const user = document.getElementById('user')
const regex = /^[^;]*/ //find untill found
const current = regex.exec(document.cookie.split("=")[1])
const lgout = document.getElementById('lgout')
user.innerHTML = `Staff ID: <span>${current}</span>`
const btn = document.getElementById('quizBtn')
import checkUserStatus from "./checkUser.mjs"

import {loadingSlider, responseMsg} from "./loader.mjs"
checkUserStatus()
if(lgout){
    lgout.addEventListener('click',lgoutUser)
}

function lgoutUser(){
    const xhr = new XMLHttpRequest()
    xhr.open('get','/lgout')
    xhr.send()
    loadingSlider(xhr)
    xhr.onreadystatechange = ()=>{
        if(xhr.readyState === 4){
            loadingSlider(xhr)
            responseMsg(xhr.responseText)
            document.cookie="user=; Max-Age=0; Path=/;"
            checkUserStatus()
        }
    }
}
window.onload = ()=>{
    if(btn) {
        btn.addEventListener('click',saveQuiz)
    }
}

function saveQuiz(e){
    // e.preventDefault()
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
            checkUserStatus()
        }
    }
}
