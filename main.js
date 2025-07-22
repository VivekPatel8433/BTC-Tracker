const priceEl = document.getElementById("btc-price");
const ethPriceEl = document.getElementById("eth-price");
const dogePriceEl = document.getElementById("doge-price");
const solPriceEl = document.getElementById("sol-price");
const xrpPriceEl = document.getElementById("xrp-price");
const fxEl = document.getElementById("fx-rate");

let usdToCad = null;

const lastPrices = {
  btc: null,
  eth: null,
  doge: null,
  sol: null,
  xrp: null,
};

// Fetch USD → CAD exchange rate
async function getExchangeRate() {
  try {
    const res = await fetch("https://api.coingecko.com/api/v3/exchange_rates");
    const data = await res.json();
    usdToCad = data.rates.cad.value / data.rates.usd.value;
    fxEl.textContent = `1 USD = ${usdToCad.toFixed(4)} CAD`;
  } catch (err) {
    console.error("Exchange rate error:", err);
    fxEl.textContent = "FX rate unavailable";
  }
}

// General WebSocket setup for a coin
function trackCoin(symbol, element, key) {
  const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@trade`);

  ws.onmessage = (event) => {
    const trade = JSON.parse(event.data);
    const priceUsd = parseFloat(trade.p);
    if (!usdToCad) return;

    const priceCad = priceUsd * usdToCad;

    // Flash if price changes
    if (lastPrices[key] !== null && priceUsd !== lastPrices[key]) {
      const flashClass = priceUsd > lastPrices[key] ? 'bg-green-600' : 'bg-red-600';
      element.classList.add(flashClass);
      setTimeout(() => element.classList.remove(flashClass),10000);
    }

    element.textContent = `${key.toUpperCase()}: $${priceCad.toLocaleString("en-CA", { minimumFractionDigits: 2 })} CAD`;
    lastPrices[key] = priceUsd;
  };

  ws.onerror = (err) => {
    console.error(`${key.toUpperCase()} WebSocket error:`, err);
    element.textContent = `${key.toUpperCase()} WebSocket error`;
  };
}

// Start everything
getExchangeRate();
trackCoin("btcusdt", priceEl, "btc");
trackCoin("ethusdt", ethPriceEl, "eth");
trackCoin("dogeusdt", dogePriceEl, "doge");
trackCoin("solusdt", solPriceEl, "sol");
trackCoin("xrpusdt", xrpPriceEl, "xrp");
