import mongoose from "mongoose";
import { VALID_MEMBERSHIPS, VALID_ZONES } from "../config/utils.js";

const memberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    zone: { type: String, enum: VALID_ZONES, required: true },
    membershipType: {
      type: String,
      required: true,
      enum: VALID_MEMBERSHIPS,
      default: "Bronze",
    },
    password: { type: String, required: true },
    status: { type: String, enum: ["active", "disabled"], default: "active" },
    qrCode: { type: String }, // base64 string or file path
    receiptFile: { type: String }, // optional
  },
  { timestamps: true }
);

export default mongoose.model("Member", memberSchema);
