window.onresize = doLayout;


onload = () => {
  doLayout();
  // Topbar functions
  homeButton();
  printButton();
  allowNewWindows();
};


// const webview = document.querySelector('webview')
// webview.addEventListener('console-message', (e) => {
//   console.log('Guest page logged a message:', e.message)
// })


var ipc = require('electron').ipcRenderer;


function doLayout() {
  let webview = document.querySelector("webview");
  let windowWidth = document.documentElement.clientWidth;
  let windowHeight = document.documentElement.clientHeight;
  let controlsHeight = getControlsHeight();
  let webviewHeight = windowHeight - controlsHeight;
  // console.log(document)
  // console.log(webview)

  webview.addEventListener('console-message', (e) => {
    //console.log(e.message)
    const messageEvent = e.message;
    //const aux = messageEvent.split(':').pop();

    
    if(messageEvent.includes("badgeNumberTotal")){
      // var newStr = messageEvent.includes("badgeNumberTotal");
      // var newStr = messageEvent.includes("badgeNumberTotal");
      //messageEvent.split(':').pop();

      var txt = messageEvent;
      var numb = txt.match(/\d/g);
      numb = numb.join("");
      var integerN = parseInt(numb);
      console.log(integerN)
      ipc.send('setBadgeNumber', integerN);

      // var str = messageEvent;
      // str.substr(str.length -1);

      // console.log(str)
    }

    if(messageEvent == "renameFileDialog"){
      console.log("yes")
    }
  })

  // //console.log(global)
  // document.addEventListener('message', ({ data }) => {
  //   // our embedded site did a window.postMessage and therefor we will
  //   // proxy it back to our main process
  //   //console.log("===========")
  //   ipcRenderer.send('postMessage', data)
  // })

  // ipcRenderer.on('postMessage', (event) => {
  //   // We received an event on the postMessage channel from
  //   // the main process. Do a window.postMessage to forward it
  //   webview.postMessage([], '*')
  // })

  webview.style.width = windowWidth + "px";
  //webview.style.height = webviewHeight + "px";

    //console.log(webview)

    // webview.addEventListener('did-finish-load', function (event) {
    //   console.log('did-finish-load')
    // })
    // webview.addEventListener('message', (e) => {
    //   alert("asddas")
    // });

}

function allowNewWindows() {
  // Listen for web contents being created

}