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
                    let now = new Date().getTime()
                    let qDate = new Date(i.QDate).getTime()
                    if(qDate > now) {
                        const quizDateObj = new Date(i.QDate)
                        let tzCalc = quizDateObj.getTimezoneOffset() + 60
                        const day = 60 * 60 * 24 * 1000
                        let variance = quizDateObj.getTime() - now + (tzCalc*60*1000)
                        let dayVar = variance/day
                        let dateVariance = new Date(variance)
                        quizDate.textContent = `
                            ${dateVariance.getMonth()} M 
                            ${Math.floor(dayVar)} D
                            ${dateVariance.getHours()} H: 
                            ${dateVariance.getMinutes()} M: 
                            ${dateVariance.getSeconds()} S
                        `
                        countDown(variance,dateVariance,day,0)
                    } else if(
                        (qDate <= now) &&
                        (now < qDate+(i.Duration*60*1000))) {
                            quizDate.textContent = `Take the quiz now!!`
                            countDown(0,0,0,1)
                            break
                    } else {
                        continue
                    }
                }
            } else {
                quizDate.textContent = `No new quiz assigned`
            }
            
        }
    }
}
getNextQuiz()

function countDown(variance,dateVariance,day,clear){
    if(clear === 0) {
        setInterval(()=>{
            variance-=1000
            dateVariance = new Date(variance)
            let dayVar = variance/day
            quizDate.textContent = `
                ${dateVariance.getMonth()} M 
                ${Math.floor(dayVar)} D
                ${dateVariance.getHours()} H: 
                ${dateVariance.getMinutes()} M: 
                ${dateVariance.getSeconds()} S
                `
        },1000)
    } else {
        return true
    }
    
}