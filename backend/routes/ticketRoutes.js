const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const authGuard = require('../middleware/authGuard');

// Apply authGuard to all ticket routes (Task 3)
router.use(authGuard);

/**
 * POST /api/v1/tickets (Task 3 & Task 5)
 * Book tickets for an event (protected)
 * Requirements:
 * - Check availability with findById before Ticket.create()
 * - Validate that ticketsAvailable >= quantity (return 400 if not)
 * - Never let count go negative
 * - Create Ticket document
 * - Decrement ticketsAvailable on Event document using findByIdAndUpdate
 * - Return HTTP 201 on success
 */
router.post('/', async (req, res, next) => {
  try {
    const { eventId, quantity } = req.body;
    const attendeeId = req.user._id;

    const requestedQty = Number(quantity);

    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed: eventId is required to book a ticket',
      });
    }

    if (!requestedQty || requestedQty < 1) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed: Ticket quantity must be at least 1',
      });
    }

    // When MongoDB is connected
    if (mongoose.connection.readyState === 1) {
      // Task 5 Hint: check availability with findById before Ticket.create()
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: `Event not found with ID ${eventId}`,
        });
      }

      // Task 3 & 5: Validate ticketsAvailable >= quantity (never let count go negative)
      if (event.ticketsAvailable < requestedQty) {
        return res.status(400).json({
          success: false,
          message: `Validation failed: Insufficient tickets available. Requested: ${requestedQty}, Remaining: ${event.ticketsAvailable}`,
        });
      }

      // Create the Ticket
      const ticket = await Ticket.create({
        attendeeId,
        eventId,
        quantity: requestedQty,
        status: 'booked',
      });

      // Task 5 Hint: update the event with findByIdAndUpdate
      const updatedEvent = await Event.findByIdAndUpdate(
        eventId,
        { $inc: { ticketsAvailable: -requestedQty } },
        { new: true, runValidators: true }
      );

      // Return populated response with 201 Created
      const populatedTicket = await Ticket.findById(ticket._id)
        .populate('attendeeId', 'name email')
        .populate('eventId', 'title date venue');

      return res.status(201).json({
        success: true,
        message: 'Tickets booked successfully',
        data: populatedTicket,
        remainingTickets: updatedEvent.ticketsAvailable,
      });
    }

    // Offline simulation response (if MongoDB server is offline)
    if (requestedQty > 25) {
      return res.status(400).json({
        success: false,
        message: `Validation failed: Insufficient tickets available. Requested: ${requestedQty}, Remaining: 25`,
      });
    }

    const mockTicket = {
      _id: '671765c7145781a179bf1088',
      attendeeId: {
        _id: attendeeId,
        name: req.user.name || 'Demo Attendee',
        email: req.user.email || 'attendee@eventhub.com',
      },
      eventId: {
        _id: eventId,
        title: 'Web Development Workshop',
        date: new Date('2026-11-15T10:00:00.000Z'),
        venue: 'CSPIT Auditorium',
      },
      quantity: requestedQty,
      bookingDate: new Date(),
      status: 'booked',
    };

    res.status(201).json({
      success: true,
      message: 'Tickets booked successfully (Offline simulation)',
      data: mockTicket,
      remainingTickets: 25 - requestedQty,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/tickets/my (Task 3 & Task 5)
 * Return the attendee's own tickets (protected)
 * Requirement:
 * - Must use .populate('attendeeId', 'name email') and .populate('eventId', 'title date venue')
 */
router.get('/my', async (req, res, next) => {
  try {
    const attendeeId = req.user._id;

    if (mongoose.connection.readyState === 1) {
      const myTickets = await Ticket.find({ attendeeId })
        .populate('attendeeId', 'name email')
        .populate('eventId', 'title date venue')
        .sort({ bookingDate: -1 });

      return res.status(200).json({
        success: true,
        count: myTickets.length,
        data: myTickets,
      });
    }

    // Offline fallback data
    const mockTickets = [
      {
        _id: '671765c7145781a179bf1077',
        attendeeId: {
          _id: attendeeId,
          name: req.user.name || 'Demo Attendee',
          email: req.user.email || 'attendee@eventhub.com',
        },
        eventId: {
          _id: '671765c7145781a179bf1001',
          title: 'Web Development Workshop',
          date: new Date('2026-11-15T10:00:00.000Z'),
          venue: 'CSPIT Auditorium',
        },
        quantity: 2,
        bookingDate: new Date(),
        status: 'booked',
      },
    ];

    res.status(200).json({
      success: true,
      count: mockTickets.length,
      data: mockTickets,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/v1/tickets/:id/status (Task 3)
 * Update ticket status (protected)
 * Allowed statuses: booked | cancelled | used
 */
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['booked', 'cancelled', 'used'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status: '${status}'. Allowed statuses are: ${validStatuses.join(', ')}`,
      });
    }

    if (mongoose.connection.readyState === 1) {
      const ticket = await Ticket.findById(id);
      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: `Ticket not found with id ${id}`,
        });
      }

      const previousStatus = ticket.status;
      ticket.status = status;
      await ticket.save();

      // If ticket was cancelled, restore tickets to event availability
      if (status === 'cancelled' && previousStatus !== 'cancelled') {
        await Event.findByIdAndUpdate(ticket.eventId, {
          $inc: { ticketsAvailable: ticket.quantity },
        });
      }

      return res.status(200).json({
        success: true,
        message: `Ticket status successfully updated to '${status}'`,
        data: ticket,
      });
    }

    // Offline simulation response
    res.status(200).json({
      success: true,
      message: `Ticket status successfully updated to '${status}' (Offline simulation)`,
      data: {
        _id: id,
        status,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
