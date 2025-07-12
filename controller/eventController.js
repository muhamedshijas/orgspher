import { VALID_MEMBERSHIPS, VALID_ZONES } from "../config/utils.js";
import eventSchema from "../models/eventSchema.js";
import memberSchema from "../models/memberSchema.js";
import paymentSchema from "../models/paymentSchema.js";

export async function addEvent(req, res) {
  try {
    const { title, zone, location, membershipAllowed, fee } = req.body;

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
        message: `Event already exists.`,
      });
    }

    const event = await eventSchema.create({
      title,
      zone,
      location,
      membershipsAllowed: membershipAllowed,
      fee: typeof fee === "number" && fee >= 0 ? fee : 0, // 👈 default fee handling
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

export async function markAttendee(req, res) {
  try {
    const { eventId, memberId } = req.body;

    if (!eventId || !memberId) {
      return res.status(400).json({
        success: false,
        message: "Event ID and Member ID are required.",
      });
    }

    const event = await eventSchema.findById(eventId);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found." });
    }

    const member = await memberSchema.findById(memberId);
    if (!member) {
      return res
        .status(404)
        .json({ success: false, message: "Member not found." });
    }

    // Check already marked
    const alreadyMarked = event.attendees.some(
      (a) => a.member.toString() === memberId
    );
    if (alreadyMarked) {
      return res.status(409).json({
        success: false,
        message: "This member is already marked as attended.",
      });
    }

    // Check zone & membership eligibility
    if (!event.zone.includes(member.zone)) {
      return res.status(403).json({
        success: false,
        message: `Member zone (${member.zone}) is not allowed for this event.`,
      });
    }

    if (!event.membershipsAllowed.includes(member.membershipType)) {
      return res.status(403).json({
        success: false,
        message: `Member membership (${member.membershipType}) not allowed for this event.`,
      });
    }

    // FREE event logic
    if (event.fee === 0) {
      event.attendees.push({
        member: memberId,
        payment: null,
        markedAt: new Date(),
      });

      await event.save();

      return res.status(200).json({
        success: true,
        message: "Member marked as attended (free event).",
      });
    }

    // PAID event logic
    const paidPayment = await paymentSchema.findOne({
      member: memberId,
      event: eventId,
      type: "event",
      status: "paid",
    });

    if (!paidPayment) {
      return res.status(403).json({
        success: false,
        message: "No valid payment found for this event.",
      });
    }

    // Mark attendee
    event.attendees.push({
      member: memberId,
      payment: paidPayment._id,
      markedAt: new Date(),
    });

    await event.save();

    return res.status(200).json({
      success: true,
      message: "Member marked as attended (paid event).",
    });
  } catch (error) {
    console.error("Error marking attendee:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while marking attendee.",
    });
  }
}

export async function listAttendees(req, res) {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Event ID is required.",
      });
    }

    // Get full event details including fee
    const event = await eventSchema
      .findById(id)
      .populate("attendees.member", "name email membership zone")
      .populate("attendees.payment", "amount paymentMode status")
      .lean();

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    // Transform attendees to include "free event" if payment is null
    const attendeesWithPaymentInfo = event.attendees.map((a) => ({
      member: a.member,
      payment: a.payment ? a.payment : event.fee === 0 ? "free event" : null,
      markedAt: a.markedAt,
    }));

    return res.status(200).json({
      success: true,
      title: event.title,
      fee: event.fee,
      count: attendeesWithPaymentInfo.length,
      attendees: attendeesWithPaymentInfo,
    });
  } catch (error) {
    console.error("Error listing attendees:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while listing attendees.",
      error: error.message,
    });
  }
}

export async function getEventPayments(req, res) {
  try {
    const eventId = req.params.id;

    const event = await eventSchema.findById(eventId).lean();
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    // 🆓 Handle free event case early
    if (event.fee === 0) {
      return res.status(200).json({
        success: true,
        eventTitle: event.title,
        message: "This is a free event. No payments collected.",
        totalPayments: 0,
        totalAmountCollected: 0,
        payments: [],
      });
    }

    // 💳 Get all payments for the event
    const payments = await paymentSchema
      .find({ event: eventId, type: "event", status: "paid" })
      .populate("member", "name email membership zone")
      .sort({ createdAt: -1 })
      .lean();

    if (payments.length === 0) {
      return res.status(200).json({
        success: true,
        eventTitle: event.title,
        message: "No payments have been made yet for this event.",
        totalPayments: 0,
        totalAmountCollected: 0,
        payments: [],
      });
    }

    // 💰 Calculate total amount collected (only from "paid" payments)
    const totalAmountCollected = payments
      .filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + p.amount, 0);

    return res.status(200).json({
      success: true,
      eventTitle: event.title,
      message: "Event payment summary retrieved successfully.",
      totalPayments: payments.length,
      totalAmountCollected,
      payments: payments.map((p) => ({
        member: p.member,
        amount: p.amount,
        status: p.status,
        paymentMode: p.paymentMode,
        receiptUrl: p.receiptUrl,
        rejectionReason: p.rejectionReason,
        createdAt: p.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error getting event payments:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching payments.",
      error: error.message,
    });
  }
}
