const { app, BrowserWindow } = require('electron')

// app controls total lifecycle
// BrowserWindow creates windows

const createMainWindow = () => {
    const mainWindow = new BrowserWindow({
        title: 'Image Shrink',
        width: 500,
        height: 600
    })
}

app.on('ready', createMainWindow)