// src/main.js
console.log("📡 Attaching userNotationUpdated listener...");
import { openCardModal } from "./components/cardModal/cardModal.js";


window.addEventListener("userNotationUpdated", (e) => {
  console.log("📩 Événement userNotationUpdated reçu :", e.detail?.cardName);
});

import { initGrid } from "./grid.js";
import { initSidebar } from "./sidebar.js";
import { openSettingsModal } from "./parametre.js";

document.addEventListener("DOMContentLoaded", () => {
  initSidebar();
  initGrid();
  const settingsBtn = document.querySelector(".settings-btn");
  if (settingsBtn) {
    settingsBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openSettingsModal();
    });
  }
  console.log("Application initialisée");
});


//mainWindow.webContents.openDevTools();

// À la place de window.addEventListener(...)
const bc = new BroadcastChannel("user-notation-channel");
console.log("📡 BroadcastChannel listener attaché...");

bc.onmessage = (event) => {
  const { type, cardName } = event.data || {};
  if (type === "userNotationUpdated" && cardName) {
    const lastCard = window.__lastOpenedCard;
    const overlay = document.getElementById("card-detail-overlay");
    if (!lastCard || !overlay) return;

    console.log("📩 BroadcastChannel: événement reçu :", cardName);

    // 🧹 Fermer l’ancien modal sans animation
    overlay.remove();

    // ⚙️ Créer le loader plein écran
    const loaderOverlay = document.createElement("div");
    loaderOverlay.id = "loader-overlay";
    Object.assign(loaderOverlay.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100vw",
      height: "100vh",
      backgroundColor: "#000000cc",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: "9999"
    });

    const loader = document.createElement("div");
    loader.className = "loader";
    loader.innerHTML = `
      <span></span><span></span><span></span>
      <span></span><span></span><span></span>
    `;

    loaderOverlay.appendChild(loader);
    document.body.appendChild(loaderOverlay);

    // ⏱️ Attente d’une seconde, puis rouvrir le nouveau modal
    setTimeout(() => {
      loaderOverlay.remove();
      openCardModal(lastCard);
    }, 1000);
  }
};
