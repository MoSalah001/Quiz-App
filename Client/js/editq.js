import {loadingSlider,responseMsg} from "./loader.mjs";
const uid = document.cookie.split('=')[1]

function selectQuiz(e){
    console.log(e.target);
}

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
        if(xhr.readyState === 4) {
            loadingSlider(xhr)
            responseMsg(xhr.responseText,xhr.status)
        }

    } else {
        return null
    }
}

window.onload = ()=>{
    const xhr = new XMLHttpRequest()
    xhr.open("post",'./getQuizList')
    xhr.send()
    let quizList;
    const main = document.getElementById('app')
    xhr.onreadystatechange = ()=>{
        if(xhr.readyState === 4) {
            quizList = JSON.parse(xhr.responseText)
            for( let i in quizList) {
                const div = document.createElement('div')
                div.classList.add('quizCard')
                const quizID = document.createElement('p')
                quizID.textContent = `Quiz ID:${quizList[i].QuizID}`
                const qDate = document.createElement('p')
                const formatedDate = new Date(quizList[i].QDate)
                qDate.textContent = `Quiz Date:
                ${formatedDate.getDay()} /
                ${formatedDate.getMonth()} / 
                ${formatedDate.getFullYear()} - 
                ${formatedDate.getHours()} :
                ${formatedDate.getMinutes()}
                ${formatedDate.getHours()>12 ? "PM" : "AM"}
                `
                const qStatus = document.createElement('p')
                qStatus.textContent = `Quiz Status:${quizList[i].QStatus}`
                const qCreator = document.createElement('p')
                qCreator.textContent = `Staff ID:${quizList[i].QCreator}`
                const qDuration = document.createElement('p')
                qDuration.textContent = `Quiz Duration:${quizList[i].Duration}`
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
                // setQuestionBtn.addEventListener()

                btnSection.append(deleteBtn,setQuestionBtn)
                // end of buttons section
                div.setAttribute('status',quizList[i].QStatus)
                div.setAttribute('ID',quizList[i].QuizID)
                div.addEventListener('click',selectQuiz)
                div.append(quizID,qDate,qStatus,qDuration,qCreator,btnSection)
                main.append(div)
            }
        }
    }

}