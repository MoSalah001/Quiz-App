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

module.exports = router