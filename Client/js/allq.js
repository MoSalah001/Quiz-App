import { loadingSlider } from "./loader.mjs"
const app = document.getElementById('app')
const table = document.getElementById('table')
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
        const filterDate = new Date(this.date)
        const zone = filterDate.getTimezoneOffset() < 0 ? Math.abs(filterDate.getTimezoneOffset()*60*1000) : filterDate.getTimezoneOffset()*60*1000*-1 
        const shownDate = new Date(filterDate.getTime()+zone).toLocaleString('en-CA').split(',')
        const date = document.createElement('p')
        date.textContent = "Quiz Date: "+ shownDate[0]
        const quizTime = document.createElement('p')
        quizTime.innerHTML = `Quiz Time: ${shownDate[1]}`
        const status = document.createElement('p')
        status.textContent ="Quiz Status: "+ this.status
        const creator = document.createElement('p')
        creator.textContent ="Created By: "+ this.creator
        const duration = document.createElement('p')
        duration.textContent = "Quiz Duration: "+ this.duration
        const id = document.createElement('p')
        id.textContent = "Quiz ID: "+this.id
        div.append(id,date,quizTime,status,creator,duration)
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

function quizRes(e){
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

                    table.append(tableHeaderUser,tableHeaderStaff,tableHeaderResult)
                    for(let i of res) {
                        let payload = {
                            quiz: data.id,
                            sID: i.StaffID
                        }
                        let result = new XMLHttpRequest()
                        result.open('post',`result/${data.id}/getAnswersCount`)
                        result.setRequestHeader('content-type','application/json')
                        result.send(JSON.stringify(payload))
                        result.onreadystatechange = ()=>{
                            if(result.readyState === 4) {
                                console.log(result.responseType);
                            }
                        }
                        const row = document.createElement('tr')
                        const uName = document.createElement('td')
                        uName.textContent = i.NTUser
                        const sID = document.createElement('td')
                        sID.textContent = i.StaffID
                        row.append(uName,sID)
                    }
                }
            }
        }
    }
}