const mongoose = require('mongoose');

/**
 * Event Schema (Task 5)
 * Requirements:
 * - title: required
 * - category: String
 * - date: required
 * - venue: required
 * - ticketsAvailable: min 0
 */
const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    category: {
      type: String,
      default: 'General',
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    venue: {
      type: String,
      required: [true, 'Event venue is required'],
      trim: true,
    },
    ticketsAvailable: {
      type: Number,
      required: [true, 'Number of tickets available is required'],
      min: [0, 'Tickets available cannot be negative'],
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Event', eventSchema);
