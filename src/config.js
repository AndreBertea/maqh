// src/config.js
const fs = window.require('fs');
const path = window.require('path');
const { fileURLToPath } = window.require('url');
const { app } = window.require('@electron/remote');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Utilise le dossier userData de l'utilisateur pour stocker la configuration
const userDataPath = app.getPath('userData');
const configDir = path.join(userDataPath, 'config');
const configFile = path.join(configDir, 'config.json');

const defaultConfig = {
  cardsPerPage: 10,
  currentPeriod: "5d"
};

function loadConfig() {
  try {
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    if (fs.existsSync(configFile)) {
      const data = fs.readFileSync(configFile, 'utf8');
      return JSON.parse(data);
    } else {
      saveConfig(defaultConfig);
      return defaultConfig;
    }
  } catch (err) {
    console.error("Erreur lors du chargement du config :", err);
    return defaultConfig;
  }
}

function saveConfig(config) {
  try {
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
  } catch (err) {
    console.error("Erreur lors de la sauvegarde du config :", err);
  }
}

export { loadConfig, saveConfig, defaultConfig };
