import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if token exists
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("no token provided");

    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1]; // Get token from "Bearer <token>"

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Optional: store user info in req
    next(); // Token is valid → proceed
  } catch (error) {
    console.log("❌ Invalid token:", error.message); // 👈 Also useful
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

export default verifyToken;
