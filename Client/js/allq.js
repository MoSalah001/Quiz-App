import { loadingSlider } from "./loader.mjs"
import { userAnswer, resultCheck } from "./quizModule.mjs"
const app = document.getElementById('app')
function loadCards() {
    const xhr = new XMLHttpRequest()
    xhr.open('post','allq')
    xhr.send()
    loadingSlider(xhr)
    xhr.onreadystatechange = ()=>{
        if(xhr.readyState == 4){
            loadingSlider(xhr)
            resultCard(xhr.responseText);
        }
    }
}
loadCards()

class ResultCard {
    constructor(rows) {
        this.id = rows.QuizID
        this.date = rows.QDate
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
        const creator = document.createElement('p')
        creator.textContent ="Created By: "+ this.creator
        const id = document.createElement('p')
        id.textContent = "Quiz ID: "+this.id
        div.append(id,creator)
        div.setAttribute('type','result')
        div.addEventListener('click',quizRes)
        fragment.append(div)
        return fragment
    }
}

function resultCard(rows) {
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

async function addRow(response,QuizCount,base,table){
    let data = response
    const row = document.createElement('tr')
    const uName = document.createElement('td')
    uName.textContent = data.NTUser
    const sID = document.createElement('td')
    sID.textContent = data.StaffID
    const qID = document.createElement('td')
    qID.textContent = data.QuizID ? data.QuizID : "No Show"
    qID.setAttribute('id','qid')
    qID.setAttribute('sid',data.StaffID)
    if(data.QuizID) {
        qID.addEventListener('click',showUserAnswers)
    }
    const quotient = document.createElement('td')
    quotient.textContent = ((data.dividend / QuizCount)*100).toFixed(0)+"%"
    let check = data.dividend >= base ? true : false
    if(check){
        row.classList.add('pass')
    } else if(qID.textContent === "No Show"){
        row.classList.add('no-show')
    } else {
        row.classList.add('fail')
    }
    row.append(uName,sID,quotient,qID)
    table.append(row)
}

function quizRes(e){
    let data = {
        id : e.target.parentElement.id
    }
    removeCards()
    const xhr = new XMLHttpRequest()
    xhr.open('post',`result/${data.id}`)
    xhr.setRequestHeader('content-type','application/json')
    xhr.send(JSON.stringify(data))
    loadingSlider(xhr)
    xhr.onreadystatechange = ()=>{
        if(xhr.readyState === 4) {
            const subXhr = new XMLHttpRequest()
            subXhr.open('get',`result/${data.id}`)
            subXhr.send()
            subXhr.onreadystatechange = async ()=>{
                if(subXhr.readyState === 4) {
                    let res = JSON.parse(subXhr.responseText)
                    const tableHeaderUser = document.createElement('th')
                    tableHeaderUser.textContent = "NT User"
                    const tableHeaderStaff = document.createElement('th')
                    tableHeaderStaff.textContent = "Staff ID"
                    const tableHeaderResult = document.createElement('th')
                    tableHeaderResult.textContent = "Result"
                    const tableHeaderQuizID = document.createElement('th')
                    tableHeaderQuizID.textContent = "Quiz ID"
                    table.append(tableHeaderUser,tableHeaderStaff,tableHeaderResult,tableHeaderQuizID)
                    let baseXhr = new XMLHttpRequest()
                    let par;
                    let base;
                    let payload = {
                        quiz: data.id
                    }
                    baseXhr.open('post',`result/${data.id}/getAnswersBase`)
                    baseXhr.setRequestHeader('content-type','application/json')
                    baseXhr.send(JSON.stringify(payload))
                    baseXhr.onreadystatechange = async()=>{
                        if(baseXhr.readyState === 4) {
                            par = await JSON.parse(baseXhr.responseText).QuizCount
                            base = (par*0.6).toFixed(0)
                        }
                    }
                    let result = new XMLHttpRequest()
                    result.open('post',`result/${data.id}/getAnswersCount`)
                    result.setRequestHeader('content-type','application/json')
                    result.send(JSON.stringify(payload))
                    result.onreadystatechange = ()=>{
                        if(result.readyState === 4) {
                            let dataParser = JSON.parse(result.responseText)
                            let table = document.getElementById('table')
                            for(let row of dataParser) {
                                addRow(row,par,base,table)
                            }
                        }
                    }
                }
                loadingSlider(subXhr)
            }
        }
    }
    const resetBtn = document.createElement('btn')
    resetBtn.textContent = "Reset"
    resetBtn.setAttribute('id','reset-btn')
    app.append(resetBtn)
}

function removeCards(){
    const app = document.getElementById('app')
    app.textContent = ""
    const table = document.createElement('table')
    table.setAttribute('id','table')
    app.append(table)
}

function showUserAnswers(e){
    const payload = {
        QID: e.target.textContent,
        sID: e.target.getAttribute('sid')
    }
    const xhr = new XMLHttpRequest()
    xhr.open('post',`result/${payload.QID}`)
    xhr.setRequestHeader('content-type','application/json')
    xhr.send(JSON.stringify(payload))
    xhr.onreadystatechange = ()=>{
        if(xhr.readyState === 4) {
            const subXhr = new XMLHttpRequest()
            subXhr.open('post',`result/${payload.QID}/getUserAnswers`)
            subXhr.setRequestHeader('content-type','application/json')
            subXhr.send(JSON.stringify(payload))
            subXhr.onreadystatechange = ()=>{
                if(subXhr.readyState === 4) {
                    app.textContent = ""
                    console.log(subXhr.responseText);
                    setTimeout(()=>{
                        resultCheck(JSON.parse(xhr.responseText))
                        userAnswer(JSON.parse(subXhr.responseText))
                    },2000)
                }
            }
        }   
    }
   
}