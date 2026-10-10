import express from "express";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();
router.use(requireAuth);

router.get("/me", async (req, res) => {
  const user = await User.findById(req.userId).select("-passwordHash");
  res.json(user);
});

export default router;
