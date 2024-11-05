import { quizCard } from './quizModule.mjs'
const user = document.getElementById('user')
const filterCookie = document.cookie.indexOf('user=');
const current = document.cookie.substring(filterCookie+5,filterCookie+11)
user.innerHTML = `Staff ID: <span>${current}</span>`

window.onload = ()=>{
    const rows = window.localStorage.getItem('rows')   
    /* TODO */     
    /* fetch unaswered only */
    /* update backend to filter already answered quizes */
    quizCard(rows)    
}

