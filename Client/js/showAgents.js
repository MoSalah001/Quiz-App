import { loadingSlider, responseMsg } from "./loader.mjs"
import {exportToExcel} from "./exportExcel.mjs"
const exportBtn = document.getElementById("exportBtn")
exportBtn.addEventListener('click',exportToExcel)
window.onload = ()=>{
    const xhr = new XMLHttpRequest()
    xhr.open("get","./showAgents")
    xhr.send()
    loadingSlider(xhr)
    xhr.onreadystatechange = ()=>{
        if(xhr.readyState === 4) {
            loadingSlider(xhr)
            const dataParser = JSON.parse(xhr.responseText)
            const headers = Object.keys(dataParser[0]) 
            const table = document.getElementById("table")
            let headerRow = document.createElement('tr')
            headerRow.classList.add('header-row')
            for(let header of headers) {
                let th = document.createElement("th")
                th.classList.add('table-header')
                th.textContent=header
                headerRow.append(th)
            } 
            table.append(headerRow)
            for(let row in dataParser) {
               let singleRow = new tableData(dataParser[row]).create()
               table.append(singleRow)               
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
        row.append(staff,user,store,cDate)
        return row
    }
}


