import express from "express";
import verifyToken from "../middlewares/adminAuthMiddleWare.js";
import { authorizeRole } from "../middlewares/authorizeRole.js";
import {
  addEvent,
  filterEventsByStatus,
  listUpcomingEvents,
  markAttendance,
  updateStatus,
} from "../controller/eventController.js";

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
router.post("/addevent", verifyToken, authorizeRole("admin"), addEvent);

/**
 * @swagger
 * /event/listupcomingevents:
 *   get:
 *     summary: Get all upcoming events
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched all upcoming events
 *       401:
 *         description: Unauthorized – token required
 *       403:
 *         description: Forbidden – no access
 */
router.get(
  "/listupcomingevents",
  verifyToken,
  authorizeRole("admin", "member"),
  listUpcomingEvents
);
export default router;

/**
 * @swagger
 * /event/filtereventsbystatus/{status}:
 *   get:
 *     summary: Filter  events by status (via URL param)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: status
 *         schema:
 *           type: string
 *         required: true
 *         description: "Status to fetch [Accepted Values: upcoming, completed, cancelled]"
 *     responses:
 *       200:
 *         description: Successfully fetched Events
 *       400:
 *         description: Invalid Status Selected
 *       404:
 *         description: Event not found
 */
router.get(
  "/filtereventsbystatus/:status",
  verifyToken,
  authorizeRole("admin", "member"),
  filterEventsByStatus
);

/**
 * @swagger
 * /event/updatestatus:
 *   put:
 *     summary: Update a  event status (Admin only)
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
 *               - id
 *               - status
 *             properties:
 *               id:
 *                 type: string
 *                 example: 6870d04b21f23bcfd3339183
 *               status:
 *                 type: string
 *                 example: cancelled
 *     responses:
 *       201:
 *         description: Status Updated successfully
 *       401:
 *         description: Unauthorized – token required
 *       403:
 *         description: Forbidden – admin access only
 *       500:
 *         description: Internal server error
 */
router.put("/updatestatus", verifyToken, authorizeRole("admin"), updateStatus);

/**
 * @swagger
 * /event/markattendance:
 *   post:
 *     summary: Mark a member as an attendee for a specific event (Admin only)
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
 *               - memberId
 *               - eventId
 *             properties:
 *               memberId:
 *                 type: string
 *                 description: MongoDB ObjectId of the member
 *                 example: 64fc0a39dbe8aa2148ee234e
 *               eventId:
 *                 type: string
 *                 description: MongoDB ObjectId of the event
 *                 example: 64fd0b70a9c6de001a7cdef1
 *     responses:
 *       200:
 *         description: Member added to attendees successfully
 *       400:
 *         description: Bad request (invalid status, zone, or membership)
 *       404:
 *         description: Member or Event not found
 *       500:
 *         description: Server error
 */
router.post("/markattendance",verifyToken,authorizeRole("admin"),markAttendance)
