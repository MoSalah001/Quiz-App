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
        // const
    }
}