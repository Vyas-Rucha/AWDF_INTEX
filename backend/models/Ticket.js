const mongoose = require('mongoose');

/**
 * Ticket Schema (Task 5)
 * Requirements:
 * - attendeeId: ref Attendee
 * - eventId: ref Event
 * - quantity: min 1
 * - bookingDate: default Date.now
 * - status: enum ['booked', 'cancelled', 'used'], default 'booked'
 */
const ticketSchema = new mongoose.Schema(
  {
    attendeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Attendee',
      required: [true, 'Attendee reference (attendeeId) is required'],
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event reference (eventId) is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Ticket quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    bookingDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: {
        values: ['booked', 'cancelled', 'used'],
        message: 'Status must be either booked, cancelled, or used',
      },
      default: 'booked',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Ticket', ticketSchema);
