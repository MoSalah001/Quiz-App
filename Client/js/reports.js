import { loadingSlider } from "./loader.mjs"
// get db data and store locally
window.onload = async()=>{
    let fetchData = await fetch('reports/main',{
        method: "GET"
    })
    let data = await fetchData.json()
    const request = window.indexedDB.open("quizReports",1)

    request.onerror = (event)=>{
        console.error(`Database error: ${event.target.error?.message}`)
    }

    request.onupgradeneeded = (event)=>{
        const db = event.target.result
        const objStore = db.createObjectStore("Quizes", {autoIncrement: true})
        objStore.createIndex('AreaName','AreaName',{unique: false})
        objStore.createIndex('StoreName','StoreName',{unique: false})
        objStore.createIndex('AgentName','AgentName',{unique: false})
        for(let i in data) {
            objStore.add(data[i])
            console.log(data[i])
        }
    }  

    request.onsuccess = ()=>{
        const db = request.result.transaction(["Quizes"],"readonly").objectStore("StoreName").get('Marsa Matrouh').onsuccess = (event)=>{
            console.log(`Result: ${event.target.result.name}`);
            
        }
    }  
}



const control = document.getElementById('control')
// select area || store || agent 
const area = document.getElementById('area')
const store = document.getElementById('store')
const agent = document.getElementById('agent')
area.addEventListener('click',perAreaClicked)
store.addEventListener('click',perStoreClicked)
agent.addEventListener('click',perAgentClicked)
function filterTemplate(value){
    const input = document.createElement("input")
    const label = document.createElement("label")
    label.setAttribute('for','filter')
    label.setAttribute('id','filterLabel')
    label.textContent = `Enter ${value} Name: `
    input.setAttribute('name','filter')
    input.setAttribute('id','filterInput')
    const button = document.createElement('button')
    button.textContent = "Filter"
    button.setAttribute('id','filterButton')
    if(control.hasChildNodes()){
        control.replaceChildren(label,input,button)
    } else {
        control.append(label,input,button)
    }
}

function perAreaClicked(){
    filterTemplate('Area')
}
function perStoreClicked(){
    filterTemplate('Store')
}
function perAgentClicked(){
    filterTemplate('Agent')
}