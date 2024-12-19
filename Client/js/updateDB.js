import {loadingSlider,loadingSliderFetch,loadingSliderFetchRemover, responseMsg} from './loader.mjs'
const user = document.getElementById('user')
const filterCookie = document.cookie.indexOf('user=');
const current = document.cookie.substring(filterCookie+5,filterCookie+12)
user.innerHTML = `Staff ID: <span>${current}</span>`
function getAreaData(){
    const form = document.getElementById('updateDBForm')
    form.addEventListener('submit',async (e)=>{
        e.preventDefault()
        loadingSliderFetch()
        let response = await fetch('updateStores',{
            method:"POST",
            body: new FormData(form)
        })        
        let result = await response.text()
        loadingSliderFetchRemover(response,result)
        form.reset()
        document.getElementById("storeName").focus()
                
    })

    
    const xhr = new XMLHttpRequest()
    xhr.open('post',"getAreas")
    xhr.send()
    const selectArea = document.getElementById('selectArea')
    loadingSlider(xhr)
    xhr.onreadystatechange = ()=>{
        if(xhr.readyState === 4) {
            const jsonParser = JSON.parse(xhr.responseText)
            jsonParser.map(row=>{
                let option = document.createElement('option')                
                option.value = row.Area
                option.textContent = row.listRow
                selectArea.append(option)
            })
        }
        loadingSlider(xhr)
    }
}
getAreaData()

