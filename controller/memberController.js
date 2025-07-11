import memberSchema from "../models/memberSchema.js";
import jwt from "jsonwebtoken";
import paymentSchema from "../models/paymentSchema.js";
import { MEMBERSHIP_FEES } from "../config/utils.js";

export async function memberLogin(req, res) {
  const { email, password } = req.body;
  const member = await memberSchema.findOne({ email }).lean();
  if (!member) {
    return res.status(400).json({ success: false, message: "Invalid email." });
  }
  if (member.password !== password) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid password." });
  }
  const memberId = member._id;
  const token = jwt.sign({ memberId, role: "member" }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  return res.status(200).json({ success: true, token });
}

export async function viewProfile(req, res) {
  const memberId = req.user.memberId;
  if (!memberId) {
    return res.status(400).json({ success: false, message: "No user Found." });
  }

  const member = await memberSchema
    .findOne({ _id: memberId })
    .select("name email phone qrCode membershipType zone")
    .lean();
  res.status(201).json({
    success: true,
    message: "Profile Fetched successfully",
    Profile: member,
  });
}

export async function submitMembershipPayment(req, res) {
  try {
    const memberId = req.user.memberId;
    const { amount, paymentMode } = req.body;

    if (!amount || !paymentMode) {
      return res.status(400).json({
        success: false,
        message: "Amount and paymentMode are required",
      });
    }

    const numericAmount = Number(amount);
    const targetMembership = Object.entries(MEMBERSHIP_FEES).find(
      ([_, fee]) => fee === numericAmount
    );

    if (!targetMembership) {
      return res.status(400).json({
        success: false,
        message: `Invalid amount: no matching membership type found.`,
      });
    }

    const [newType, fee] = targetMembership;

    // ✅ Get current member
    const member = await memberSchema.findById(memberId);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    const currentType = member.membershipType;

    // Membership levels ordered by rank
    const levels = ["Bronze", "Silver", "Gold", "Platinum"];
    const currentIndex = levels.indexOf(currentType);
    const newIndex = levels.indexOf(newType);

    if (newIndex === -1 || currentIndex === -1) {
      return res.status(400).json({
        success: false,
        message: "Invalid membership type comparison",
      });
    }

    if (newIndex <= currentIndex) {
      return res.status(400).json({
        success: false,
        message: `You are already ${currentType} or higher. Upgrade not allowed.`,
      });
    }
    const existingPending = await paymentSchema.findOne({
      member: memberId,
      type: "membership",
      status: "pending",
    });

    if (existingPending) {
      return res.status(400).json({
        success: false,
        message: "You already have a membership payment pending approval.",
        payment: existingPending, // optional: return the pending one
      });
    }
    const receiptUrl = req.file
      ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
      : null;

    const payment = await paymentSchema.create({
      member: memberId,
      type: "membership",
      amount: numericAmount,
      paymentMode,
      receiptUrl,
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: `Payment submitted for ${newType}. Awaiting admin approval.`,
      payment,
    });
  } catch (error) {
    console.error("Membership payment error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}
