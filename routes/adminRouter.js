import express from "express";
import {
  addmember,
  adminLogin,
  disableUser,
  enableUser,
  filterByMembership,
  filterByStatus,
  filterByZone,
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
 *               - phone
 *               - password
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
 *               phone:
 *                  type: Number
 *                  example: 9876543210
 *               password:
 *                  type: string
 *                  example: as123456
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
/**
 * @swagger
 * /admin/getmemberbyId/{id}:
 *   get:
 *     summary: Get a member by ID (via URL param)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Member ID to fetch
 *     responses:
 *       200:
 *         description: Successfully fetched member
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: Member not found
 */
router.get(
  "/getmemberbyId/:id",
  verifyToken,
  authorizeRole("admin"),
  getmemberbyId
);

/**
 * @swagger
 * /admin/disableuser/{id}:
 *   put:
 *     summary: Disable a member by ID (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the member to disable
 *     responses:
 *       200:
 *         description: Member disabled successfully
 *       401:
 *         description: Unauthorized – token required
 *       403:
 *         description: Forbidden – admin only
 *       404:
 *         description: Member not found
 */
router.put(
  "/disableuser/:id",
  verifyToken,
  authorizeRole("admin"),
  disableUser
);
/**
 * @swagger
 * /admin/enableuser/{id}:
 *   put:
 *     summary: Enable a member by ID (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the member to Enable
 *     responses:
 *       200:
 *         description: Member Enabled successfully
 *       401:
 *         description: Unauthorized – token required
 *       403:
 *         description: Forbidden – admin only
 *       404:
 *         description: Member not found
 */
router.put("/enableuser/:id", verifyToken, authorizeRole("admin"), enableUser);
/**
 * @swagger
 * /admin/filteruserbyzone/{zone}:
 *   get:
 *     summary: Filter  members by Zone (via URL param)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: zone
 *         schema:
 *           type: string
 *         required: true
 *         description: "Zone to fetch [Accepted Values: North, South, East, West, Central]"
 *     responses:
 *       200:
 *         description: Successfully fetched member
 *       400:
 *         description: Invalid Zone Selected
 *       404:
 *         description: Member not found
 */
router.get(
  "/filteruserbyzone/:zone",
  verifyToken,
  authorizeRole("admin"),
  filterByZone
);

/**
 * @swagger
 * /admin/filteruserbymembership/{membership}:
 *   get:
 *     summary: Filter  members by membership (via URL param)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: membership
 *         schema:
 *           type: string
 *         required: true
 *         description: "Membership to fetch [Accepted Values: Bronze, Silver, Gold, Platinum]"
 *     responses:
 *       200:
 *         description: Successfully fetched member
 *       400:
 *         description: Invalid Zone Selected
 *       404:
 *         description: Member not found
 */
router.get(
  "/filteruserbymembership/:membership",
  verifyToken,
  authorizeRole("admin"),
  filterByMembership
);

/**
 * @swagger
 * /admin/filteruserbystatus/{status}:
 *   get:
 *     summary: Filter  members by status (via URL param)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: status
 *         schema:
 *           type: string
 *         required: true
 *         description: "Status to fetch [Accepted Values: active , disabled ]"
 *     responses:
 *       200:
 *         description: Successfully fetched member
 *       400:
 *         description: Invalid status Selected
 *       404:
 *         description: Member not found
 */
router.get(
  "/filteruserbystatus/:status",
  verifyToken,
  authorizeRole("admin"),
  filterByStatus
);
export default router;
