self.addEventListener('install',async ()=>{
    await caches.open('static')
    .then(cache=>{
        cache.addAll([
            '/style/admin.css',
            '/style/agent.css',
            '/style/general.css',
            '/icons/icon-32x32.png',
            '/icons/icon-64x64.png',
            '/icons/icon-144x144.png',
            '/branch/agent.html',
            '/branch/admin.html'
        ])
    })
})

self.addEventListener('activate',async ()=>{
    const subscription = await self.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: "BGRa7VZ1GpJjfeLQn6UIs2TF2A8JF3GtXURVlvnprd8PBC27gO2KiCdmSt4ozQRoJIkG7ITVehIdc-2Z01e575c"
    })
    console.log(subscription);
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


self.addEventListener('push',e =>{
    const data = e.data.json();
    self.registration.showNotification(data.title,{
        body: "notified"
    })
})
