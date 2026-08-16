import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/config.js';
import * as db from '../config/db.js';

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    // Fetch user
    const users = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    // Create JWT
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '12h' });

    // Insert access logs
    await db.run('INSERT INTO system_logs (category, message, severity) VALUES (?, ?, ?)', [
      'Access',
      `User ${user.username} logged in successfully.`,
      'info'
    ]);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });

  } catch (error) {
    next(error);
  }
};

export const register = async (req, res, next) => {
  try {
    const { username, password, email, role } = req.body;
    
    if (!username || !password || !email) {
      return res.status(400).json({ error: 'Username, password, and email are required.' });
    }

    // Check duplicate
    const checkUser = await db.query('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);
    if (checkUser.length > 0) {
      return res.status(409).json({ error: 'Username or email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.run('INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)', [
      username,
      hashedPassword,
      email,
      role || 'sales'
    ]);

    res.status(201).json({ message: 'User registered successfully.', userId: result.id });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    // req.user is populated by authenticate middleware
    res.json(req.user);
  } catch (error) {
    next(error);
  }
};
