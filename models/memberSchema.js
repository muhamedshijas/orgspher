import mongoose from "mongoose";
import { VALID_ZONES } from "../config/zone.js";

const memberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    zone: { type: String, enum: VALID_ZONES, required: true },
    membershipType: { type: String, required: true }, // can also enum
    status: { type: String, enum: ["active", "disabled"], default: "active" },
    qrCode: { type: String }, // base64 string or file path
    receiptFile: { type: String }, // optional
  },
  { timestamps: true }
);

export default mongoose.model("Member", memberSchema);
