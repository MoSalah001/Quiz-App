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
app.use(express.urlencoded({
    extended: true
}))
app.use('/admin',admin)
app.use('/agent',agent)


app.listen(port,()=>{
    console.log(`http://127.0.0.1:${port}`);
})

app.post('/login',async (req,res)=>{
    DBConnect.query("SELECT StaffID , PHashed, Admin FROM Users WHERE StaffID =?",parseInt(req.body.ID),(error,result,fields)=>{
        if(error) {
            console.log(error);
            res.status(404).send('Wrong User or Password')
        }
        let data = result[0]
        if(data){
            bcrypt.compare(req.body.pass,data.PHashed,(err,result)=>{
                if(err){
                    console.log(err);
                    res.send("Wrong Credintals")
                }
                else {
                    jwt.sign(JSON.stringify(data.StaffID),process.env.JWTSecret,(err,token)=>{
                        if (err) res.send(err)
                        else {
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

app.get('/request',(req,res)=>{
    res.sendFile("./branch/firstReg.html",{root: path.join(__dirname,"./Client")})
})

app.post('/firstReg',async (req,res)=>{ // first admin user
    const saltRounds = 15;
    const salt = await bcrypt.genSalt(saltRounds)
    bcrypt.hash(req.body.password,salt,(err,hash)=>{
        if (err) {
            console.log(err);
            return err
        }
        let admin = false
        if(req.body.userType === "1"){
            admin = true
        }

        let regQuery = `INSERT INTO Users (StaffID, PHashed, StoreID, Admin) 
        VALUES (?,?,?,?)`

        DBConnect.query(regQuery,[req.body.staffID,hash,req.body.storeID,admin],(error, result, fields)=>{
            if(error) {
                res.send("User Not Saved");
            }
            res.send('User Saved')
        })
    })
})

app.get('/lgout',(req,res)=>{
    res.cookie("user","")
    res.cookie("token","")
    res.send({"msg":"Logged out"})
})


// test server deployment