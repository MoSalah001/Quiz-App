import { loadingSlider } from "./loader.mjs"

export function quizCard(rows) {
    const dataArray = JSON.parse(rows)
    for(let i in dataArray) {
        const testCard = new QuizCard(dataArray[i]).create()
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
        this.date = rows.QDate
        this.status = rows.QStatus
        this.creator = rows.QCreator
        this.duration = rows.Duration
    }

    create(){
        const fragment = document.createDocumentFragment()
        const div = document.createElement('div')
        div.classList.add('card')
        div.setAttribute('id',this.id)
        // fix for local summertime adjustments - this fix will generate wrong time calculation to any GMT+3 country
        const timeZoneFix = new Date(this.date).getTimezoneOffset() == -180 ? 60 : new Date(this.date).getTimezoneOffset()
        const filterDate = new Date(this.date).getTime() - timeZoneFix*60*1000
        const shownDate = new Date(filterDate).toLocaleString('en-CA').split(',')
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
        const startTime = new Date(filterDate)
        const calculateDuration = startTime.getTime()+(this.duration*60*1000)
        const endTime = new Date(calculateDuration)
        const now = new Date()
        if( startTime.getTime() < now.getTime()  &&
            now.getTime() < endTime.getTime() ) {
                div.addEventListener('click',takeQuiz)
            } else {
                div.addEventListener('click',notYet)
                // div.addEventListener('click',takeQuiz)
            }
            fragment.append(div)
        if( startTime.getTime() < now.getTime()  &&
            now.getTime() > endTime.getTime() 
        ) {
            // update DB with quiz status
            // const xhr = new XMLHttpRequest()
            return null
        } else {
            return fragment
        }
    }
}


function takeQuiz(e){
    const data = {
        id:e.target.parentElement.getAttribute('id')
    }
    const xhr = new XMLHttpRequest()
    xhr.open('post',`./quiz${data.id}`)
    xhr.send()
    loadingSlider(xhr)
    xhr.onreadystatechange = ()=>{
        if(xhr.readyState === 4) {
            window.localStorage.setItem("json",xhr.responseText)
            const qid = JSON.parse(xhr.responseText)[0].QuizID
            window.localStorage.setItem("qid",qid)
            const subXhr = new XMLHttpRequest()
            subXhr.open('get',`./quiz/q${data.id}`)
            subXhr.send()
            subXhr.onreadystatechange = ()=>{
                if(subXhr.readyState === 4) {
                    window.location = subXhr.responseURL
                }
            }
        }
    }
}

function notYet(e) {
    window.alert("Please Wait for quiz time")
}