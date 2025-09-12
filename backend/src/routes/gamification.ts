import express from 'express';
import {
  getBadges,
  getUserBadges,
  checkAndAwardBadges,
  getGlobalLeaderboard,
  getSchoolLeaderboard,
  createBadge
} from '../controllers/gamificationController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/badges', getBadges);
router.get('/leaderboard', getGlobalLeaderboard);
router.get('/leaderboard/school/:school', getSchoolLeaderboard);

// Protected routes
router.use(protect);

router.get('/my-badges', getUserBadges);
router.post('/check-badges', checkAndAwardBadges);

// Admin only routes
router.post('/badges', authorize('admin'), createBadge);

export default router;
