import express from 'express';
import { getDashboardStats, getModelMetrics, retrainModel } from '../controllers/dashboardController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate); // Secure dashboard usage

router.get('/stats', getDashboardStats);
router.get('/metrics', getModelMetrics);
router.post('/retrain', authorize(['admin']), retrainModel); // Retraining only by Admin role

export default router;
