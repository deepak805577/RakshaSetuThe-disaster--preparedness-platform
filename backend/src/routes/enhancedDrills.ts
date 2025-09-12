import express from 'express';
import {
  getEnhancedScenarios,
  createDrillSession,
  getActiveSessions,
  joinDrillSession,
  getUserStats,
  getUserAchievements,
  startDrillSession,
  updateParticipantStatus,
  getLeaderboard
} from '../controllers/enhancedDrillController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All routes are protected
router.use(protect);

// Scenario management routes
router.get('/scenarios', getEnhancedScenarios);

// Session management routes
router.post('/sessions', createDrillSession);
router.get('/sessions/active', getActiveSessions);
router.post('/sessions/:sessionId/join', joinDrillSession);
router.post('/sessions/:sessionId/start', startDrillSession);
router.put('/sessions/:sessionId/participants/:participantId/status', updateParticipantStatus);

// User analytics routes
router.get('/stats', getUserStats);
router.get('/achievements', getUserAchievements);
router.get('/leaderboard', getLeaderboard);

export default router;
