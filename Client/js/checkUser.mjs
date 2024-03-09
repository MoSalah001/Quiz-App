export default function checkUserStatus(){
    const user = document.cookie.includes('user')
    if(!user) {
        window.location.href = document.location.origin
    }
}