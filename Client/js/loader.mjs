export function loadingSlider(res){
    if(res.readyState === 1) {
        const page = document.createElement('div')
        const box = document.createElement('div')
        const eye = document.createElement('div')
        page.id = "page"
        page.classList.add('loadPage')
        box.classList.add('box')
        eye.classList.add('eye')
        page.append(box)
        box.append(eye)
        document.body.append(page)
    }
    if (res.readyState === 4) {
        const getPage = document.getElementById("page")
        document.body.removeChild(getPage)
    }
}


export function responseMsg(msg,status){
    const box = document.createElement('div')
    box.classList.add('dialog')
    const filterMsg = JSON.parse(msg)
    box.textContent = filterMsg.msg
    if(status == 200 || status == 304){box.classList.add('respond')}
    else {box.classList.add('error')}
    document.body.append(box)
    setTimeout(()=>{
        document.body.removeChild(box)
    },3000)
}


export function loadingSliderFetch(){
        const page = document.createElement('div')
        const box = document.createElement('div')
        const eye = document.createElement('div')
        page.id = "page"
        page.classList.add('loadPage')
        box.classList.add('box')
        eye.classList.add('eye')
        page.append(box)
        box.append(eye)
        document.body.append(page)

}


export function loadingSliderFetchRemover(res,msg){
    const getPage = document.getElementById("page")
    document.body.removeChild(getPage)
    if(res) {
        const box = document.createElement('div')
        box.classList.add('dialog')
        box.textContent = msg
        if(res.status == 200 || res.status == 304){box.classList.add('respond')}
        else {box.classList.add('error')}
        document.body.append(box)
        setTimeout(()=>{
            document.body.removeChild(box)
        },3000)
    }
}
