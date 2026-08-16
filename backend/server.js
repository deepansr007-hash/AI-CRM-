import express from 'express';
import cors from 'cors';
import { PORT } from './src/config/config.js';
import { requestLogger } from './src/middleware/logger.js';
import { errorHandler } from './src/middleware/errorHandler.js';

// Route imports
import authRoutes from './src/routes/authRoutes.js';
import leadRoutes from './src/routes/leadRoutes.js';
import customerRoutes from './src/routes/customerRoutes.js';
import dealRoutes from './src/routes/dealRoutes.js';
import dashboardRoutes from './src/routes/dashboardRoutes.js';

const app = express();

// Standard Middlewares
app.use(cors({
  origin: '*', // Allow all cross origin in development, or adjust specifically for Vite
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// API Routes Dispatcher
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Global Fallback Error Handler middleware
app.use(errorHandler);

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=============================================`);
  console.log(`   AI CRM Enterprise Server Running Online   `);
  console.log(`   Port: ${PORT}                             `);
  console.log(`   Env:  ${process.env.NODE_ENV || 'dev'}    `);
  console.log(`=============================================`);
});
