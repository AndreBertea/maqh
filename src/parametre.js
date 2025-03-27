// src/parametre.js
import { loadConfig, saveConfig } from "./config.js";

export function openSettingsModal() {
  // Créer l'overlay du modal
  const modal = document.createElement("div");
  modal.id = "settingsModal";
  modal.style.position = "fixed";
  modal.style.top = "0";
  modal.style.left = "0";
  modal.style.width = "100%";
  modal.style.height = "100%";
  modal.style.backgroundColor = "rgba(0,0,0,0.5)";
  modal.style.display = "flex";
  modal.style.justifyContent = "center";
  modal.style.alignItems = "center";
  modal.style.zIndex = "10000";

  // Contenu du modal
  const modalContent = document.createElement("div");
  modalContent.style.width = "80%";
  modalContent.style.maxWidth = "600px";
  modalContent.style.backgroundColor = "#fff";
  modalContent.style.padding = "20px";
  modalContent.style.borderRadius = "8px";
  modalContent.style.position = "relative";
  modalContent.style.color = "#000";

  // Bouton de fermeture (X)
  const closeButton = document.createElement("button");
  closeButton.innerText = "X";
  closeButton.style.position = "absolute";
  closeButton.style.top = "10px";
  closeButton.style.right = "10px";
  closeButton.style.border = "none";
  closeButton.style.background = "transparent";
  closeButton.style.fontSize = "20px";
  closeButton.style.cursor = "pointer";
  closeButton.addEventListener("click", () => {
    document.body.removeChild(modal);
  });
  modalContent.appendChild(closeButton);

  // Titre du modal
  const title = document.createElement("h2");
  title.innerText = "Paramètres";
  modalContent.appendChild(title);

  // Charger la configuration existante
  const config = loadConfig();

  // --- Paramètre 1 : Nombre de cartes par page (curseur) ---
  const cardsLabel = document.createElement("label");
  cardsLabel.innerText = "Nombre de cartes par page:";
  cardsLabel.style.display = "block";
  cardsLabel.style.marginTop = "20px";
  modalContent.appendChild(cardsLabel);

  const cardsSlider = document.createElement("input");
  cardsSlider.type = "range";
  cardsSlider.min = "6";
  cardsSlider.max = "30";
  cardsSlider.value = config.cardsPerPage;
  cardsSlider.style.width = "100%";
  modalContent.appendChild(cardsSlider);

  const cardsValue = document.createElement("span");
  cardsValue.innerText = config.cardsPerPage;
  cardsValue.style.marginLeft = "10px";
  modalContent.appendChild(cardsValue);

  cardsSlider.addEventListener("input", () => {
    cardsValue.innerText = cardsSlider.value;
  });

  // --- Paramètre 2 : Période (choix multiple) ---
  const periodLabel = document.createElement("label");
  periodLabel.innerText = "Période sélectionnée:";
  periodLabel.style.display = "block";
  periodLabel.style.marginTop = "20px";
  modalContent.appendChild(periodLabel);

  const periodSelect = document.createElement("select");
  periodSelect.style.width = "100%";
  const options = ["5d", "1mo", "3mo", "6mo", "1y", "5y", "max"];
  options.forEach(opt => {
    const optionElement = document.createElement("option");
    optionElement.value = opt;
    optionElement.innerText = opt;
    if (opt === config.currentPeriod) {
      optionElement.selected = true;
    }
    periodSelect.appendChild(optionElement);
  });
  modalContent.appendChild(periodSelect);

  // Bouton de sauvegarde
  const saveButton = document.createElement("button");
  saveButton.innerText = "Sauvegarder";
  saveButton.style.marginTop = "30px";
  saveButton.style.padding = "10px 20px";
  saveButton.style.cursor = "pointer";
  saveButton.style.display = "block";
  saveButton.style.width = "100%";
  saveButton.style.backgroundColor = "#4CAF50";
  saveButton.style.color = "#fff";
  saveButton.style.border = "none";
  saveButton.style.borderRadius = "5px";
  saveButton.addEventListener("click", () => {
    // Mettre à jour la config avec les nouvelles valeurs
    config.cardsPerPage = parseInt(cardsSlider.value, 10);
    config.currentPeriod = periodSelect.value;
    saveConfig(config);
    // Émettre un événement pour informer les autres modules
    const event = new CustomEvent("configUpdated", { detail: config });
    document.dispatchEvent(event);
    document.body.removeChild(modal);
  });
  modalContent.appendChild(saveButton);

  modal.appendChild(modalContent);
  document.body.appendChild(modal);
}
