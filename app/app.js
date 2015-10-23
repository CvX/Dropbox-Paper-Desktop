var app = require('app');
var Menu = require('menu');
var Tray = require('tray');
var BrowserWindow = require('browser-window');  // Module to create native browser window.
var mainWindow = null;

win = null; // make it global so app_menu.js can see it

// workaround
var fs = require('fs');
var cacheFile = app.getDataPath()+"/Application Cache/Index";
try{
  fs.unlinkSync(cacheFile);
}catch(e){}

// template
var template = require('./app_menu');

app.on('window-all-closed', function() {
  if (process.platform != 'darwin')
    app.quit();
});

app.on('before-quit', function() {
  win.forceClose = true;
});

app.on('activate-with-no-open-windows', function() {
  win.show();
});

app.on('ready', function() {
  appInit();
});

// Initialization.
function appInit () {

  var menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // Create the browser window.
  win = new BrowserWindow({
    "width": 1000,
    "height": 720,
    "type": "toolbar",
    "title": "Dropbox Paper",
    "node-integration": false,
  });

  // Load the app page
  win.loadUrl('https://paper.dropbox.com/?role=personal', {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.52 Safari/537.36'
  });

  // Open links externally
  win.webContents.on("new-window", function(event, url, frameName, disposition){
    require('shell').openExternal(url)
    event.preventDefault();
  });

  // update OSX badge only if you're using OSX.
  if(process.platform == 'darwin') {
  	win.on('page-title-updated', function(event, title) {
  	  var unreadCount = getUnreadCount(title);
  	  app.dock.setBadge(unreadCount);
  	  if (unreadCount > 0)
  	    app.dock.bounce('informational');
  	});
  }

  win.on('close', function(e){
    if (win.forceClose) return;
    if (process.platform == 'darwin') {
      e.preventDefault();
      win.hide();
    }
  });

  // Emitted when the window is closed.
  win.on('closed', function() {
    win = null;
  });

  // app.dock.hide();
  win.show();
}

/**
 * Returns unread count from window title
 */
function getUnreadCount(title) {
  return title.substring(0, title.indexOf(')')).split('(').join('');
}