const path = require('path')
const os = require('os')
const { ipcRenderer } = require('electron')

// get doms
const form = document.getElementById('image-form')
const slider = document.getElementById('slider')
const img = document.getElementById('img')

// form submit
form.addEventListener('submit', (e) => {
    e.preventDefault()
    const imgPath = img.files[0].path
    const quality = slider.value
    // send data to main process
    ipcRenderer.send('image:scale', { imgPath, quality })
})
// alert
ipcRenderer.on('image:done', (e) => {
    // meterial alert
    M.toast({
        html: `image shrink to ${slider.value}%`
    })
})

// show path in html
document.getElementById('output-path').innerText = path.join(os.homedir(), 'imageshrink')