import { loadingSlider, responseMsg } from "./loader.mjs";
const form = document.forms.logForm
const btn = document.getElementById('btn')
btn.addEventListener('click',login)

function login(e) {
    e.preventDefault();
    const xhr = new XMLHttpRequest()
    let data = {
        user: form.ID.value,
        pass: form.pass.value
    }
    xhr.open('post','/login')
    xhr.setRequestHeader('Content-Type',"application/json")
    xhr.send(JSON.stringify(data))
    loadingSlider(xhr)
    xhr.onreadystatechange=()=>{
        if(xhr.readyState===4 && xhr.status == 200) {
            loadingSlider(xhr)
            window.location.href = xhr.responseURL
        } else if(xhr.readyState === 4) {
            loadingSlider(xhr)
            responseMsg(xhr.responseText,xhr.status)
        }
    }
}
