import express from "express";
import { memberLogin, viewProfile } from "../controller/memberController.js";
import verifyToken from "../middlewares/adminAuthMiddleWare.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";
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
router.get("/viewprofile", verifyToken, authorizeRole("member"),viewProfile);

export default router;
