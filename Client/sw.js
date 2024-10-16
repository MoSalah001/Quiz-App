self.addEventListener('install',async ()=>{
    await caches.open('static')
    .then(cache=>{
        cache.addAll([
            '/',
            '/index.html',
            '/js/index.js',
            '/style/index.css',
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

// self.addEventListener('activate',async ()=>{
//     const subscription = await self.registration.pushManager.subscribe({
//         userVisibleOnly: true,
//         applicationServerKey: "BGRa7VZ1GpJjfeLQn6UIs2TF2A8JF3GtXURVlvnprd8PBC27gO2KiCdmSt4ozQRoJIkG7ITVehIdc-2Z01e575c"
//     })
// })

self.addEventListener('fetch',(event)=>{
    let request = event.request;
    if (event.request.cache === 'only-if-cached' && event.request.mode !== 'same-origin') return;

    if (request.headers.get('Accept').includes('text/javascript')) {
        event.respondWith(fetch(request).then((response)=>{
            return response
        }).catch((error)=>{
            return caches.match(request).then((response)=>{
                return response
            })
        }))
        return;
      }
})


self.addEventListener('push',e =>{
    const data = e.data.json();
    self.registration.showNotification(data.title,{
        body: "notified"
    })
})
