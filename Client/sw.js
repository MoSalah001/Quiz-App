self.addEventListener('install',()=>{
    console.log("sw installed");
    caches.open('static')
    .then((cache)=>{
        cache.addAll([
            '/',
            '/index.html',
            '/js/index.js',
            '/style/index.css',
            '/icons/icon-main.svg',
            '/icons/icon-128x261.svg',
            '/icons/icon-256x521.svg'
        ])
    })
})

self.addEventListener('activate',()=>{
    console.log("sw activated");
})

self.addEventListener('fetch',(event)=>{
    event.respondWith(caches.match(event.request).then((res)=>{
        if(res){
            return res
        } else {
            return fetch(event.request)
        }
    }))
})