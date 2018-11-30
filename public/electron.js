const path = require('path')
const { app, BrowserWindow, dialog, Menu } = require('electron')
const { autoUpdater } = require('electron-updater')
const isDev = require('electron-is-dev')
const { BASE_URL } = require('./src/constants.js')

// Event Handlers
require('./src/events/path.js')
require('./src/events/remote.js')
require('./src/events/installer.js')

/**
 * @type {BrowserWindow}
 */
let window

app.on('ready', () => {
  if (!isDev) autoUpdater.checkForUpdates()

  const width = 800
  const height = 580
  window = new BrowserWindow({
    width: width,
    height: isDev ? height + 20 : height,
    minWidth: width,
    minHeight: isDev ? height + 20 : height,
    show: false,
    icon: path.join(__dirname, 'icon.png'),
  })

  const menu = !isDev ? null : new Menu.buildFromTemplate([ // eslint-disable-line
    {
      label: 'Dev',
      submenu: [
        { role: 'reload' },
        { role: 'forcereload' },
        { role: 'toggledevtools' },
      ],
    },
  ])
  window.setMenu(menu)

  const startURL = isDev ?
    'http://localhost:3000' :
    `file://${path.join(__dirname, '../build/index.html')}`
  window.loadURL(startURL)

  window.setTitle(`ModSaber Installer // v${require('../package.json').version}`)
  window.show()

  window.custom = { BASE_URL }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

autoUpdater.on('download-progress', ({ percent }) => {
  window.setProgressBar(percent, { mode: 'normal' })
})

autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox(window, {
    type: 'info',
    buttons: [],
    title: 'Updater',
    message: 'A newer version has been downloaded.\n\nClick OK to install the update.\nThe program will restart with the update applied.',
  })

  autoUpdater.quitAndInstall(true, true)
})