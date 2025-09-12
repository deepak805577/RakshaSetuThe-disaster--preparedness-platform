import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import UserProgress from '../models/UserProgress';
import DrillSession from '../models/DrillSession';
import Badge from '../models/Badge';
import School from '../models/School';
import DisasterModule from '../models/DisasterModule';
import { VirtualDrill } from '../models/VirtualDrill';
import { DailyChallenge, UserChallenge, UserStreak } from '../models/DailyChallenge';
import FamilyRelationship from '../models/FamilyRelationship';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    email: string;
  };
}

// Platform-wide analytics (Admin only)
export const getPlatformAnalytics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Get date range from query params or default to last 30 days
    const { startDate, endDate, granularity = 'day' } = req.query;
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    // User Analytics
    const [totalUsers, newUsersThisPeriod, activeUsersThisPeriod] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ 
        createdAt: { $gte: start, $lte: end } 
      }),
      User.countDocuments({ 
        lastLogin: { $gte: start, $lte: end } 
      })
    ]);

    // User distribution by role
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // User distribution by district (Punjab-specific)
    const usersByDistrict = await User.aggregate([
      { $group: { _id: '$district', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // School Analytics
    const [totalSchools, schoolsWithActiveUsers] = await Promise.all([
      School.countDocuments(),
      User.distinct('school').then(schools => schools.length)
    ]);

    // Learning Analytics
    const [totalModules, totalModuleCompletions, avgModuleScore] = await Promise.all([
      DisasterModule.countDocuments(),
      UserProgress.countDocuments({ completed: true }),
      UserProgress.aggregate([
        { $match: { completed: true } },
        { $group: { _id: null, avgScore: { $avg: '$score' } } }
      ]).then(result => result[0]?.avgScore || 0)
    ]);

    // Drill Analytics
    const [totalDrills, totalDrillSessions, avgDrillScore] = await Promise.all([
      VirtualDrill.countDocuments(),
      DrillSession.countDocuments({ completed: true }),
      DrillSession.aggregate([
        { $match: { completed: true } },
        { $group: { _id: null, avgScore: { $avg: '$score' } } }
      ]).then(result => result[0]?.avgScore || 0)
    ]);

    // Engagement Analytics
    const [totalBadges, totalChallengesCompleted, totalActiveStreaks] = await Promise.all([
      Badge.countDocuments(),
      UserChallenge.countDocuments({ status: 'completed' }),
      UserStreak.countDocuments({ currentStreak: { $gt: 0 } })
    ]);

    // Time-series data for charts
    const getTimeSeriesQuery = (collection: any, dateField: string) => {
      const groupBy = granularity === 'hour' 
        ? { $dateToString: { format: '%Y-%m-%d %H:00', date: `$${dateField}` } }
        : granularity === 'week'
        ? { $dateToString: { format: '%Y-W%U', date: `$${dateField}` } }
        : { $dateToString: { format: '%Y-%m-%d', date: `$${dateField}` } };

      return collection.aggregate([
        { $match: { [dateField]: { $gte: start, $lte: end } } },
        { $group: { _id: groupBy, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]);
    };

    const [userRegistrations, moduleCompletions, drillSessions] = await Promise.all([
      getTimeSeriesQuery(User, 'createdAt'),
      getTimeSeriesQuery(UserProgress.find({ completed: true }), 'updatedAt'),
      getTimeSeriesQuery(DrillSession.find({ completed: true }), 'createdAt')
    ]);

    // Performance metrics by disaster type
    const performanceByDisasterType = await UserProgress.aggregate([
      {
        $lookup: {
          from: 'disastermodules',
          localField: 'module',
          foreignField: '_id',
          as: 'moduleData'
        }
      },
      { $unwind: '$moduleData' },
      {
        $group: {
          _id: '$moduleData.type',
          avgScore: { $avg: '$score' },
          completionCount: { $sum: 1 },
          avgTimeSpent: { $avg: '$timeSpent' }
        }
      },
      { $sort: { avgScore: -1 } }
    ]);

    // Top performing schools
    const topSchools = await UserProgress.aggregate([
      { $match: { completed: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userData'
        }
      },
      { $unwind: '$userData' },
      {
        $group: {
          _id: '$userData.school',
          avgScore: { $avg: '$score' },
          totalCompletions: { $sum: 1 },
          uniqueUsers: { $addToSet: '$user' }
        }
      },
      {
        $addFields: {
          userCount: { $size: '$uniqueUsers' }
        }
      },
      { $sort: { avgScore: -1 } },
      { $limit: 10 }
    ]);

    // Challenge participation rates
    const challengeStats = await DailyChallenge.aggregate([
      {
        $lookup: {
          from: 'userchallenges',
          localField: '_id',
          foreignField: 'challenge',
          as: 'participations'
        }
      },
      {
        $addFields: {
          participationRate: {
            $cond: {
              if: { $gt: ['$maxParticipants', 0] },
              then: { $divide: [{ $size: '$participations' }, '$maxParticipants'] },
              else: 0
            }
          },
          completionRate: {
            $divide: [
              {
                $size: {
                  $filter: {
                    input: '$participations',
                    cond: { $eq: ['$$this.status', 'completed'] }
                  }
                }
              },
              { $max: [{ $size: '$participations' }, 1] }
            ]
          }
        }
      },
      {
        $group: {
          _id: '$type',
          avgParticipationRate: { $avg: '$participationRate' },
          avgCompletionRate: { $avg: '$completionRate' },
          totalChallenges: { $sum: 1 }
        }
      }
    ]);

    // Family engagement metrics
    const familyStats = await FamilyRelationship.aggregate([
      {
        $match: { isVerified: true }
      },
      {
        $group: {
          _id: null,
          totalFamilyLinks: { $sum: 1 },
          avgChildrenPerParent: { $avg: { $size: '$children' } }
        }
      }
    ]);

    const analyticsData = {
      summary: {
        totalUsers,
        newUsersThisPeriod,
        activeUsersThisPeriod,
        totalSchools,
        schoolsWithActiveUsers,
        totalModules,
        totalDrills,
        totalBadges
      },
      engagement: {
        moduleCompletions: totalModuleCompletions,
        drillSessions: totalDrillSessions,
        challengesCompleted: totalChallengesCompleted,
        activeStreaks: totalActiveStreaks,
        avgModuleScore: Math.round(avgModuleScore * 100) / 100,
        avgDrillScore: Math.round(avgDrillScore * 100) / 100
      },
      distribution: {
        usersByRole: usersByRole.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {} as Record<string, number>),
        usersByDistrict: usersByDistrict.slice(0, 10), // Top 10 districts
        performanceByDisasterType,
        topSchools: topSchools.map(school => ({
          school: school._id,
          avgScore: Math.round(school.avgScore * 100) / 100,
          totalCompletions: school.totalCompletions,
          userCount: school.userCount
        }))
      },
      timeSeries: {
        userRegistrations: userRegistrations.map(item => ({
          date: item._id,
          count: item.count
        })),
        moduleCompletions: moduleCompletions.map(item => ({
          date: item._id,
          count: item.count
        })),
        drillSessions: drillSessions.map(item => ({
          date: item._id,
          count: item.count
        }))
      },
      challenges: {
        participationRates: challengeStats,
        totalActive: await DailyChallenge.countDocuments({ 
          isActive: true,
          validDate: { $lte: new Date() },
          expiryDate: { $gt: new Date() }
        })
      },
      family: {
        totalFamilyLinks: familyStats[0]?.totalFamilyLinks || 0,
        avgChildrenPerParent: Math.round((familyStats[0]?.avgChildrenPerParent || 0) * 100) / 100
      },
      metadata: {
        generatedAt: new Date(),
        period: { start, end },
        granularity
      }
    };

    res.json({
      success: true,
      data: analyticsData
    });

  } catch (error) {
    console.error('Error generating platform analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate platform analytics'
    });
  }
};

// School-specific analytics (Admin/Teacher)
export const getSchoolAnalytics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { schoolId } = req.params;
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    // Verify access (admin or teacher from the same school)
    if (req.user!.role !== 'admin') {
      const userSchool = await User.findById(req.user!.id).select('school');
      if (userSchool?.school !== schoolId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this school\'s analytics'
        });
      }
    }

    // School basic info
    const school = await School.findById(schoolId);
    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }

    // Students, teachers, and parents in this school
    const [students, teachers, parents] = await Promise.all([
      User.find({ school: schoolId, role: 'student' }),
      User.find({ school: schoolId, role: 'teacher' }),
      User.find({ school: schoolId, role: 'parent' })
    ]);

    const studentIds = students.map(s => s._id);
    const teacherIds = teachers.map(t => t._id);

    // Learning progress for school students
    const [moduleProgress, drillProgress] = await Promise.all([
      UserProgress.find({ 
        user: { $in: studentIds },
        updatedAt: { $gte: start, $lte: end }
      }).populate('user', 'name grade').populate('module', 'title type'),
      DrillSession.find({ 
        user: { $in: studentIds },
        createdAt: { $gte: start, $lte: end }
      }).populate('user', 'name grade').populate('drill', 'title type')
    ]);

    // Class-wise performance
    const performanceByGrade = await UserProgress.aggregate([
      { $match: { 
        user: { $in: studentIds },
        completed: true,
        updatedAt: { $gte: start, $lte: end }
      }},
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userData'
        }
      },
      { $unwind: '$userData' },
      {
        $group: {
          _id: '$userData.grade',
          avgScore: { $avg: '$score' },
          totalCompletions: { $sum: 1 },
          students: { $addToSet: '$user' }
        }
      },
      {
        $addFields: {
          studentCount: { $size: '$students' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Top performing students
    const topStudents = await UserProgress.aggregate([
      { $match: { 
        user: { $in: studentIds },
        completed: true
      }},
      {
        $group: {
          _id: '$user',
          avgScore: { $avg: '$score' },
          totalCompletions: { $sum: 1 },
          totalXP: { $sum: '$xpEarned' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userData'
        }
      },
      { $unwind: '$userData' },
      { $sort: { avgScore: -1 } },
      { $limit: 10 },
      {
        $project: {
          name: '$userData.name',
          grade: '$userData.grade',
          avgScore: 1,
          totalCompletions: 1,
          totalXP: 1
        }
      }
    ]);

    // Challenge participation for school
    const challengeParticipation = await UserChallenge.aggregate([
      { $match: { user: { $in: studentIds } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Streak analysis
    const streakAnalysis = await UserStreak.aggregate([
      { $match: { user: { $in: studentIds } } },
      {
        $group: {
          _id: '$type',
          avgCurrentStreak: { $avg: '$currentStreak' },
          avgLongestStreak: { $avg: '$longestStreak' },
          totalUsers: { $sum: 1 }
        }
      }
    ]);

    // Family engagement for this school
    const familyEngagement = await FamilyRelationship.aggregate([
      { $match: { children: { $in: studentIds }, isVerified: true } },
      {
        $group: {
          _id: null,
          totalFamilyLinks: { $sum: 1 },
          childrenWithParents: { $sum: { $size: '$children' } }
        }
      }
    ]);

    // Recent activities timeline
    const recentActivities = await Promise.all([
      UserProgress.find({ 
        userId: { $in: studentIds },
        status: 'completed',
        updatedAt: { $gte: start, $lte: end }
      })
      .populate('userId', 'name grade')
      .populate('moduleId', 'title')
      .sort({ updatedAt: -1 })
      .limit(50),
      
      DrillSession.find({ 
        userId: { $in: studentIds },
        isCompleted: true,
        createdAt: { $gte: start, $lte: end }
      })
      .populate('userId', 'name grade')
      .populate('drillType', 'title')
      .sort({ createdAt: -1 })
      .limit(50)
    ]);

    const schoolAnalytics = {
      school: {
        id: school._id,
        name: school.name,
        district: school.address.district,
        totalStudents: students.length,
        totalTeachers: teachers.length,
        totalParents: parents.length
      },
      performance: {
        overallAvgScore: moduleProgress.length > 0 
          ? Math.round((moduleProgress.reduce((sum, p) => sum + p.score, 0) / moduleProgress.length) * 100) / 100
          : 0,
        totalModuleCompletions: moduleProgress.filter(p => p.status === 'completed').length,
        totalDrillCompletions: drillProgress.filter(d => d.isCompleted).length,
        performanceByGrade: performanceByGrade.map(grade => ({
          grade: grade._id,
          avgScore: Math.round(grade.avgScore * 100) / 100,
          totalCompletions: grade.totalCompletions,
          studentCount: grade.studentCount
        }))
      },
      students: {
        topPerformers: topStudents.map(student => ({
          name: student.name,
          grade: student.grade,
          avgScore: Math.round(student.avgScore * 100) / 100,
          completions: student.totalCompletions,
          xp: student.totalXP
        })),
        challengeParticipation: challengeParticipation.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {} as Record<string, number>)
      },
      engagement: {
        streakAnalysis: streakAnalysis,
        familyEngagement: {
          linkedFamilies: familyEngagement[0]?.totalFamilyLinks || 0,
          childrenWithParents: familyEngagement[0]?.childrenWithParents || 0,
          parentalEngagementRate: students.length > 0 
            ? Math.round(((familyEngagement[0]?.childrenWithParents || 0) / students.length) * 100)
            : 0
        }
      },
      recentActivities: [
        ...recentActivities[0].map(activity => ({
          type: 'module_completion',
          user: activity.userId,
          item: activity.moduleId,
          score: activity.score,
          timestamp: activity.updatedAt
        })),
        ...recentActivities[1].map(activity => ({
          type: 'drill_completion',
          user: activity.userId,
          item: activity.drillType,
          score: activity.score,
          timestamp: activity.createdAt
        }))
      ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 20),
      metadata: {
        generatedAt: new Date(),
        period: { start, end }
      }
    };

    res.json({
      success: true,
      data: schoolAnalytics
    });

  } catch (error) {
    console.error('Error generating school analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate school analytics'
    });
  }
};

// Personal analytics for individual users
export const getPersonalAnalytics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Learning progress
    const [moduleProgress, drillProgress, badges, streaks] = await Promise.all([
      UserProgress.find({ 
        userId: userId,
        updatedAt: { $gte: start, $lte: end }
      }).populate('moduleId', 'title type difficulty'),
      DrillSession.find({ 
        userId: userId,
        createdAt: { $gte: start, $lte: end }
      }),
      Badge.find({ user: userId }).sort({ createdAt: -1 }),
      UserStreak.find({ user: userId })
    ]);

    // Challenge participation
    const challenges = await UserChallenge.find({ 
      userId: userId,
      updatedAt: { $gte: start, $lte: end }
    }).populate('challenge', 'title type difficulty');

    // Performance trends
    const performanceTrend = moduleProgress
      .filter(p => p.status === 'completed')
      .sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime())
      .map(p => ({
        date: p.updatedAt.toISOString().split('T')[0],
        score: p.score,
        module: p.moduleId
      }));

    // Time spent analysis
    const timeSpentByType = await UserProgress.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), status: 'completed' } },
      {
        $lookup: {
          from: 'disastermodules',
          localField: 'moduleId',
          foreignField: '_id',
          as: 'moduleData'
        }
      },
      { $unwind: '$moduleData' },
      {
        $group: {
          _id: '$moduleData.type',
          totalTime: { $sum: '$timeSpent' },
          avgScore: { $avg: '$score' },
          completions: { $sum: 1 }
        }
      }
    ]);

    // Goal progress
    const monthlyGoals = {
      modules: 10, // Default goals - could be customizable
      drills: 5,
      challenges: 15
    };

    const monthlyProgress = {
      modules: moduleProgress.filter(p => p.status === 'completed').length,
      drills: drillProgress.filter(d => d.isCompleted).length,
      challenges: challenges.filter(c => c.status === 'completed').length
    };

    // Strengths and improvement areas
    const strengthsAndWeaknesses = timeSpentByType.map(type => ({
      type: type._id,
      avgScore: Math.round(type.avgScore * 100) / 100,
      completions: type.completions,
      totalTime: type.totalTime,
      category: type.avgScore >= 80 ? 'strength' : type.avgScore >= 60 ? 'moderate' : 'needs_improvement'
    }));

    const personalAnalytics = {
      profile: {
        name: user.name,
        role: user.role,
        grade: user.grade,
        school: user.school,
        district: user.district
      },
      summary: {
        totalModulesCompleted: moduleProgress.filter(p => p.status === 'completed').length,
        totalDrillsCompleted: drillProgress.filter(d => d.isCompleted).length,
        totalBadges: badges.length,
        totalXP: moduleProgress.reduce((sum, p) => sum + (p.xpEarned || 0), 0),
        totalPoints: moduleProgress.reduce((sum, p) => sum + (p.pointsEarned || 0), 0),
        avgScore: moduleProgress.length > 0 
          ? Math.round((moduleProgress.reduce((sum, p) => sum + p.score, 0) / moduleProgress.length) * 100) / 100
          : 0
      },
      progress: {
        performanceTrend,
        timeSpentByType: timeSpentByType.map(type => ({
          type: type._id,
          hours: Math.round((type.totalTime / 60) * 100) / 100,
          avgScore: Math.round(type.avgScore * 100) / 100,
          completions: type.completions
        })),
        monthlyGoals,
        monthlyProgress,
        goalCompletionRate: {
          modules: Math.round((monthlyProgress.modules / monthlyGoals.modules) * 100),
          drills: Math.round((monthlyProgress.drills / monthlyGoals.drills) * 100),
          challenges: Math.round((monthlyProgress.challenges / monthlyGoals.challenges) * 100)
        }
      },
      streaks: streaks.map(streak => ({
        type: streak.type,
        current: streak.currentStreak,
        longest: streak.longestStreak,
        totalDays: streak.totalActiveDays,
        lastActivity: streak.lastActivity,
        milestones: streak.milestones.filter(m => !m.rewardClaimed)
      })),
      strengths: strengthsAndWeaknesses
        .filter(item => item.category === 'strength')
        .sort((a, b) => b.avgScore - a.avgScore),
      improvementAreas: strengthsAndWeaknesses
        .filter(item => item.category === 'needs_improvement')
        .sort((a, b) => a.avgScore - b.avgScore),
      recentBadges: badges.slice(0, 5),
      challengeHistory: challenges.slice(0, 10).map(challenge => ({
        title: (challenge.challenge as any)?.title,
        type: (challenge.challenge as any)?.type,
        status: challenge.status,
        score: challenge.score,
        xpEarned: challenge.xpEarned,
        completedAt: challenge.completedAt
      })),
      metadata: {
        generatedAt: new Date(),
        period: { start, end }
      }
    };

    res.json({
      success: true,
      data: personalAnalytics
    });

  } catch (error) {
    console.error('Error generating personal analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate personal analytics'
    });
  }
};

// Generate compliance report for government authorities
export const getComplianceReport = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user!.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const { district, startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // Default 90 days
    const end = endDate ? new Date(endDate as string) : new Date();

    // Build query filters
    const districtFilter = district ? { district: district as string } : {};

    // Schools compliance data
    const schoolsData = await School.aggregate([
      { $match: districtFilter },
      {
        $lookup: {
          from: 'users',
          localField: 'name',
          foreignField: 'school',
          as: 'users'
        }
      },
      {
        $lookup: {
          from: 'userprogresses',
          localField: 'users._id',
          foreignField: 'userId',
          as: 'progress'
        }
      },
      {
        $addFields: {
          totalStudents: {
            $size: { $filter: { input: '$users', cond: { $eq: ['$$this.role', 'student'] } } }
          },
          totalTeachers: {
            $size: { $filter: { input: '$users', cond: { $eq: ['$$this.role', 'teacher'] } } }
          },
          completedModules: {
            $size: { $filter: { input: '$progress', cond: { $eq: ['$$this.completed', true] } } }
          },
          avgScore: { $avg: '$progress.score' }
        }
      },
      {
        $project: {
          name: 1,
          district: 1,
          address: 1,
          totalStudents: 1,
          totalTeachers: 1,
          completedModules: 1,
          avgScore: { $round: ['$avgScore', 2] },
          preparednessLevel: {
            $switch: {
              branches: [
                { case: { $gte: ['$avgScore', 80] }, then: 'High' },
                { case: { $gte: ['$avgScore', 60] }, then: 'Medium' },
                { case: { $gte: ['$avgScore', 40] }, then: 'Low' }
              ],
              default: 'Very Low'
            }
          }
        }
      }
    ]);

    // District-wise summary
    const districtSummary = await User.aggregate([
      { $match: { ...districtFilter, createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: '$district',
          totalUsers: { $sum: 1 },
          students: { $sum: { $cond: [{ $eq: ['$role', 'student'] }, 1, 0] } },
          teachers: { $sum: { $cond: [{ $eq: ['$role', 'teacher'] }, 1, 0] } },
          parents: { $sum: { $cond: [{ $eq: ['$role', 'parent'] }, 1, 0] } }
        }
      }
    ]);

    // Training completion rates
    const trainingCompletion = await UserProgress.aggregate([
      { $match: { completed: true, updatedAt: { $gte: start, $lte: end } } },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userData'
        }
      },
      { $unwind: '$userData' },
      { $match: district ? { 'userData.district': district } : {} },
      {
        $lookup: {
          from: 'disastermodules',
          localField: 'module',
          foreignField: '_id',
          as: 'moduleData'
        }
      },
      { $unwind: '$moduleData' },
      {
        $group: {
          _id: {
            district: '$userData.district',
            moduleType: '$moduleData.type'
          },
          completions: { $sum: 1 },
          avgScore: { $avg: '$score' }
        }
      }
    ]);

    // Emergency preparedness metrics
    const preparednessMetrics = await DrillSession.aggregate([
      { $match: { completed: true, createdAt: { $gte: start, $lte: end } } },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userData'
        }
      },
      { $unwind: '$userData' },
      { $match: district ? { 'userData.district': district } : {} },
      {
        $group: {
          _id: '$userData.district',
          totalDrills: { $sum: 1 },
          avgCompletionTime: { $avg: '$completionTime' },
          avgScore: { $avg: '$score' }
        }
      }
    ]);

    const complianceReport = {
      metadata: {
        generatedAt: new Date(),
        period: { start, end },
        district: district || 'All Districts',
        reportType: 'Government Compliance Report'
      },
      summary: {
        totalSchools: schoolsData.length,
        totalUsers: districtSummary.reduce((sum, d) => sum + d.totalUsers, 0),
        totalStudents: districtSummary.reduce((sum, d) => sum + d.students, 0),
        totalTeachers: districtSummary.reduce((sum, d) => sum + d.teachers, 0),
        totalParents: districtSummary.reduce((sum, d) => sum + d.parents, 0),
        avgPreparednessScore: schoolsData.reduce((sum, s) => sum + (s.avgScore || 0), 0) / Math.max(schoolsData.length, 1)
      },
      districtBreakdown: districtSummary,
      schoolsCompliance: schoolsData,
      trainingMetrics: {
        byDisasterType: trainingCompletion,
        overallCompletionRate: trainingCompletion.reduce((sum, t) => sum + t.completions, 0)
      },
      preparednessMetrics: preparednessMetrics.map(metric => ({
        district: metric._id,
        totalDrills: metric.totalDrills,
        avgCompletionTime: Math.round(metric.avgCompletionTime * 100) / 100,
        avgScore: Math.round(metric.avgScore * 100) / 100,
        preparednessRating: metric.avgScore >= 75 ? 'Excellent' : 
                           metric.avgScore >= 60 ? 'Good' : 
                           metric.avgScore >= 45 ? 'Fair' : 'Needs Improvement'
      })),
      recommendations: [
        {
          priority: 'High',
          area: 'Low Performing Schools',
          schools: schoolsData.filter(s => (s.avgScore || 0) < 60).map(s => s.name),
          action: 'Increase training focus and provide additional resources'
        },
        {
          priority: 'Medium', 
          area: 'Teacher Training',
          metric: `${districtSummary.reduce((sum, d) => sum + d.teachers, 0)} teachers registered`,
          action: 'Expand teacher training programs for disaster preparedness'
        },
        {
          priority: 'Medium',
          area: 'Parent Engagement',
          metric: `${Math.round((districtSummary.reduce((sum, d) => sum + d.parents, 0) / districtSummary.reduce((sum, d) => sum + d.students, 0)) * 100)}% parent participation`,
          action: 'Increase family engagement initiatives'
        }
      ]
    };

    res.json({
      success: true,
      data: complianceReport
    });

  } catch (error) {
    console.error('Error generating compliance report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate compliance report'
    });
  }
};

export default {
  getPlatformAnalytics,
  getSchoolAnalytics, 
  getPersonalAnalytics,
  getComplianceReport
};
