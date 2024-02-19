window.onload = ()=>{
    const table = document.getElementById('table-section') // html section
    const xhr = new XMLHttpRequest();
    const data = {
        qid: window.localStorage.getItem('qid')
    }
    xhr.open('post','../setQ/qid')
    xhr.setRequestHeader('content-type','application/json')
    xhr.send(JSON.stringify(data))
    xhr.onreadystatechange = ()=>{
        if (xhr.readyState === 4) {
            const parsedData = JSON.parse(xhr.responseText)
            if(parsedData.length === 0) {
                const creataQuestion = new questionTemplate
                creataQuestion.create()
            } else {
                // returned question + new question template
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
        const question = document.createElement('input')
        question.type = "text"
        question.placeholder = "Enter Question ..."
        questionRow.append(question)      
        let controlOptions = 1
        // for(let i =0 ; i < controlOptions; i++) {
        //     const radioBtn = document.createElement('input')
        //     radioBtn.type = "radio"
        //     const option = document.createElement('input')
        //     option.type = "text"
        //     option.placeholder = `Option #${i+1}`
        //     optionRow.append(radioBtn,option)
        // }
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
        controlDiv.append(pOption,pQuestion)
        
        questionHead.append(questionRow)
        table.append(questionHead,controlDiv)
        addOptions(controlOptions,questionHead)
    }

}
function addOptions(control,questionHead) {
    const getExist = document.getElementsByClassName('option-row')
    if(getExist.length === 0){
        const optionRow = document.createElement('div') // option div
        optionRow.classList.add('option-row')
        const radioBtn = document.createElement('input')
        radioBtn.type = "radio"
        radioBtn.name = "option"
        const option = document.createElement('input')
        option.type = "text"
        option.placeholder = `Option #${control}`
        optionRow.setAttribute('order',control)
        optionRow.append(radioBtn,option) 
        questionHead.append(optionRow)
    } else {
        const optionRow = document.createElement('div') // option div
        optionRow.classList.add('option-row')
        const radioBtn = document.createElement('input')
        radioBtn.type = "radio"
        const option = document.createElement('input')
        option.type = "text"
        option.placeholder = `Option #${control}`
        optionRow.setAttribute('order',control)
        optionRow.append(radioBtn,option) 
        questionHead.append(optionRow)                
    }
}
