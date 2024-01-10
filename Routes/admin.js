const router = require('express').Router();
const path = require('path')
const mysql = require('mysql')

let DBConnect = mysql.createConnection({
    host : process.env.DBHost,
    user : process.env.DBUser,
    password : process.env.DBPass,
    database : process.env.DBName
}) 

router.get('/newq',(req,res)=>{
    res.sendFile('./newForm.html',{root: path.join(__dirname,"../Client/branch")})
})

router.post('/newq/newquiz',(req,res)=>{
    const cookies = req.headers.cookie.split('=')
    const cleanCookie = {
        token: cookies[1].split(';')[0],
        user: cookies[2]
    }
    const quizData = {
        quizID: `${new Date(req.body.date).getMonth()}-${cleanCookie.user}` ,
        quizDate: new Date(req.body.date).toISOString().slice(0,19).replace('T',' '),
        quizCreator: cleanCookie.user,
        quizDuration: req.body.duration
    }
    DBConnect.query("INSERT INTO Quiz (QuizID,QDate,QCreator,Duration) VALUES (?,?,?,?)",[quizData.quizID,quizData.quizDate,quizData.quizCreator,quizData.quizDuration],(err,rows)=>{
        if(err) {
            res.status(400).send({"message":"You already set a quiz on the selected month"})
        }
    })
})


module.exports = router;