const router = require('express').Router();
const path = require('path')
const mysql = require('mysql');
const jwt = require('jsonwebtoken')

const DBConnect = mysql.createConnection({
    host : process.env.DBHost,
    user : process.env.DBUser,
    password : process.env.DBPass,
    database : process.env.DBName
}) 
router.use(async (req,res,next)=>{
    let token = req.cookies.token ? req.cookies.token : "wrong token" 
    let user = req.cookies.user
    let check = await jwt.verify(token,process.env.JWTSecret,(err,decoded)=>{
        if(err) {
            res.clearCookie("token")
        } else {
            return decoded
        }
    })
    if(check != undefined && check.staffID == user ) {
        next()
    } else {
        res.redirect('/')
    }
    
})

router.get('/newq',(req,res)=>{
    res.sendFile('./newForm.html',{root: path.join(__dirname,"../Client/branch")})
})

router.post('/newq/new',(req,res)=>{
    const cookies = req.headers.cookie.split('=')
    const filterCookie = req.headers.cookie.indexOf("user=")
    const cleanCookie = {
        token: cookies[1].split(';')[0],
        user: req.headers.cookie.substring(filterCookie+5,filterCookie+12)
    }
    const quizData = {
        quizID: `${new Date(req.body.date).getDate()}${new Date(req.body.date).getMonth()}-${cleanCookie.user}` ,
        quizDate: new Date(req.body.date).toISOString(),
        quizCreator: cleanCookie.user,
        quizDuration: req.body.duration
    }
    DBConnect.query("INSERT INTO Quiz (QuizID,QDate,QCreator,Duration) VALUES (?,TIMESTAMP(?),?,?)",[quizData.quizID,quizData.quizDate,quizData.quizCreator,quizData.quizDuration],(err,rows)=>{
        if(err) {
            res.status(400).send({"msg":"You already set a quiz on the selected day"})
        } else {
            res.cookie("quizID",quizData.quizID)
            res.status(200).send({
                "quizID":quizData.quizID,
                "msg":"Quiz Assigned Successfully"
            })
        }
    })
})


router.get('/editq',async (req,res)=>{
    res.sendFile('./editq.html',{root: path.join(__dirname,'../Client/branch')})
})

router.post('/getQuizList',async (req,res)=>{
    const filterCookie = req.headers.cookie.indexOf("user=")
    const user = req.headers.cookie.substring(filterCookie+5,filterCookie+12)
    DBConnect.query("SELECT * FROM Quiz WHERE QCreator = ? AND DATE(QDate) > NOW()",user,(err,rows)=>{
        if(err) {
            console.log(err);
            res.send(err)
        } else {
            res.send(rows)
        }
    })
})

router.post('/deleteQuiz', async (req,res)=>{
    const filterCookie = req.headers.cookie.indexOf("user=")
    const user = req.headers.cookie.substring(filterCookie+5,filterCookie+12)
    const quizID = req.body.uid
    DBConnect.query("DELETE FROM Quiz WHERE QuizID =? AND QCreator=?",[quizID,user],(err,rows)=>{
        if(err) {
            res.send(err)
        } else {
            res.status(200).send({
               "Affected Rows":rows,
               "msg":"Quiz Deleted Successfully"
            })
        }
    })
})

router.post('/setQ',async (req,res)=>{
    const quizID = req.body.uid
    DBConnect.query("SELECT * FROM Questions WHERE QuizID =?",quizID,(err,rows)=>{
        if(err) {
            res.status(400).send(err)
        } else {
            res.status(200).send({
                "rows": rows,
                "qid": quizID
            })
        }
    })
})

router.get('/setQ',async (req,res)=>{
    res.sendFile("setq.html",{root : path.join(__dirname,'../Client/branch')})
})
router.post('/setQ/qid',async (req,res)=>{
    const qid = req.body.qid
    DBConnect.query("SELECT * FROM Questions JOIN Answers ON Questions.QID = Answers.QID WHERE Questions.QuizID=?",qid,(err,rows)=>{
        if(err){
            res.status(400).send(err)
            // res.send({"msg":"SQL Error. Please Refer back to system admin"})
        } else {
            res.status(200).send(rows)
        }
    })
})

router.post('/setq/save',async (req,res)=>{
    const parsedData = req.body
    const qTable = [parsedData.qid,parsedData.qValue]
    DBConnect.query("INSERT INTO Questions(QuizID,QValue) Values(?)",[qTable],(err,rows)=>{
        if(err) {
            res.status(400).send(err)
        } else {
            const answers = parsedData.answers
            for(let answer of answers) {
                let singleArr=[rows.insertId,answer.value,answer.isChecked]
                DBConnect.query("INSERT INTO Answers(QID,AValue,IsTrue) Values(?)",[singleArr],(err,rows)=>{
                    if(err) {
                        res.status(400).send(err)
                    }
                })
            }
            res.status(200).send({"msg":"Question Added Sucessfully"})
        }
    })
})

router.post('/setq/delete',async (req,res)=>{
    const parsedData = req.body
    DBConnect.query("DELETE FROM Questions WHERE QID=?",parsedData.questionID,(err,rows)=>{
        if(err) {
            res.send(err)
        } else {
            res.status(200).send({"msg":"Question Removed"})
        }
    })
})

router.post('/setq/CountQ',async (req,res)=>{
    const parsedData = req.body
    DBConnect.query("SELECT COUNT(*) AS Counter FROM Questions WHERE QuizID =?",parsedData.qid,(err,count)=>{
        if(err){
            res.send("NA")
        } else {
            res.send(count)
        }
    })
})

router.get('/approve',async (req,res)=>{
    res.sendFile('approve.html',{root: path.join(__dirname,"../Client/branch")})
})

router.get('/getPendingUsers', async (req,res)=>{
    DBConnect.query('SELECT StaffID, NTUser, StoreID, CreationDate FROM Users WHERE Status = "PENDING"',(err,resolve,fields)=>{
        if(err) {
            res.send({"msg":"internal server Error"})
        } else {
            res.send(resolve)
        }
    })
})

router.post('/approveUser', async(req,res)=>{
    let parsedData = req.body
    DBConnect.query("UPDATE Users SET Status = 'ACTIVE' WHERE StaffID =?",parsedData.user,(err,result)=>{
        if(err){
            res.status(500).send({"msg":"Refer back to SAdmin - Error mo-app-1"})
        } else {
            res.send({"msg":"User Approved"})
        }
    })
})

router.post('/deleteUser', async(req,res)=>{
    let parsedData = req.body
    DBConnect.query("DELETE FROM Users WHERE StaffID =?",parsedData.user,(err,result)=>{
        if(err){
            res.status(500).send({"msg":"Refer back to SAdmin - Error mo-del-1"})
        } else {
            res.send({"msg":"User Deleted"})
        }
    })
})

router.get('/agents',async (req,res)=>{
    res.sendFile('showAgents.html',{root: path.join(__dirname,"../Client/branch")})
})

router.get('/showAgents',async (req,res)=>{
    DBConnect.query('SELECT StaffID, NTUser, StoreID, CreationDate FROM Users WHERE Status = "ACTIVE" AND Admin =0',(err,resolve,fields)=>{
        if(err) {
            res.send({"msg":"internal server Error"})
        } else {
            res.send(resolve)
        }
    })
})

router.get('/allq',(req,res)=>{
    res.sendFile('allq.html',{root: path.join(__dirname,"../Client/branch")})
})

router.post('/allq',(req,res)=>{
    DBConnect.query("SELECT * FROM Quiz WHERE QStatus = 'Done'",(err,rows)=>{
        if(err) {
            res.status(400).send({"msg":"Error Code mo-allq-01"})
        } else {
            res.status(200).send(rows)
        }
    })
})

router.post('/result/:id',(req,res)=>{
    let data = req.body.QID
    DBConnect.query(`
        SELECT Answers.AID,Answers.QID,Questions.QuizID,Questions.QValue, Answers.AValue,Answers.isTrue
        FROM Answers
        INNER JOIN Questions ON Answers.QID = Questions.QID
        WHERE Questions.QuizID =? 
        `,[data],(err,rows)=>{
        if(err) {
            console.log(err);
            res.status(400).send({"msg":"Bad Request - mo-postRes-01"})
        } else {
            res.send(rows)
        }
    })
})

router.get('/result/:id',(req,res)=>{
    let data = req.params.id
    DBConnect.query(`
        SELECT Users.StaffID, Users.NTUser FROM Users 
        LEFT JOIN userAnswers
        ON Users.StaffID = userAnswers.StaffID
        WHERE userAnswers.QuizID = ?
        GROUP BY userAnswers.StaffID
        `,[data],(err,rows)=>{
            if(err) {
                res.status(400).send({'msg':"Error Code sad-res-01"})
            } else {
                res.status(200).send(rows)
            }
        })
})

router.post('/result/:id/getAnswers',(req,res)=>{ // to show quiz question without users
    let data = req.body.id
    DBConnect.query(`
        SELECT userAnswers.AID,userAnswers.QID,userAnswers.QuizID,Answers.AValue,Answers.isTrue
        FROM userAnswers
        INNER JOIN Answers ON userAnswers.AID = Answers.AID
        WHERE userAnswers.QuizID =?
        `,[data],(err,rows)=>{
        if(err) {
            console.log(err);
            res.status(400).send({"msg":"Bad Request - mo-postRes-02"})
        } else {
            res.send(rows)
        }
    })
})

router.post('/result/:id/getUserAnswers',(req,res)=>{ // to show quiz question with specific user answers
    let data = req.body
    DBConnect.query(`
        SELECT userAnswers.AID,userAnswers.QID,userAnswers.QuizID,Answers.AValue,Answers.isTrue
        FROM userAnswers
        INNER JOIN Answers ON userAnswers.AID = Answers.AID
        WHERE userAnswers.QuizID =? AND userAnswers.StaffID = ?
        `,[data.QID,data.sID],(err,rows)=>{
        if(err) {
            console.log(err);
            res.status(400).send({"msg":"Bad Request - mo-postRes-02"})
        } else {
            res.send(rows)
        }
    })
})

router.post('/result/:id/getAnswersBase',async (req,res)=>{
    const data = req.body
    await DBConnect.query(`
        SELECT COUNT(*) AS QuizCount
        FROM Answers
        INNER JOIN Questions
        ON Answers.QID = Questions.QID
        WHERE Questions.QuizID =? AND Answers.IsTrue = 1
        `,[data.quiz],(err,rows)=>{
            if(err) {
                console.log(err);
                res.status(400).send({"msg":"Bad Request - mo-postRes-04"})
            } else {
                res.send(rows[0])
            } 
    })
})

router.post('/result/:id/getAnswersCount',async (req,res)=>{
    const data = req.body
    await DBConnect.query(`
        SELECT COUNT(*) AS UserCount, userAnswers.StaffID as sID,userAnswers.QuizID as QuizID, Users.NTUser
        FROM Answers
        INNER JOIN userAnswers
        ON Answers.AID = userAnswers.AID
        RIGHT JOIN Users
        ON Users.StaffID = userAnswers.StaffID
        WHERE userAnswers.QuizID = ? AND Users.StaffID = ? AND Answers.IsTrue = 1
        `,[data.quiz,data.sID],(err,rows)=>{
            if(err) {
                console.log(err);
                res.status(400).send({"msg":"Bad Request - mo-postRes-04"})
            } else {
                res.send(rows[0])
            } 
    })
})

module.exports = router;