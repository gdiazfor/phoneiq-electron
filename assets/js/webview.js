// import installPostMessage from 'electronic-post-message'
 
// installPostMessage()
 
 
 
// // That's it!! Use postMessage as usual
// window.parent.postMessage('ping')
// window.addEventListener('message', function (msg) {
//   if (msg.source === window.parent) {
//     console.log(msg.data) // logs 'pong'
//   }
// })


window.onresize = doLayout;

// window.onload = function () {
//   console.log("tests");
//   messageHandler();
//   function messageHandler() {
//       var messageHandler = function(event) {
//           if (event.data.key == 'showDialogRenameFile') {
//               // messageBageCount = event.data.badgeCount;
//               // updateBadgeCount();
//               console.log("test");
//               console.log("test");
//               console.log("test");
//               console.log("test");
//               console.log("test");
//           }
//       };
//       window.addEventListener('message', messageHandler, false);
//   }
//   window.addEventListener('message', messageHandler, false);

// };

onload = () => {
  doLayout();
  // Topbar functions
  homeButton();
  printButton();
  allowNewWindows();
};



function doLayout() {
  let webview = document.querySelector("webview");
  let windowWidth = document.documentElement.clientWidth;
  let windowHeight = document.documentElement.clientHeight;
  let controlsHeight = getControlsHeight();
  let webviewHeight = windowHeight - controlsHeight;

  webview.style.width = windowWidth + "px";
  //webview.style.height = webviewHeight + "px";

}

function allowNewWindows() {
  // Listen for web contents being created

}