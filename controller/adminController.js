import jwt from "jsonwebtoken";

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

  const token = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  return res.status(200).json({ success: true, token });
}

export async function getallMembers(req, res) {
  res.json("success");
}
