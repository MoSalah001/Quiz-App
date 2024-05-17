import {loadingSlider,responseMsg} from "./loader.mjs";
window.onload = ()=>{
    const xhr = new XMLHttpRequest();
    const data = {
        qid: window.localStorage.getItem('qid')
    }
    xhr.open('post','../setQ/qid')
    xhr.setRequestHeader('content-type','application/json')
    xhr.send(JSON.stringify(data))
    loadingSlider(xhr)
    xhr.onreadystatechange = ()=>{
        if (xhr.readyState === 4) {
            loadingSlider(xhr)
            const parsedData = JSON.parse(xhr.responseText)
            if(parsedData.length === 0) {
                const createQuestion = new questionTemplate
                createQuestion.create()
            } else {
                // show saved questions
                getSaved(parsedData)
                const createQuestion = new questionTemplate
                createQuestion.create()
            }
        }
    }
}


class questionTemplate {
    // html question , array mapped for html , determine answer
    constructor(_questionText,_choices,_answer) {
        this.question = _questionText
    }

    create() {
        const table = document.getElementById('table-section')
        const questionHead = document.createElement('div') // question div
        questionHead.classList.add('question-head')
        const questionRow = document.createElement('div') // question div
        questionRow.classList.add('question-row')
        const question = document.createElement('textarea')
        question.setAttribute('id','question-text')
        question.placeholder = "Enter Question ..."
        questionRow.append(question)      
        let controlOptions = 1
        function changeControlOptions() {
            controlOptions++
            addOptions(controlOptions,questionHead)
            return null;
        }
        const controlDiv = document.createElement('div')
        const pQuestion = document.createElement('p')
        pQuestion.textContent = "Add Question"
        const pOption = document.createElement('p')
        pOption.textContent = "Add Option"
        pOption.addEventListener('click',changeControlOptions)
        pQuestion.addEventListener('click',addQuestion)
        controlDiv.append(pOption,pQuestion)
        
        questionHead.append(questionRow)
        table.append(questionHead,controlDiv)
        addOptions(controlOptions,questionHead)
    }
    
}
function addOptions(control,questionHead) {
    const label = document.createElement("label")
    label.setAttribute('for',`o-${control}`)
    label.setAttribute('id',`o-${control}-l`)
    label.textContent = "Set Answer"
    label.classList.add('oLabels')
    // label.addEventListener('click',checkAnswer)
    const optionRow = document.createElement('div') // option div
    optionRow.classList.add('option-row')
    const radioBtn = document.createElement('input')
    radioBtn.type = "radio"
    radioBtn.name = "option"
    radioBtn.id = `o-${control}`
    radioBtn.classList.add('radios')
    radioBtn.addEventListener('change',checkAnswer)
    const option = document.createElement('input')
    option.type = "text"
    option.placeholder = `Option #${control}`
    const del = document.createElement('button')
    del.textContent = "Delete"
    del.setAttribute('order',control)
    optionRow.setAttribute('order',control)
    optionRow.append(label,radioBtn,option,del) 
    questionHead.append(optionRow)
}



function addQuestion(e){
    const question = document.getElementById('question-text')
    const options = document.getElementsByClassName('option-row')
    const values =[]
    const optionsValues = [...options].map(option =>{
        let data = {
            isChecked: option.children[0].checked,
            value: option.children[1].value
        }
        values.push(data)
    })
    let fData = {
        qValue : question.value,
        answers : values,
        qid: window.localStorage.getItem('qid')
    }

    const xhr = new XMLHttpRequest()
    xhr.open('post','save')
    xhr.setRequestHeader('content-type','application/json')
    xhr.send(JSON.stringify(fData))
    loadingSlider(xhr)
    xhr.onreadystatechange = ()=>{
        if(xhr.readyState === 4) {
            loadingSlider(xhr)
            responseMsg(xhr.responseText,xhr.status)
            const table = document.getElementById('table-section')
            table.textContent = ""
            const createQuestion = new questionTemplate
            createQuestion.create()
        }
    }
    setTimeout(()=>{
        window.location.reload()
    },1000)
}

function getSaved(data) {
    const filtered = Object.groupBy(data,({QID})=>QID)
    for(let single in filtered) {
        let iterate = 0;
        let deleteBtn = document.createElement('button')
        deleteBtn.classList.add('question-delete')
        deleteBtn.textContent="Delete Question"
        let container = document.createElement('div')
        container.classList.add("saved-question")
        let question = document.createElement('h3')
        question.setAttribute('id','question-h3')
        question.textContent = filtered[single][iterate].QValue+' ?'
        for(let i=0; i<filtered[single].length; i++) { 
            deleteBtn.setAttribute("QID",filtered[single][i].QID)
            const answer = document.createElement('label')
            answer.textContent = filtered[single][i].AValue
            const isTrue = `${filtered[single][i].IsTrue === 0 ? "false":"true"}`
            answer.setAttribute('answer',isTrue)
            question.append(answer)
        }
        deleteBtn.addEventListener('click',deleteQ)
        container.append(question,deleteBtn)
        saved.append(container)
    }
}

function deleteQ(e){
    const data = {
        questionID:e.target.getAttribute("QID"),
        quizID: window.localStorage.getItem('qid')
    }
    const xhr = new XMLHttpRequest()
    xhr.open('post',"delete")
    xhr.setRequestHeader('content-type','application/json')
    xhr.send(JSON.stringify(data))
    loadingSlider(xhr)
    xhr.onreadystatechange = ()=>{
        if(xhr.readyState === 4) {
            loadingSlider(xhr)
            responseMsg(xhr.responseText,xhr.status)
        }
    }
    window.location.reload()
}

function checkAnswer(e){
    const getRadios = document.getElementsByClassName('radios') 
    for(let radio of getRadios) {
        if(radio.checked) {
            const getLabel = document.getElementById(radio.id+'-l')
            getLabel.setAttribute("answer",true)
        } else {
            const getLabel = document.getElementById(radio.id+'-l')
            getLabel.removeAttribute('answer')
        }
    }
}