import fetch from "node-fetch";

// Simple in-memory cache so we don't hammer free API rate limits.
const cache = { data: {}, ts: 0 };
const CACHE_MS = 5000; // 5 second cache

const BINANCE_MAP = { BTCUSD: "BTCUSDT", ETHUSD: "ETHUSDT" };
const TWELVEDATA_MAP = { XAUUSD: "XAU/USD", EURUSD: "EUR/USD" };

async function fetchCrypto(symbol) {
  const pair = BINANCE_MAP[symbol];
  const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${pair}`);
  if (!res.ok) throw new Error(`Binance error for ${symbol}`);
  const json = await res.json();
  return parseFloat(json.price);
}

async function fetchTwelveData(symbol) {
  const pair = TWELVEDATA_MAP[symbol];
  const key = process.env.TWELVEDATA_API_KEY;
  const res = await fetch(
    `https://api.twelvedata.com/price?symbol=${encodeURIComponent(pair)}&apikey=${key}`
  );
  const json = await res.json();
  if (!json.price) throw new Error(`Twelve Data error for ${symbol}: ${JSON.stringify(json)}`);
  return parseFloat(json.price);
}

export async function getPrices() {
  const now = Date.now();
  if (now - cache.ts < CACHE_MS && Object.keys(cache.data).length === 4) {
    return cache.data;
  }

  const symbols = ["BTCUSD", "ETHUSD", "XAUUSD", "EURUSD"];
  const results = {};

  await Promise.all(
    symbols.map(async (symbol) => {
      try {
        results[symbol] = BINANCE_MAP[symbol]
          ? await fetchCrypto(symbol)
          : await fetchTwelveData(symbol);
      } catch (err) {
        // fall back to last known cached price if the live fetch fails
        results[symbol] = cache.data[symbol] ?? null;
      }
    })
  );

  cache.data = results;
  cache.ts = now;
  return results;
}

export async function getPrice(symbol) {
  const prices = await getPrices();
  const price = prices[symbol];
  if (price == null) throw new Error(`No price available for ${symbol}`);
  return price;
}
