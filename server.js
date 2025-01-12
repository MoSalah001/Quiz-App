const express = require('express')
const path = require("path")
const bcrypt = require("bcryptjs")
const jwt = require('jsonwebtoken')
const app = express()
const mysql = require('mysql')
const webpush = require('web-push')
const cookieParser = require('cookie-parser')
const multer = require('multer')
const upload = multer()
require('dotenv').config()


// const vapidKeys = {
//     publicKey: "BGRa7VZ1GpJjfeLQn6UIs2TF2A8JF3GtXURVlvnprd8PBC27gO2KiCdmSt4ozQRoJIkG7ITVehIdc-2Z01e575c",
//     privateKey: process.env.vapidKeyPrivate
// }

// webpush.setVapidDetails('mailto:contact@devmosalah.com',
//     vapidKeys.publicKey,
//     vapidKeys.privateKey
// )



let DBConnect;


const port = process.env.PORT || 1234

const admin = require('./Routes/admin')
const agent = require('./Routes/agent')

function dbConnect(){
        DBConnect = mysql.createConnection({
        host : process.env.DBHost,
        user : process.env.DBUser,
        password : process.env.DBPass,
        database : process.env.DBName
    }) 

    DBConnect.connect((err)=>{
        if(err){
            console.log("Error connecting db: ",err);
            setTimeout(dbConnect,3000)
        } else {
            console.log('Connected');
            
        }
    })

    DBConnect.on('error',(err)=>{
        console.log("DB Error: ",err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') {
        dbConnect()
    } else {
        console.log(err);
    }
        
    })
}

dbConnect()


app.use(cookieParser())
app.use(express.static("Client"))
app.use(express.text())
app.use(express.urlencoded({
    extended: false
}))
app.use(upload.array()); 
app.use(express.static('public'));

app.use(express.json())
app.use('/admin',admin)
app.use('/agent',agent)


app.listen(port,()=>{
    console.log(`http://127.0.0.1:${port}`);
})

app.post('/login',async (req,res)=>{
    DBConnect.query("SELECT StaffID , PHashed, Admin, Status, NTUser FROM Users WHERE NTUser =?",String(req.body.user).toUpperCase(),(error,result,fields)=>{
        if(error) {
            res.status(404).send('Wrong User or Password')
        }
        let data = result[0]
        if(data){
            if(data.PHashed == 0) {
                res.status(500).send(data.NTUser)
            } else {
                bcrypt.compare(req.body.pass,data.PHashed,(err,result)=>{
                    if(err){
                        res.status(400).send({"msg":"Report to SAdmin"})
                    } else if(result) {
                        if(data.Status == "ACTIVE") {
                            let tokenData = {
                                staffID : data.StaffID,
                                Admin : data.Admin
                            }
                            jwt.sign(JSON.stringify(tokenData),process.env.JWTSecret,(err,token)=>{
                                if (err){
                                    res.send(err)
                                } else {
                                    if(data.Admin === 1) {
                                        res.cookie("token",token,{
                                            httpOnly: true
                                        })
                                        res.cookie('user',data.StaffID)
                                        res.cookie('status',data.Admin)
                                        res.redirect('../admin')
                                    } else {
                                        res.cookie("token",token,{
                                            httpOnly: true
                                        })
                                        res.cookie('status',data.Admin)
                                        res.cookie('user',data.StaffID)
                                        res.redirect('../main')
                                    }
                                }
                            })
                        } else {
                            res.cookie('user',data.StaffID)
                            res.redirect('./temp')
                        }
                    } else {
                        res.status(400).send({"msg":"Wrong Credintals"})
                    }
                    })
            }
            
                    
        } else {
            res.status(400).send({"msg":"User not found"})
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


app.post('/resetPass',(req,res)=>{
    const saltRounds = 15;
    let parsedData = JSON.parse(req.body)
    bcrypt.hash(parsedData.pass,saltRounds,(err,hash)=>{
        if(err) {
            res.status(500).send({"msg":"Refer back to SAdmin - Error mo-res-hash 1"})
        } else {
            DBConnect.query("UPDATE Users SET PHashed=? WHERE NTUser=?",[hash,String(parsedData.user).toUpperCase()],(err,result)=>{
                if(err) {
                    res.status(500).send({"msg":"Refer back to SAdmin - Error mo-res-db 1"})
                } else {
                    DBConnect.query("SELECT StaffID, Admin, Status, NTUser FROM Users WHERE NTUser =?",String(parsedData.user).toUpperCase(),(err,result)=>{
                        let data = result[0]
                        if(data.Status == "ACTIVE"){
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
                            res.redirect('./temp')
                        }
                    })
                }        
            })
        }
    })
})

app.post('/subscribe', (req,res)=>{
    const subscribe = req.body
    res.status(201).json({})
    const payload = JSON.stringify({title:"Push Test"})

    webpush.sendNotification(subscribe,payload).catch(err =>{
        if(err) {
            console.log(err);
        }
    })
})

