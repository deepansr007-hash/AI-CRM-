import express from 'express';
import { 
  getAllLeads, 
  getLeadById, 
  createLead, 
  updateLead, 
  deleteLead, 
  reScoreLead 
} from '../controllers/leadController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate); // Secure all lead routes

router.get('/', getAllLeads);
router.get('/:id', getLeadById);
router.post('/', createLead);
router.put('/:id', updateLead);
router.delete('/:id', deleteLead);
router.post('/:id/rescore', reScoreLead);

export default router;
