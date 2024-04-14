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
        const date = document.createElement('p')
        date.textContent = "Quiz Date: "+ this.date
        const status = document.createElement('p')
        status.textContent ="Quiz Status: "+ this.status
        const creator = document.createElement('p')
        creator.textContent ="Created By: "+ this.creator
        const duration = document.createElement('p')
        duration.textContent = "Quiz Duration: "+ this.duration
        const id = document.createElement('p')
        id.textContent = "Quiz ID: "+this.id
        div.append(id,date,status,creator,duration)
        div.addEventListener('click',takeQuiz)
        fragment.append(div)
        if(new Date(date.textContent) < new Date()) {
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