export default function loadingSlider(res){
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