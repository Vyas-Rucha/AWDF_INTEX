const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Attendee = require('./models/Attendee');
const Event = require('./models/Event');
const Ticket = require('./models/Ticket');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eventhub';

const seedData = async () => {
  try {
    console.log(`Connecting to MongoDB at: ${MONGO_URI}`);
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB. Clearing existing collections...');

    await Attendee.deleteMany({});
    await Event.deleteMany({});
    await Ticket.deleteMany({});

    console.log('Creating demo attendees...');
    const salt = await bcrypt.genSalt(10);
    const attendeePassword = await bcrypt.hash('attendee123', salt);
    const organizerPassword = await bcrypt.hash('organizer123', salt);

    const attendeeUser = await Attendee.create({
      name: 'Rucha Vyas',
      email: 'attendee@eventhub.com',
      phone: '+91 9876543210',
      role: 'attendee',
      password: attendeePassword,
    });

    const organizerUser = await Attendee.create({
      name: 'EventHub Organizer',
      email: 'organizer@eventhub.com',
      phone: '+91 9123456789',
      role: 'organizer',
      password: organizerPassword,
    });

    console.log('Creating demo events...');
    const event1 = await Event.create({
      title: 'Web Development Workshop',
      category: 'Workshop',
      date: new Date('2026-11-15T10:00:00.000Z'),
      venue: 'CSPIT Auditorium',
      ticketsAvailable: 25,
    });

    const event2 = await Event.create({
      title: 'Tech Fest 2026',
      category: 'Festival',
      date: new Date('2026-12-10T09:00:00.000Z'),
      venue: 'CHARUSAT Campus Grounds',
      ticketsAvailable: 0, // Demonstrates "Sold Out" badge requirement
    });

    const event3 = await Event.create({
      title: 'Coding Competition',
      category: 'Competition',
      date: new Date('2026-11-25T14:00:00.000Z'),
      venue: 'Computer Engineering Lab 3',
      ticketsAvailable: 12,
    });

    const event4 = await Event.create({
      title: 'AI & Cloud Summit 2026',
      category: 'Conference',
      date: new Date('2026-12-05T11:00:00.000Z'),
      venue: 'Seminar Hall 1',
      ticketsAvailable: 40,
    });

    console.log('Creating sample booked tickets for attendee...');
    await Ticket.create({
      attendeeId: attendeeUser._id,
      eventId: event1._id,
      quantity: 2,
      bookingDate: new Date(),
      status: 'booked',
    });

    console.log('==================================================');
    console.log('✅ Demo Database Seed Completed Successfully!');
    console.log('==================================================');
    console.log('Attendees:');
    console.log('  1) Attendee:  attendee@eventhub.com  / attendee123');
    console.log('  2) Organizer: organizer@eventhub.com / organizer123');
    console.log('Events:');
    console.log(`  1) ${event1.title} (Available: ${event1.ticketsAvailable})`);
    console.log(`  2) ${event2.title} (Available: ${event2.ticketsAvailable} - SOLD OUT)`);
    console.log(`  3) ${event3.title} (Available: ${event3.ticketsAvailable})`);
    console.log(`  4) ${event4.title} (Available: ${event4.ticketsAvailable})`);
    console.log('==================================================');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedData();
