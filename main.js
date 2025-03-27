const { app, BrowserWindow } = require('electron');
const path = require('path');
const remoteMain = require('@electron/remote/main');
remoteMain.initialize();

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  // Permet à @electron/remote d'accéder aux webContents de la fenêtre
  remoteMain.enable(win.webContents);
  win.loadFile('index.html');
});
