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
        objStore.createIndex('AgentName','NTUser',{unique: false})
        for(let i in data) {
            objStore.add(data[i])
            console.log(data[i])
        }
    }  

    request.onsuccess = ()=>{
        const db = request.result
        const trx = db.transaction("Quizes",'readonly')
        const filter = trx.objectStore("Quizes")
        const filterArea = filter.index("AreaName")
        const filterStore = filter.index("StoreName")
        const filterAgent = filter.index("AgentName")
        const queryArea = filterArea.getAll(["Alex"])
        const queryStore = filterStore.getAll(["Marsa Matrouh"])
        const queryAgent = filterAgent.getAll(["V23MSAYED2"])
        queryArea.onsuccess = ()=>{
            console.log(queryArea.result);
        }

        queryStore.onsuccess = ()=>{
            console.log(queryStore.result);
        }

        queryAgent.onsuccess = ()=>{
            console.log(queryAgent.result);
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