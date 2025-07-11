import memberSchema from "../models/memberSchema.js";
import jwt from "jsonwebtoken";
import paymentSchema from "../models/paymentSchema.js";
import { MEMBERSHIP_UPGRADE_FEES } from "../config/utils.js";

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

    const member = await memberSchema.findById(memberId);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    const currentType = member.membershipType;
    const upgradeInfo = MEMBERSHIP_UPGRADE_FEES[currentType];

    if (!upgradeInfo) {
      return res.status(400).json({
        success: false,
        message: "You are already at the highest membership level.",
      });
    }

    if (Number(amount) !== upgradeInfo.amount) {
      return res.status(400).json({
        success: false,
        message: `To upgrade from ${currentType} to ${upgradeInfo.next}, you must pay ₹${upgradeInfo.amount}.`,
      });
    }

    const receiptUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const payment = await paymentSchema.create({
      member: memberId,
      type: "membership",
      amount: Number(amount),
      paymentMode,
      receiptUrl,
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: `Payment submitted. Awaiting admin approval to upgrade to ${upgradeInfo.next}.`,
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
