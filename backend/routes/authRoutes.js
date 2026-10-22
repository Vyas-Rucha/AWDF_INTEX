const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Attendee = require('../models/Attendee');

/**
 * POST /api/v1/auth/login (Task 3)
 * Authenticate attendee, issue JWT token
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    // Find attendee by email
    const attendee = await Attendee.findOne({ email: email.toLowerCase() });

    if (!attendee) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials: user not found with this email',
      });
    }

    // Check password (bcrypt or plain match for test convenience)
    let isMatch = false;
    if (attendee.password.startsWith('$2a$') || attendee.password.startsWith('$2b$')) {
      isMatch = await bcrypt.compare(password, attendee.password);
    } else {
      isMatch = attendee.password === password;
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials: password does not match',
      });
    }

    // Generate JWT token
    const secret = process.env.JWT_SECRET || 'eventhub_exam_jwt_secret_key_2026';
    const token = jwt.sign(
      {
        id: attendee._id,
        email: attendee.email,
        role: attendee.role,
      },
      secret,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      role: attendee.role,
      attendee: {
        id: attendee._id,
        name: attendee.name,
        email: attendee.email,
        phone: attendee.phone,
        role: attendee.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/auth/register (Helper for seeding & viva testing)
 */
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // Check if attendee already exists
    const existing = await Attendee.findOne({ email: email?.toLowerCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An attendee with this email is already registered',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || 'password123', salt);

    const attendee = await Attendee.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: role || 'attendee',
    });

    const secret = process.env.JWT_SECRET || 'eventhub_exam_jwt_secret_key_2026';
    const token = jwt.sign(
      { id: attendee._id, email: attendee.email, role: attendee.role },
      secret,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Attendee registered successfully',
      token,
      attendee: {
        id: attendee._id,
        name: attendee.name,
        email: attendee.email,
        phone: attendee.phone,
        role: attendee.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
