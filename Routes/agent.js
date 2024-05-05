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
    DBConnect.query("SELECT * FROM Quiz ORDER BY QDate",(err,rows)=>{
        if(err) throw err
        else {
            res.send(rows)
        }
    })
})

router.get('/quizlist',async(req,res)=>{
    let testPath = path.relative(__dirname,__dirname+'/Client/agent')
    res.send(testPath)
    // res.sendFile('./quizlist.html',{root: path.relative(__dirname,__dirname+'/Client/agent')}) 
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

module.exports = router