import { loadingSlider } from "./loader.mjs"
import { resultCheck } from "./quizModule.mjs"
const user = document.getElementById('user')
const filterCookie = document.cookie.indexOf('user=');
const current = document.cookie.substring(filterCookie+5,filterCookie+11)
user.innerHTML = `Staff ID: <span>${current}</span>`
const app = document.getElementById('app')
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
            loadingSlider(xhr)
            resultCheck(JSON.parse(xhr.responseText))
        }
    }

}

