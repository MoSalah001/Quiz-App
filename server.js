const express = require('express')
const User = require('./Models/User')
const path = require("path")
const bcrypt = require("bcryptjs")
const jwt = require('jsonwebtoken')
const app = express()
require('dotenv').config()
const port = 3005

const admin = require('./Routes/admin')

const mongo = require('mongoose')

mongo.connect(process.env.DBHost).then(()=>{
    console.log("connected successfully");
}).catch(err=>{
    console.log('auth with db failed');;
})

app.use(express.static("Client"))
app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))

app.use('/admin',admin)


app.listen(port,()=>{
    console.log(`http://127.0.0.1:${port}`);
})

app.post('/login',async (req,res)=>{
    const user = await User.find({staffID : req.body.ID})
    if(user[0]){
        bcrypt.compare(req.body.pass,user[0].password,(err,result)=>{
            if(err){
                res.send("Wrong Credintals")
            }
            else {
                jwt.sign(JSON.stringify(user[0]),process.env.JWTSecret,(err,token)=>{
                    if (err) res.send(err)
                    else {
                        if(user[0].userType === 1) {
                            res.cookie("token",token,{
                                httpOnly: true
                            })
                            res.cookie('user',user[0].staffID)
                            res.redirect('../admin')
                        } else {
                            res.cookie("token",token)
                            res.redirect('../main')
                        }
                    }
                })
            }
        })
    } else {
        res.append('message',"Wrong Credintals")
        res.redirect('..')
    }
})

app.get('/admin',(req,res)=>{
    res.sendFile('./branch/admin.html',{root: path.join(__dirname,"./Client")})
})

app.get('/main',(req,res)=>{
    res.sendFile('./branch/agent.html',{root: path.join(__dirname,"./Client")})
})

app.get('/request',(req,res)=>{
    res.sendFile("./branch/firstReg.html",{root: path.join(__dirname,"./Client")})
})

app.post('/firstReg',async (req,res)=>{ // first admin user
    console.log(req.body);
    const saltRounds = 15;
    const salt = await bcrypt.genSalt(saltRounds)
    bcrypt.hash(req.body.password,salt,(err,hash)=>{
        if (err) {
            console.log(err);
            return err
        }
        const user = new User({
            staffID: req.body.staffID,
            password : hash,
            storeID : req.body.storeID,
            email : req.body.email,
            userType : 1,
            KYC : true
        })
        user.save().then(()=>{
            res.status(200).send("user saved")
        }).catch(err=>{
            res.status(200).send("user not saved")
        });
    })
})

app.get('/lgout',(req,res)=>{
    res.send("logout Khalaf")
})


// test server deployment