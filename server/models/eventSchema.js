import mongoose from "mongoose";
import { VALID_MEMBERSHIPS, VALID_ZONES } from "../config/utils.js";

// 🧾 Attendee Sub-Schema
const attendeeSubSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },
    markedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false } // Disable _id for each attendee entry
);

// 📅 Main Event Schema
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
      default: 0,
      min: 0,
    },
    attendees: [attendeeSubSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);
