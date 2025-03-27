import { hexToRGBA, getFilteredData, parseCSV } from "./utils.js";
import { loadConfig } from "./config.js";

// États internes de la grille
let allCards = [];
export let activeCards = [];
let stockData = {};
let chartInstances = {};
let currentPeriod = "5d";
let currentPage = 1;
let cardsPerPage = 10; // Déclaré avec let pour être modifié par la config

const periodDaysMap = {
  '1d': 1,
  '5d': 5,
  '1mo': 30,
  '3mo': 90,
  '6mo': 180,
  '1y': 365,
  '5y': 1825,
  'max': Infinity
};

const positiveColor = "#4CAF50";
const negativeColor = "#F44336";

async function initGrid() {
  // Charger la configuration depuis le fichier de config
  const config = loadConfig();
  console.log("Configuration chargée au démarrage :", config);
  cardsPerPage = config.cardsPerPage;
  currentPeriod = config.currentPeriod;
  
  // Attacher l'écouteur de recherche
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("keyup", handleSearch);
  }
  
  // Attacher les écouteurs aux boutons de période
  document.querySelectorAll(".period-btn").forEach(button => {
    button.addEventListener("click", function () {
      document.querySelectorAll(".period-btn").forEach(btn => btn.classList.remove("active"));
      this.classList.add("active");
      updatePeriod(this.getAttribute("data-period"));
    });
  });
  
  await fetchData();
}

async function fetchData() {
  try {
    // Charger le CSV (chemin relatif à index.html)
    const csvResponse = await fetch("data/EURONEXT_actions.csv").then(res => res.text());
    allCards = parseCSV(csvResponse);
    
    // Pour chaque carte, charger le fichier JSON associé dans data/yahoo_api/{Symbol}.json
    await Promise.all(allCards.map(async card => {
      try {
        // Le CSV fournit par exemple "ALDOL" ; on attend "ALDOL.json"
        const jsonData = await fetch(`data/yahoo_api/${card.Symbol}.json`).then(res => res.json());
        card.currentPrice = jsonData.currentPrice;
        card.prices = jsonData.prices;
        // Si currentPrice est null ou si le JSON indique "No Data Available", on marque la carte comme spéciale
        if (card.currentPrice === null || (card.prices && Object.keys(card.prices)[0] === "No Data Available")) {
          card.dataAvailable = false;
          card.special = true;
        } else {
          card.dataAvailable = true;
          card.special = false;
        }
      } catch (err) {
        console.error(`Erreur lors du chargement pour ${card.Symbol}:`, err);
        card.dataAvailable = false;
        card.special = true;
      }
    }));
    
    // Trier les cartes : celles avec données disponibles en premier
    allCards.sort((a, b) => {
      if (a.special && !b.special) return 1;
      if (!a.special && b.special) return -1;
      return 0;
    });
    
    activeCards = allCards.slice();
    currentPage = 1;
    renderCards(activeCards);
  } catch (error) {
    console.error("Erreur lors du chargement :", error);
  }
}

function renderCards(cards) {
  const gridContainer = document.getElementById("grid-container");
  if (!gridContainer) {
    console.error("Erreur : 'grid-container' introuvable dans le DOM.");
    return;
  }
  gridContainer.innerHTML = "";
  // Détruire d'anciens graphiques
  Object.values(chartInstances).forEach(chart => chart.destroy());
  chartInstances = {};

  // Calcul de la pagination
  const startIndex = (currentPage - 1) * cardsPerPage;
  const endIndex = startIndex + cardsPerPage;
  const cardsToRender = cards.slice(startIndex, endIndex);

  if (cardsToRender.length === 0) {
    gridContainer.innerHTML = "<p>Aucune carte ne correspond à votre recherche.</p>";
    return;
  }

  cardsToRender.forEach(card => {
    const cardElement = document.createElement("div");
    cardElement.classList.add("card");
    if (card.special) {
      cardElement.style.opacity = "0.6";
    }
    cardElement.dataset.symbol = card.Symbol;
    cardElement.innerHTML = `
      <div class="card-header">
        <p class="symbol">${card.Symbol}.PA</p>
        <p class="description">${card.Name}</p>
      </div>
      <div class="price" id="price-${card.Symbol}">...</div>
      <div class="change" id="change-${card.Symbol}">...</div>
      <div class="card-chart">
        <canvas id="chart-${card.Symbol}"></canvas>
      </div>
    `;
    gridContainer.appendChild(cardElement);
    
    if (!card.dataAvailable) {
      renderCardData(card.Symbol, { dataAvailable: false, special: card.special });
    } else {
      const data = calculateCardData(card);
      renderCardData(card.Symbol, data);
    }
  });
  renderPaginationControls(cards);
}

function calculateCardData(card) {
  const pricesData = card.prices;
  if (!pricesData || Object.keys(pricesData).length === 0) {
    return { dataAvailable: false };
  }
  const filteredData = getFilteredData(pricesData, currentPeriod, periodDaysMap);
  const labels = filteredData.map(item => item.date.toISOString().split("T")[0]);
  const prices = filteredData.map(item => item.price);
  const currentPrice = card.currentPrice;
  const firstPrice = prices.length > 0 ? prices[0] : currentPrice;
  const change = currentPrice - firstPrice;
  const changePercent = firstPrice !== 0 ? (change / firstPrice * 100) : 0;
  return {
    currentPrice,
    change,
    changePercent,
    dates: labels,
    prices: prices,
    dataAvailable: true
  };
}

function updatePeriod(period) {
  currentPeriod = period;
  Object.values(chartInstances).forEach(chart => chart.destroy());
  chartInstances = {};
  const currentCards = getCurrentPageCards(activeCards);
  currentCards.forEach(card => {
    if (card.dataAvailable) {
      const data = calculateCardData(card);
      renderCardData(card.Symbol, data);
    }
  });
  console.log(`Période mise à jour : ${currentPeriod}`);
}

function getCurrentPageCards(cards) {
  const startIndex = (currentPage - 1) * cardsPerPage;
  const endIndex = startIndex + cardsPerPage;
  return cards.slice(startIndex, endIndex);
}

function renderCardData(symbol, data) {
  const priceElement = document.getElementById(`price-${symbol}`);
  const changeElement = document.getElementById(`change-${symbol}`);
  const canvasElement = document.getElementById(`chart-${symbol}`);
  if (!priceElement || !changeElement || !canvasElement) return;
  
  if (data.special) {
    priceElement.innerText = "No Data Available";
    changeElement.innerHTML = "";
    return;
  }
  
  priceElement.innerText = `${data.currentPrice.toFixed(2)} €`;
  const color = data.change >= 0 ? positiveColor : negativeColor;
  changeElement.innerHTML = `<span style="color: ${color}">${data.changePercent.toFixed(2)}% (${data.change.toFixed(2)})</span>`;
  if (chartInstances[symbol]) {
    chartInstances[symbol].destroy();
  }
  const ctx = canvasElement.getContext("2d");
  chartInstances[symbol] = new Chart(ctx, {
    type: "line",
    data: {
      labels: data.dates,
      datasets: [{
        data: data.prices,
        borderColor: color,
        backgroundColor: hexToRGBA(color, 0.2),
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: { x: { display: false }, y: { display: false } }
    }
  });
}

function renderPaginationControls(filteredCards) {
  const paginationContainer = document.getElementById("pagination");
  if (!paginationContainer) return;
  paginationContainer.innerHTML = "";
  const totalPages = Math.ceil(filteredCards.length / cardsPerPage);
  const prevBtn = document.createElement("button");
  prevBtn.innerText = "Previous";
  prevBtn.disabled = currentPage <= 1;
  prevBtn.addEventListener("click", function () {
    if (currentPage > 1) {
      currentPage--;
      renderCards(filteredCards);
    }
  });
  const nextBtn = document.createElement("button");
  nextBtn.innerText = "Next";
  nextBtn.disabled = currentPage >= totalPages;
  nextBtn.addEventListener("click", function () {
    if (currentPage < totalPages) {
      currentPage++;
      renderCards(filteredCards);
    }
  });
  const pageInfo = document.createElement("span");
  pageInfo.innerText = `Page ${currentPage} of ${totalPages}`;
  paginationContainer.appendChild(prevBtn);
  paginationContainer.appendChild(pageInfo);
  paginationContainer.appendChild(nextBtn);
}

function handleSearch() {
  const searchInput = document.getElementById("searchInput");
  const query = searchInput.value.toLowerCase();
  console.log("Recherche lancée avec :", query);
  activeCards = allCards.filter(card => {
    return card.Name.toLowerCase().includes(query) ||
           card.Symbol.toLowerCase().includes(query);
  });
  currentPage = 1;
  renderCards(activeCards);
}

document.addEventListener("keydown", function (e) {
  if ((e.metaKey || e.ctrlKey) && e.code === "KeyK") {
    e.preventDefault();
    console.log("Raccourci Cmd/Ctrl+K déclenché");
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.focus();
    }
  }
});

document.addEventListener("configUpdated", function(e) {
  const newConfig = e.detail;
  cardsPerPage = newConfig.cardsPerPage;
  currentPeriod = newConfig.currentPeriod;
  currentPage = 1;
  renderCards(activeCards);
  console.log("Configuration mise à jour :", newConfig);
});

export { initGrid, handleSearch, updatePeriod };
