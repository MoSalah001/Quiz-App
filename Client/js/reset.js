const submit = document.getElementById('submit')
const form = document.getElementById('resetPasswordForm')
let formData = new FormData(form)

submit.addEventListener('click',resetPassword)
async function resetPassword(e){
    e.preventDefault()
    let msg = await fetch('./resetPassword',{
        method: 'post',
        body: formData.get('staffID'),
        headers: {
            'Content-Type': "application/x-www-form-urlencoded"
        }
    })
    
}