import { Request, Response } from 'express';
import User from '../models/User';
import DisasterModule from '../models/DisasterModule';
import UserProgress from '../models/UserProgress';
import DrillSession from '../models/DrillSession';
import Badge from '../models/Badge';

interface AuthRequest extends Request {
  user?: any;
}

// @desc    Get dashboard analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin)
export const getDashboardAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    // Get total counts
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalModules = await DisasterModule.countDocuments();
    const totalDrillSessions = await DrillSession.countDocuments({ isCompleted: true });
    const totalBadges = await Badge.countDocuments();

    // User distribution by role
    const usersByRole = await User.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Users by district (from profile)
    const usersByDistrict = await User.aggregate([
      { $match: { isActive: true, 'profile.district': { $exists: true } } },
      { $group: { _id: '$profile.district', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Module completion stats
    const moduleCompletionStats = await UserProgress.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Top performing schools
    const topSchools = await User.aggregate([
      {
        $match: { 
          isActive: true, 
          school: { $exists: true, $ne: null },
          points: { $gt: 0 }
        }
      },
      {
        $group: {
          _id: '$school',
          totalStudents: { $sum: 1 },
          totalPoints: { $sum: '$points' },
          averagePoints: { $avg: '$points' }
        }
      },
      { $sort: { averagePoints: -1 } },
      { $limit: 10 }
    ]);

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const recentActivity = {
      newUsers: await User.countDocuments({ 
        createdAt: { $gte: sevenDaysAgo },
        isActive: true 
      }),
      completedModules: await UserProgress.countDocuments({ 
        completedAt: { $gte: sevenDaysAgo },
        status: 'completed'
      }),
      completedDrills: await DrillSession.countDocuments({ 
        endTime: { $gte: sevenDaysAgo },
        isCompleted: true
      })
    };

    // Module popularity
    const modulePopularity = await DisasterModule.aggregate([
      {
        $lookup: {
          from: 'userprogresses',
          localField: '_id',
          foreignField: 'moduleId',
          as: 'progress'
        }
      },
      {
        $project: {
          title: 1,
          type: 1,
          difficulty: 1,
          totalAttempts: { $size: '$progress' },
          completions: { 
            $size: { 
              $filter: { 
                input: '$progress', 
                cond: { $eq: ['$$this.status', 'completed'] } 
              } 
            } 
          }
        }
      },
      {
        $addFields: {
          completionRate: {
            $cond: {
              if: { $gt: ['$totalAttempts', 0] },
              then: { $multiply: [{ $divide: ['$completions', '$totalAttempts'] }, 100] },
              else: 0
            }
          }
        }
      },
      { $sort: { totalAttempts: -1 } }
    ]);

    // Drill performance by type
    const drillPerformance = await DrillSession.aggregate([
      { $match: { isCompleted: true } },
      {
        $group: {
          _id: '$drillType',
          totalSessions: { $sum: 1 },
          averageScore: { $avg: '$score' },
          averageTime: { $avg: '$totalTime' }
        }
      },
      { $sort: { totalSessions: -1 } }
    ]);

    // Badge distribution
    const badgeStats = await Badge.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'badges',
          as: 'holders'
        }
      },
      {
        $project: {
          name: 1,
          rarity: 1,
          points: 1,
          holdersCount: { $size: '$holders' }
        }
      },
      { $sort: { holdersCount: -1 } }
    ]);

    // Learning progress over time (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const learningProgress = await UserProgress.aggregate([
      {
        $match: {
          completedAt: { $gte: thirtyDaysAgo },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$completedAt' },
            month: { $month: '$completedAt' },
            day: { $dayOfMonth: '$completedAt' }
          },
          completions: { $sum: 1 },
          averageScore: { $avg: '$score' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalModules,
          totalDrillSessions,
          totalBadges
        },
        userDistribution: {
          byRole: usersByRole,
          byDistrict: usersByDistrict
        },
        moduleStats: {
          completionStats: moduleCompletionStats,
          popularity: modulePopularity
        },
        drillStats: {
          performance: drillPerformance
        },
        topSchools,
        recentActivity,
        badgeStats,
        learningProgress
      }
    });

  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard analytics'
    });
  }
};

// @desc    Get user management data
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getUsers = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      role, 
      school, 
      district, 
      search,
      isActive = 'true'
    } = req.query;

    const query: any = {};
    
    if (role) query.role = role;
    if (school) query.school = new RegExp(school as string, 'i');
    if (district) query['profile.district'] = district;
    if (isActive !== 'all') query.isActive = isActive === 'true';
    
    if (search) {
      query.$or = [
        { name: new RegExp(search as string, 'i') },
        { email: new RegExp(search as string, 'i') }
      ];
    }

    const users = await User.find(query)
      .populate('badges', 'name icon rarity')
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit))
      .select('-password');

    const total = await User.countDocuments(query);

    // Get progress stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const progress = await UserProgress.find({ userId: user._id });
        const completedModules = progress.filter(p => p.status === 'completed').length;
        const drillSessions = await DrillSession.countDocuments({ 
          userId: user._id, 
          isCompleted: true 
        });

        return {
          ...user.toObject(),
          stats: {
            completedModules,
            drillSessions,
            totalProgress: progress.length
          }
        };
      })
    );

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      data: usersWithStats
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
};

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin)
export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: user
    });

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user status'
    });
  }
};

// @desc    Get preparedness scores report
// @route   GET /api/admin/preparedness-scores
// @access  Private (Admin)
export const getPreparednessScores = async (req: Request, res: Response) => {
  try {
    const { school, grade, district, moduleType } = req.query;

    // Build user filter
    const userFilter: any = { isActive: true };
    if (school) userFilter.school = new RegExp(school as string, 'i');
    if (grade) userFilter.grade = Number(grade);
    if (district) userFilter['profile.district'] = district;

    // Get users matching criteria
    const users = await User.find(userFilter).select('_id name school grade profile.district');
    const userIds = users.map(u => u._id);

    if (userIds.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No users found matching criteria',
        data: []
      });
    }

    // Build progress filter
    const progressFilter: any = { 
      userId: { $in: userIds },
      status: 'completed'
    };

    // Get progress data with module details
    const progressData = await UserProgress.aggregate([
      { $match: progressFilter },
      {
        $lookup: {
          from: 'disastermodules',
          localField: 'moduleId',
          foreignField: '_id',
          as: 'module'
        }
      },
      { $unwind: '$module' },
      ...(moduleType ? [{ $match: { 'module.type': moduleType } }] : []),
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          userId: 1,
          userName: '$user.name',
          userSchool: '$user.school',
          userGrade: '$user.grade',
          userDistrict: '$user.profile.district',
          moduleTitle: '$module.title',
          moduleType: '$module.type',
          moduleDifficulty: '$module.difficulty',
          score: 1,
          timeSpent: 1,
          completedAt: 1,
          attempts: 1
        }
      }
    ]);

    // Calculate preparedness scores
    const preparednessReport = users.map(user => {
      const userProgress = progressData.filter(p => p.userId.toString() === user._id.toString());
      
      const totalModules = userProgress.length;
      const averageScore = totalModules > 0 
        ? Math.round(userProgress.reduce((sum, p) => sum + p.score, 0) / totalModules)
        : 0;
      
      const modulesByType = userProgress.reduce((acc, p) => {
        if (!acc[p.moduleType]) acc[p.moduleType] = [];
        acc[p.moduleType].push(p);
        return acc;
      }, {});

      const typeScores = Object.keys(modulesByType).map(type => ({
        type,
        averageScore: Math.round(
          modulesByType[type].reduce((sum, p) => sum + p.score, 0) / modulesByType[type].length
        ),
        moduleCount: modulesByType[type].length
      }));

      // Calculate preparedness level
      let preparednessLevel = 'Beginner';
      if (averageScore >= 90 && totalModules >= 5) preparednessLevel = 'Expert';
      else if (averageScore >= 80 && totalModules >= 3) preparednessLevel = 'Advanced';
      else if (averageScore >= 70 && totalModules >= 2) preparednessLevel = 'Intermediate';

      return {
        userId: user._id,
        name: user.name,
        school: user.school,
        grade: user.grade,
        district: user.profile?.district,
        completedModules: totalModules,
        averageScore,
        preparednessLevel,
        typeScores,
        lastActivity: totalModules > 0 
          ? userProgress.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())[0].completedAt
          : null
      };
    });

    // Sort by preparedness score
    preparednessReport.sort((a, b) => b.averageScore - a.averageScore);

    res.status(200).json({
      success: true,
      count: preparednessReport.length,
      filters: { school, grade, district, moduleType },
      data: preparednessReport
    });

  } catch (error) {
    console.error('Get preparedness scores error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching preparedness scores'
    });
  }
};

// @desc    Export data (CSV format)
// @route   GET /api/admin/export/:type
// @access  Private (Admin)
export const exportData = async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const { format = 'json' } = req.query;

    let data: any[] = [];
    let filename = '';

    switch (type) {
      case 'users':
        data = await User.find({ isActive: true })
          .populate('badges', 'name')
          .select('-password')
          .lean();
        filename = 'users_export';
        break;

      case 'progress':
        data = await UserProgress.find({ status: 'completed' })
          .populate('userId', 'name school grade')
          .populate('moduleId', 'title type difficulty')
          .lean();
        filename = 'progress_export';
        break;

      case 'drills':
        data = await DrillSession.find({ isCompleted: true })
          .populate('userId', 'name school grade')
          .lean();
        filename = 'drills_export';
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid export type'
        });
    }

    if (format === 'csv') {
      // Convert to CSV format (simplified)
      const csvData = convertToCSV(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      return res.send(csvData);
    }

    res.status(200).json({
      success: true,
      type,
      count: data.length,
      timestamp: new Date().toISOString(),
      data
    });

  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting data'
    });
  }
};

// Helper function to convert data to CSV
function convertToCSV(data: any[]): string {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [];
  
  csvRows.push(headers.join(','));
  
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value).replace(/"/g, '""');
      }
      return `"${String(value).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}

// @desc    Get all modules for admin
// @route   GET /api/admin/modules
// @access  Private (Admin)
export const getAllModulesAdmin = async (req: Request, res: Response) => {
  try {
    const modules = await DisasterModule.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: modules.length,
      data: modules
    });
  } catch (error) {
    console.error('Get admin modules error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching modules'
    });
  }
};

// @desc    Create new module
// @route   POST /api/admin/modules
// @access  Private (Admin)
export const createModuleAdmin = async (req: Request, res: Response) => {
  try {
    const moduleData = req.body;
    const module = await DisasterModule.create(moduleData);
    
    res.status(201).json({
      success: true,
      message: 'Module created successfully',
      data: module
    });
  } catch (error: any) {
    console.error('Create module error:', error);
    
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
      message: 'Error creating module'
    });
  }
};

// @desc    Update module
// @route   PUT /api/admin/modules/:id
// @access  Private (Admin)
export const updateModuleAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const module = await DisasterModule.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Module updated successfully',
      data: module
    });
  } catch (error: any) {
    console.error('Update module error:', error);
    
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
      message: 'Error updating module'
    });
  }
};

// @desc    Delete module
// @route   DELETE /api/admin/modules/:id
// @access  Private (Admin)
export const deleteModuleAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const module = await DisasterModule.findById(id);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }
    
    // Delete associated user progress
    await UserProgress.deleteMany({ moduleId: id });
    
    // Delete the module
    await DisasterModule.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Module deleted successfully'
    });
  } catch (error) {
    console.error('Delete module error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting module'
    });
  }
};

// @desc    Get all videos from all modules
// @route   GET /api/admin/videos
// @access  Private (Admin)
export const getAllVideosAdmin = async (req: Request, res: Response) => {
  try {
    const modules = await DisasterModule.find().select('_id title type content.videos');
    
    // Flatten all videos from all modules
    const allVideos: any[] = [];
    
    modules.forEach(module => {
      if (module.content?.videos) {
        module.content.videos.forEach((video: any) => {
          allVideos.push({
            ...video,
            moduleId: module._id,
            moduleTitle: module.title,
            moduleType: module.type,
            isActive: true // Default to active
          });
        });
      }
    });
    
    res.status(200).json({
      success: true,
      count: allVideos.length,
      data: allVideos
    });
  } catch (error) {
    console.error('Get all videos error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching videos'
    });
  }
};

// @desc    Add video to module
// @route   POST /api/admin/videos
// @access  Private (Admin)
export const addVideoToModule = async (req: Request, res: Response) => {
  try {
    const { moduleId, video } = req.body;
    
    if (!moduleId || !video) {
      return res.status(400).json({
        success: false,
        message: 'Module ID and video data are required'
      });
    }
    
    const module = await DisasterModule.findById(moduleId);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }
    
    // Generate unique video ID if not provided
    if (!video.id) {
      video.id = `${module.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Initialize videos array if it doesn't exist
    if (!module.content.videos) {
      module.content.videos = [];
    }
    
    // Add the video
    module.content.videos.push(video);
    await module.save();
    
    res.status(201).json({
      success: true,
      message: 'Video added successfully',
      data: {
        moduleId: module._id,
        video: video
      }
    });
  } catch (error) {
    console.error('Add video error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding video'
    });
  }
};

// @desc    Update video in module
// @route   PUT /api/admin/videos/:videoId
// @access  Private (Admin)
export const updateVideoInModule = async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;
    const { moduleId, videoData } = req.body;
    
    // Find the module containing the video
    let targetModule = null;
    if (moduleId) {
      targetModule = await DisasterModule.findById(moduleId);
    } else {
      // Search all modules for the video
      const modules = await DisasterModule.find();
      for (const module of modules) {
        if (module.content?.videos?.some((v: any) => v.id === videoId)) {
          targetModule = module;
          break;
        }
      }
    }
    
    if (!targetModule) {
      return res.status(404).json({
        success: false,
        message: 'Module or video not found'
      });
    }
    
    // Find and update the video
    const videoIndex = targetModule.content.videos.findIndex((v: any) => v.id === videoId);
    if (videoIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }
    
    // Update the video
    targetModule.content.videos[videoIndex] = {
      ...targetModule.content.videos[videoIndex],
      ...videoData,
      id: videoId // Preserve the original ID
    };
    
    await targetModule.save();
    
    res.status(200).json({
      success: true,
      message: 'Video updated successfully',
      data: {
        moduleId: targetModule._id,
        video: targetModule.content.videos[videoIndex]
      }
    });
  } catch (error) {
    console.error('Update video error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating video'
    });
  }
};

// @desc    Delete video from module
// @route   DELETE /api/admin/videos/:videoId
// @access  Private (Admin)
export const deleteVideoFromModule = async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;
    
    // Find the module containing the video
    const modules = await DisasterModule.find();
    let targetModule = null;
    
    for (const module of modules) {
      if (module.content?.videos?.some((v: any) => v.id === videoId)) {
        targetModule = module;
        break;
      }
    }
    
    if (!targetModule) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }
    
    // Remove the video
    targetModule.content.videos = targetModule.content.videos.filter((v: any) => v.id !== videoId);
    await targetModule.save();
    
    res.status(200).json({
      success: true,
      message: 'Video deleted successfully'
    });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting video'
    });
  }
};
