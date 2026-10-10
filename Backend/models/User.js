import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    balance: { type: Number, default: Number(process.env.STARTING_BALANCE) || 100000 },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
