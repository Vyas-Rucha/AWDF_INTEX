/**
 * Custom requestLogger Middleware (Task 3)
 * Requirement:
 * "Create a custom requestLogger middleware that logs [METHOD] [PATH] [TIMESTAMP] for every request, applied globally."
 */
const requestLogger = (req, res, next) => {
  const method = req.method;
  const path = req.originalUrl || req.url;
  const timestamp = new Date().toISOString();

  console.log(`[${method}] [${path}] [${timestamp}]`);

  next();
};

module.exports = requestLogger;
