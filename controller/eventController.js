import { VALID_MEMBERSHIPS, VALID_ZONES } from "../config/utils.js";
import eventSchema from "../models/eventSchema.js";
import memberSchema from "../models/memberSchema.js";

export async function addEvent(req, res) {
  try {
    const { title, zone, location, membershipAllowed } = req.body;

    if (!title || !zone || !location || !membershipAllowed) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields.",
      });
    }

    const invalidZones = zone.filter((z) => !VALID_ZONES.includes(z));
    if (invalidZones.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid zones: ${invalidZones.join(", ")}`,
      });
    }

    const invalidMemberships = membershipAllowed.filter(
      (m) => !VALID_MEMBERSHIPS.includes(m)
    );
    if (invalidMemberships.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid membership types: ${invalidMemberships.join(", ")}`,
      });
    }

    const existingevent = await eventSchema
      .findOne({ title, status: "upcoming", zone })
      .lean();

    if (existingevent) {
      return res.status(400).json({
        success: false,
        message: `Event already exist`,
      });
    }
    const event = await eventSchema.create({
      title,
      zone,
      location,
      membershipsAllowed: membershipAllowed,
    });

    return res.status(201).json({
      success: true,
      message: "Event added successfully",
      event,
    });
  } catch (error) {
    console.error("Error adding event:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while adding event",
      error: error.message,
    });
  }
}

export async function listUpcomingEvents(req, res) {
  const events = await eventSchema.find({ status: "upcoming" }).lean();
  if (events.length == 0) {
    return res
      .status(404)
      .json({ success: false, message: `No upcomingEvents` });
  }
  return res
    .status(200)
    .json({ success: true, message: "Upcoming Events", events });
}

export async function filterEventsByStatus(req, res) {
  const status = req.params.status;
  if (!["upcoming", "completed", "cancelled"].includes(status)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid status selected." });
  }
  const events = await eventSchema.find({ status }).lean();

  if (events.length === 0) {
    return res.status(404).json({
      success: false,
      message: `No events found in status : ${status}`,
    });
  }
  return res
    .status(200)
    .json({ success: true, message: "Upcoming Events", events });
}

export async function updateStatus(req, res) {
  try {
    const { id, status } = req.body;

    if (!["upcoming", "completed", "cancelled"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status selected." });
    }

    const event = await eventSchema.findById(id).lean();
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found." });
    }

    await eventSchema.findByIdAndUpdate(id, { status });

    return res.status(200).json({
      success: true,
      message: "Event status updated successfully.",
    });
  } catch (error) {
    console.error("Error updating event status:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while updating status.",
    });
  }
}

export async function markAttendance(req, res) {
  const { memberId, eventId } = req.body;

  try {
    const event = await eventSchema.findById({ _id: eventId });
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }
    if (event.status !== "upcoming") {
      return res.status(400).json({
        success: false,
        message: `Cannot mark attendance. Event is already ${event.status}.`,
      });
    }
    const member = await memberSchema.findOne({ _id: memberId });
    if (!member) {
      return res
        .status(404)
        .json({ success: false, message: "Member not found" });
    }

    if (!event.membershipsAllowed.includes(member.membershipType)) {
      return res.status(400).json({
        success: false,
        message: `This event is not available for ${member.membershipType} members.`,
      });
    }

    if (!event.zone.includes(member.zone)) {
      return res.status(400).json({
        success: false,
        message: `Member's zone (${member.zone}) is not eligible for this event.`,
      });
    }

    if (event.attendees.includes(memberId)) {
      return res.status(400).json({
        success: false,
        message: "Member already marked as attendee",
      });
    }

    event.attendees.push(memberId);
    await event.save();

    return res.status(200).json({
      success: true,
      message: "Attendance recorded successfully.",
    });
  } catch (error) {
    console.error("Error marking attendance:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while marking attendance.",
      error: error.message,
    });
  }
}
