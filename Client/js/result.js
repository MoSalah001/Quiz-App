import { loadingSlider } from "./loader.mjs"
import { resultCard } from "./quizModule.mjs"
const app = document.getElementById('app')

window.onload = ()=>{
    const xhr = new XMLHttpRequest()
    xhr.open('post','result')
    xhr.send()
    loadingSlider(xhr)
    xhr.onreadystatechange = ()=>{
        if(xhr.readyState == 4){
            loadingSlider(xhr)
            resultCard(xhr.responseText);
        }
    }
}

