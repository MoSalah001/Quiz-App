const router = require('express').Router();
const path = require('path')
const jwt = require('jsonwebtoken')
router.get('/newq',(req,res)=>{
    res.sendFile('./newForm.html',{root: path.join(__dirname,"../Client/branch")})
})

router.post('/newq/newquiz',(req,res)=>{
    console.log(req.headers.cookie);
    const cookies = req.headers.cookie.split('=')
    const cleanCookie = {
        token: cookies[1].split(';')[0],
        user: cookies[2]
    }
    console.log(req.body);
    const quizData = {
        quizDate: req.body.date,
        quizCreator: cleanCookie.user,
        quizDuration: req.body.duration
    }
    res.send(quizData)
})


module.exports = router;