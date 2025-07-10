import express from "express";
import {
  addmember,
  adminLogin,
  getallMembers,
  getmemberbyId,
} from "../controller/adminController.js";
import verifyToken from "../middlewares/adminAuthMiddleWare.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";
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
 * /admin/addmember:
 *   post:
 *     summary: Add a new member (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - zone
 *               - membershipType
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               zone:
 *                 type: string
 *                 example: North
 *               membershipType:
 *                 type: string
 *                 example: Premium
 *     responses:
 *       201:
 *         description: Member added successfully
 *       401:
 *         description: Unauthorized – token required
 *       403:
 *         description: Forbidden – admin access only
 *       500:
 *         description: Internal server error
 */
router.post("/addmember", verifyToken, authorizeRole("admin"), addmember);
/**
 * @swagger
 * /admin/getallmembers:
 *   get:
 *     summary: Get all members (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched all members
 *       401:
 *         description: Unauthorized – token required
 *       403:
 *         description: Forbidden – admin access only
 */
router.get(
  "/getallmembers",
  verifyToken,
  authorizeRole("admin"),
  getallMembers
);

router.get("/getmemberbyId",getmemberbyId)

export default router;
