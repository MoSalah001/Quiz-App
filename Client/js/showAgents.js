import { loadingSlider, responseMsg } from "./loader.mjs"


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
            //create table with data
            const table = document.getElementById("table")
            for(let header of headers) {
                let th = document.createElement("th")
                th.classList.add('table-header')
                th.textContent=header
                table.append(th)
            }
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
        row.append(staff,user,store,cDate)
        table.append(row)
    }
}
