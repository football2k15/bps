const {app,BrowserWindow, ipcMain}= require("electron");


var knex = require("knex")({
    client: "sqlite3",
    connection: {
        filename:"./newDatabase.db"
    },
    debug: true,
    useNullAsDefault:true
});

app.on("ready", ()=>{
    let mainWindow = new BrowserWindow({
        height:800,
        width:800, 
        show:false
    })
    mainWindow.loadURL('file://' + __dirname + '/index2.html')
    mainWindow.once("ready-to-show", ()=>{mainWindow.show()})
    ipcMain.on("mainWindowLoaded",function(){
        
        let results = knex.select("FirstName").select("LastName").from("User")
        console.log("got it")
        results.then(function(rows){
            console.log(rows+"got it 2")
            mainWindow.webContents.send("resultSent",rows)
        })
    })
})

ipcMain.on("customerSubmit",function(evnt,result){
var insert1 =JSON.parse(result)
knex.insert(insert1).into("User").then(function (id) {
    console.log(id);
  })

    console.log(result);
})

app.on("window-all-closed",()=> {app.quit()})