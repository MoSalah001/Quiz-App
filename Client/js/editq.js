const uid = document.cookie.split('=')[1]

function selectQuiz(e){
    console.log(e.target);
}

window.onload = ()=>{
    const xhr = new XMLHttpRequest()
    xhr.open("post",'./getQuizList')
    xhr.send()
    let quizList;
    const main = document.getElementById('nav-admin')
    xhr.onreadystatechange = ()=>{
        if(xhr.readyState === 4) {
            quizList = JSON.parse(xhr.responseText)
            for( let i in quizList) {
                const div = document.createElement('div')
                div.classList.add('quizCard')
                const quizID = document.createElement('p')
                quizID.textContent = `Quiz ID:${quizList[i].QuizID}`
                const qDate = document.createElement('p')
                qDate.textContent = `Quiz Date:${quizList[i].QDate}`
                const qStatus = document.createElement('p')
                qStatus.textContent = `Quiz Status:${quizList[i].QStatus}`
                const qCreator = document.createElement('p')
                qCreator.textContent = `Staff ID:${quizList[i].QCreator}`
                const qDuration = document.createElement('p')
                qDuration.textContent = `Quiz Duration:${quizList[i].Duration}`
                div.append(quizID,qDate,qStatus,qDuration,qCreator)
                div.addEventListener('click',selectQuiz)
                main.append(div)
            }
        }
    }

}