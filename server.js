import express from "express";
import dotenv from "dotenv";
import dbConnect from "./config/dbConnect.js";
import { swaggerUi, swaggerSpec } from './config/swagger.js'

const app = express();
dotenv.config();
app.use(express.json())
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.get("/", (req, res) => {
  res.send("✅ OrgSphere Backend is running")
})

dbConnect();
app.listen(5000, () => {
  console.log("server started on port 5000");
});
