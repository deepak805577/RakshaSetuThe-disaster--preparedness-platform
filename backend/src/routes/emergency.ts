import express from 'express';
import {
  getEmergencyContacts,
  getContactsByDistrict,
  sendEmergencyAlert,
  createEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
  testSMS
} from '../controllers/emergencyController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/contacts', getEmergencyContacts);
router.get('/contacts/district/:district', getContactsByDistrict);

// Protected routes - Teachers and Admins can send alerts
router.post('/send-alert', protect, authorize('admin', 'teacher'), sendEmergencyAlert);

// Admin only routes
router.use(protect);
router.use(authorize('admin'));

router.post('/contacts', createEmergencyContact);
router.put('/contacts/:id', updateEmergencyContact);
router.delete('/contacts/:id', deleteEmergencyContact);
router.post('/test-sms', testSMS);

export default router;
