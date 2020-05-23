const { app, BrowserWindow, Menu, globalShortcut } = require('electron')
// app controls total lifecycle
// BrowserWindow creates windows

// environment
process.env.NODE_ENV = 'development'
const is_dev = process.env.NODE_ENV !== 'production'
const is_mac = process.platform === 'darwin'


let mainWindow
let aboutWindow

const createMainWindow = () => {
    mainWindow = new BrowserWindow({
        title: 'Image Shrink',
        icon: './assets/icons/Icon_256x256.png',
        width: 500,
        height: 600,
        resizable: is_dev ? true : false,
        backgroundColor: 'white' // prevent get dark when toggle dev tools
    })
    // load url
    // mainWindow.loadURL('https://twitter.com')
    // mainWindow.loadURL(`file://${__dirname}/app/index.html`)
    mainWindow.loadFile('./app/index.html')
}

const createAboutWindow = () => {
    aboutWindow = new BrowserWindow({
        title: 'About Image Shrink',
        icon: './assets/icons/Icon_256x256.png',
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
            }
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