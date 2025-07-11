import jwt from "jsonwebtoken";
import memberSchema from "../models/memberSchema.js";
import qrcode from "qrcode";
import { VALID_ZONES } from "../config/utils.js";


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
    console.log(req.body);

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
  const member = await memberSchema.findOne({ _id: id }).lean();
  if (!member) {
    return res.status(400).json({ success: false, message: "Invalid id." });
  }
  res.status(201).json({
    success: true,
    message: "Member added successfully",
    member,
  });

  console.log(member);
}
