import { useEffect, useState } from "react";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

const SYMBOLS = [
  { key: "BTCUSD", label: "Bitcoin" },
  { key: "ETHUSD", label: "Ethereum" },
  { key: "XAUUSD", label: "Gold" },
  { key: "EURUSD", label: "EUR / USD" },
];

export default function Dashboard() {
  const { refreshBalance } = useAuth();
  const [prices, setPrices] = useState({});
  const [trades, setTrades] = useState([]);
  const [symbol, setSymbol] = useState("BTCUSD");
  const [side, setSide] = useState("BUY");
  const [quantity, setQuantity] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadPrices() {
    try {
      const res = await api.get("/prices");
      setPrices(res.data.prices);
    } catch {
      /* keep showing last known prices on a failed poll */
    }
  }

  async function loadTrades() {
    const res = await api.get("/trades");
    setTrades(res.data.filter((t) => t.status === "OPEN"));
  }

  useEffect(() => {
    loadPrices();
    loadTrades();
    const id = setInterval(loadPrices, 5000);
    return () => clearInterval(id);
  }, []);

  async function openTrade(e) {
    e.preventDefault();
    setError("");
    const qty = parseFloat(quantity);
    if (!qty || qty <= 0) return setError("Enter a valid quantity");

    setBusy(true);
    try {
      const res = await api.post("/trades/open", { symbol, side, quantity: qty });
      refreshBalance(res.data.balance);
      setQuantity("");
      loadTrades();
    } catch (err) {
      setError(err.response?.data?.error || "Could not open trade");
    } finally {
      setBusy(false);
    }
  }

  async function closeTrade(id) {
    try {
      const res = await api.post(`/trades/${id}/close`);
      refreshBalance(res.data.balance);
      loadTrades();
    } catch (err) {
      setError(err.response?.data?.error || "Could not close trade");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="font-display text-xl font-700">Live Prices</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
          {SYMBOLS.map((s) => (
            <div key={s.key} className="bg-panel border border-line rounded-xl p-4">
              <p className="text-xs text-slate-500">{s.label}</p>
              <p className="tabular text-lg mt-1">
                {prices[s.key] != null ? prices[s.key].toLocaleString(undefined, { maximumFractionDigits: 4 }) : "…"}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-panel border border-line rounded-xl p-4 md:p-5">
        <p className="font-display font-700 mb-4">Place a Trade</p>
        {error && <p className="text-rose text-sm mb-3">{error}</p>}
        <form onSubmit={openTrade} className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="text-xs text-slate-400">Symbol</label>
            <select
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="w-full mt-1 bg-ink border border-line rounded-lg px-3 py-2 text-sm"
            >
              {SYMBOLS.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400">Side</label>
            <select
              value={side}
              onChange={(e) => setSide(e.target.value)}
              className="w-full mt-1 bg-ink border border-line rounded-lg px-3 py-2 text-sm"
            >
              <option value="BUY">Buy</option>
              <option value="SELL">Sell</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400">Quantity</label>
            <input
              type="number"
              step="any"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0.5"
              className="w-full mt-1 bg-ink border border-line rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <button
            disabled={busy}
            className="bg-mint text-ink font-medium rounded-lg py-2.5 text-sm disabled:opacity-50"
          >
            {busy ? "Placing…" : "Place order"}
          </button>
        </form>
      </div>

      <div>
        <p className="font-display font-700 mb-3">Open Positions</p>
        {trades.length === 0 ? (
          <p className="text-sm text-slate-500">No open positions yet.</p>
        ) : (
          <div className="space-y-2">
            {trades.map((t) => {
              const live = prices[t.symbol];
              const direction = t.side === "BUY" ? 1 : -1;
              const unrealized = live != null ? direction * (live - t.entryPrice) * t.quantity : null;
              return (
                <div
                  key={t._id}
                  className="flex items-center justify-between bg-panel border border-line rounded-xl px-4 py-3"
                >
                  <div>
                    <p className="text-sm">
                      <span className={t.side === "BUY" ? "text-mint" : "text-rose"}>{t.side}</span>{" "}
                      {t.quantity} {t.symbol}
                    </p>
                    <p className="text-xs text-slate-500 tabular">Entry: {t.entryPrice.toFixed(4)}</p>
                  </div>
                  <div className="text-right">
                    <p className={`tabular text-sm ${unrealized >= 0 ? "text-mint" : "text-rose"}`}>
                      {unrealized != null ? unrealized.toFixed(2) : "…"}
                    </p>
                    <button
                      onClick={() => closeTrade(t._id)}
                      className="text-xs text-slate-400 hover:text-white mt-1"
                    >
                      Close
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
