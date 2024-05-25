import { loadingSlider, responseMsg } from "./loader.mjs"


window.onload = ()=>{
    const xhr = new XMLHttpRequest()
    xhr.open("get","./getPendingUsers")
    xhr.send()
    loadingSlider(xhr)
    xhr.onreadystatechange = ()=>{
        if(xhr.readyState === 4) {
            loadingSlider(xhr)
            const dataParser = JSON.parse(xhr.responseText)
            const headers = Object.keys(dataParser[0]) 
            //create table with data
            const table = document.getElementById("table")
            for(let header of headers) {
                let th = document.createElement("th")
                th.classList.add('table-header')
                th.textContent=header
                table.append(th)
            }
            let th = document.createElement("th")
            th.textContent = "Aprv"
            th.classList.add('table-header')
            let th2 = document.createElement('th')
            th2.textContent="Rej"
            th2.classList.add('table-header')
            table.append(th,th2)
            for(let row in dataParser) {
                new tableData(dataParser[row]).create()
            }
        }
    }
}


class tableData {
    constructor(data) {
        this.staffID = data.StaffID,
        this.NTUser = data.NTUser,
        this.storeID = data.StoreID,
        this.creationDate = data.CreationDate
    }

    create() {
        const table = document.getElementById("table")
        const row = document.createElement("tr")
        row.classList.add('table-row')
        const user = document.createElement("td")
        user.classList.add('table-cell')
        user.textContent = this.NTUser
        const staff = document.createElement("td")
        staff.classList.add('table-cell')
        staff.textContent = this.staffID
        const store = document.createElement("td")
        store.classList.add('table-cell')
        store.textContent = this.storeID
        const cDate = document.createElement("td")
        cDate.classList.add('table-cell')
        cDate.innerHTML = `${new Date(this.creationDate).toLocaleString("en-CA").split(",")[0]}<br>
        ${new Date(this.creationDate).toLocaleString("en-CA").split(",")[1]}`
        const approve = document.createElement("td")
        approve.classList.add('table-cell')
        const btn = document.createElement('button')
        btn.textContent=""
        btn.classList.add("approve")
        btn.setAttribute("id",this.staffID)
        btn.addEventListener('click',approveUser)
        approve.append(btn)
        const reject = document.createElement('td')
        reject.classList.add('table-cell')
        const btn2 = document.createElement('button')
        btn2.textContent=""
        btn2.classList.add("reject")
        btn2.setAttribute("id",this.staffID)
        btn2.addEventListener('click',deleteUser)
        reject.append(btn2)
        row.append(staff,user,store,cDate,approve,reject)
        table.append(row)
    }
}

function approveUser(e){
    let data = {
        user:e.target.id
    }
    const xhr = new XMLHttpRequest()
    xhr.open('post','approveUser')
    xhr.setRequestHeader("content-type","application/json")
    xhr.send(JSON.stringify(data))
    loadingSlider(xhr)
    xhr.onreadystatechange = ()=>{
        if(xhr.readyState == 4) {
            loadingSlider(xhr)
            responseMsg(xhr.responseText,xhr.status)
            setTimeout(()=>{
                window.location.reload()
            },250)
        }
    }
}

function deleteUser(e){
    let data = {
        user:e.target.id
    }
    const xhr = new XMLHttpRequest()
    xhr.open('post','deleteUser')
    xhr.setRequestHeader("content-type","application/json")
    xhr.send(JSON.stringify(data))
    loadingSlider(xhr)
    xhr.onreadystatechange = ()=>{
        if(xhr.readyState == 4) {
            loadingSlider(xhr)
            responseMsg(xhr.responseText,xhr.status)
            setTimeout(()=>{
                window.location.reload()
            },350)
        }
    }
}