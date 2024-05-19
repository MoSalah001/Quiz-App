const express = require('express')
const path = require("path")
const bcrypt = require("bcryptjs")
const jwt = require('jsonwebtoken')
const app = express()
const mysql = require('mysql')
require('dotenv').config()

let DBConnect = mysql.createConnection({
    host : process.env.DBHost,
    user : process.env.DBUser,
    password : process.env.DBPass,
    database : process.env.DBName
}) 


const port = process.env.PORT || 8800

const admin = require('./Routes/admin')
const agent = require('./Routes/agent')

DBConnect.connect((err)=>{
    if(err){
        console.log(`error connecting: `,err.stack);
        return
    } else {
        console.log(`Connected as id `,DBConnect.threadId);
    }
})
app.use(express.static("Client"))
app.use(express.json())
app.use(express.text())
app.use(express.urlencoded({
    extended: true
}))
app.use('/admin',admin)
app.use('/agent',agent)


app.listen(port,()=>{
    console.log(`http://127.0.0.1:${port}`);
})

app.post('/login',async (req,res)=>{
    DBConnect.query("SELECT StaffID , PHashed, Admin, Status, NTUser FROM Users WHERE NTUser =?",String(req.body.ID).toUpperCase(),(error,result,fields)=>{
        if(error) {
            res.status(404).send('Wrong User or Password')
        }
        let data = result[0]
        if(data){
            bcrypt.compare(req.body.pass,data.PHashed,(err,result)=>{
                if(err){
                    res.send("Wrong Credintals")
                }
                else {
                    if(data.Status == "ACTIVE") {
                        jwt.sign(JSON.stringify(data.StaffID),process.env.JWTSecret,(err,token)=>{
                            if (err){
                                res.send(err)
                            } else {
                                if(data.Admin === 1) {
                                    res.cookie("token",token,{
                                        httpOnly: true
                                    })
                                    res.cookie('user',data.StaffID)
                                    res.redirect('../admin')
                                } else {
                                    res.cookie("token",token)
                                    res.cookie('user',data.StaffID)
                                    res.redirect('../main')
                                }
                            }
                        })
                    } else {
                        res.cookie('user',data.StaffID)
                        res.redirect('../temp')
                    }
                }
                })
                    
        } else {
            res.append('message',"Wrong Credintals")
            res.redirect('..')
        }
    })

})

app.get('/admin',(req,res)=>{
    res.sendFile('./branch/admin.html',{root: path.join(__dirname,"./Client")})
})

app.get('/main',(req,res)=>{
    res.sendFile('./branch/agent.html',{root: path.join(__dirname,"./Client")})
})

app.get('/temp',(req,res)=>{
    res.sendFile('./branch/temp.html',{root: path.join(__dirname,"./Client")})
})

app.get('/request',(req,res)=>{
    res.sendFile("./branch/firstReg.html",{root: path.join(__dirname,"./Client")})
})

app.post('/firstReg',async (req,res)=>{ // first admin user
    const saltRounds = 15;
    const salt = await bcrypt.genSalt(saltRounds)
    bcrypt.hash(req.body.password,salt,(err,hash)=>{
        if (err) {
            return err
        }
        let regQuery = `INSERT INTO Users (StaffID, PHashed, StoreID, Status, NTUser) 
        VALUES (?,?,?,?,?)`
        DBConnect.query("SELECT NTUser, StaffID FROM Users WHERE NTUser = ? OR StaffID = ?",[req.body.NTUser.toUpperCase(),req.body.sfid],(err,resolve,fields)=>{
            if(err){
                res.status(503).send({"msg":"Internal server outage - refer back to system admin error code mo-server-1"})
            } else if(resolve.length > 0){
                if(resolve[0].NTUser === req.body.NTUser.toUpperCase() || resolve[0].StaffID == req.body.sfid) {
                    res.status(409).send({"msg":"User already registered - please try logging in"})
                }
            }  else {
                DBConnect.query(regQuery,[req.body.sfid,hash,req.body.storeID,"PENDING",req.body.NTUser.toUpperCase()],(error, result, fields)=>{
                    if(error) {
                        res.status(400).send({"msg":"User Not Saved"});
                    }
                     else {
                        res.send({"msg":"User Saved"})
                     }
                })
            }
        })
        
    })
})

app.get('/lgout',(req,res)=>{
    res.cookie("user","")
    res.cookie("token","")
    res.send({"msg":"Logged out"})
})

