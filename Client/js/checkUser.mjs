export default function checkUserStatus(){
    const user = document.cookie.includes('user')
    if(!user) {
        setTimeout(()=>{
            window.location.href = document.location.origin
        },500)
    }
}