const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const { Menu, Tray, session, remote, Notification, shell, dialog } = require('electron')
const ipcMain = require('electron').ipcMain;
const contextMenu = require('electron-context-menu')

const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

// configure logging
autoUpdater.logger = require("electron-log")
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

// //const packager = require('electron-packager')

// // packager({
// //   dir: '/release-builds/PhoneIQ-darwin-x64/',
// //   osxSign: {
// //     identity: 'Developer ID Application: NXT  S.R.L (G977B72DJK)'
// //   }
// // })

// // --osx-sign.identity='Developer ID Application: NXT  S.R.L (G977B72DJK)'


//const installPostMessage = require('electron-context-menu')

const path = require("path");
const fs = require("fs");

let tray = null
let notification = null
let badgesCounts = 0;

contextMenu({
    prepend: (defaultActions, params, browserWindow) => [
        {
            label: 'Rainbow',
            // Only show it when right-clicking images
            visible: params.mediaType === 'image'
        },
        {
            label: 'Search Google for “{selection}”',
            // Only show it when right-clicking text
            visible: params.selectionText.trim().length > 0,
            click: () => {
                shell.openExternal(`https://google.com/search?q=${encodeURIComponent(params.selectionText)}`);
            }
        }
    ]
    //,
    //showInspectElement: false
});

const notifier = require('node-notifier');
// String
//notifier.notify('Message');
 
// Object
notifier.notify({
  title: 'Welcome to PhoneIQ!',
  message: 'Click here to download our other apps!',
  reply: true,
  open: 'https://www.phoneiq.co/apps',
  icon: (__dirname, "assets/icons/png/IconTemplate.png"),
  //contentImage: (__dirname, "assets/icons/png/IconTemplate.png"),
  sound: 'Hero',
  closeLabel: 'Close'
  //actions: ['Hide', 'Reply'],
});


const template = [
  {
    label: "Edit",
    submenu: [
      { role: "undo" },
      { role: "redo" },
      { type: "separator" },
      { role: "cut" },
      { role: "copy" },
      { role: "paste" },
      { role: "pasteandmatchstyle" },
      { role: "delete" },
      { role: "selectall" },
    ],
  },
  {
    label: "View",
    submenu: [
      { role: "reload" },
      { role: "forcereload" },
      { role: "toggledevtools" },
      { type: "separator" },
      { role: "resetzoom" },
      { role: "zoomin" },
      { role: "zoomout" },
      { type: "separator" },
      { role: "togglefullscreen" },
    ],
  },
  {
    role: "window",
    submenu: [{ role: "minimize" }, { role: "close" }],
  },
];

if (process.platform === "darwin") {
  template.unshift({
    label: app.name,
    submenu: [
      { role: "about" },
      { type: "separator" },
      { role: "services", submenu: [] },
      { type: "separator" },
      { role: "hide" },
      { role: "hideothers" },
      { role: "unhide" },
      { type: "separator" },
      { role: "quit" },
    ],
  });

  // Edit menu
  template[1].submenu.push(
    { type: "separator" },
    {
      label: "Speech",
      submenu: [{ role: "startspeaking" }, { role: "stopspeaking" }],
    }
  );

  // Window menu
  template[3].submenu = [
    { role: "close" },
    { role: "minimize" },
    { role: "zoom" },
    { type: "separator" },
    { role: "front" },
  ];
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let initPath;

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.allowRendererProcessReuse = true;
app.on("ready", () => {
  //console.log(dialog)
  //console.log(dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] }))

  initPath = path.join(app.getPath("userData"), "init.json");

  try {
    data = JSON.parse(fs.readFileSync(initPath, "utf8"));
  } catch (e) {}

  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    minWidth: 760,
    minHeight: 560,
    movable: true,
    icon: path.join(__dirname, "assets/icons/png/64x64.png"),
    titleBarStyle: 'hidden',
    //frame: false,
    backgroundColor: "#fff",
    webPreferences: {
      nodeIntegration: true,
      webviewTag: true,
      // plugins: true,
      // zoomFactor: 1.0,
      // allowpopups: true,
      //hace funcionar la app sin el tag webvie
      //contextIsolation: true,
      enableRemoteModule: true,
      spellcheck: true,
      preload: path.join(__dirname, "preload.js"),
      allowRunningInsecureContent: true
    },
  });
  
  // let contents = mainWindow.webContents
  // console.log(contents)


  mainWindow.webContents.send('asynchronous-message', 'ping')
  mainWindow.loadURL("file://" + __dirname + "/index.html");
  //mainWindow.loadURL('https://anakin.xentricqa.com:4434/?sf=ok')


 autoUpdater.checkForUpdates();
  

  autoUpdater.on('checking-for-update', () => {
    sendStatusToWindow('Checking for update...');
    console.log('Checking for update...')
    dialog.showErrorBox("title", "content")
  });
  autoUpdater.on('update-available', info => {
    sendStatusToWindow('Update available.');
    console.log('Update available');
    dialog.showErrorBox("title", "Update available")
  });
  autoUpdater.on('update-not-available', info => {
    sendStatusToWindow('Update not available.');
    dialog.showErrorBox("title", "Update not available")
  });
  autoUpdater.on('error', err => {
    sendStatusToWindow(`Error in auto-updater: ${err.toString()}`);
  });
  autoUpdater.on('download-progress', progressObj => {
    sendStatusToWindow(
      `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}% (${progressObj.transferred} + '/' + ${progressObj.total} + )`
    );
  });
  autoUpdater.on('update-downloaded', info => {
    sendStatusToWindow('Update downloaded; will install now');
  });

  autoUpdater.on('update-downloaded', info => {
    // Wait 5 seconds, then quit and install
    // In your application, you don't need to wait 500 ms.
    // You could call autoUpdater.quitAndInstall(); immediately
    autoUpdater.quitAndInstall();
  });

  const sendStatusToWindow = (text) => {
    log.info(text);
    if (mainWindow) {
      mainWindow.webContents.send('message', text);
    }
  };

  mainWindow.webContents.on('did-finish-load', ()=>{
      //badgesCounts = `console.log(globals)`;
      //console.log(badgesCounts)
      //mainWindow.webContents.executeJavaScript(badgesCounts);
      //app.setBadgeCount(code)

        //let contents = mainWindow.webContents
        //console.log(contents)

      // mainWindow.webContents.executeJavaScript(`globals.badgeCount`, true)
      // .then((result) => {
      //   //console.log(result) // Will be the JSON object from the fetch call
      //   badgesCounts = result;
      //   console.log(badgesCounts)
      //   app.setBadgeCount(badgesCounts)
      // })
  });


  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  //mainWindow.openDevTools();

  //console.log(mainWindow.webContents)
  //console.log(app)

  tray = new Tray(__dirname + '/assets/icons/png/IconTemplate.png')
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Online', type: 'radio' },
    { label: 'Away', type: 'radio' },
    { label: 'Busy', type: 'radio' },
    { label: '', type: 'separator' },
    { label: 'Do not disturb', type: 'checkbox' },
    { label: '', type: 'separator' },
    { label: 'Reload app', click:  function(){
          app.relaunch()
          app.exit(0)
      } 
    },
    { label: 'Show developer console', click:  function(){
          mainWindow.openDevTools();
      } 
    },
    { label: '', type: 'separator' },
    { label: 'Quit', click:  function(){
          app.isQuiting = true;
          app.quit()
      } 
    } 
  ])

  // notification = new Notification('', {
  //   silent: true
  // })


  //tray.setPressedImage(__dirname + '/assets/icons/png/tray.png')
  //tray.setTitle("PhoneIQ")
  //tray.setToolTip('Click to open more options')
  tray.setContextMenu(contextMenu)
  //console.log(Notification.isSupported())
  

  mainWindow.on('close', (event) => {
    if (app.quitting) {
      mainWindow = null
    } else {
      event.preventDefault()
      mainWindow.hide()
    }
  })



});

app.on('ready', async () => {
  await session.defaultSession.loadExtension('assets/extensions/ScreenShareExt')
  //await session.defaultSession.loadExtension(path.join('assets/extensions/ScreenShareExt'))
})


app.on("web-contents-created", (e, contents) => { 
if (contents.getType() == "webview") { // set context menu in webview 
  contextMenu({ window: contents, }); 
  } 
});


//Listen for web contents being created
app.on('web-contents-created', (e, contents) => {

  // Check for a webview
  if (contents.getType() == 'webview') {

    // Listen for any new window events
    contents.on('new-window', (e, url) => {
      if (url.indexOf("#conferences/videoRoomInUse") > 0) {
        return
      }else{
        shell.openExternal(url);
      }
    })
  }
})


// Quit when all windows are closed.
// app.on("window-all-closed", () => {
//   data = {
//     bounds: mainWindow.getBounds(),
//   };
//   fs.writeFileSync(initPath, JSON.stringify(data));
//   if (process.platform != 'darwin') {
//      app.quit();
//   }
// });


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => { app.show() })

app.on('before-quit', () => app.quitting = true)
// Quit when all windows are closed.



