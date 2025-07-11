import express from "express";
import dotenv from "dotenv";
import dbConnect from "./config/dbConnect.js";
import { swaggerUi, swaggerSpec } from "./config/swagger.js";
import memberRouter from "./routes/memberRouter.js";
import adminRouter from "./routes/adminRouter.js";
import cors from "cors";

const app = express();
dotenv.config();
app.use(express.json());
app.use(cors());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/", memberRouter);
app.use("/admin", adminRouter);
dbConnect();
app.listen(5000, () => {
  console.log("server started on port 5000");
});
