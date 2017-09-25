'use strict';

const electron = require('electron');
const app = electron.app;

const path = electron.path;
const url = electron.url;
const BrowserWindow = electron.BrowserWindow;
var fs = electron.fs;
var ipc = electron.ipcMain;
const Menu = electron.Menu;
var user= 55555;
var pass = 12345;
var promptWindow;
var promptOptions
var promptAnswer;
var userIsAuthenticated = false;
var mainWindow;
function createWindow(){
mainWindow = new BrowserWindow({width:1024,height:768,backgroundColor: '#2e2c29',icon:__dirname+'/img/bigbrand.png'});
mainWindow.loadURL('https://www.bigbrandtire.com');
mainWindow.loadURL('file://' + __dirname + '/index.html');
const menu = Menu.buildFromTemplate([{
    label: 'Electron',
    submenu:[
        {
            label: 'Prefs',
            click: function(){
                //mainWindow.destroy();
                prefWindow.show();
            }
        }
    ]
    }]);
Menu.setApplicationMenu(menu);
mainWindow.setMenu(null);
mainWindow.on('closed',()=>{
    mainWindow = null;
   
});
if(userIsAuthenticated == false){
  authenticate();
}




var edge = new BrowserWindow({
    width:400,
    height:400,
    show:false
  });
  edge.loadURL('https://edge.bigbrandtire.com');

  var prefWindow = new BrowserWindow({
    width:400,
    height:400,
    show:false
  });
  prefWindow.loadURL('file://' + __dirname + '/next.html');

  ipc.on('show-prefs',function(){
    //mainWindow.destroy();
    prefWindow.show();
  });
  ipc.on('edge',function(){
    edge.show();
  });
  ipc.on('goHome',function(){
   
  });
}
function promptModal(parent, options) {
    promptOptions = options;
    promptWindow = new BrowserWindow({
      width:360, height: 250, 
      'parent': parent,
      //'show': false,
      'modal': true,
      'alwaysOnTop' : true, 
      'title' : options.title,
      'autoHideMenuBar': true,
      'webPreferences' : { 
        "nodeIntegration":true,
        "sandbox" : false 
      }   
    });
    promptWindow.on('closed', () => { 
      promptWindow = null 
      //callback(promptAnswer);
    })
  
    // Load the HTML dialog box
    promptWindow.loadURL('file://' + __dirname + '/promt.html')
    promptWindow.once('ready-to-show', () => { promptWindow.show() })
  }
  
  ipc.on("openDialog", (event, data) => {
    event.returnValue = JSON.stringify(promptOptions, null, '')
})

// Called by the dialog box when closed
ipc.on('async', (event, arg) => {  
  // Print 1
 var args = JSON.parse(arg);

if(user == args.user && pass == args.pass){
  var home = new BrowserWindow({
    width:1700,
    height:1000,
    show:false
  });
  home.loadURL('file://' + __dirname + '/home.html');
  userIsAuthenticated == true;
  console.log("gotin")
  event.sender.send('async-reply', true);
  mainWindow.destroy();
  home.show();
}else{
  event.sender.send('async-reply', false);
}
});

ipc.on("closeDialog", (event, data) => {
    console.log(data);
  promptAnswer = data
})
app.on('ready', createWindow);
app.on('window-all-closed',()=>{
if(process.platform !== 'darwin'){
app.quit();
}
});
console.log(userIsAuthenticated);


function authenticate(){
  promptModal(mainWindow, {
    "title": "Login",
    "label":"User Name:", 
      "value":"User Name", 
      "labelPas":"Password:", 
    "valuePas":"Password", 
    "ok": "ok"
    }
  );        
}
// Called by the application to open the prompt dialog

// ipc.on("prompt",  (event, notused) => {
// 	promptModal(mainWindow, {
// 	    "title": "Login",
// 	    "label":"User Name:", 
//         "value":"User Name", 
//         "labelPas":"Password:", 
// 	    "valuePas":"Password", 
// 	    "ok": "ok"
// 	    }, 
// 	    function(data) {
//         event.returnValue = data
//       }
//     );        
// });



