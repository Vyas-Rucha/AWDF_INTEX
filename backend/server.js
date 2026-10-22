const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '.env') });
// Also check root .env if not found in backend/
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Custom Middlewares
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');

// Route Handlers
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const ticketRoutes = require('./routes/ticketRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Task 3: Global requestLogger logging [METHOD] [PATH] [TIMESTAMP]
app.use(requestLogger);

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'EventHub API is running',
    timestamp: new Date().toISOString(),
  });
});

// REST Endpoints under /api/v1/ (Task 3)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/tickets', ticketRoutes);

// Catch-all for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Task 3: Global error-handling middleware as the last middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🎟️  EventHub Backend Server running on port ${PORT}`);
  console.log(`📡 Endpoints available at http://localhost:${PORT}/api/v1/`);
  console.log(`===============================================`);
});

module.exports = { app, server };
