import express from 'express';
import {
  getModules,
  getModule,
  startModule,
  submitQuiz,
  getUserProgress,
  createModule
} from '../controllers/moduleController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', getModules);
router.get('/:id', getModule);

// Protected routes
router.use(protect);

router.get('/progress/my', getUserProgress);
router.post('/:id/start', startModule);
router.post('/:id/submit-quiz', submitQuiz);

// Admin only routes
router.post('/', authorize('admin'), createModule);

export default router;
