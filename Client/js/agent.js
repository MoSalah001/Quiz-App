import {loadingSlider , responseMsg} from './loader.mjs'
const user = document.getElementById('user')
const regex = /^[^;]*/ //find untill found
const current = regex.exec(document.cookie.split("=")[3])
user.innerHTML = `Staff ID: <span>${current}</span>`
const lgout = document.getElementById('lgout')
const quizDate = document.getElementById('quizDate')
let timer
lgout.addEventListener('click',lgoutUser)

function lgoutUser(){
    const xhr = new XMLHttpRequest()
    xhr.open('get','/lgout')
    xhr.send()
    loadingSlider(xhr)
    xhr.onreadystatechange = ()=>{
        if(xhr.readyState === 4){
            loadingSlider(xhr)
            responseMsg(xhr.responseText)
            document.cookie = "user=; Max-Age=0; Path=/;"
            checkUserStatus()
        }
    }
}
import checkUserStatus from "./checkUser.mjs"

checkUserStatus()
function getNextQuiz() {
    const xhr = new XMLHttpRequest()
    xhr.open('get','agent/quizez')
    xhr.send()
    loadingSlider(xhr)
    xhr.onreadystatechange = ()=>{
        if(xhr.readyState === 4) {
            loadingSlider(xhr)
            const rows = JSON.parse(xhr.responseText)
            const date = new Date()
            for(let i of rows) {
                if(new Date(i.QDate) > new Date()) {
                    const mainDate = new Date(i.QDate)
                    timer = new Date(i.QDate) - new Date()
                    quizDate.textContent = `Quiz Date: 
                    ${new Date(timer).getMonth()} M 
                    ${new Date(timer).getDay()} D
                    ${new Date(timer).getHours()} : 
                    ${new Date(timer).getMinutes()} : 
                    ${new Date(timer).getSeconds()}
                    `
                    break;
                }
            }
        }
    }
}
getNextQuiz()

setInterval(()=>{
    timer--
    quizDate.textContent = `Quiz Date: 
                    ${new Date(timer).getMonth()} M 
                    ${new Date(timer).getDay()} D
                    ${new Date(timer).getHours()} H: 
                    ${new Date(timer).getMinutes()} M:
                    ${new Date(timer).getSeconds()} S
`
},1000)