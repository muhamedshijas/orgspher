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
 * /submitmembershippayment:
 *   post:
 *     summary: Submit payment for membership upgrade (Members only)
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
 *                 example: 300
 *               paymentMode:
 *                 type: string
 *                 enum: [cash, upi]
 *                 example: upi
 *               receipt:
 *                 type: string
 *                 format: binary
 *                 description: Optional receipt image/pdf file
 *     responses:
 *       201:
 *         description: Payment submitted successfully
 *       400:
 *         description: Validation error (missing fields or wrong amount)
 *       401:
 *         description: Unauthorized – token missing or invalid
 *       500:
 *         description: Internal server error
 */

router.post(
  "/submitmembershippayment",
  verifyToken,
  authorizeRole("member"),
  upload.single("receipt"),
  submitMembershipPayment
);
export default router;
