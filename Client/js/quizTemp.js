import {loadingSlider, responseMsg} from './loader.mjs'
const timer = document.getElementById("timer")
let counter;
let data;
let parser = window.localStorage.getItem('qid')
let rowParser = JSON.parse(window.localStorage.getItem('rows'))
rowParser.map(row=>{
    if(row.QuizID === parser) {        
        return data = row
    }
})
if(data.QuizDate === null) {
    const jsonData = JSON.stringify(data)
    const xhr = new XMLHttpRequest()
    
    xhr.open('post','timer')
    xhr.setRequestHeader('content-type','application/json')
    xhr.send(jsonData)
    xhr.onreadystatechange = ()=>{
        if(xhr.readyState === 4) {
            const subXhr = new XMLHttpRequest()
            subXhr.open('post','getTimer')
            subXhr.setRequestHeader('content-type','application/json')
            subXhr.send(jsonData)
            subXhr.onreadystatechange = ()=>{
                if(subXhr.readyState === 4) {                            
                    const jsonParser = JSON.parse(subXhr.responseText)     
                    const startTime = new Date(jsonParser.StartTime).getTime()          
                    const quizDuration = jsonParser.Duration*60*1000
                    const finishTime = startTime+quizDuration
                    counter = new Date(finishTime - new Date().getTime())
                    timer.textContent = `${counter.getUTCMinutes()} : ${counter.getUTCSeconds()}`
                }
            }
            let counterFunc = setInterval(() => {                                                   
                if(counter > 0) {
                    counter-=1000

                    timer.textContent = `${new Date(counter).getUTCMinutes()} : ${new Date(counter).getUTCSeconds()}`
                } else {                                    
                    clearInterval(counterFunc)
                    submitAnswer()
                }            
            }, 1000);
            return counterFunc;
        }
    }
} else {
    const jsonData = JSON.stringify(data)        
    const xhr = new XMLHttpRequest()
    xhr.open('post','timer')
    xhr.setRequestHeader('content-type','application/json')
    xhr.send(jsonData)
    xhr.onreadystatechange = ()=>{
        if(xhr.readyState === 4) {
            const subXhr = new XMLHttpRequest()
            subXhr.open('post','getTimer')
            subXhr.setRequestHeader('content-type','application/json')            
            subXhr.send(jsonData)
            subXhr.onreadystatechange = ()=>{
                if(subXhr.readyState === 4) {        
                    const jsonParser = JSON.parse(subXhr.responseText)
                    console.log(jsonParser);
                    
                    const startTime = new Date(jsonParser.StartTime).getTime()
                    const quizDuration = jsonParser.Duration*60*1000                    
                    const finishTime = startTime+quizDuration
                    counter = new Date(finishTime - new Date().getTime())
                    timer.textContent = `${counter.getUTCMinutes()} : ${counter.getUTCSeconds()}`
                    
                }
            }
            let counterFunc = setInterval(() => {
                console.log(counter);                        
                if(counter > 0) {
                    counter-=1000

                    timer.textContent = `${new Date(counter).getUTCMinutes()} : ${new Date(counter).getUTCSeconds()}`
                } else {                           
                    clearInterval(counterFunc)
                    submitAnswer()
                }            
            }, 1000);
            return counterFunc;
        }
    }

}




window.onload = ()=>{
    const submitBtn = document.getElementById('submit')
    submitBtn.addEventListener('click',submitAnswer)
    const data = JSON.parse(window.localStorage.getItem('json'))
    for(let i = 0; i< data.length;i++) {
        let newQuestion = new Question(data[i].QValue,data[i].AValue,data[i].QID,data[i].AID,"app")
        if(i === 0) {
            // create first question
            newQuestion.createQuestionHead()
            newQuestion.createAnswer()
        } else {
            const k = i-1
            if(data[i].QID === data[k].QID) {
                newQuestion.createAnswer()
                // append answers to question
            } else {
                // set new question 
                newQuestion.createQuestionHead()
                newQuestion.createAnswer()
            }
        }
    }
}



class Question {
    constructor(_q,_a,_qID,_aID,_link) {
        this.question = _q
        this.answer = _a
        this.qID = _qID
        this.parent = _link
        this.aID = _aID
    }

    createQuestionHead() {
        const div = document.createElement('div')
        div.classList.add("holder")
        div.setAttribute("id",this.qID)
        const questionHead = document.createElement("p")
        questionHead.classList.add("questionHead")
        questionHead.textContent = this.question + '?'
        div.appendChild(questionHead)
        document.getElementById(this.parent).appendChild(div)
    }

    createAnswer(_a,_aID){
        const answer = document.createElement("input")
        const label = document.createElement("label")
        label.setAttribute("for",_aID ? "r-"+_aID : "r-"+this.aID)
        label.setAttribute("id",_aID ? "label-"+_aID : "label-"+this.aID)
        label.textContent = _a ? _a : this.answer
        answer.type = "radio"
        answer.required = true
        answer.name = this.qID
        answer.value = _a ? _a : this.answer
        answer.classList.add("Answers")
        checkStoredAnswers(answer,this.aID,label)
        answer.setAttribute("id",_aID ? "r-"+_aID : "r-"+this.aID)
        answer.onchange = (e)=> {
            let rButtons = document.getElementsByName(e.target.name)
            for(let i of rButtons){
                if(i.checked){
                    let id = i.id.split('-')[1]
                    let markLabel = document.getElementById(`label-${id}`)
                    window.localStorage.setItem(i.name,id)
                    markLabel.classList.add('isSelected')
                    checkStoredAnswers(answer,_aID)
                } else {
                    let id = i.id.split('-')[1]
                    let markLabel = document.getElementById(`label-${id}`)
                    markLabel.classList.remove('isSelected')
                }
            }

        }

        document.getElementById(this.qID).appendChild(answer)
        document.getElementById(this.qID).appendChild(label)
    }
}

function checkStoredAnswers(answer,_aID,label){
    let storeAnswers = window.localStorage.getItem(answer.name)
    if(storeAnswers) {
        if(storeAnswers == _aID) {
            answer.checked = true
            label.classList.add('isSelected')
        }
    }
}

function submitAnswer(e){
    const submitBtn = document.getElementById('submit')
    submitBtn.removeEventListener('click',submitAnswer)
    submitBtn.style = "display:none"
    const answersKeys = []
    let data = {}
    let answers = document.getElementsByClassName('Answers')
    for(let i in window.localStorage) {
        for(let k of answers) {
            if(i == k.name && !answersKeys.includes(`${i}-${window.localStorage.getItem(i)}`)) {
                answersKeys.push(`${i}-${window.localStorage.getItem(i)}`)
            }
        }
    }
    Object.assign(data,answersKeys)
    Object.assign(data , {"qid":window.localStorage.getItem('qid')})
    const xhr = new XMLHttpRequest()
    xhr.open('post','./answers')
    xhr.setRequestHeader("content-type","application/json")
    xhr.send(JSON.stringify(data))

    loadingSlider(xhr)
    xhr.onreadystatechange = ()=>{
        if(xhr.readyState === 4) {
            loadingSlider(xhr)
            responseMsg(xhr.responseText,xhr.status)
            setTimeout(()=>{
                window.location.href = window.location.origin+'/main'
            },1500)
        }
    }
}