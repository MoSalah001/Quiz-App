const app = document.getElementById("form-div")
const user = document.getElementById('user')
const current = document.cookie.split("=")[1]
user.innerHTML = `Staff ID: <span>${current}</span>`
const btn = document.getElementById('quizBtn')

const quizData =[]

const nextQ = document.createElement("input")
nextQ.type = "button"
nextQ.value = "Next Question"
nextQ.id = "nextQ"
const prevQ = document.createElement('input')
prevQ.value = "Previous Question"
prevQ.id = "prevQ"
prevQ.type = 'button'
const saveDraft = document.createElement('input')
saveDraft.type = "button"
saveDraft.id = "saveDraft"
saveDraft.value = "Save Draft"
saveDraft.addEventListener('click',saveDraftFunc)
const finish = document.createElement('input')
finish.type = "button"
finish.value = "Finish"
finish.id = "finish"
const quizNav = document.createElement('nav')
quizNav.id = "navList"

const addO = document.createElement("button")
addO.addEventListener('click',options)
addO.textContent = "Add Option"
addO.id = "addO"
addO.setAttribute('type','button')
const form = document.forms["newQuiz"]

function navMenuControl(mainDiv,nav,next,prev,save,finish){
    if(quizData.length < 1) {
        nav.textContent="";
        next.addEventListener('click',nextQBtnEvent)
        nav.append(next,save,finish)
        mainDiv.append(nav)
    } else {
        nav.textContent="";
        next.addEventListener('click',nextQBtnEvent)
        nav.append(prev,next,save,finish)
        mainDiv.append(nav)
    }
}


window.onload = ()=>{
    if(
    window.localStorage.getItem("quizDuration") &&
    window.localStorage.getItem("quizCreator") && 
    window.localStorage.getItem("quizDuration") && 
    window.localStorage.getItem("quizCreator") == current){
        nextStep()
    } 
}
function nextStep(){
    app.textContent =""
    quizDiv(app)
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

function options(){
    const label = document.createElement('label')
    const option = document.createElement("input")
    const target = this.parentElement.children[1]
    const del = document.createElement('input')
    const markTrue = document.createElement('input')
    markTrue.id = "mark-true"
    markTrue.type = "checkbox"
    del.id = `del${target.children.length+1}`
    del.type = "button"
    del.value = "Delete"
    del.setAttribute('target',`opt${target.children.length+1}`)
    del.addEventListener('click',delFunc)
    label.textContent = `Option ${target.children.length+1}:`
    label.htmlFor = `opt${target.children.length+1}`
    option.id = `opt${target.children.length+1}`
    label.append(option,del,markTrue)
    target.appendChild(label)
}

function delFunc(){
    const confirm = window.confirm("Are you sure you want to delete this option?\nThis Action can't be reversed")
    if(confirm){
        const div = document.getElementById('options')
        div.removeChild(this.parentElement)
    }
    else {
        return null
    }
}


function saveDraftFunc() {
    const currentQuestion = this.parentElement.parentElement.children[0].children[0].children[1]
    const optionsMainDiv = this.parentElement.parentElement.children[0].children[1].children
    let optionOrder = 0
    for( let option of optionsMainDiv) {
        optionOrder++
        const data = {
            order : optionOrder,
            value: option.children[0].value,
            mark: option.children[2].checked,
            relatedQuestion: currentQuestion.id,
            questionValue: currentQuestion.value
        }
        if(quizData.length<1) {
            quizData.push(data)
        } else {
            quizData.forEach(check=>{
                if(check){
                    if(check.order == data.order) {
                        const delOld = quizData.lastIndexOf(check)
                        quizData.splice(delOld,0,data)
                    } 
                }           
            })
        }
    }
    console.log(quizData);
}

function quizDiv(app) {
    const div = document.createElement('div')
    const secDiv = document.createElement('div')
    const thirdDiv = document.createElement('div')
    secDiv.classList.add('question-branch')
    thirdDiv.classList.add('options')
    thirdDiv.id = "options"
    div.append(secDiv)
    div.append(thirdDiv)
    div.classList.add('question-main')
    secDiv.setAttribute("answer","pending")
    app.appendChild(div)
    quizQ(secDiv)
    div.appendChild(addO)
    navMenuControl(app,quizNav,nextQ,prevQ,saveDraft,finish)
}

function quizQ(div) {
    const label = document.createElement('label')
    const input = document.createElement('textarea')
    label.classList.add('mainLabel')
    const counter = document.getElementsByClassName("mainLabel")
    label.textContent = `Q ${counter.length+1}: `

    label.htmlFor = `Q${counter.length+1}`
    input.name = `Q${counter.length+1}`
    input.type = 'text'
    input.id = `Q${counter.length+1}`
    input.classList.add("questionField")
    div.append(label,input)
}



function nextQBtnEvent(){
    const question = this.parentElement.parentElement.children[0].children[0]
    const target = this.parentElement.parentElement.children[0].children[1].children
    const data = {
        question: question.value,
        questionID: question.id ,
        options:[]
    }
    const option = {}
    for(let i = 0; i < target.length;i++) // get options 
    {
        console.log(target[i]);
    }
}