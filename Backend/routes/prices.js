import express from "express";
import { getPrices } from "../utils/priceFeed.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const prices = await getPrices();
    res.json({ prices, timestamp: Date.now() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
