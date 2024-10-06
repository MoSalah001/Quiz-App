import {loadingSlider,responseMsg} from "./loader.mjs";

function deleteQuiz(e) {
    const confirm = window.confirm("Are you sure you want to delete this Quiz? \nPlease note that this action can't be undone")
    if(confirm === true) {
        const xhr = new XMLHttpRequest()
        xhr.open('post','deleteQuiz',true)
        xhr.setRequestHeader("content-type","application/json")
        const data = {
            uid: e.target.id
        }
        xhr.send(JSON.stringify(data))
        loadingSlider(xhr)
        xhr.onreadystatechange = ()=>{
            if(xhr.readyState === 4) {
                loadingSlider(xhr)
                responseMsg(xhr.responseText,xhr.status)
                getQuizez()
            }
        }
    } else {
        return null
    }
}

function setQuizQuestions(e){
    const data = {
        uid: e.target.id
    }
    const xhr = new XMLHttpRequest()
    xhr.open('post','setQ')
    xhr.setRequestHeader('content-type',"application/json")
    xhr.send(JSON.stringify(data))
    loadingSlider(xhr)
    xhr.onreadystatechange = ()=>{     
        if(xhr.readyState === 4) {
            loadingSlider(xhr)
            responseMsg(xhr.responseText,xhr.status)
            window.localStorage.setItem("rows",xhr.responseText)
            if(xhr.status === 200 && xhr.readyState === 4) {
                const qid = JSON.parse(xhr.responseText).qid
                window.localStorage.setItem('qid',qid)
                const subXhr = new XMLHttpRequest()
                loadingSlider(subXhr)
                subXhr.open('get',"setq/#/?qid="+qid,true)
                subXhr.send()
                subXhr.onreadystatechange = ()=>{
                    if(subXhr.readyState === 4) {
                        window.location = subXhr.responseURL
                    }
                }
            }
        }
   
    }
}

function getQuizez(){
    const xhr = new XMLHttpRequest()
    xhr.open("post",'./getQuizList')
    xhr.send()
    let quizList;
    const main = document.getElementById('app')
    main.textContent = ""
    xhr.onreadystatechange = ()=>{
        if(xhr.readyState === 4) {
            quizList = JSON.parse(xhr.responseText)
            for( let i in quizList) {
                const div = document.createElement('div')
                div.classList.add('quizCard')
                const quizID = document.createElement('p')
                quizID.innerHTML = `Quiz ID: <span class="quizListTemp">${quizList[i].QuizID}</span>`
                const qDate = document.createElement('p')
                const formatedDate = new Date(quizList[i].QCreationDate).toLocaleString('en-CA').split(",")
                qDate.innerHTML = `Quiz Creation Date: <span class="quizListTemp">${formatedDate[0]}</span>`
                const qName = document.createElement('p')
                qName.innerHTML = `Quiz Name: <span class="quizListTemp">${quizList[i].QName}</span>`
                const qStatus = document.createElement('p')
                qStatus.innerHTML = `Quiz Status: <span class="quizListTemp">${quizList[i].QStatus}</span>`
                const qCreator = document.createElement('p')
                qCreator.innerHTML = `Staff ID: <span class="quizListTemp">${quizList[i].QCreator}</span>`
                const qDuration = document.createElement('p')
                qDuration.innerHTML = `Quiz Duration: <span class="quizListTemp">${quizList[i].Duration} Min</span>`
                // buttons section
                const btnSection = document.createElement('section')
                btnSection.classList.add('buttons-section')

                const deleteBtn = document.createElement('button')
                deleteBtn.classList.add('delete')
                deleteBtn.textContent = "Delete Quiz"
                deleteBtn.setAttribute('id',quizList[i].QuizID)
                deleteBtn.addEventListener('click',deleteQuiz)

                const setQuestionBtn = document.createElement('button')
                setQuestionBtn.classList.add('edit')
                setQuestionBtn.textContent = "Set Quiz Questions"
                setQuestionBtn.classList.add('assigned')
                setQuestionBtn.setAttribute('id',quizList[i].QuizID)
                setQuestionBtn.addEventListener('click',setQuizQuestions)
                // setQuestionBtn.addEventListener()

                btnSection.append(deleteBtn,setQuestionBtn)
                // end of buttons section
                div.setAttribute('status',quizList[i].QStatus)
                div.setAttribute('ID',quizList[i].QuizID)
                div.append(quizID,qName,qDate,qStatus,qDuration,qCreator,btnSection)
                main.append(div)
            }
        }
    }
}

window.onload = ()=>{
    getQuizez()
}