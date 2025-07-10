import express from "express";
import { adminLogin, getallMembers } from "../controller/adminController.js";
import verifyToken from "../middlewares/adminAuthMiddleWare.js";
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: API endpoints for admin
 */

/**
 * @swagger
 * /admin/login:
 *   post:
 *     summary: Login for Admin
 *     tags: [Admin]
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
 *                 example: admin@orgsphere.com
 *               password:
 *                 type: string
 *                 example: admin123
 *     responses:
 *       200:
 *         description: Successfully logged in
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", adminLogin);

/**
 * @swagger
 * /admin/getallmembers:
 *   get:
 *     summary: For viewing all members
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns all members
 *       401:
 *         description: Unauthorized – token required
 */

router.get("/getallmembers", verifyToken, getallMembers);
export default router;
 