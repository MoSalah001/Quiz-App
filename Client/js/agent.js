import {loadingSlider , responseMsg} from './loader.mjs'
const user = document.getElementById('user')
const filterCookie = document.cookie.indexOf('user=');
const current = document.cookie.substring(filterCookie+5,filterCookie+12)
user.innerHTML = `Staff ID: <span>${current}</span>`
const lgout = document.getElementById('lgout')
const quizDate = document.getElementById('quizDate')
lgout.addEventListener('click',lgoutUser)

console.log(filterCookie);




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
    xhr.open('post','agent/agentData')
    xhr.setRequestHeader('content-type','application/json')
    xhr.send(JSON.stringify({user: current}))
    loadingSlider(xhr)
    xhr.onreadystatechange = ()=>{
        if(xhr.readyState === 4) {
            loadingSlider(xhr)
            let jsonParser = JSON.parse(xhr.responseText)            
            const subXhr = new XMLHttpRequest()
            subXhr.open('post','agent/quizData')
            subXhr.setRequestHeader('content-type','application/json')
            subXhr.send(JSON.stringify(jsonParser[0]))
            subXhr.onreadystatechange = ()=>{
                if(subXhr.readyState === 4) {
                    try {
                        const rows = JSON.parse(subXhr.responseText)
                        window.localStorage.setItem('rows',JSON.stringify(rows))
                        
                        if(rows.length !== 0){
                            quizDate.textContent = `New Quiz Assgined - Take It Now`
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
    }
}
getNextQuiz()
