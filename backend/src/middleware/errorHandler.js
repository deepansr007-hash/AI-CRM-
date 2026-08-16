import * as db from '../config/db.js';

export const errorHandler = (err, req, res, next) => {
  console.error('[Global Error Handler]:', err);

  const statusCode = err.statusCode || 500;
  const errMsg = err.message || 'An unexpected internal server error occurred.';

  // Log critical error in system log database
  db.run('INSERT INTO system_logs (category, message, severity) VALUES (?, ?, ?)', [
    'System_Error',
    `Path: ${req.originalUrl}. Error: ${errMsg}`,
    'error'
  ]).catch(e => console.error('[Error Logger] DB log failed:', e.message));

  res.status(statusCode).json({
    error: errMsg,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};
