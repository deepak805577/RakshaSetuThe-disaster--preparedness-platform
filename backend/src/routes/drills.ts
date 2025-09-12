import express from 'express';
import {
  getDrillTypes,
  startDrill,
  completeStep,
  completeDrill,
  getDrillHistory,
  getActiveDrill
} from '../controllers/drillController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/types', getDrillTypes);

// Protected routes
router.use(protect);

router.get('/active', getActiveDrill);
router.get('/history', getDrillHistory);
router.post('/start', startDrill);
router.put('/:sessionId/step/:stepNumber', completeStep);
router.put('/:sessionId/complete', completeDrill);

export default router;
