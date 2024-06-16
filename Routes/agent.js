const router = require('express').Router();
const path = require('path');
const mysql = require('mysql');

const DBConnect = mysql.createConnection({
    host : process.env.DBHost,
    user : process.env.DBUser,
    password : process.env.DBPass,
    database : process.env.DBName
}) 

router.get('/quizez',async(req,res)=>{
    DBConnect.query("SELECT * FROM Quiz WHERE QDate >= CURRENT_DATE() ORDER BY QDate ASC lIMIT 1",(err,rows)=>{
        if(err) throw err
        else {
            res.send(rows)
        }
    })
})

router.get('/quizlist',async(req,res)=>{
    res.sendFile('./quizList.html',{root: path.join(__dirname,'../Client/agent')}) 
})

router.get('/getquizes',async (req,res)=>{
    DBConnect.query("SELECT * FROM Quiz ORDER BY QDate",(err,rows)=>{
        if(err) throw err
        else {
            res.send(rows)
        }
    })
})

router.post('/quiz:id',(req,res)=>{
    let filterCookie = req.headers.cookie.indexOf('user=');
    const user = req.headers.cookie.substring(filterCookie+5,filterCookie+11)
    DBConnect.query('SELECT * FROM userAnswers WHERE StaffID = ? AND userAnswers.QuizID = ?',[String(user),req.params.id],(err,rows)=>{
        if(err) {
            res.status(500).send({"msg":"Refer back to system admin - Error mo-sel-1"})
        } else {
            if(rows.length > 0) {
                res.status(400).send({"msg":"Your answers for the selected quiz are already submitted"})
            } else {
                DBConnect.query(
                    `
                    SELECT * FROM Questions 
                    Left JOIN Answers 
                    ON Questions.QID = Answers.QID 
                    WHERE Questions.QuizID =?
                    `
                ,String(req.params.id),(err,rows)=>{
                    if(err) {
                        res.send(err)
                    }
                    else{
                        res.send(rows);
                    }
                })
            }
        }
    })
})

router.get('/quiz/q:id',(req,res)=>{
    res.sendFile('./quizTemp.html',{root: path.join(__dirname,"../Client/agent")})
})
router.post('/quiz/answers',(req,res)=>{
    let filterCookie = req.headers.cookie.indexOf('user=');
    const user = req.headers.cookie.substring(filterCookie+5,filterCookie+11)
    const quizID = req.body.qid
    for(let i in req.body) {
        if(i === "qid") {
            continue
        } else {
            let data = req.body[i.toString()].split('-')
            const [qid,aid] = data
            DBConnect.query(`INSERT INTO userAnswers(QID,AID,StaffID,QuizID) VALUES(?,?,?,?)`,[qid,aid,user,quizID],(err,rows)=>{
                if(err) {
                    // error mo-1 - insert into DB Error
                    res.status(500).send("Refer back to system admin - Error mo-1")
                }
            })
        }
    }
    res.status(200).send({"msg":"Your answers have been saved Successfully"})
})

router.post('/quiz/timer',(req,res)=>{
    const qid = req.body
    DBConnect.query("SELECT Duration,QDate FROM Quiz WHERE QuizID = ?",qid,(err,rows)=>{
        res.send(rows)
    })
})

router.get('/result',(req,res)=>{
    res.sendFile('result.html',{root:path.join(__dirname,"../Client/agent")})
})

router.post('/result',(req,res)=>{
    let filterCookie = req.headers.cookie.indexOf('user=');
    const user = req.headers.cookie.substring(filterCookie+5,filterCookie+11)
    DBConnect.query(`
    SELECT * FROM Quiz INNER JOIN userAnswers
    ON Quiz.QuizID = userAnswers.QuizID
    AND userAnswers.StaffID = ?
    GROUP BY Quiz.QuizID  
    `,String(user),(err,rows)=>{
        if(err){
            res.status(500).send("Refer back to system admin - Error mo-res-1")
        } else {
            res.send(rows)
        }
    })
})

router.post('/result/:id',(req,res)=>{
    let filterCookie = req.headers.cookie.indexOf('user=');
    const user = req.headers.cookie.substring(filterCookie+5,filterCookie+11)
    let data = req.body.id
    DBConnect.query(`
        SELECT Answers.AID,Answers.QID,Questions.QuizID,Questions.QValue, Answers.AValue,Answers.isTrue
        FROM Answers
        INNER JOIN Questions ON Answers.QID = Questions.QID
        WHERE Questions.QuizID =? 
        `,[data,user,data],(err,rows)=>{
        if(err) {
            console.log(err);
            res.status(400).send({"msg":"Bad Request - mo-getRes-01"})
        } else {
            res.send(rows)
        }
    })
})

router.get('/result/:id',(req,res)=>{
    res.sendFile('singleQuiz.html',{root: path.join(__dirname,'../Client/agent')})
})

router.post('/result/:id/getAnswers',(req,res)=>{
    let filterCookie = req.headers.cookie.indexOf('user=');
    const user = req.headers.cookie.substring(filterCookie+5,filterCookie+11)
    let data = req.body.id
    DBConnect.query(`
        SELECT userAnswers.AID,userAnswers.QID,userAnswers.QuizID,Answers.AValue,Answers.isTrue
        FROM userAnswers
        INNER JOIN Answers ON userAnswers.AID = Answers.AID
        WHERE userAnswers.QuizID =? AND userAnswers.StaffID = ? 
        `,[data,user],(err,rows)=>{
        if(err) {
            console.log(err);
            res.status(400).send({"msg":"Bad Request - mo-getRes-01"})
        } else {
            res.send(rows)
        }
    })
})

module.exports = router