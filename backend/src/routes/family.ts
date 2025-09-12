import express from 'express';
const { body, validationResult } = require('express-validator');
import { protect } from '../middleware/auth';
import {
  linkChildAccount,
  verifyFamilyRelationship,
  getParentDashboard,
  getChildProgress,
  updateFamilySettings,
  removeFamilyRelationship,
  getFamilyNotifications
} from '../controllers/familyController';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Link parent to child account
router.post('/link-child', [
  body('childEmail')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('relationshipType')
    .optional()
    .isIn(['parent', 'guardian', 'family_member'])
    .withMessage('Invalid relationship type'),
  body('emergencyContact.phone')
    .matches(/^[\+]?[0-9\s\-\(\)]{10,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('emergencyContact.email')
    .isEmail()
    .withMessage('Please provide a valid emergency contact email')
    .normalizeEmail(),
  body('emergencyContact.address')
    .isLength({ min: 10, max: 200 })
    .withMessage('Address must be between 10 and 200 characters')
], linkChildAccount);

// Verify family relationship
router.post('/verify', [
  body('relationshipId')
    .isMongoId()
    .withMessage('Invalid relationship ID'),
  body('verificationCode')
    .isLength({ min: 6, max: 6 })
    .withMessage('Verification code must be 6 characters')
    .isAlphanumeric()
    .withMessage('Verification code must be alphanumeric')
], verifyFamilyRelationship);

// Get parent dashboard with all children's progress
router.get('/dashboard', getParentDashboard);

// Get specific child's detailed progress
router.get('/child/:childId/progress', getChildProgress);

// Update family relationship settings
router.put('/relationship/:relationshipId/settings', [
  body('permissions.viewProgress')
    .optional()
    .isBoolean()
    .withMessage('viewProgress must be a boolean'),
  body('permissions.receiveNotifications')
    .optional()
    .isBoolean()
    .withMessage('receiveNotifications must be a boolean'),
  body('permissions.manageAccount')
    .optional()
    .isBoolean()
    .withMessage('manageAccount must be a boolean'),
  body('permissions.accessEmergencyInfo')
    .optional()
    .isBoolean()
    .withMessage('accessEmergencyInfo must be a boolean'),
  body('emergencyContact.phone')
    .optional()
    .matches(/^[\+]?[0-9\s\-\(\)]{10,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('emergencyContact.email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid emergency contact email')
    .normalizeEmail()
], updateFamilySettings);

// Remove family relationship
router.delete('/relationship/:relationshipId', removeFamilyRelationship);

// Get family notifications
router.get('/notifications', getFamilyNotifications);

// Get family emergency contacts
router.get('/emergency-contacts', async (req: any, res) => {
  try {
    const parentId = req.user.id;
    
    const FamilyRelationship = (await import('../models/FamilyRelationship')).default;
    
    const relationships = await FamilyRelationship.find({
      parent: parentId,
      isVerified: true
    }).populate('children', 'name email phone grade school');

    const emergencyContacts = relationships.map(rel => ({
      relationship: rel,
      emergencyContact: rel.emergencyContact,
      children: rel.children
    }));

    res.json({
      success: true,
      data: emergencyContacts
    });

  } catch (error) {
    console.error('Error fetching emergency contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching emergency contacts'
    });
  }
});

// Send emergency message to all family members
router.post('/emergency-broadcast', [
  body('message')
    .isLength({ min: 10, max: 500 })
    .withMessage('Emergency message must be between 10 and 500 characters'),
  body('type')
    .isIn(['emergency', 'alert', 'info'])
    .withMessage('Invalid message type')
], async (req: any, res) => {
  try {
    const { message, type = 'emergency' } = req.body;
    const parentId = req.user.id;
    
    const FamilyRelationship = (await import('../models/FamilyRelationship')).default;
    const { smsService } = await import('../services/smsService');
    
    const relationships = await FamilyRelationship.find({
      parent: parentId,
      isVerified: true,
      'notifications.emergencyAlerts': true
    });

    // Send SMS to parent's emergency contact numbers
    const phoneNumbers = relationships.map(rel => rel.emergencyContact.phone);
    const smsResult = await smsService.sendEmergencyAlert(
      phoneNumbers,
      message,
      type
    );

    res.json({
      success: smsResult.success,
      message: `Emergency message sent to ${smsResult.sent} of ${relationships.length} family contact(s)`,
      data: {
        contactsNotified: smsResult.sent,
        failed: smsResult.failed,
        messageType: type,
        errors: smsResult.errors
      }
    });

  } catch (error) {
    console.error('Error broadcasting emergency message:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while broadcasting emergency message'
    });
  }
});

// Get family statistics summary
router.get('/stats', async (req: any, res) => {
  try {
    const parentId = req.user.id;
    
    const FamilyRelationship = (await import('../models/FamilyRelationship')).default;
    const UserProgress = (await import('../models/UserProgress')).default;
    const DrillSession = (await import('../models/DrillSession')).default;
    const Badge = (await import('../models/Badge')).default;
    
    const relationships = await FamilyRelationship.find({
      parent: parentId,
      isVerified: true
    });

    const childrenIds = relationships.reduce((acc: any[], rel) => {
      acc.push(...rel.children);
      return acc;
    }, []);

    const [progressCount, drillCount, badgeCount] = await Promise.all([
      UserProgress.countDocuments({ user: { $in: childrenIds }, completed: true }),
      DrillSession.countDocuments({ user: { $in: childrenIds }, completed: true }),
      Badge.countDocuments({ user: { $in: childrenIds } })
    ]);

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const [recentProgress, recentDrills] = await Promise.all([
      UserProgress.countDocuments({ 
        user: { $in: childrenIds }, 
        updatedAt: { $gte: thirtyDaysAgo },
        completed: true 
      }),
      DrillSession.countDocuments({ 
        user: { $in: childrenIds }, 
        createdAt: { $gte: thirtyDaysAgo },
        completed: true 
      })
    ]);

    res.json({
      success: true,
      data: {
        totalChildren: childrenIds.length,
        totalVerifiedRelationships: relationships.length,
        overallProgress: {
          modulesCompleted: progressCount,
          drillsCompleted: drillCount,
          badgesEarned: badgeCount
        },
        recentActivity: {
          modulesThisMonth: recentProgress,
          drillsThisMonth: recentDrills,
          period: '30 days'
        }
      }
    });

  } catch (error) {
    console.error('Error fetching family stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching family statistics'
    });
  }
});

export default router;
