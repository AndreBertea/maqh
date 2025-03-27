// src/cardDetail.js
export async function openCardDetail(card) {
  try {
    // Utiliser la colonne Name pour déterminer le fichier JSON associé (attention à la normalisation)
    const fileName = encodeURIComponent(card.Name.trim()) + ".json";
    const url = `data/companies/euronext/${fileName}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Erreur lors du chargement du fichier JSON.");
    }
    const data = await response.json();

    // Création de l'overlay du modal
    const overlay = document.createElement("div");
    overlay.id = "card-detail-overlay";
    Object.assign(overlay.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: "10000"
    });

    // Création du conteneur du modal
    const modalContent = document.createElement("div");
    modalContent.id = "card-detail-container";
    // Définir des styles de base
    modalContent.style.width = "80%";
    modalContent.style.maxWidth = "1600px";
    modalContent.style.height = "80%";
    modalContent.style.padding = "20px";
    modalContent.style.borderRadius = "8px";
    modalContent.style.position = "relative";
    modalContent.style.overflowY = "auto";
    // Appliquer les styles en fonction du thème actif
    if (document.body.classList.contains("light-mode")) {
      modalContent.style.backgroundColor = "#ffffff";
      modalContent.style.color = "#121212";
    } else {
      modalContent.style.backgroundColor = "#1b1b1b";
      modalContent.style.color = "#ffffff";
    }
    // Initialisation pour l'animation
    modalContent.style.transform = "scale(0.8)";
    modalContent.style.opacity = "0";
    modalContent.style.transition = "transform 0.3s ease-out, opacity 0.3s ease-out";

    // Bouton de fermeture
    const closeButton = document.createElement("button");
    closeButton.innerText = "X";
    Object.assign(closeButton.style, {
      position: "absolute",
      top: "10px",
      right: "10px",
      border: "none",
      background: "transparent",
      fontSize: "30px",
      cursor: "pointer",
      color: "inherit"
    });
    closeButton.addEventListener("click", () => {
      modalContent.style.transform = "scale(0.8)";
      modalContent.style.opacity = "0";
      setTimeout(() => {
        document.body.removeChild(overlay);
      }, 300);
    });
    modalContent.appendChild(closeButton);

    // Contenu : affichage du JSON formaté dans un bloc <pre>
    const pre = document.createElement("pre");
    pre.innerText = JSON.stringify(data, null, 2);
    pre.style.whiteSpace = "pre-wrap";
    pre.style.wordBreak = "break-all";
    pre.style.marginTop = "40px";
    modalContent.appendChild(pre);

    overlay.appendChild(modalContent);
    document.body.appendChild(overlay);

    // Lancer l'animation d'ouverture
    setTimeout(() => {
      modalContent.style.transform = "scale(1)";
      modalContent.style.opacity = "1";
    }, 50);

  } catch (error) {
    console.error("Erreur lors de l'ouverture de la carte détaillée:", error);
    alert("Erreur lors de l'ouverture des détails de la carte.");
  }
}
