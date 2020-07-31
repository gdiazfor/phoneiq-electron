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

const path = require("path");
const fs = require("fs");

let tray = null
let notification = null
let badgesCounts = 0;

//notification.silent(true)

ipcMain.on('invokeAction', function(event, data){
    // var result = data;
    // event.sender.send('actionReply', result);
    dialog.showErrorBox("title", "content")
});

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


  ipcMain.on('setBadgeNumber', function(event, data){
    // var result = data;
    // event.sender.send('actionReply', result);
    app.setBadgeCount(data)
  });

  //console.log(dialog)
  //console.log(dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] }))


  // notification.on('show', () => {
  //   silent: true
  // })

  // notification = {
  //     silent: true
  // }



  // new Notification({
  //   title: "test",
  //   body: "asdasd"
  //   })

  // notification.on('show'){
  //       silent: "true"
  // };

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

  // const webview = document.querySelector('webview')
  // webview.addEventListener('ipc-message', (event) => {
  //   console.log(event.channel)
  //   // Prints "pong"
  // })
  
  mainWindow.webContents.send('asynchronous-message', 'ping')
  mainWindow.loadURL("file://" + __dirname + "/index.html");
  //mainWindow.loadURL('https://anakin.xentricqa.com:4434/?sf=ok')

  //mainWindow.webContents.executeJavaScript('console.log(global);');
  
  //let contents = mainWindow.webContents.global
  //mainWindow.webContents.executeJavaScript('console.log(window)');
  //console.log(contents)

  // mainWindow.webContents.on('did-finish-load', ()=>{
  //     let code = `var authButton = document.getElementById("controls");
  //             authButton.addEventListener("click",function(){alert("clicked!");});`;
  //     mainWindow.webContents.executeJavaScript(code);
  // });

  // let contents = mainWindow.webContents
  // console.log(contents)


  mainWindow.webContents.session.on('will-download', (event, item, webContents) => {
  // Set the save path, making Electron not to prompt a save dialog.
  //item.setSavePath('/tmp/save.pdf')

  // item.on('updated', (event, state) => {
  //   if (state === 'interrupted') {
  //     console.log('Download is interrupted but can be resumed')
  //   } else if (state === 'progressing') {
  //     if (item.isPaused()) {
  //       console.log('Download is paused')
  //     } else {
  //       console.log(`Received bytes: ${item.getReceivedBytes()}`)
  //     }
  //   }
  // })
  // item.once('done', (event, state) => {
  //   if (state === 'completed') {
  //     console.log('Download successfully')
  //   } else {
  //     console.log(`Download failed: ${state}`)
  //   }
  // })
})

  //hide menubar in windows
  mainWindow.setMenuBarVisibility(false)

  //prevenir segunda instancia de app en windows
  //let myWindow = null

  const gotTheLock = app.requestSingleInstanceLock()

  if (!gotTheLock) {
    app.quit()
  } else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
      // Someone tried to run a second instance, we should focus our window.
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore()
        mainWindow.focus()
      }
    })
  }

  //Updater
  autoUpdater.checkForUpdates();

  autoUpdater.on('checking-for-update', () => {
    sendStatusToWindow('Checking for update...');
    console.log('Checking for update...')
    dialog.showErrorBox("title", "content")
  });

  autoUpdater.on('update-available', () => {
    dialog.showMessageBox({
      type: 'info',
      title: 'Found Updates',
      message: 'There is a new version of PhoneIQ',
      detail: "Download this version to get the latest features",
      buttons: ['Start Download', 'Cancel']
    }, (buttonIndex) => {
      if (buttonIndex === 0) {
        autoUpdater.downloadUpdate()
      }
      else {
        updater.enabled = true
        updater = null
      }
    })
  })

  autoUpdater.on('update-not-available', info => {
      // dialog.showMessageBox({
      //   title: 'No Updates',
      //   message: 'Current version is up-to-date!'
      // })
  });

  autoUpdater.on('error', err => {
      // dialog.showMessageBox({
      //   title: 'No Updates',
      //   message: 'Error in auto-updater: ${err.toString()}'
      // })
    //sendStatusToWindow(`Error in auto-updater: ${err.toString()}`);
  });

  autoUpdater.on('download-progress', progressObj => {
    sendStatusToWindow(
      `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}% (${progressObj.transferred} + '/' + ${progressObj.total} + )`
    );
  });

  autoUpdater.on('update-downloaded', () => {
    autoUpdater.quitAndInstall()
    mainWindow.destroy()
    app.quit()
  })


  const sendStatusToWindow = (text) => {
    log.info(text);
    if (mainWindow) {
      mainWindow.webContents.send('message', text);
    }
  };

  mainWindow.webContents.on('did-finish-load', ()=>{
    //let contents = mainWindow.webContents
    //console.log(contents)
  });


  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  mainWindow.openDevTools();

  tray = new Tray(__dirname + '/assets/icons/png/IconTemplate.png')
  const contextMenu = Menu.buildFromTemplate([
    //{ label: 'Online', type: 'radio' },
    //{ label: 'Away', type: 'radio' },
    //{ label: 'Busy', type: 'radio' },
    //{ label: '', type: 'separator' },
    //{ label: 'Do not disturb', type: 'checkbox' },
    //{ label: '', type: 'separator' },
    { label: 'Show app', click:  function(){
          mainWindow.show()
      } 
    },
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

  tray.on('click', function (event) {
        mainWindow.show();
  });



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

      if (process.platform != 'darwin') {
        mainWindow.minimize()
      }else{
        mainWindow.hide()
      }
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

app.on('activate', () => { 
  app.show() 
  mainWindow.show()
})

app.on('before-quit', () => app.quitting = true)
// Quit when all windows are closed.



