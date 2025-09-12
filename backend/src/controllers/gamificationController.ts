import { Request, Response } from 'express';
import User from '../models/User';
import Badge from '../models/Badge';
import UserProgress from '../models/UserProgress';
import { ILeaderboard } from '../types';

interface AuthRequest extends Request {
  user?: any;
}

// @desc    Get all badges
// @route   GET /api/gamification/badges
// @access  Public
export const getBadges = async (req: Request, res: Response) => {
  try {
    const badges = await Badge.find().sort({ points: -1 });

    res.status(200).json({
      success: true,
      count: badges.length,
      data: badges
    });

  } catch (error) {
    console.error('Get badges error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching badges'
    });
  }
};

// @desc    Get user's earned badges
// @route   GET /api/gamification/my-badges
// @access  Private
export const getUserBadges = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user.id).populate('badges');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      count: user.badges?.length || 0,
      data: user.badges || []
    });

  } catch (error) {
    console.error('Get user badges error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user badges'
    });
  }
};

// @desc    Check and award badges to user
// @route   POST /api/gamification/check-badges
// @access  Private
export const checkAndAwardBadges = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate('badges');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userProgress = await UserProgress.find({ 
      userId, 
      status: 'completed' 
    });

    const completedModules = userProgress.length;
    const totalScore = userProgress.reduce((sum, progress) => sum + (progress.score || 0), 0);
    const averageScore = completedModules > 0 ? totalScore / completedModules : 0;

    const newBadges = [];
    const allBadges = await Badge.find();
    const earnedBadgeIds = user.badges || [];

    // Check for new badges based on criteria
    for (const badge of allBadges) {
      if (earnedBadgeIds.includes(badge._id as string)) {
        continue; // Already earned
      }

      let shouldAward = false;

      switch (badge.name) {
        case 'First Steps':
          shouldAward = completedModules >= 1;
          break;
        case 'Knowledge Seeker':
          shouldAward = completedModules >= 3;
          break;
        case 'Disaster Expert':
          shouldAward = completedModules >= 5;
          break;
        case 'Perfect Score':
          shouldAward = userProgress.some(p => p.score === 100);
          break;
        case 'Consistent Learner':
          shouldAward = averageScore >= 85 && completedModules >= 3;
          break;
        case 'Speed Learner':
          shouldAward = userProgress.some(p => (p.timeSpent || 0) < 10); // Less than 10 minutes
          break;
        case 'Champion':
          shouldAward = user.points >= 1000;
          break;
        case 'Master':
          shouldAward = user.points >= 500 && averageScore >= 90;
          break;
        default:
          break;
      }

      if (shouldAward) {
        newBadges.push(badge);
        user.badges = user.badges || [];
        user.badges.push(badge._id as string);
        user.points = (user.points || 0) + badge.points;
      }
    }

    if (newBadges.length > 0) {
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: newBadges.length > 0 ? 'New badges awarded!' : 'No new badges at this time',
      data: {
        newBadges,
        totalBadges: user.badges?.length || 0,
        totalPoints: user.points || 0
      }
    });

  } catch (error) {
    console.error('Check badges error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking badges'
    });
  }
};

// @desc    Get global leaderboard
// @route   GET /api/gamification/leaderboard
// @access  Public
export const getGlobalLeaderboard = async (req: Request, res: Response) => {
  try {
    const { limit = 50, school, grade } = req.query;
    
    const matchQuery: any = { isActive: true };
    if (school) matchQuery.school = school;
    if (grade) matchQuery.grade = Number(grade);

    const leaderboard = await User.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: 'userprogresses',
          let: { userId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$userId', '$$userId'] },
                    { $eq: ['$status', 'completed'] }
                  ]
                }
              }
            }
          ],
          as: 'completedModules'
        }
      },
      {
        $addFields: {
          completedModulesCount: { $size: '$completedModules' },
          badgesCount: { $size: { $ifNull: ['$badges', []] } }
        }
      },
      {
        $sort: {
          points: -1,
          completedModulesCount: -1,
          badgesCount: -1
        }
      },
      {
        $limit: Number(limit)
      },
      {
        $project: {
          name: 1,
          school: 1,
          grade: 1,
          points: 1,
          completedModulesCount: 1,
          badgesCount: 1,
          profile: 1
        }
      }
    ]);

    // Add rank to each user
    const leaderboardWithRank: ILeaderboard[] = leaderboard.map((user, index) => ({
      userId: user._id,
      name: user.name,
      points: user.points || 0,
      badges: user.badgesCount || 0,
      completedModules: user.completedModulesCount || 0,
      rank: index + 1,
      school: user.school,
      grade: user.grade
    }));

    res.status(200).json({
      success: true,
      count: leaderboardWithRank.length,
      data: leaderboardWithRank
    });

  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching leaderboard'
    });
  }
};

// @desc    Get school-specific leaderboard
// @route   GET /api/gamification/leaderboard/school/:school
// @access  Public
export const getSchoolLeaderboard = async (req: Request, res: Response) => {
  try {
    const { school } = req.params;
    const { limit = 50, grade } = req.query;
    
    const matchQuery: any = { 
      isActive: true,
      school: school
    };
    
    if (grade) matchQuery.grade = Number(grade);

    const leaderboard = await User.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: 'userprogresses',
          let: { userId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$userId', '$$userId'] },
                    { $eq: ['$status', 'completed'] }
                  ]
                }
              }
            }
          ],
          as: 'completedModules'
        }
      },
      {
        $addFields: {
          completedModulesCount: { $size: '$completedModules' },
          badgesCount: { $size: { $ifNull: ['$badges', []] } }
        }
      },
      {
        $sort: {
          points: -1,
          completedModulesCount: -1,
          badgesCount: -1
        }
      },
      {
        $limit: Number(limit)
      },
      {
        $project: {
          name: 1,
          grade: 1,
          points: 1,
          completedModulesCount: 1,
          badgesCount: 1,
          profile: 1
        }
      }
    ]);

    const leaderboardWithRank: ILeaderboard[] = leaderboard.map((user, index) => ({
      userId: user._id,
      name: user.name,
      points: user.points || 0,
      badges: user.badgesCount || 0,
      completedModules: user.completedModulesCount || 0,
      rank: index + 1,
      school: school,
      grade: user.grade
    }));

    res.status(200).json({
      success: true,
      count: leaderboardWithRank.length,
      school: school,
      data: leaderboardWithRank
    });

  } catch (error) {
    console.error('Get school leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching school leaderboard'
    });
  }
};

// @desc    Create badge (Admin only)
// @route   POST /api/gamification/badges
// @access  Private (Admin)
export const createBadge = async (req: Request, res: Response) => {
  try {
    const badgeData = req.body;
    const badge = await Badge.create(badgeData);

    res.status(201).json({
      success: true,
      message: 'Badge created successfully',
      data: badge
    });

  } catch (error: any) {
    console.error('Create badge error:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Badge with this name already exists'
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating badge'
    });
  }
};
