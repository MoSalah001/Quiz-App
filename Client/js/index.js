const form = document.forms.namedItem('form')
const pRes = document.getElementById("response")
from.addEventListener('submit',check)
function check(e){
    e.preventDefault()
    pRes.textContent = form
}