const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const authGuard = require('../middleware/authGuard');

/**
 * GET /api/v1/events (Task 3)
 * Return all events (public)
 */
router.get('/', async (req, res, next) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/events (Task 2 & 3 - Organizer/Protected)
 * Create a new event
 */
router.post('/', authGuard, async (req, res, next) => {
  try {
    const { title, category, date, venue, ticketsAvailable } = req.body;

    const event = await Event.create({
      title,
      category,
      date,
      venue,
      ticketsAvailable: Number(ticketsAvailable),
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
