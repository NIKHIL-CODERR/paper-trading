import { useEffect, useState } from "react";
import api from "../api/client.js";

export default function History() {
  const [trades, setTrades] = useState([]);

  useEffect(() => {
    api.get("/trades").then((res) => {
      setTrades(res.data.filter((t) => t.status === "CLOSED"));
    });
  }, []);

  return (
    <div>
      <p className="font-display text-xl font-700 mb-4">Trade History</p>
      {trades.length === 0 ? (
        <p className="text-sm text-slate-500">No closed trades yet.</p>
      ) : (
        <div className="space-y-2">
          {trades.map((t) => (
            <div
              key={t._id}
              className="flex items-center justify-between bg-panel border border-line rounded-xl px-4 py-3"
            >
              <div>
                <p className="text-sm">
                  <span className={t.side === "BUY" ? "text-mint" : "text-rose"}>{t.side}</span>{" "}
                  {t.quantity} {t.symbol}
                </p>
                <p className="text-xs text-slate-500 tabular">
                  {t.entryPrice.toFixed(4)} → {t.exitPrice?.toFixed(4)}
                </p>
              </div>
              <p className={`tabular text-sm ${t.pnl >= 0 ? "text-mint" : "text-rose"}`}>
                {t.pnl >= 0 ? "+" : ""}{t.pnl.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
