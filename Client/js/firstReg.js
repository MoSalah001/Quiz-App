const submit = document.getElementById('submit')
const form = document.forms.regForm
form.addEventListener('submit',submitUser)

function submitUser(e){
    return false
}