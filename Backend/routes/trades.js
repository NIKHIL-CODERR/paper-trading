import express from "express";
import Trade from "../models/Trade.js";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import { getPrice } from "../utils/priceFeed.js";

const router = express.Router();
router.use(requireAuth);

// Contract size per 1.0 lot-equivalent "quantity" unit, kept simple for paper trading:
// quantity is just units of the asset (e.g. 0.5 BTC, 1000 EUR notional, 2 oz gold).
function notional(price, quantity) {
  return price * quantity;
}

router.get("/", async (req, res) => {
  const trades = await Trade.find({ user: req.userId }).sort({ createdAt: -1 });
  res.json(trades);
});

router.post("/open", async (req, res) => {
  try {
    const { symbol, side, quantity } = req.body;
    if (!symbol || !side || !quantity || quantity <= 0) {
      return res.status(400).json({ error: "symbol, side and a positive quantity are required" });
    }

    const price = await getPrice(symbol);
    const cost = notional(price, quantity);

    const user = await User.findById(req.userId);
    if (cost > user.balance) {
      return res.status(400).json({ error: "Insufficient virtual balance for this position size" });
    }

    user.balance -= cost;
    await user.save();

    const trade = await Trade.create({
      user: req.userId,
      symbol,
      side,
      quantity,
      entryPrice: price,
    });

    res.status(201).json({ trade, balance: user.balance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:id/close", async (req, res) => {
  try {
    const trade = await Trade.findOne({ _id: req.params.id, user: req.userId });
    if (!trade) return res.status(404).json({ error: "Trade not found" });
    if (trade.status === "CLOSED") return res.status(400).json({ error: "Trade already closed" });

    const exitPrice = await getPrice(trade.symbol);
    const direction = trade.side === "BUY" ? 1 : -1;
    const pnl = direction * (exitPrice - trade.entryPrice) * trade.quantity;
    const returnedCash = trade.entryPrice * trade.quantity + pnl;

    trade.exitPrice = exitPrice;
    trade.pnl = pnl;
    trade.status = "CLOSED";
    trade.closedAt = new Date();
    await trade.save();

    const user = await User.findById(req.userId);
    user.balance += returnedCash;
    await user.save();

    res.json({ trade, balance: user.balance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
