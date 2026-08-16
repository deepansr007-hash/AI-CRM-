import express from 'express';
import { 
  getAllCustomers, 
  getCustomerById, 
  createCustomer, 
  updateCustomer, 
  createCustomerInteraction, 
  requestSmartEmail 
} from '../controllers/customerController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate); // Secure all customer endpoints

router.get('/', getAllCustomers);
router.get('/:id', getCustomerById);
router.post('/', createCustomer);
router.put('/:id', updateCustomer);
router.post('/:id/interactions', createCustomerInteraction);
router.post('/:id/generate-email', requestSmartEmail);

export default router;
