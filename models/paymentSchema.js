import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    type: {
      type: String,
      enum: ["event", "membership"],
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      default: null, // Only used if type === "event"
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentMode: {
      type: String,
      enum: ["cash", "upi", "online", "bank"],
      required: true,
    },
    receiptUrl: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
