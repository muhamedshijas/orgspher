import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import dbConnect from "./config/dbConnect.js";
import { swaggerUi, swaggerSpec } from "./config/swagger.js";
import memberRouter from "./routes/memberRouter.js";
import adminRouter from "./routes/adminRouter.js";
import eventRouter from "./routes/eventRouter.js";

// Fix for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize app
const app = express();
dotenv.config();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Swagger docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ✅ Serve static uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/", memberRouter);
app.use("/admin", adminRouter);
app.use("/event", eventRouter);

// Connect DB and start server
dbConnect();
app.listen(5000, () => {
  console.log("✅ Server started on port 5000");
});
