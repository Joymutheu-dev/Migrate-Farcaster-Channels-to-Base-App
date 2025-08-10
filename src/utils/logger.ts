import winston from 'winston';

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info', // Log info level and above (warn, error)
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json() // Log in JSON format for structured logging
  ),
  transports: [
    new winston.transports.Console(), // Log to console
    new winston.transports.File({ filename: 'logs/app.log' }), // Log to file
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }) // Separate file for errors
  ],
});

// Export logger for use in other modules
export { logger };