import {loadingSlider, responseMsg} from "./loader.mjs"
import checkUserStatus from "./checkUser.mjs"
const filterCookieUser = document.cookie.indexOf("user=")
const userID = document.cookie.substring(filterCookieUser+5,filterCookieUser+11)
const user = document.getElementById('user')
const h1 = document.getElementById("h1-mid")
const lgout = document.getElementById('lgout')
lgout.addEventListener('click',lgoutUser)
user.innerHTML = `Staff ID: <span>${userID}</span>`
h1.innerHTML = `User with Staff ID: <span id="sp-mid">${userID}</span> is not yet approved by admin to have access on this resource. Check again later`

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