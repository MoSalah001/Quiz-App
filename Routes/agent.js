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
    DBConnect.query("SELECT * FROM Quiz ORDER BY QDate LIMIT 1",(err,rows)=>{
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
    DBConnect.query(`
    SELECT * FROM Questions Left JOIN Answers ON Questions.QID = Answers.QID WHERE Questions.QuizID =?
    `,String(req.params.id),(err,rows)=>{
        if(err) {
            res.send(err)
        }
        else{
            res.send(rows);
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

module.exports = router