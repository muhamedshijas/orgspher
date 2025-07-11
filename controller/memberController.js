import memberSchema from "../models/memberSchema.js";
import jwt from "jsonwebtoken";

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
