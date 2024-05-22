import { loadingSlider, responseMsg } from "./loader.mjs";
const submit = document.getElementById('submit')
const form = document.forms.regForm
submit.addEventListener('click',submitUser)

async function submitUser(e){
    e.preventDefault()
    const formData = {
        sfid: form.staffID.value,
        password: form.password.value,
        storeID: form.storeID.value,
        NTUser: form.NTUser.value
    }
    if(formData.sfid && formData.password && formData.storeID) {
        const xhr = new XMLHttpRequest()
        xhr.open("post","./firstReg")
        xhr.setRequestHeader('Content-Type',"application/json")
        xhr.send(JSON.stringify(formData))
        loadingSlider(xhr)
        xhr.onreadystatechange = ()=>{
            if(xhr.readyState === 4) {
                if(xhr.status === 200) {
                    loadingSlider(xhr)
                    responseMsg(xhr.responseText,xhr.status)
                    setTimeout(()=>{
                        window.location.href = window.location.origin
                    },2000)  
                } else {
                    loadingSlider(xhr)
                    responseMsg(xhr.responseText,xhr.status)
                }
            }
        }
    } else {
        return false
    }
}