import express from "express";
import {
  memberLogin,
  submitMembershipPayment,
  viewProfile,
} from "../controller/memberController.js";
import verifyToken from "../middlewares/adminAuthMiddleWare.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";
import upload from "../middlewares/multer.js";
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Member
 *   description: API endpoints for managing members
 */

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login for Member
 *     tags: [Member]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: member@gmail.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Successfully logged in
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", memberLogin);

/**
 * @swagger
 * /viewprofile:
 *   get:
 *     summary: View Profile (member only)
 *     tags: [Member]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched Profile Data
 *       401:
 *         description: Unauthorized – token required
 *       403:
 *         description: Forbidden – member access only
 */
router.get("/viewprofile", verifyToken, authorizeRole("member"), viewProfile);

/**
 * @swagger
 * /submitMembershipPayment:
 *   post:
 *     summary: Submit membership upgrade payment
 *     tags: [Member]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - paymentMode
 *             properties:
 *               amount:
 *                 type: number
 *                 description: >
 *                   Enter the membership amount only. Accepted values:
 *                   100 = Bronze,
 *                   200 = Silver,
 *                   300 = Gold,
 *                   500 = Platinum
 *                 example: 300
 *               paymentMode:
 *                 type: string
 *                 enum: [cash, upi, online, bank]
 *                 example: upi
 *               receipt:
 *                 type: string
 *                 format: binary
 *                 description: Upload receipt image or PDF
 *     responses:
 *       201:
 *         description: Payment submitted successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post(
  "/submitmembershippayment",
  verifyToken,
  authorizeRole("member"),
  upload.single("receipt"),
  submitMembershipPayment
);
export default router;
