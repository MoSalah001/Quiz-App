window.onload = ()=>{
    const xhr = new XMLHttpRequest();
    const data = {
        qid: window.localStorage.getItem('qid')
    }
    xhr.open('post','../setQ/qid')
    xhr.setRequestHeader('content-type','application/json')
    xhr.send(JSON.stringify(data))
    xhr.onreadystatechange = ()=>{
        if (xhr.readyState === 4) {
            return null
        }
    }
}