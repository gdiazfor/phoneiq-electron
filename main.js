const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const { Menu, Tray, session, remote, shell, ipcMain } = require('electron')

const path = require("path");
const fs = require("fs");

let tray = null

//const { app, Menu, Tray } = require('electron')

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
      zoomFactor: 1.0,
      enableRemoteModule: true,
      allowRunningInsecureContent: true
    },
  });
  
  //let contents = mainWindow.webContents
  //console.log(contents)

  mainWindow.webContents.send('asynchronous-message', 'ping')
  mainWindow.loadURL("file://" + __dirname + "/index.html");

  // Display Dev Tools
  //mainWindow.openDevTools();


  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  mainWindow.openDevTools();

  tray = new Tray(__dirname + '/assets/icons/png/tray.png')
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

  tray.setTitle("PhoneIQ")
  tray.setToolTip('Click to open more options')
  tray.setContextMenu(contextMenu)

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

app.on('activate', () => { mainWindow.show() })

app.on('before-quit', () => app.quitting = true)
// Quit when all windows are closed.



