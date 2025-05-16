const router = require('express').Router();
const path = require('path');
const mysql = require('mysql');
const jwt = require('jsonwebtoken')

let dev = false

let DBConnect;

if (dev){
    function dbConnect(){
        DBConnect = mysql.createConnection({
        host : process.env.DBHostDev,
        user : process.env.DBUserDev,
        password : process.env.DBPassDev,
        database : process.env.DBNameDev,
        timezone: "UTC"
    }) 

    DBConnect.connect((err)=>{
        if(err){
            console.log("Error connecting db: ",err.code);
            setTimeout(dbConnect,3000)
        } else {            
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
} else {
        function dbConnect(){
            DBConnect = mysql.createConnection({
            host : process.env.DBHost,
            port: 3306,
            user : process.env.DBUser,
            password : process.env.DBPass,
            database : process.env.DBName,
            timezone: "UTC"
        }) 
    
        DBConnect.connect((err)=>{
            if(err){
                console.log("Error connecting db: ",err.code);
                setTimeout(dbConnect,3000)
            } else {
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

}

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
    if(check && check.staffID == user) {
        next()
    } else {
        res.redirect('/')
    }
    
})

router.post('/agentData',async(req,res)=>{
    const parsedData = req.body        
    DBConnect.query("SELECT StaffID,StoreID FROM Users WHERE StaffID =?",[parsedData.user],(err,rows)=>{
        if(err) throw err
        else {
            console.log(rows);
            
            res.send(rows)
        }
    })
})

router.post('/quizData',async (req,res)=>{
    const parsedData = req.body
        

    DBConnect.query(`
        SELECT * FROM Quiz 
        LEFT JOIN Assigned 
        ON Quiz.QuizID  = Assigned.QuizID 
        WHERE Assigned.Affects = ? 
        OR Assigned.Affects = ?
        ORDER BY Assigned.ID DESC
        `,[parsedData.StaffID,parsedData.StoreID],(err,rows)=>{
        if(err){
            console.log(err);
        } else {      
            res.send(rows)
        }
    })
})

router.get('/quizlist',async(req,res)=>{
    res.sendFile('./quizList.html',{root: path.join(__dirname,'../Client/agent')}) 
})

router.post('/quiz:id',(req,res)=>{
    let filterCookie = req.headers.cookie.indexOf('user=');
    const user = req.headers.cookie.substring(filterCookie+5,filterCookie+11)
    
    DBConnect.query('SELECT * FROM userAnswers WHERE StaffID = ? AND userAnswers.QuizID = ?',[String(user),req.params.id],(err,rows)=>{
        if(err) {
            res.status(500).send({"msg":"Refer back to system admin - Error mo-sel-1"})
        } else {
            
            if(rows.length > 0) {
                res.status(400).send({"msg":"Your answers for the selected quiz are already submitted"})
            } else {                
                DBConnect.query(
                    `
                    SELECT * FROM Questions 
                    Left JOIN Answers 
                    ON Questions.QID = Answers.QID 
                    WHERE Questions.QuizID =?
                    `
                ,String(req.params.id),(err,rows)=>{
                    if(err) {
                        res.send(err)
                    }
                    else{                        
                        res.send(rows);
                    }
                })
            }
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
// quiz timer section
router.post('/quiz/timer',(req,res)=>{
    let filterCookie = req.headers.cookie.indexOf('user=');
    const user = req.headers.cookie.substring(filterCookie+5,filterCookie+11)
    const parsedData = req.body
    let date = new Date().toISOString().replace("Z","").replace("T"," ")
    
    DBConnect.query("SELECT Tickler,QuizID FROM History WHERE Tickler=? AND QuizID=?",[user,parsedData.QuizID],(err,rows)=>{
        if(err){
            console.error(err)
        } else {
            if(rows.length > 0){
                                                  
                res.status(200).send()
            } else {
                /* check strict */
                DBConnect.query("SELECT QuizDate FROM Assigned WHERE QuizID=? AND Affects=?",[parsedData.QuizID,user],(err,qid)=>{
                    let id = qid[0].QuizDate
                    console.log("strict");
                    
                    res.send(qid)
                    if(id == null) {                                                
                        DBConnect.query("INSERT INTO History(QuizID,StartTime,Tickler) VALUES(?,?,?)",[parsedData.QuizID,date,user],(err,rows)=>{
                            if(err){
                                console.error(err)
                            } else {
                                res.send(rows)
                            }
                        })
                    } else {
                        console.log("non strict");
                        
                        const strictDate = new Date(id).toISOString().replace("Z","").replace("T"," ")
                        DBConnect.query("INSERT INTO History(QuizID,StartTime,Tickler) VALUES(?,?,?)",[parsedData.QuizID,strictDate,user],(err,rows)=>{
                            if(err){
                                console.error(err)
                            } else {
                                res.send(rows)
                            }
                        })
                    }
                })
                
            }
        }
    })
    
})
router.post('/quiz/getTimer',(req,res)=>{
    let filterCookie = req.headers.cookie.indexOf('user=');
    const user = req.headers.cookie.substring(filterCookie+5,filterCookie+11)
    const parsedData = req.body
    DBConnect.query(`SELECT History.StartTime, Assigned.Duration FROM History JOIN Assigned ON History.QuizID = Assigned.QuizID WHERE History.Tickler=? AND History.QuizID=?`,[user,parsedData.QuizID],(err,rows)=>{
        if(err){
            console.error(err)
        } else {                                    
            res.send(rows[0])
        }
    })
})

router.get('/result',(req,res)=>{
    res.sendFile('result.html',{root:path.join(__dirname,"../Client/agent")})
})

router.post('/result',(req,res)=>{
    let filterCookie = req.headers.cookie.indexOf('user=');
    const user = req.headers.cookie.substring(filterCookie+5,filterCookie+11)
    DBConnect.query(`
    SELECT Quiz.QuizID,QName,QStatus,Quiz.Duration FROM Quiz INNER JOIN userAnswers
    ON Quiz.QuizID = userAnswers.QuizID
    LEFT JOIN Assigned
    ON Quiz.QuizID = Assigned.QuizID
    AND Assigned.Affects =?
    AND userAnswers.StaffID = ?
    WHERE Assigned.Affects = ?
    GROUP BY Quiz.QuizID,QName,QStatus,Quiz.Duration
    `,[String(user),String(user),String(user)],(err,rows)=>{        
        if(err){
            console.log(err);
            
            res.status(500).send("Refer back to system admin - Error mo-res-1")
        } else {                                    
            res.send(rows)
        }
    })
})

router.post('/result/:id',(req,res)=>{
    let filterCookie = req.headers.cookie.indexOf('user=');
    const user = req.headers.cookie.substring(filterCookie+5,filterCookie+11)
    let data = req.body.id
    DBConnect.query(`
        SELECT Answers.AID,Answers.QID,Questions.QuizID,Questions.QValue, Answers.AValue,Answers.isTrue
        FROM Answers
        INNER JOIN Questions ON Answers.QID = Questions.QID
        WHERE Questions.QuizID =? 
        `,[data,user,data],(err,rows)=>{
        if(err) {
            console.log(err);
            res.status(400).send({"msg":"Bad Request - mo-postRes-01"})
        } else {
            res.send(rows)
        }
    })
})

router.get('/result/:id',(req,res)=>{
    res.sendFile('singleQuiz.html',{root: path.join(__dirname,'../Client/agent')})
})

router.post('/result/:id/getAnswers',(req,res)=>{
    let filterCookie = req.headers.cookie.indexOf('user=');
    const user = req.headers.cookie.substring(filterCookie+5,filterCookie+11)
    let data = req.body.id
    DBConnect.query(`
        SELECT userAnswers.AID,userAnswers.QID,userAnswers.QuizID,Answers.AValue,Answers.isTrue
        FROM userAnswers
        INNER JOIN Answers ON userAnswers.AID = Answers.AID
        WHERE userAnswers.QuizID =? AND userAnswers.StaffID = ? 
        `,[data,user],(err,rows)=>{
        if(err) {
            console.log(err);
            res.status(400).send({"msg":"Bad Request - mo-postRes-02"})
        } else {
            res.send(rows)
        }
    })
})

router.post('/result/:id/getAnswersCount',(req,res)=>{
    let filterCookie = req.headers.cookie.indexOf('user=');
    const user = req.headers.cookie.substring(filterCookie+5,filterCookie+11)
    const data = req.body.id
    let dbData = {}
    DBConnect.query(`
        SELECT COUNT(*) AS QuizCount
        FROM Answers
        INNER JOIN Questions
        ON Answers.QID = Questions.QID
        WHERE Questions.QuizID =? AND Answers.IsTrue = 1
        `,[data],(err,rows,fields)=>{
        if(err) {
            res.status(400).send({"msg":"Bad Request - mo-postRes-03"})
        } else {
            dbData.quizCount = rows[0].QuizCount
        }
    })
    DBConnect.query(`
        SELECT COUNT(*) AS UserCount
        FROM Answers
        INNER JOIN userAnswers
        ON Answers.AID = userAnswers.AID
        WHERE userAnswers.QuizID = ? AND userAnswers.StaffID = ? AND Answers.IsTrue = 1
        `,[data,user],(err,rows)=>{
            if(err) {
                console.log(err);
                res.status(400).send({"msg":"Bad Request - mo-postRes-04"})
            } else {
                dbData.userCount = rows[0].UserCount
                res.send(dbData)
            }
        })
})

module.exports = router