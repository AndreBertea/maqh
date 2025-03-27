// src/utils.js
export function hexToRGBA(hex, opacity) {
  hex = hex.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export function getFilteredData(prices, period, periodDaysMap) {
  const dataArray = Object.entries(prices)
    .map(([dateStr, price]) => ({ date: new Date(dateStr), price: Number(price) }))
    .sort((a, b) => a.date - b.date);
  const lastDate = dataArray[dataArray.length - 1].date;
  const daysToSubtract = periodDaysMap[period] || 5;
  if (daysToSubtract !== Infinity) {
    const cutoffDate = new Date(lastDate);
    cutoffDate.setDate(cutoffDate.getDate() - daysToSubtract);
    return dataArray.filter(item => item.date >= cutoffDate);
  } else {
    return dataArray;
  }
}

export function parseCSV(csvText) {
  const lines = csvText.trim().split("\n");
  const headers = lines[0].split(",");
  const cards = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",");
    let card = {};
    for (let j = 0; j < headers.length; j++) {
      let value = values[j].replace(/"/g, "").trim();
      card[headers[j]] = value;
    }
    cards.push(card);
  }
  return cards;
}
