import {loadingSlider , responseMsg} from './loader.mjs'
const form = document.getElementById('form')
const selectInput = document.getElementById('impact')
selectInput.addEventListener('change',getSelectedValue)
const dataList = document.getElementById("data")
const submit = document.createElement('button')
submit.setAttribute('id','send')
submit.textContent = "Assign Quiz"
document.getElementById('app').append(submit)
submit.addEventListener('click',assignQuiz)
function getSelectedValue(){
    getData(selectInput.value)
}


function getData(selectValue){
    const xhr = new XMLHttpRequest()
    xhr.open('get',`getData/${selectValue}`)
    xhr.send()
    xhr.onreadystatechange = ()=>{
        if(xhr.readyState === 4) {
            dataList.textContent=""
            for(let i of JSON.parse(xhr.responseText)) {
                let option = document.createElement('option')
                option.value = i.Key
                option.textContent = i.Data
                dataList.append(option)
            }
        }
    } 
    showSecondInputs()
}


function showSecondInputs(){
    if(document.getElementById('secondInput')) {
        return;
    } else {
        const input = document.createElement('input')
        const inputLabel = document.createElement('label')
        inputLabel.setAttribute('for','secondInput')
        inputLabel.textContent = "Choose From Below"
        const strict = document.createElement('select')
        const strictLabel = document.createElement('label')
        strictLabel.setAttribute('for','strict')
        strictLabel.textContent = "Date strict quiz?"
        strict.setAttribute('id','strict')
        strict.setAttribute('name','strict')
        let opt1 = document.createElement('option')
        let opt2 = document.createElement('option')
        opt1.textContent = "Yes"
        opt1.setAttribute('value',true)
        opt2.textContent = "No"
        opt2.setAttribute('value',false)
        strict.append(opt1,opt2)
        input.setAttribute('id','secondInput')
        input.setAttribute('name','secondInput')
        input.setAttribute('list','data')
        form.append(inputLabel,input,strictLabel,strict)
        strict.addEventListener('change',showThirdInputs)
        showThirdInputs()
    }

}


function showThirdInputs(){
    const checkStrict = document.getElementById('strict')
    if(checkStrict.value == "true") {
        const strictDate = document.createElement('input')
        const timeLabel = document.createElement('label')
        timeLabel.setAttribute('for','time')
        timeLabel.textContent = 'Enter Quiz Duration'
        const time = document.createElement('input')
        time.setAttribute('id','time')
        time.setAttribute('name','time')
        time.setAttribute('type','number')
        time.placeholder = "Write quiz duration ...."
        strictDate.setAttribute('type','datetime-local')
        strictDate.setAttribute('id','date-strict')
        strictDate.setAttribute('name','date-strict')
        strictDate.textContent = "Quiz date and time"
        const strictDateLabel = document.createElement('label')
        strictDateLabel.setAttribute('for','date-strict')
        strictDateLabel.setAttribute('id','date-strict-label')
        strictDateLabel.textContent = "Choose Quiz Date"
        if(document.getElementById('time')){
            form.append(strictDateLabel,strictDate,submit)
        } else {
            form.append(timeLabel,time,strictDateLabel,strictDate,submit)
        }
        
    } else {
        let strictDate = document.getElementById('date-strict')
        let strictDateLabel = document.getElementById('date-strict-label')
        form.removeChild(strictDate)
        form.removeChild(strictDateLabel)
    }
}


function assignQuiz(){
    let data = {
        quizID: window.localStorage.getItem('quizID'),
        strict: document.getElementById('strict').value,
        time: document.getElementById('time').value,
        impact: document.getElementById('impact').value,
        subImpact: document.getElementById('secondInput').value,
        strictDate: document.getElementById('date-strict') ? new Date(document.getElementById('date-strict').value).toISOString().replace("Z","").replace("T"," ") : null 
    }    
    const xhr = new XMLHttpRequest()
    xhr.open('post','assign')
    xhr.setRequestHeader('content-type','application/json')    
    xhr.send(JSON.stringify(data))
    loadingSlider(xhr)
    xhr.onreadystatechange = ()=>{
        if(xhr.readyState === 4) {
            loadingSlider(xhr)
            responseMsg(xhr.responseText,xhr.status)
        }
    }
}