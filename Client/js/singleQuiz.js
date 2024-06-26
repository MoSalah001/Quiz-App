import { loadingSlider } from "./loader.mjs"
import { resultCheck, userAnswer } from "./quizModule.mjs"
const user = document.getElementById('user')
const filterCookie = document.cookie.indexOf('user=');
const current = document.cookie.substring(filterCookie+5,filterCookie+11)
user.innerHTML = `Staff ID: <span>${current}</span>`
const quizID = {
    id : window.localStorage.getItem('QuizID').replace(/"/g,"")
}
window.onload = ()=>{
    const xhr = new XMLHttpRequest()
    xhr.open('post',`./${quizID.id}`)
    xhr.setRequestHeader('content-type','application/json')
    xhr.send(JSON.stringify(quizID))
    loadingSlider(xhr)
    xhr.onreadystatechange = ()=>{
        if(xhr.readyState === 4) {
            resultCheck(JSON.parse(xhr.responseText))
            const subXhr = new XMLHttpRequest()
            subXhr.open('post',`./${quizID.id}/getAnswers`)
            subXhr.setRequestHeader('content-type','application/json')
            subXhr.send(JSON.stringify(quizID))
            subXhr.onreadystatechange = ()=>{
                if(subXhr.readyState === 4) {
                    }
                    userAnswer(JSON.parse(subXhr.responseText))
                }
            }
        }
        const secondXhr = new XMLHttpRequest()
        secondXhr.open('post',`./${quizID.id}/getAnswersCount`)
        secondXhr.setRequestHeader('content-type','application/json')
        secondXhr.send(JSON.stringify(quizID))
        secondXhr.onreadystatechange = ()=>{
            if(secondXhr.readyState === 4) {
                loadingSlider(secondXhr)
                markDiv(secondXhr.responseText)
            }
    }

}

function markDiv(responseText) {
    let parsedData = JSON.parse(responseText)
    console.log(parsedData);
    let quizMark = parsedData.quizCount
    let userMark = parsedData.userCount
    let div = document.createElement('div')
    div.setAttribute("id",'result-div')
    div.textContent = ((userMark/quizMark)*100).toFixed(2) +"%"
    let app = document.getElementById('app')
    app.append(div)
}