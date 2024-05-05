window.onload = ()=>{
    const data = JSON.parse(window.localStorage.getItem('json'))
    for(let i = 0; i< data.length;i++) {
        let newQuestion = new Question(data[i].QValue,data[i].AValue,data[i].QID,data[i].AID,"app")
        if(i === 0) {
            // create first question
            newQuestion.createQuestionHead()
            newQuestion.createAnswer()
        } else {
            const k = i-1
            if(data[i].QID === data[k].QID) {
                newQuestion.createAnswer()
                // append answers to question
            } else {
                // set new question 
                newQuestion.createQuestionHead()
                newQuestion.createAnswer()
            }
        }
    }
}



class Question {
    constructor(_q,_a,_qID,_aID,_link) {
        this.question = _q
        this.answer = _a
        this.qID = _qID
        this.parent = _link
        this.aID = _aID
    }

    createQuestionHead() {
        const div = document.createElement('div')
        div.classList.add("holder")
        div.setAttribute("id",this.qID)
        const questionHead = document.createElement("p")
        questionHead.classList.add("questionHead")
        questionHead.textContent = this.question + '?'
        div.appendChild(questionHead)
        document.getElementById(this.parent).appendChild(div)
    }

    createAnswer(_a,_aID){
        const answer = document.createElement("input")
        const label = document.createElement("label")
        label.setAttribute("for",_aID ? "r-"+_aID : "r-"+this.aID)
        label.setAttribute("id",_aID ? "label-"+_aID : "label-"+this.aID)
        label.textContent = _a ? _a : this.answer
        answer.type = "radio"
        answer.required = true
        answer.name = this.qID
        answer.value = _a ? _a : this.answer
        answer.classList.add("Answers")
        checkStoredAnswers(answer,this.aID,label)
        answer.setAttribute("id",_aID ? "r-"+_aID : "r-"+this.aID)
        answer.onchange = (e)=> {
            console.log(window.localStorage);
            let rButtons = document.getElementsByName(e.target.name)
            for(let i of rButtons){
                if(i.checked){
                    let id = i.id.split('-')[1]
                    let markLabel = document.getElementById(`label-${id}`)
                    window.localStorage.setItem(i.name,id)
                    markLabel.classList.add('isSelected')
                    checkStoredAnswers(answer,_aID)
                } else {
                    let id = i.id.split('-')[1]
                    let markLabel = document.getElementById(`label-${id}`)
                    markLabel.classList.remove('isSelected')
                }
            }

        }

        document.getElementById(this.qID).appendChild(answer)
        document.getElementById(this.qID).appendChild(label)
    }
}

function checkStoredAnswers(answer,_aID,label){
    let storeAnswers = window.localStorage.getItem(answer.name)
    if(storeAnswers) {
        if(storeAnswers == _aID) {
            answer.checked = true
            label.classList.add('isSelected')
        }
    }
}

function submitAnswer(){
    
}