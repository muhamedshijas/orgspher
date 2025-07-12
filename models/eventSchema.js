import mongoose from "mongoose";
import { VALID_MEMBERSHIPS, VALID_ZONES } from "../config/utils.js";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    zone: {
      type: [String],
      required: true,
      validate: {
        validator: function (arr) {
          return arr.every((z) => VALID_ZONES.includes(z));
        },
        message: "One or more invalid zones selected.",
      },
    },
    location: {
      type: String,
      required: true,
    },
    membershipsAllowed: {
      type: [String],
      required: true,
      validate: {
        validator: function (arr) {
          return arr.every((m) => VALID_MEMBERSHIPS.includes(m));
        },
        message: "One or more invalid membership types selected.",
      },
    },
    status: {
      type: String,
      enum: ["upcoming", "completed", "cancelled"],
      default: "upcoming",
    },
    fee: {
      type: Number,
      default: 0, // 👈 means it's free by default
      min: 0,
    },
    attendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Member",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);
