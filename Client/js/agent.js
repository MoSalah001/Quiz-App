import {loadingSlider , responseMsg} from './loader.mjs'
const user = document.getElementById('user')
const filterCookie = document.cookie.indexOf('user=');
const current = document.cookie.substring(filterCookie+5,filterCookie+11)
user.innerHTML = `Staff ID: <span>${current}</span>`
const lgout = document.getElementById('lgout')
const quizDate = document.getElementById('quizDate')
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
            window.localStorage.clear()
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
            if(rows.length !== 0){
                for(let i of rows) {
                    if(new Date(i.QDate) > new Date()) {
                        const quizDateObj = new Date(i.QDate)
                        let variance = quizDateObj.getTime() - new Date().getTime()
                        let dateVariance = new Date(quizDateObj.getTime()-variance)
                        quizDate.textContent = `
                        ${quizDateObj.getMonth() - dateVariance.getMonth()} M 
                        ${quizDateObj.getDate() - dateVariance.getDate()} D
                        ${quizDateObj.getHours() - dateVariance.getHours()} H: 
                        ${quizDateObj.getMinutes() - dateVariance.getMinutes() - 1} M: 
                        ${59 - dateVariance.getSeconds() - quizDateObj.getSeconds()} S
                        `
                        setInterval(()=>{
                            variance-=1000
                            dateVariance = new Date(quizDateObj.getTime()-variance)
                            quizDate.textContent = `
                                ${quizDateObj.getMonth() - dateVariance.getMonth()} M 
                                ${quizDateObj.getDate() - dateVariance.getDate()} D
                                ${quizDateObj.getHours() - dateVariance.getHours()} H: 
                                ${quizDateObj.getMinutes() - dateVariance.getMinutes()-1} M: 
                                ${59 - dateVariance.getSeconds() - quizDateObj.getSeconds()} S
                                `
                        },1000)
                    } else {
                        quizDate.textContent = `No new quiz assigned`
                    }
                }
            } else {
                quizDate.textContent = `No new quiz assigned`
            }
            
        }
    }
}
getNextQuiz()
