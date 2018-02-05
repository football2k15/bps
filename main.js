'use strict';
const electron = require('electron');
const {net,session} = require('electron');
var Client = require('node-rest-client').Client;
var client = new Client();
const Store = require('./Store.js');
client.registerMethod("jsonMethod", "http://tires.bigbrand.com/webApiTransfers/api/gettires", "GET");
client.registerMethod("postMethod", "http://tires.bigbrand.com/webApiTransfers/api/InvoiceHeaders", "POST");
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
var home;
var userIsAuthenticated = false;
var mainWindow;
var sendapp = false; 
var updatedata = false;
var isonline = false;
var connectivity = require('connectivity')
 
var onLine = function(){ connectivity(function (online) {
  isonline = online
  if (online) {
    
    console.log('connected to the internet!')
  } else {
    console.error('sorry, not connected!')
  }
})
}
onLine()
var checkingonlinestatus = function(){
  onLine()
  if(isonline){
    console.log("yup")
   if(updatedata){
    console.log("posting it")
    var app = store.get("appointment");
          var args = {
            data: app,
            headers: { "Content-Type": "application/json" }
            };
            client.post("http://tires.bigbrand.com/webApiTransfers/api/InvoiceHeaders", args, function (data, response) {
          });
          updatedata = false
   }
  }else{
    updatedata = true
    message();
    checkonline();
    console.log('App is offline!')
  }
}

function checkonline(){
  onLine()
    setTimeout(function(){
      if(isonline){
        console.log(isonline)
        checkingonlinestatus()
      }else{
        console.log(isonline)
        checkonline()
      }
    },1000)
} 

var message = function(){
  const {dialog} = require('electron');
  return dialog.showMessageBox({
     title:"There's no internet",
     message:"No internet available, do you want to try again?",
     type:'warning',
     buttons:["Try again please","I don't want to work anyway"],
     defaultId: 0
  },function(index){
      // if clicked "Try again please"
      if(index == 0){
         checkingonlinestatus();
      }
  })
};

const store = new Store({
  configName: 'user-preferences',
  defaults: {
  
    windowBounds: { width: 800, height: 600 }
  }
});

//tires jason data set
ipc.on('gettiredata', (event, arg) => {  
  if(isonline){
    client.methods.jsonMethod(function (data, response) {
      store.set('tiresdataset', data);
      event.returnValue =  data;
  });
  
  }else{
  event.returnValue = store.get('tiresdataset');
  checkingonlinestatus()
  }
  
});

//make walk in appointment
ipc.on('makeappointmet',(event,args)=>{
  onLine()
  if(isonline){
    var argsforpost = {
      data: args,
      headers: { "Content-Type": "application/json" }
      };
     var test = client.post("http://tires.bigbrand.com/webApiTransfers/api/InvoiceHeaders", argsforpost, function (data, response) {
        
     });
     test.on('error', function (err) {
      store.set("appointment",args)
      checkingonlinestatus()
     });
    }else{
      store.set("appointment",args)
      checkingonlinestatus()
    }
})

function createWindow(){
mainWindow = new BrowserWindow({
  width:1024,
  height:768,
  backgroundColor: '#2e2c29',
  nodeIntegration:false,
  icon:__dirname+'/img/bigbrand.png'});
mainWindow.loadURL('file://' + __dirname + '/index.html');
// const menu = Menu.buildFromTemplate([{
//     label: 'Electron',
//     submenu:[
//         {
//             label: 'Magic',
//             click: function(){
//                 //mainWindow.destroy();
//                 prefWindow.show();
//             }
//         }
//     ]
//     }]);
// Menu.setApplicationMenu(menu);
mainWindow.setMenu(null);
mainWindow.on('closed',()=>{
    mainWindow = null;
});
if(userIsAuthenticated == false){
  authenticate();
}




var edge = new BrowserWindow({
  width:1024,
  height:768,
    show:false,
    webPreferences:{
      nodeIntegration:false
    }
  });
  
  edge.loadURL('http://edge.bigbrandtire.com');
  var bigbrand = new BrowserWindow({
    width:1024,
    height:768,
    show:false,
    webPreferences:{
      nodeIntegration:false
    }
    
  });
  bigbrand.loadURL('http://bbtalpha.azurewebsites.net/');

  var prefWindow = new BrowserWindow({
    width:400,
    height:400,
    show:false
  });
  prefWindow.loadURL('file://' + __dirname + '/next.html');

  var gettires = new BrowserWindow({
    width:1024,
    height:768,
      show:false,
      webPreferences:{
        nodeIntegration:true
      }
    });
  gettires.loadURL('file://' + __dirname + '/addtires.html');
  

  ipc.on('show-prefs',function(){
    //mainWindow.destroy();
    prefWindow.show();
  });
  ipc.on('edge',function(){
    
    edge.show();
   
  });
  ipc.on('bigbrand',function(){

    bigbrand.show();
  });
  ipc.on('goHome',function(){
   
  });

  ipc.on('addtires',function(){
    client.methods.jsonMethod(function (data, response) {
      store.set('tiresdataset', data);
  });
  
  home.close();  
  gettires.show();
 
  })
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
  home = new BrowserWindow({
    width:1700,
    height:1000,
    show:false
  });
  home.loadURL('file://' + __dirname + '/home.html');
  userIsAuthenticated == true;
 
  event.sender.send('async-reply', true);
  
}else{
  event.sender.send('async-reply', false);
}
});

ipc.on("closeDialog", (event, data) => {
  
   
  promptAnswer = data
  //event.sender.send('CloseMainPanel', true);
  mainWindow.close();
  home.show();
})
app.on('ready', createWindow);
app.on('window-all-closed',()=>{
if(process.platform !== 'darwin'){
app.quit();
}
});

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



