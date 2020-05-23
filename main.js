const path = require('path')
const os = require('os')
const { app, BrowserWindow, Menu, globalShortcut, ipcMain, shell } = require('electron')
// app controls total lifecycle
// BrowserWindow creates windows
// Menu to create custom menu
// globalShortcut to create global shortcuts
// ipcMain is the main process to react to ipcRenderer
// shell to open folder
const imagemin = require('imagemin')
const imagemin_mozjpeg = require('imagemin-mozjpeg')
const imagemin_pngquant = require('imagemin-pngquant')
const slash = require('slash')
const logger = require('electron-log')



// environment
process.env.NODE_ENV = 'production'//'development'
const is_dev = process.env.NODE_ENV !== 'production'
const is_mac = process.platform === 'darwin'


let mainWindow
let aboutWindow

const createMainWindow = () => {
    mainWindow = new BrowserWindow({
        title: 'Image Shrink',
        icon: `${__dirname}/assets/icons/Icon_256x256.png`,
        width: 500,
        height: 600,
        resizable: is_dev ? true : false,
        backgroundColor: 'white', // prevent get dark when toggle dev tools
        webPreferences: {
            nodeIntegration: true // allow using node modules in the js
        }
    })
    // load url
    // mainWindow.loadURL('https://twitter.com')
    // mainWindow.loadURL(`file://${__dirname}/app/index.html`)
    mainWindow.loadFile('./app/index.html')
}

const createAboutWindow = () => {
    aboutWindow = new BrowserWindow({
        title: 'About Image Shrink',
        icon: `${__dirname}/assets/icons/Icon_256x256.png`,
        width: 300,
        height: 300,
        resizable: false,
        backgroundColor: 'white' // prevent get dark when toggle dev tools
    })
    // load url
    // mainWindow.loadURL('https://twitter.com')
    // mainWindow.loadURL(`file://${__dirname}/app/index.html`)
    aboutWindow.loadFile('./app/about.html')
}


app.on('ready', () => {
    createMainWindow()

    // set menu
    const mainMenu = Menu.buildFromTemplate(menu)
    Menu.setApplicationMenu(mainMenu)

    // set global shortcuts
    globalShortcut.register('CmdOrCtrl+R', () => mainWindow.reload())
    globalShortcut.register('CmdOrCtrl+I', () => mainWindow.toggleDevTools())

    // set mainWindow variable to null when closed
    mainWindow.on('ready', () => mainWindow == null)
})

// set menu
const menu = [
    ...(is_mac ? [{ // create about menu item
        label: app.name,
        submenu: [
            {
                label: 'About',
                click: createAboutWindow
            },
            { type: 'separator' },
            { role: 'quit' }
        ]

    }] : []),
    { role: 'fileMenu' },
    ...(is_dev ? [
        {
            label: 'dev',
            submenu: [
                { role: 'reload' },
                { role: 'forcereload' },
                { type: 'separator' },
                { role: 'toggledevtools' }
            ]
        }
    ] : []),
    ...(!is_mac ? [{ // create about menu item (windows)
        label: 'Help',
        submenu: [
            {
                label: 'About',
                click: createAboutWindow
            }
        ]

    }] : []),

    // {
    //     label: 'File',
    //     submenu: [
    //         {
    //             label: 'Quit',
    //             // accelerator: is_mac ? 'Command+W' : 'Ctrl+W',//set shortcut
    //             accelerator: 'CmdOrCtrl+W',//set shortcut
    //             click: () => app.quit()
    //         }
    //     ]
    // }
]

// the main process
ipcMain.on('image:scale', (e, options) => {
    options.dest = path.join(os.homedir(), 'imageshrink')
    // shrink image 
    shrinkImage(options)
})

// imagemin
const shrinkImage = async ({ imgPath, quality, dest }) => {
    try {
        const pngQuality = quality / 100.0
        const files = await imagemin([slash(imgPath)], {
            destination: dest,
            plugins: [
                imagemin_mozjpeg({ quality }),
                imagemin_pngquant({ quality: [pngQuality, pngQuality] })
            ]
        })
        // open dest folder
        shell.openPath(dest)
        // send back success alert
        mainWindow.webContents.send('image:done')
        logger.info(files)// log show in /Users/kin/Library/Logs/image-shrink/main.log
    } catch (err) {
        console.log(err.message)
        logger.error(err.message)
    }
}

// quit when all window closed except on mac
app.on('window-all-closed', () => {
    if (!is_mac) {
        app.quit()
    }
})
// create new window when icon clicked
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow()
    }
})