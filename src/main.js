// src/main.js
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
