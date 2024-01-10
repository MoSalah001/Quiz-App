const app = document.getElementById("form-div")
const user = document.getElementById('user')
const current = document.cookie.split("=")[1]
user.innerHTML = `Staff ID: <span>${current}</span>`
const btn = document.getElementById('quizBtn')

const form = document.forms["newQuiz"]


function responseMsg(msg,state){
    const box = document.createElement('div')
    box.classList.add('dialog')
    box.textContent = msg
    document.body.append(box)
}

function loadingSlider(res){
    if(res.readyState === 1) {
        const page = document.createElement('div')
        const box = document.createElement('div')
        const eye = document.createElement('div')
        page.id = "page"
        page.classList.add('loadPage')
        box.classList.add('box')
        eye.classList.add('eye')
        page.append(box)
        box.append(eye)
        document.body.append(page)
    }
    if (res.readyState === 4) {
        const getPage = document.getElementById("page")
        document.body.removeChild(getPage)
    }
}

btn.addEventListener('click',saveQuiz)

function saveQuiz(e){
    e.preventDefault()
    const data = {
        date:form.date.value,
        duration: form.duration.value
    }
    const xhr = new XMLHttpRequest()
    xhr.open("post","newq/newquiz",true)
    xhr.setRequestHeader("content-type","application/json")
    xhr.send(JSON.stringify(data))
    loadingSlider(xhr)
    xhr.onreadystatechange = ()=>{
        if(xhr.status === 400) {
            responseMsg(xhr.responseText)
        }
        if(xhr.readyState === 4){
            loadingSlider(xhr)
        }
    }
}