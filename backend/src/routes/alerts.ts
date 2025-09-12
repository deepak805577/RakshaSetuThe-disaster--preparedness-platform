import express from 'express';
import {
  getActiveAlerts,
  createAlert,
  deactivateAlert
} from '../controllers/alertController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', getActiveAlerts);

// Admin only routes
router.use(protect);
router.use(authorize('admin'));

router.post('/', createAlert);
router.put('/:id/deactivate', deactivateAlert);

export default router;
