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

if('serviceWorker' in navigator) {
    send().catch(err=>{
        console.error(err)
    })
}
    
async function send(){
    const register = await navigator.serviceWorker.register("../sw.js")
    if(Notification.permission == 'granted') {
        const subscription =  await register.pushManager.subscribe({
            userVisibleOnly : true,
            applicationServerKey : "BGRa7VZ1GpJjfeLQn6UIs2TF2A8JF3GtXURVlvnprd8PBC27gO2KiCdmSt4ozQRoJIkG7ITVehIdc-2Z01e575c"
        })
        await fetch('subscribe',{
            method: "post",
            headers: {"Content-type":"application/json"},
            body: JSON.stringify(subscription)
        })
    } else {
        Notification.requestPermission().then(permission=>{
            console.log(permission);
        })
    }
}

function getNextQuiz() {
    const xhr = new XMLHttpRequest()
    xhr.open('get','agent/quizez')
    xhr.send()
    loadingSlider(xhr)
    xhr.onreadystatechange = ()=>{
        if(xhr.readyState === 4) {
            loadingSlider(xhr)
            try {
                const rows = JSON.parse(xhr.responseText)
                if(rows.length !== 0){
                    for(let i of rows) {
                        let now = new Date().getTime()
                        let qDate = new Date(i.QDate).getTime()
                        let zone = Math.abs(new Date(i.QDate).getTimezoneOffset()*60*1000)
                        let zonedDate = new Date(qDate+zone).getTime()
                        if(zonedDate > now) {
                            const quizDateObj = new Date(zonedDate)
                            const day = 60 * 60 * 24 * 1000
                            let variance = quizDateObj.getTime() - now
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
                            (zonedDate <= now) &&
                            (now < zonedDate+(i.Duration*60*1000))) {
                                quizDate.textContent = `Take the quiz now!!`
                                break
                        } else {
                            
                            quizDate.textContent = `No new quiz assigned`
                        }
                    }
                } else {
                    quizDate.textContent = `No new quiz assigned`
                }
            }
            catch{
                window.location.assign(xhr.responseURL)
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