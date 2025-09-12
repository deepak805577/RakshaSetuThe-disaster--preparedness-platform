import { Request, Response } from 'express';
const { validationResult } = require('express-validator');
import mongoose from 'mongoose';
import FamilyRelationship from '../models/FamilyRelationship';
import User from '../models/User';
import UserProgress from '../models/UserProgress';
import DrillSession from '../models/DrillSession';
import Badge from '../models/Badge';
import { sendSMS } from '../services/smsService';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    email: string;
  };
}

// Link parent to child account
export const linkChildAccount = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { childEmail, relationshipType = 'parent', emergencyContact } = req.body;
    const parentId = req.user!.id;

    // Find the child user
    const childUser = await User.findOne({ email: childEmail, role: 'student' });
    if (!childUser) {
      return res.status(404).json({
        success: false,
        message: 'Student not found with this email'
      });
    }

    // Check if relationship already exists
    const existingRelation = await FamilyRelationship.findOne({
      parent: parentId,
      children: childUser._id
    });

    if (existingRelation) {
      return res.status(400).json({
        success: false,
        message: 'Family relationship already exists'
      });
    }

    // Create new family relationship
    const familyRelationship = new FamilyRelationship({
      parent: parentId,
      children: [childUser._id],
      relationshipType,
      emergencyContact,
      isVerified: false
    });

    await familyRelationship.save();

    // Send verification SMS to parent
    const verificationMessage = `Your family link verification code is: ${familyRelationship.verificationCode}. This code expires in 24 hours.`;
    await sendSMS(emergencyContact.phone, verificationMessage);

    res.status(201).json({
      success: true,
      message: 'Family relationship request created. Please verify using the code sent to your phone.',
      data: {
        relationshipId: familyRelationship._id,
        verificationCodeExpires: familyRelationship.verificationCodeExpires
      }
    });

  } catch (error) {
    console.error('Error linking child account:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while linking accounts'
    });
  }
};

// Verify family relationship
export const verifyFamilyRelationship = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { relationshipId, verificationCode } = req.body;
    const userId = req.user!.id;

    const relationship = await FamilyRelationship.findOne({
      _id: relationshipId,
      parent: userId,
      verificationCode,
      isVerified: false
    });

    if (!relationship) {
      return res.status(404).json({
        success: false,
        message: 'Invalid verification code or relationship not found'
      });
    }

    if (!relationship.isVerificationCodeValid()) {
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired'
      });
    }

    // Mark as verified
    relationship.isVerified = true;
    relationship.verificationCode = '';
    await relationship.save();

    res.json({
      success: true,
      message: 'Family relationship verified successfully',
      data: relationship
    });

  } catch (error) {
    console.error('Error verifying family relationship:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during verification'
    });
  }
};

// Get parent dashboard with all children's progress
export const getParentDashboard = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parentId = req.user!.id;

    // Find all verified family relationships
    const familyRelationships = await FamilyRelationship.find({
      parent: parentId,
      isVerified: true
    }).populate('children', 'name email grade school district');

    if (!familyRelationships.length) {
      return res.json({
        success: true,
        message: 'No verified family relationships found',
        data: {
          children: [],
          overallStats: {
            totalChildren: 0,
            totalModulesCompleted: 0,
            totalDrillsCompleted: 0,
            averageScore: 0,
            totalBadges: 0
          }
        }
      });
    }

    // Get all children IDs
    const allChildrenIds = familyRelationships.reduce((acc, rel) => {
      acc.push(...rel.children.map(child => child._id || child));
      return acc;
    }, [] as mongoose.Types.ObjectId[]);

    // Fetch progress data for all children
    const [progressData, drillSessions, badges] = await Promise.all([
      UserProgress.find({ userId: { $in: allChildrenIds } })
        .populate('moduleId', 'title type difficulty')
        .populate('userId', 'name email'),
      DrillSession.find({ userId: { $in: allChildrenIds } })
        .populate('drillId', 'title type difficulty')
        .populate('userId', 'name email'),
      Badge.find({ user: { $in: allChildrenIds } })
        .populate('user', 'name email')
    ]);

    // Organize data by child
    const childrenData = familyRelationships.map(relationship => {
      return relationship.children.map(child => {
        const childId = child._id || child;
        const childProgress = progressData.filter(p => 
          p.userId.toString() === childId.toString()
        );
        const childDrills = drillSessions.filter(d => 
          d.userId.toString() === childId.toString()
        );
        const childBadges = badges.filter(b => 
          (b.user._id || b.user).toString() === childId.toString()
        );

        // Calculate statistics
        const completedModules = childProgress.filter(p => p.status === 'completed').length;
        const completedDrills = childDrills.filter(d => d.isCompleted).length;
        const averageScore = childProgress.length > 0 
          ? Math.round(childProgress.reduce((sum, p) => sum + p.score, 0) / childProgress.length)
          : 0;

        // Recent activity (last 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recentProgress = childProgress.filter(p => 
          p.updatedAt && p.updatedAt > sevenDaysAgo
        );
        const recentDrills = childDrills.filter(d => 
          d.createdAt && d.createdAt > sevenDaysAgo
        );

        return {
          child: child,
          relationship: {
            id: relationship._id,
            relationshipType: relationship.relationshipType,
            permissions: relationship.permissions,
            notifications: relationship.notifications
          },
          stats: {
            modulesCompleted: completedModules,
            drillsCompleted: completedDrills,
            averageScore,
            totalBadges: childBadges.length,
            recentActivity: {
              modulesThisWeek: recentProgress.length,
              drillsThisWeek: recentDrills.length
            }
          },
          recentAchievements: childBadges
            .sort((a, b) => (b.earnedAt?.getTime() || 0) - (a.earnedAt?.getTime() || 0))
            .slice(0, 5),
          upcomingDrills: [], // Can be enhanced with scheduled drills
          alerts: [] // Can be enhanced with child-specific alerts
        };
      });
    }).flat();

    // Calculate overall statistics
    const overallStats = {
      totalChildren: childrenData.length,
      totalModulesCompleted: childrenData.reduce((sum, child) => sum + child.stats.modulesCompleted, 0),
      totalDrillsCompleted: childrenData.reduce((sum, child) => sum + child.stats.drillsCompleted, 0),
      averageScore: childrenData.length > 0 
        ? Math.round(childrenData.reduce((sum, child) => sum + child.stats.averageScore, 0) / childrenData.length)
        : 0,
      totalBadges: childrenData.reduce((sum, child) => sum + child.stats.totalBadges, 0)
    };

    res.json({
      success: true,
      data: {
        children: childrenData,
        overallStats
      }
    });

  } catch (error) {
    console.error('Error fetching parent dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard data'
    });
  }
};

// Get specific child's detailed progress
export const getChildProgress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { childId } = req.params;
    const parentId = req.user!.id;

    // Verify parent has access to this child
    const relationship = await FamilyRelationship.findOne({
      parent: parentId,
      children: childId,
      isVerified: true
    }).populate('children', 'name email grade school');

    if (!relationship || !relationship.permissions.viewProgress) {
      return res.status(403).json({
        success: false,
        message: 'Access denied or child not found'
      });
    }

    // Fetch detailed progress
    const [progress, drillSessions, badges] = await Promise.all([
      UserProgress.find({ userId: childId })
        .populate('moduleId', 'title description type difficulty topics estimatedTime')
        .sort({ updatedAt: -1 }),
      DrillSession.find({ userId: childId })
        .sort({ createdAt: -1 })
        .limit(20),
      Badge.find({ user: childId }).sort({ createdAt: -1 })
    ]);

    // Group progress by module type
    const progressByType = progress.reduce((acc, p) => {
      const moduleType = (p.moduleId as any)?.type || 'general';
      if (!acc[moduleType]) {
        acc[moduleType] = [];
      }
      acc[moduleType].push(p);
      return acc;
    }, {} as Record<string, typeof progress>);

    // Calculate learning analytics
    const analytics = {
      totalTimeSpent: progress.reduce((sum, p) => sum + (p.timeSpent || 0), 0),
      averageScore: progress.length > 0 
        ? Math.round(progress.reduce((sum, p) => sum + p.score, 0) / progress.length)
        : 0,
      completionRate: progress.length > 0 
        ? Math.round((progress.filter(p => p.status === 'completed').length / progress.length) * 100)
        : 0,
      strongestAreas: Object.keys(progressByType)
        .map(type => ({
          type,
          averageScore: Math.round(
            progressByType[type].reduce((sum, p) => sum + p.score, 0) / 
            progressByType[type].length
          )
        }))
        .sort((a, b) => b.averageScore - a.averageScore)
        .slice(0, 3),
      improvementAreas: Object.keys(progressByType)
        .map(type => ({
          type,
          averageScore: Math.round(
            progressByType[type].reduce((sum, p) => sum + p.score, 0) / 
            progressByType[type].length
          )
        }))
        .sort((a, b) => a.averageScore - b.averageScore)
        .slice(0, 3)
    };

    res.json({
      success: true,
      data: {
        child: relationship.children.find(c => c._id.toString() === childId),
        progress: progressByType,
        drillHistory: drillSessions,
        badges,
        analytics
      }
    });

  } catch (error) {
    console.error('Error fetching child progress:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching child progress'
    });
  }
};

// Update family relationship settings
export const updateFamilySettings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { relationshipId } = req.params;
    const { permissions, notifications, emergencyContact } = req.body;
    const parentId = req.user!.id;

    const relationship = await FamilyRelationship.findOne({
      _id: relationshipId,
      parent: parentId,
      isVerified: true
    });

    if (!relationship) {
      return res.status(404).json({
        success: false,
        message: 'Family relationship not found'
      });
    }

    // Update settings
    if (permissions) {
      relationship.permissions = { ...relationship.permissions, ...permissions };
    }
    
    if (notifications) {
      relationship.notifications = { ...relationship.notifications, ...notifications };
    }
    
    if (emergencyContact) {
      relationship.emergencyContact = { ...relationship.emergencyContact, ...emergencyContact };
    }

    await relationship.save();

    res.json({
      success: true,
      message: 'Family settings updated successfully',
      data: relationship
    });

  } catch (error) {
    console.error('Error updating family settings:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating settings'
    });
  }
};

// Remove family relationship
export const removeFamilyRelationship = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { relationshipId } = req.params;
    const parentId = req.user!.id;

    const relationship = await FamilyRelationship.findOne({
      _id: relationshipId,
      parent: parentId
    });

    if (!relationship) {
      return res.status(404).json({
        success: false,
        message: 'Family relationship not found'
      });
    }

    await relationship.deleteOne();

    res.json({
      success: true,
      message: 'Family relationship removed successfully'
    });

  } catch (error) {
    console.error('Error removing family relationship:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing relationship'
    });
  }
};

// Get family notifications
export const getFamilyNotifications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parentId = req.user!.id;
    const { page = 1, limit = 20 } = req.query;

    // This would typically come from a notifications collection
    // For now, we'll return recent activities from all children
    const familyRelationships = await FamilyRelationship.find({
      parent: parentId,
      isVerified: true
    }).populate('children', 'name');

    const childrenIds = familyRelationships.reduce((acc, rel) => {
      acc.push(...rel.children.map(child => child._id || child));
      return acc;
    }, [] as mongoose.Types.ObjectId[]);

    // Fetch recent activities
    const [recentProgress, recentDrills, recentBadges] = await Promise.all([
      UserProgress.find({ 
        userId: { $in: childrenIds },
        updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      })
      .populate('userId', 'name')
      .populate('moduleId', 'title')
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit as string)),
      
      DrillSession.find({ 
        userId: { $in: childrenIds },
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      })
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string)),
      
      Badge.find({ 
        user: { $in: childrenIds },
        earnedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      })
      .populate('user', 'name')
      .sort({ earnedAt: -1 })
      .limit(parseInt(limit as string))
    ]);

    // Format notifications
    const notifications = [
      ...recentProgress.map(p => ({
        type: 'module_progress',
        title: `${(p.userId as any).name} completed a module`,
        message: `Completed "${(p.moduleId as any).title}" with ${p.score}% score`,
        timestamp: p.updatedAt,
        data: p
      })),
      ...recentDrills.map(d => ({
        type: 'drill_completed',
        title: `${(d.userId as any).name} completed a drill`,
        message: `Completed "${d.drillType}" drill`,
        timestamp: d.createdAt,
        data: d
      })),
      ...recentBadges.map(b => ({
        type: 'badge_earned',
        title: `${(b.user as any).name} earned a badge`,
        message: `Earned "${b.name}" badge`,
        timestamp: b.createdAt,
        data: b
      }))
    ].sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0));

    res.json({
      success: true,
      data: {
        notifications: notifications.slice(0, parseInt(limit as string)),
        hasMore: notifications.length > parseInt(limit as string),
        total: notifications.length
      }
    });

  } catch (error) {
    console.error('Error fetching family notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching notifications'
    });
  }
};

export default {
  linkChildAccount,
  verifyFamilyRelationship,
  getParentDashboard,
  getChildProgress,
  updateFamilySettings,
  removeFamilyRelationship,
  getFamilyNotifications
};
