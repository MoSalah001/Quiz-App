import { loadingSlider, responseMsg } from "./loader.mjs"

export function quizCard(rows) {
    const dataArray = JSON.parse(rows)
    for(let i in dataArray) {        
        const testCard = new QuizCard(dataArray[i]).create()
        const app = document.getElementById('app')
        if(testCard == null) {
            console.log('no');
            continue
        }
        else {                        
            app.append(testCard)
        }
    }
}

export function resultCard(rows) {
    const dataArray = JSON.parse(rows)
    for(let i in dataArray) {
        const testCard = new ResultCard(dataArray[i]).result()
        const app = document.getElementById('app')
        if(testCard == null) continue
        else {
            app.append(testCard)
        }
    }
}


class QuizCard{
    constructor(rows) {
        this.id = rows.QuizID
        this.name = rows.QName
        this.creator = rows.QCreator
        this.duration = rows.Duration
    }

    create(){        
        const fragment = document.createDocumentFragment()
        const div = document.createElement('div')
        div.classList.add('card')
        div.setAttribute('id',this.id)
        const creator = document.createElement('p')
        creator.textContent ="Created By: "+ this.creator
        creator.setAttribute('id',this.id)
        const duration = document.createElement('p')
        duration.textContent = "Quiz Duration: "+ this.duration
        duration.setAttribute('id',this.id)
        const id = document.createElement('p')
        id.textContent = "Quiz ID: "+this.id
        id.setAttribute('id',this.id)
        div.addEventListener('click',takeQuiz)
        div.append(id,creator,duration)
        fragment.append(div)       
        
        return fragment
    }


}

class ResultCard {
    constructor(rows) {
        this.id = rows.QuizID
        this.status = rows.QStatus
        this.creator = rows.QCreator
        this.duration = rows.Duration
    }

    result(){
        const fragment = document.createDocumentFragment()
        const div = document.createElement('div')
        div.classList.add('card')
        div.setAttribute('id',this.id)
        div.setAttribute('type','pending')
        const status = document.createElement('p')
        status.textContent ="Quiz Status: "+ this.status
        const creator = document.createElement('p')
        creator.textContent ="Created By: "+ this.creator
        const duration = document.createElement('p')
        duration.textContent = "Quiz Duration: "+ this.duration
        const id = document.createElement('p')
        id.textContent = "Quiz ID: "+this.id
        div.append(id,status,creator,duration)
        div.addEventListener('click',quizRes)
        fragment.append(div)
        return fragment
    }
}

function takeQuiz(e){
    const data = {
        id:e.target.parentElement.getAttribute('id')
    }
    console.log(e.target.id);
    
    const xhr = new XMLHttpRequest()
    xhr.open('post',`./quiz${data.id}`)
    xhr.send()
    loadingSlider(xhr)
    xhr.onreadystatechange = ()=>{
        if(xhr.readyState === 4 && xhr.status !== 400) {
            window.localStorage.setItem("json",xhr.responseText)
            if(xhr.responseText[0]) {
                const qid = JSON.parse(xhr.responseText)[0].QuizID
                window.localStorage.setItem("qid",qid)
            }            
        
            const subXhr = new XMLHttpRequest()
            subXhr.open('get',`./quiz/q${data.id}`)
            subXhr.send()
            subXhr.onreadystatechange = ()=>{
                if(subXhr.readyState === 4) {
                    window.location = subXhr.responseURL
                }
            }
        } else if(xhr.readyState === 4) {
            loadingSlider(xhr)
            responseMsg(xhr.responseText,xhr.status)
        }
    }
}

function notYet(e) {
    window.alert("Please Wait for quiz time")
}

function notYetRes(){
    window.alert("Please wait for quiz to finish")
}

function quizRes(e) {
    let data = {
        id : e.target.parentElement.id
    }
    const xhr = new XMLHttpRequest()
    xhr.open('post',`result/${data.id}`)
    xhr.setRequestHeader('content-type','application/json')
    xhr.send(JSON.stringify(data))
    loadingSlider(xhr)
    xhr.onreadystatechange = ()=>{
        if(xhr.readyState === 4) {
            window.localStorage.setItem('QuizID',JSON.stringify(JSON.parse(xhr.responseText)[0].QuizID))
            const subXhr = new XMLHttpRequest()
            subXhr.open('get',`result/${data.id}`)
            subXhr.send()
            subXhr.onreadystatechange = ()=>{
                if(subXhr.readyState === 4) {
                    window.location.assign(subXhr.responseURL)
                }
            }
        }
    }
}



export function resultCheck(rows){
    for(let row in rows) {
        let qHead = new ResultCheck(rows[row],'app')
        if(row == 0) {
            qHead.createQuestionHead()
            qHead.createAnswer()
        } else {
            let k = row -1
            if(rows[row].QID === rows[k].QID){
                qHead.createAnswer()
            } else {
                qHead.createQuestionHead()
                qHead.createAnswer()
            }
        }

    }
}

export function userAnswer(rows) {
    for(let row in rows) {
        let qHead = new ResultCheck(rows[row],'app')
        qHead.createUserAnswer()
    }
}

export function markDiv(responseText,adminInput) {
    let parsedData = JSON.parse(responseText)
    let app = document.getElementById('app')
    if(!adminInput){
        let quizMark = parsedData.quizCount
        let userMark = parsedData.userCount
        let div = document.createElement('div')
        div.setAttribute("id",'result-div')
        div.textContent = ((userMark/quizMark)*100).toFixed(2) +"%"
        app.append(div)
    } else {
        let div = document.createElement('div')
        div.setAttribute("id",'result-div')
        div.textContent = adminInput
        app.append(div)        
    }
    
}

class ResultCheck {
    constructor(rows,_link) {
        this.qHead = rows.QValue
        this.qIsTrue = rows.isTrue
        this.qID = rows.QID
        this.aID = rows.AID
        this.aValue = rows.AValue
        this.parent = _link
    }

    createQuestionHead() {
        const fragment = document.createDocumentFragment()
        const div = document.createElement('div')
        const qHead = document.createElement('h3')
        div.setAttribute('id',this.qID)
        qHead.textContent = "Q: "+this.qHead 
        qHead.classList.add('question-head')
        const parent = document.getElementById(this.parent)
        div.append(qHead)
        div.classList.add('question-card')
        fragment.append(div),
        parent.append(fragment)
    }

    createAnswer() {
        const p = document.createElement('p')
        p.textContent = this.aValue
        let check = this.qIsTrue == 1 ? true : false
        if(check){
            p.classList.add('true')
        } else {
            p.classList.remove('true')
        }
        p.setAttribute('id',this.aID)
        const qHead = document.getElementById(this.qID)
        qHead.append(p)
    }
    createUserAnswer(){
        let selectedAnswer = document.getElementById(this.aID)
        let check = this.qIsTrue == 1 ? true : false
        if(check) {
            selectedAnswer.setAttribute('id',"true")
        } else {
            selectedAnswer.setAttribute('id',"mark")
        }
    }
}