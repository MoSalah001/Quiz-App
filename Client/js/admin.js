const user = document.getElementById('user')
const regex = /^[^;]*/ //find untill found
const current = regex.exec(document.cookie.split("=")[1])
user.innerHTML = `Staff ID: <span>${current}</span>`
const btn = document.getElementById('quizBtn')

import {loadingSlider, responseMsg} from "./loader.mjs"

btn.addEventListener('click',saveQuiz)

function saveQuiz(e){
    e.preventDefault()
    const data = {
        date: document.getElementById("date").value,
        duration: document.getElementById("duration").value
    }
    const xhr = new XMLHttpRequest()
    xhr.open("post","newq/new",true)
    xhr.setRequestHeader("content-type","application/json")
    xhr.send(JSON.stringify(data))
    loadingSlider(xhr)
    xhr.onreadystatechange = ()=>{
        if(xhr.readyState === 4){
            loadingSlider(xhr)
            responseMsg(xhr.responseText,xhr.status)
        }
    }
}
