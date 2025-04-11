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

  // Activer remote
  remoteMain.enable(win.webContents);

  // Charger ton fichier HTML
  win.loadFile('index.html');

  // Ouvrir automatiquement les DevTools
  win.webContents.openDevTools(); // 👈 AJOUT ICI
});
