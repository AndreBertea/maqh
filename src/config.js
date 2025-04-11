const fs = window.require('fs');
const path = window.require('path');
const { app } = window.require('@electron/remote');

// 📁 Dossier local usine (dans le projet)
const usineConfigDir = path.join(__dirname, 'config');
const usineConfigFile = path.join(usineConfigDir, 'config.json');
const usineNotationFile = path.join(usineConfigDir, 'configNotation.json');

// 📁 Dossier perso (userData Electron)
const userDataPath = app.getPath('userData');
const configDir = path.join(userDataPath, 'config');
const configFile = path.join(configDir, 'config.json');
const notationConfigFile = path.join(configDir, 'configNotation.json');

// 💾 Valeurs par défaut de secours (si rien n'existe du tout)
const defaultConfig = {
  cardsPerPage: 10,
  currentPeriod: "5d"
};

// ➕ Utilitaire pour copier un fichier usine vers le dossier userData
function copyIfMissing(from, to, fallback = '{}') {
  if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true });
  if (!fs.existsSync(to)) {
    try {
      if (fs.existsSync(from)) {
        fs.copyFileSync(from, to);
      } else {
        fs.writeFileSync(to, fallback);
      }
    } catch (err) {
      console.error(`Erreur lors de la copie du fichier de config de ${from}`, err);
    }
  }
}

function loadConfig() {
  copyIfMissing(usineConfigFile, configFile, JSON.stringify(defaultConfig));
  try {
    return JSON.parse(fs.readFileSync(configFile, 'utf8'));
  } catch (err) {
    console.error("Erreur lors du chargement de config.json:", err);
    return defaultConfig;
  }
}

function saveConfig(config) {
  try {
    fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
  } catch (err) {
    console.error("Erreur lors de la sauvegarde de config.json:", err);
  }
}

function loadNotationConfig() {
  copyIfMissing(usineNotationFile, notationConfigFile, JSON.stringify({ usine: {}, perso: {} }));
  try {
    return JSON.parse(fs.readFileSync(notationConfigFile, 'utf8'));
  } catch (err) {
    console.error("Erreur lors du chargement de configNotation.json:", err);
    return { usine: {}, perso: {} };
  }
}

function saveNotationConfig(config) {
  try {
    fs.writeFileSync(notationConfigFile, JSON.stringify(config, null, 2));
  } catch (err) {
    console.error("Erreur lors de la sauvegarde de configNotation.json:", err);
  }
}

// ➕ Remettre à zéro depuis les fichiers usine
function resetToFactoryConfig() {
  if (fs.existsSync(usineConfigFile)) fs.copyFileSync(usineConfigFile, configFile);
  if (fs.existsSync(usineNotationFile)) fs.copyFileSync(usineNotationFile, notationConfigFile);
}

export {
  loadConfig, saveConfig,
  loadNotationConfig, saveNotationConfig,
  defaultConfig, resetToFactoryConfig
};
