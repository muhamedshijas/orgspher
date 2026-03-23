import memberSchema from "../models/memberSchema.js";
import jwt from "jsonwebtoken";
import paymentSchema from "../models/paymentSchema.js";
import { MEMBERSHIP_FEES } from "../config/utils.js";
import eventSchema from "../models/eventSchema.js";

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

export async function submitEventPayment(req, res) {
  try {
    const memberId = req.user.memberId;

    const { amount, paymentMode, eventId } = req.body;

    const event = await eventSchema.findById(eventId).lean();
    const member = await memberSchema.findById(memberId).lean();

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    if (event.status !== "upcoming") {
      return res.status(400).json({
        success: false,
        message: `This event is already ${event.status}.`,
      });
    }

    if (!event.zone.includes(member.zone)) {
      return res.status(403).json({
        success: false,
        message: `Member zone (${member.zone}) is not allowed for this event.`,
      });
    }

    if (!event.membershipsAllowed.includes(member.membershipType)) {
      return res.status(403).json({
        success: false,
        message: `Member membership type (${member.membershipType}) is not allowed for this event.`,
      });
    }
    if (event.fee == 0) {
      return res.status(400).json({
        success: false,
        message: `This event is completely free so no need to pay`,
      });
    }

    const paidAmount = Number(req.body.amount);
    if (paidAmount !== event.fee) {
      return res.status(400).json({
        success: false,
        message: `Incorrect payment amount. Required: ₹${event.fee}`,
      });
    }

    const existingPayment = await paymentSchema.findOne({
      member: memberId,
      type: "event",
      event: eventId,
      status: { $in: ["pending", "paid"] }, // 👈 match either pending or paid
    });

    if (existingPayment) {
      return res.status(409).json({
        success: false,
        message: "Payment already exists for this event.",
      });
    }

    const receiptUrl = req.file
      ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
      : null;

    const payment = await paymentSchema.create({
      member: memberId,
      type: "event",
      event: eventId,
      amount: amount,
      paymentMode,
      receiptUrl,
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Payment submitted for event. Awaiting admin approval.",
      payment,
    });
  } catch (error) {
    console.error("Submit payment error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while submitting event payment.",
      error: error.message,
    });
  }
}

export async function getAllPaymentsStatus(req, res) {
  const memberId = req.user.memberId;
  const payment = await paymentSchema
    .find({ member: memberId })
    .select("title status type");
  res.status(201).json({
    success: true,
    message: "Payments Fetched successfully",
    payments: payment,
  });
}

export async function getPaymentById(req, res) {
  try {
    const id = req.params.id;
    const memberId = req.user.memberId;

    if (!id || !memberId) {
      return res.status(400).json({
        success: false,
        message: "Payment ID and Member ID are required.",
      });
    }

    // First find the payment with member for ownership validation
    const payment = await paymentSchema
      .findById(id)
      .populate("member", "_id name") // For ownership check
      .lean();

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found.",
      });
    }

    if (payment.member._id.toString() !== memberId) {
      return res.status(403).json({
        success: false,
        message: "This is not your payment.",
      });
    }

    // If it's an event type, populate full event object
    if (payment.type === "event") {
      const fullPayment = await paymentSchema
        .findById(id)
        .populate("event", "title") // Full event details
        .select(
          "_id amount status type event paymentMode receiptUrl rejectionReason"
        )
        .lean();

      return res.status(200).json({
        success: true,
        message: "Event payment fetched successfully.",
        payment: fullPayment,
      });
    }

    // For membership payment
    const cleanedPayment = {
      _id: payment._id,
      amount: payment.amount,
      status: payment.status,
      type: payment.type,
      paymentMode: payment.paymentMode,
      receiptUrl: payment.receiptUrl,
    };

    return res.status(200).json({
      success: true,
      message: "Membership payment fetched successfully.",
      payment: cleanedPayment,
    });
  } catch (error) {
    console.error("Error fetching payment:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching payment.",
      error: error.message,
    });
  }
}
