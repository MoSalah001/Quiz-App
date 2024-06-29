import { loadingSlider, responseMsg } from "./loader.mjs";
const form = document.forms.logForm
const btn = document.getElementById('btn')
btn.addEventListener('click',login)

if (!window.matchMedia('(display-mode:standalone)').matches) {
    document.getElementById('install').style = "display:Block"
} else {
    document.getElementById('install').style = "display:none"
}

let installPrompt;

window.addEventListener('beforeinstallprompt',(e)=>{
    installPrompt = e
})
const install = document.getElementById('install')
install.addEventListener('click',async()=>{
    if(installPrompt !== null) {
        installPrompt.prompt()
        const outcome = await installPrompt.userChoice;
        if(outcome === 'accepted') {
            installPrompt = "null"
        }
    }
})

function loggedUser(){
    let cookieParser = document.cookie
    if(cookieParser.includes('user') && cookieParser.includes('status=0')){
        window.location.assign('./main')
    } else if(cookieParser.includes('user') && cookieParser.includes('status=1')) {
        window.location.assign('./admin')
    }
}

loggedUser()

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
            window.location.assign(xhr.responseURL)
        } else if(xhr.readyState === 4 && xhr.status == 500) {
            loadingSlider(xhr)
            let form = document.getElementById("form")
            form.innerHTML = `
            <label for="ID">NT User:</label>
            <input type="text" id="NTUser" name="ID" value=${xhr.responseText} disabled class="disabled">
            <label for="pass">New Password:</label>
            <input type="password" id="pass" name="pass" required>
            <button type="submit" id="btn-second">Login</button>
            `
            form.setAttribute("name","logForm")
            const respond = document.getElementById("response")
            respond.textContent = "Make a new password"
            const secBtn = document.getElementById("btn-second")
            secBtn.addEventListener("click",setPassword)
        } else if(xhr.readyState === 4) {
            loadingSlider(xhr)
            responseMsg(xhr.responseText,xhr.status)
        }
    }
}


function setPassword(e){
    e.preventDefault()
    let form = document.forms.logForm
    let data = {
        user: form.ID.value,
        pass: form.pass.value
    }
    if(form.pass.value.length < 6) {
        form.pass.focus()
        const respond = document.getElementById("response")
        respond.textContent = "Password must be at least 6 characters long"
    } else {
        const xhr= new XMLHttpRequest()
        xhr.open("post","/resetPass")
        xhr.setRequestHeader("contnet-type","application/json")
        xhr.send(JSON.stringify(data))
        loadingSlider(xhr)
        xhr.onreadystatechange = ()=>{
            if(xhr.readyState == 4 && xhr.status == 200 ) {
                loadingSlider(xhr)
                window.location.assign(xhr.responseURL)
            }
        }
    }
}


if('serviceWorker' in navigator) {
    send().catch(err=>{
        console.error(err)
    })
}
    
async function send(){
    const register = await navigator.serviceWorker.register("../sw.js")
    // if(Notification.permission == 'granted') {
    //     const subscription =  await register.pushManager.subscribe({
    //         userVisibleOnly : true,
    //         applicationServerKey : "BGRa7VZ1GpJjfeLQn6UIs2TF2A8JF3GtXURVlvnprd8PBC27gO2KiCdmSt4ozQRoJIkG7ITVehIdc-2Z01e575c"
    //     })
    //     await fetch('subscribe',{
    //         method: "post",
    //         headers: {"Content-type":"application/json"},
    //         body: JSON.stringify(subscription)
    //     })
    // } else {
    //     Notification.requestPermission().then(permission=>{
    //         console.log(permission);
    //     })
    // }
}