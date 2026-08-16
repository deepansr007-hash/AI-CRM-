import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/config.js';
import * as db from '../config/db.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // Fetch user details from database
    const users = await db.query('SELECT id, username, email, role, avatar FROM users WHERE id = ?', [decoded.id]);
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'User no longer exists or session is invalid.' });
    }

    req.user = users[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    res.status(403).json({ error: 'Invalid or tampered session token.' });
  }
};

export const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    
    const hasRole = roles.includes(req.user.role);
    if (!hasRole) {
      return res.status(403).json({ error: 'Forbidden. You do not have permissions for this action.' });
    }
    
    next();
  };
};
