import mongoose from "mongoose";

const tradeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    symbol: {
      type: String,
      enum: ["BTCUSD", "ETHUSD", "XAUUSD", "EURUSD"],
      required: true,
    },
    side: { type: String, enum: ["BUY", "SELL"], required: true },
    quantity: { type: Number, required: true },
    entryPrice: { type: Number, required: true },
    exitPrice: { type: Number, default: null },
    status: { type: String, enum: ["OPEN", "CLOSED"], default: "OPEN" },
    pnl: { type: Number, default: 0 },
    openedAt: { type: Date, default: Date.now },
    closedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Trade", tradeSchema);
