import * as db from '../config/db.js';

export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const elapsed = Date.now() - start;
    const logMsg = `${req.method} ${req.originalUrl} ${res.statusCode} - ${elapsed}ms`;
    
    // Log to console
    console.log(`[API Request] ${logMsg}`);

    // Log warning or info in system log table for interest endpoints (ignore static or metrics checks)
    if (req.originalUrl.startsWith('/api') && res.statusCode >= 400) {
      db.run('INSERT INTO system_logs (category, message, severity) VALUES (?, ?, ?)', [
        'API_Warning',
        `${req.method} ${req.originalUrl} failed with code ${res.statusCode}. Agent: ${req.headers['user-agent'] || 'unknown'}`,
        'warning'
      ]).catch(e => console.error('[Logger] DB save error:', e.message));
    }
  });

  next();
};
