import {loadingSlider,responseMsg} from "./loader.mjs";
window.onload = ()=>{
    const saved = document.getElementById('saved')
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
    const optionRow = document.createElement('div') // option div
    optionRow.classList.add('option-row')
    const radioBtn = document.createElement('input')
    radioBtn.type = "radio"
    radioBtn.name = "option"
    const option = document.createElement('input')
    option.type = "text"
    option.placeholder = `Option #${control}`
    const del = document.createElement('button')
    del.textContent = "Delete"
    del.setAttribute('order',control)
    optionRow.setAttribute('order',control)
    optionRow.append(radioBtn,option,del) 
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
}

function getSaved(data) {
    const filtered = Object.groupBy(data,({QValue})=>QValue)
    const length = Object.keys(filtered)
    for(let i=0; i<length.length; i++) {
        for(let j=0; j<filtered[length[i]].length; j++) {
            console.log(filtered[length[i]][j]);
        }
    }
    // for(let question in filtered) { // get question
    //     // console.log(question);
    // }
}