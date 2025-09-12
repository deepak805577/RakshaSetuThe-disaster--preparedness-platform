import express from 'express';
import {
  getDashboardAnalytics,
  getUsers,
  updateUserStatus,
  getPreparednessScores,
  exportData,
  getAllModulesAdmin,
  createModuleAdmin,
  updateModuleAdmin,
  deleteModuleAdmin,
  getAllVideosAdmin,
  addVideoToModule,
  updateVideoInModule,
  deleteVideoFromModule
} from '../controllers/adminController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Dashboard and Analytics
router.get('/analytics', getDashboardAnalytics);

// User Management
router.get('/users', getUsers);
router.put('/users/:id/status', updateUserStatus);

// Preparedness Tracking
router.get('/preparedness-scores', getPreparednessScores);

// Data Export
router.get('/export/:type', exportData);

// Module Management
router.get('/modules', getAllModulesAdmin);
router.post('/modules', createModuleAdmin);
router.put('/modules/:id', updateModuleAdmin);
router.delete('/modules/:id', deleteModuleAdmin);

// Video Management
router.get('/videos', getAllVideosAdmin);
router.post('/videos', addVideoToModule);
router.put('/videos/:videoId', updateVideoInModule);
router.delete('/videos/:videoId', deleteVideoFromModule);
router.put('/modules/:moduleId/videos/:videoId', updateVideoInModule);

export default router;
