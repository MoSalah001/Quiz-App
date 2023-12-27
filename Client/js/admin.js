const app = document.getElementById("form-div")
const user = document.getElementById('user')
const current = document.cookie.split("=")[1]
user.innerHTML = `Staff ID: <span>${current}</span>`
const btn = document.getElementById('quizBtn')

const form = document.forms["newQuiz"]


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
    xhr.onreadystatechange = ()=>{
        if(xhr.readyState === 4){
            const data = JSON.parse(xhr.responseText)
            window.localStorage.setItem("quizDate",new Date(data.quizDate).toISOString())
            window.localStorage.setItem("quizDuration",data.quizDuration)
            window.localStorage.setItem("quizCreator",data.quizCreator)
            app.textContent = ""
            quizDiv(app)
        }
    }
}