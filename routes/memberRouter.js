import express from "express";
import {
  memberLogin,
  submitEventPayment,
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

/**
 * @swagger
 * /submiteventpayment:
 *   post:
 *     summary: Submit payment for an event
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
 *               - eventId
 *               - amount
 *               - paymentMode
 *             properties:
 *               eventId:
 *                 type: string
 *                 description: ID of the event you want to pay for
 *                 example: 64edc5f7e9925b24b45777c1
 *               amount:
 *                 type: number
 *                 description: Event fee (must match the event's required fee)
 *                 example: 500
 *               paymentMode:
 *                 type: string
 *                 enum: [cash, upi, online, bank]
 *                 example: upi
 *               receipt:
 *                 type: string
 *                 format: binary
 *                 description: Upload payment receipt (image or PDF)
 *     responses:
 *       201:
 *         description: Event payment submitted successfully
 *       400:
 *         description: Invalid input or mismatched amount
 *       403:
 *         description: Member not allowed for this event
 *       409:
 *         description: Payment already exists for this event
 *       500:
 *         description: Server error
 */
router.post(
  "/submiteventpayment",
  verifyToken,
  authorizeRole("member"),
  upload.single("receipt"),
  submitEventPayment
);
export default router;
