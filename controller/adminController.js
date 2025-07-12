import jwt from "jsonwebtoken";
import memberSchema from "../models/memberSchema.js";
import qrcode from "qrcode";
import {
  MEMBERSHIP_FEES,
  VALID_MEMBERSHIPS,
  VALID_ZONES,
} from "../config/utils.js";
import paymentSchema from "../models/paymentSchema.js";

export async function adminLogin(req, res) {
  const { email, password } = req.body;

  // Hardcoded admin
  const ADMIN = {
    email: "admin@orgsphere.com",
    password: "admin1234",
  };

  if (email !== ADMIN.email || password !== ADMIN.password) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }

  const token = jwt.sign({ email, role: "admin" }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  return res.status(200).json({ success: true, token });
}

export async function getallMembers(req, res) {
  const users = await memberSchema.find().lean();
  res.status(201).json({
    success: true,
    message: "Members fetched successfully",
    members: users,
  });
}

export async function addmember(req, res) {
  try {
    const { email, password, zone, membershipType, name, phone } = req.body;

    // Check if user already exists
    const userExist = await memberSchema.findOne({ email }).lean();
    if (userExist) {
      return res
        .status(401)
        .json({ success: false, message: "User already exists" });
    }

    // Validate zone
    if (!VALID_ZONES.includes(zone)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid zone selected." });
    }

    // Create new member
    const newMember = new memberSchema({
      name,
      email,
      password,
      phone,
      zone,
      membershipType,
      status: "active",
    });

    await newMember.save();

    const qr = await qrcode.toDataURL(newMember._id.toString());

    newMember.qrCode = qr;
    await newMember.save();

    res.status(201).json({
      success: true,
      message: "Member added successfully",
      qrCode: newMember.qrCode,
    });
  } catch (error) {
    console.error("❌ Error in addmember:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

export async function getmemberbyId(req, res) {
  const id = req.params.id;
  const member = await memberSchema
    .findOne({ _id: id })
    .select("_id name email qrCode status membershipType zone")
    .lean();
  if (!member) {
    return res.status(400).json({ success: false, message: "Invalid id." });
  }
  res.status(201).json({
    success: true,
    message: "Member Fetched successfully",
    member,
  });
}

export async function disableUser(req, res) {
  try {
    const id = req.params.id;
    console.log("Disabling member ID:", id);

    const member = await memberSchema.findById(id).lean();
    if (!member) {
      return res
        .status(404)
        .json({ success: false, message: "Member not found." });
    }

    await memberSchema.findByIdAndUpdate(id, { status: "disabled" });

    res
      .status(200)
      .json({ success: true, message: "Member disabled successfully." });
  } catch (error) {
    console.error("Error disabling member:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
}

export async function enableUser(req, res) {
  try {
    const id = req.params.id;
    console.log("Disabling member ID:", id);

    const member = await memberSchema.findById(id).lean();
    if (!member) {
      return res
        .status(404)
        .json({ success: false, message: "Member not found." });
    }

    await memberSchema.findByIdAndUpdate(id, { status: "active" });

    res
      .status(200)
      .json({ success: true, message: "Member Enabled successfully." });
  } catch (error) {
    console.error("Error disabling member:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
}

export async function filterByZone(req, res) {
  try {
    const zone = req.params.zone;

    if (!VALID_ZONES.includes(zone)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid zone selected." });
    }

    const members = await memberSchema
      .find({ zone })
      .select("name qrCode zone membershipType")
      .lean();

    if (members.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: `No members found in zone: ${zone}` });
    }

    return res.status(200).json({
      success: true,
      message: `Members fetched successfully for zone: ${zone}`,
      data: members,
    });
  } catch (error) {
    console.error("Error filtering members by zone:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while filtering members.",
      error: error.message,
    });
  }
}

export async function filterByMembership(req, res) {
  try {
    const membership = req.params.membership;

    if (!VALID_MEMBERSHIPS.includes(membership)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid membership selected." });
    }

    const members = await memberSchema
      .find({ membershipType: membership })
      .select("name qrCode zone membershipType")
      .lean();

    if (members.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No members found in Membership Type: ${membership}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Members fetched successfully for Membership Type: ${membership}`,
      data: members,
    });
  } catch (error) {
    console.error("Error filtering members by membership Type:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while filtering members.",
      error: error.message,
    });
  }
}

export async function filterByStatus(req, res) {
  try {
    const status = req.params.status;
    if (!["active", "disabled"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status selected." });
    }

    const members = await memberSchema
      .find({ status })
      .select("name qrCode zone membershipType status")
      .lean();

    if (members.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No members found in status : ${status}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Members fetched successfully for status: ${status}`,
      data: members,
    });
  } catch (error) {
    console.error("Error filtering members by status:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while filtering members.",
      error: error.message,
    });
  }
}

export async function editMember(req, res) {
  try {
    const { email, name, phone, zone } = req.body;
    const member = await memberSchema.findOne({ email });
    if (!member) {
      return res
        .status(404)
        .json({ success: false, message: `No member found for ${email}` });
    }

    if (!VALID_ZONES.includes(zone)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid zone selected." });
    }

    member.name = name || member.name;
    member.phone = phone || member.phone;
    member.zone = zone;

    await member.save();

    return res.status(200).json({
      success: true,
      message: "Member details updated successfully.",
      member: {
        name: member.name,
        email: member.email,
        phone: member.phone,
        zone: member.zone,
      },
    });
  } catch (error) {
    console.error("Error editing member:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while updating member details.",
      error: error.message,
    });
  }
}

export async function getPaymentsbyPaymentType(req, res) {
  const type = req.params.type;
  if (!["event", "membership"].includes(type)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid type selected." });
  }

  const payments = await paymentSchema
    .find({ type: type })
    .select("member receiptUrl amount")
    .lean();

  if (payments.length === 0) {
    return res.status(404).json({
      success: false,
      message: `No payment found in   ${type}`,
    });
  }
  return res.status(200).json({
    success: true,
    message: `payments fetched successfully for  ${type}`,
    data: payments,
  });
}

export async function verifyMembershipPayment(req, res) {
  try {
    const paymentId = req.params.id;

    const payment = await paymentSchema.findOne({ _id: paymentId }).lean();
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    if (payment.type !== "membership") {
      return res.status(400).json({
        success: false,
        message: "This is not a membership payment",
      });
    }

    if (!payment.receiptUrl) {
      await paymentSchema.findByIdAndUpdate(paymentId, {
        status: "rejected",
        rejectionReason: "No receipt uploaded",
      });
      return res.status(400).json({
        success: false,
        message: "Payment rejected: No receipt uploaded",
      });
    }

    const member = await memberSchema.findById(payment.member);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    const amount = payment.amount;
    const newMembershipEntry = Object.entries(MEMBERSHIP_FEES).find(
      ([_, fee]) => fee === amount
    );

    if (!newMembershipEntry) {
      await paymentSchema.findByIdAndUpdate(paymentId, { status: "rejected" });
      return res.status(400).json({
        success: false,
        message: "Invalid payment amount. No matching membership type.",
      });
    }

    const [newType] = newMembershipEntry;

    const levels = ["Bronze", "Silver", "Gold", "Platinum"];
    const currentIndex = levels.indexOf(member.membershipType);
    const newIndex = levels.indexOf(newType);

    if (newIndex <= currentIndex) {
      await paymentSchema.findByIdAndUpdate(paymentId, { status: "rejected" });
      return res.status(400).json({
        success: false,
        message: `Cannot downgrade or assign same level. Current: ${member.membershipType}, Submitted: ${newType}`,
      });
    }

    await Promise.all([
      memberSchema.findByIdAndUpdate(member._id, {
        membershipType: newType,
      }),
      paymentSchema.findByIdAndUpdate(paymentId, {
        status: "paid",
      }),
    ]);

    return res.status(200).json({
      success: true,
      message: `Membership upgraded to ${newType} and payment marked as paid.`,
    });
  } catch (error) {
    console.error("Error verifying payment:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}

export async function getPaymentByStatus(req, res) {
  const status = req.params.status;
  if (!["paid", "rejected", "pending"].includes(status)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid status selected." });
  }

  const payments = await paymentSchema
    .find({ status: status })
    .select("member receiptUrl amount status rejectionReason")
    .lean();

  if (payments.length === 0) {
    return res.status(404).json({
      success: false,
      message: `No payment found in   ${status}`,
    });
  }
  return res.status(200).json({
    success: true,
    message: `payments fetched successfully for  ${status}`,
    data: payments,
  });
}
