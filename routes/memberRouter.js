import express from "express";
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Members
 *   description: API endpoints for managing members
 */

/**
 * @swagger
 * /api/members:
 *   get:
 *     summary: Get all members
 *     tags: [Members]
 *     responses:
 *       200:
 *         description: Returns a list of members
 */
router.get("/", (req, res) => {
  res.send("✅ Member route working");
});

/**
 * @swagger
 * /api/edit:
 *   post:
 *     summary: Edit Members
 *     tags: [Members]
 *     responses: 
 *        200:
 *          description: User Edited successfull
 */
router.post("/edit", (req, res) => {
  res.send("ueser can edit here");
});	

/**
 * @swagger
 * /api/filter
 * 
 */
 
export default router;
