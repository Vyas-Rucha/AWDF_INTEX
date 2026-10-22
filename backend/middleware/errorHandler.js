/**
 * Global Error-Handling Middleware (Task 3 & Task 5)
 * Requirements:
 * - Applied as the last middleware in Express.
 * - Returns structured JSON instead of a raw error stack.
 * - Formats Mongoose ValidationErrors and CastErrors into clean, readable JSON messages.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error: Invalid input data';
    errors = Object.values(err.errors).map((val) => val.message);
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Resource not found with id of ${err.value}`;
  }

  // Handle Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value entered for ${field}. Please use another value.`;
  }

  // Handle JSON Web Token errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please authenticate.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired. Please log in again.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

module.exports = errorHandler;
