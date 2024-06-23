self.addEventListener('install',async ()=>{
    console.log("sw installed");
    await caches.open('static')
    .then(cache=>{
        cache.addAll([
            '/',
            '/index.html',
            '/js/index.js',
            '/style/index.css',
            '/icons/icon-32x32.png',
            '/icons/icon-64x64.png',
            '/icons/icon-144x144.png'
        ])
    })
})

self.addEventListener('activate',()=>{
    console.log("sw activated");
})

self.addEventListener('fetch',(event)=>{
    event.respondWith(caches.match(event.request).then(res=>{
        if(res){
            return res
        } else {
            return fetch(event.request)
        }
    }))
})