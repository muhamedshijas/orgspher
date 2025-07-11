import express from "express";
import verifyToken from "../middlewares/adminAuthMiddleWare.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";
import { addEvent } from "../controller/eventController.js";

const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: Events
 *   description: API endpoints for managing Events
 */

/**
 * @swagger
 * /event/addevent:
 *   post:
 *     summary: Add a new Event (Admin only)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - zone
 *               - membershipsAllowed
 *               - location
 *             properties:
 *               title:
 *                 type: string
 *                 example: Annual Meet
 *               zone:
 *                 type: string[]
 *                 example: ["North" , "South"]
 *               location:
 *                  type: Number
 *                  example: Community Hall South Zone
 *               membershipAllowed:
 *                  type: string[]
 *                  example: ["Platinum","Gold"]
 *     responses:
 *       201:
 *         description: Event added successfully
 *       401:
 *         description: Unauthorized – token required
 *       403:
 *         description: Forbidden – admin access only
 *       500:
 *         description: Internal server error
 */
router.post("/addevent", verifyToken, authorizeRole("admin"),addEvent);
export default router;
