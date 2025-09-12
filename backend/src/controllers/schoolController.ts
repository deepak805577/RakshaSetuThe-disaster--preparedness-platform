import { Request, Response } from 'express';
import School from '../models/School';
import User from '../models/User';
const expressValidator = require('express-validator');
const { validationResult } = expressValidator;
import { generateSchoolCode, calculateDistance } from '../utils/helpers';

interface AuthRequest extends Request {
  user?: any;
}

// @desc    Register new school
// @route   POST /api/schools/register
// @access  Public
export const registerSchool = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      name,
      type,
      board,
      address,
      contact,
      administration,
      infrastructure
    } = req.body;

    // Check if school already exists
    const existingSchool = await School.findOne({ 
      $or: [
        { name: name.trim(), 'address.district': address.district },
        { 'contact.email': contact.email }
      ]
    });

    if (existingSchool) {
      return res.status(400).json({
        success: false,
        message: 'School with this name/email already exists in the district'
      });
    }

    // Generate unique school code
    const schoolCode = await generateSchoolCode(address.district, type);

    // Create school
    const school = await School.create({
      name: name.trim(),
      code: schoolCode,
      type,
      board,
      address,
      contact,
      administration,
      infrastructure,
      verification: {
        isVerified: false,
        documents: []
      },
      subscription: {
        plan: 'basic',
        isActive: true,
        features: ['basic_modules', 'basic_drills', 'basic_analytics']
      },
      settings: {
        language: 'en',
        timezone: 'Asia/Kolkata',
        workingHours: {
          start: '08:00',
          end: '16:00'
        },
        emergencyProtocols: {
          lockdownProcedure: false,
          evacuationProcedure: false,
          communicationTree: false
        }
      }
    });

    // Calculate initial preparedness score
    await school.calculatePreparednessScore();
    await school.save();

    res.status(201).json({
      success: true,
      message: 'School registered successfully. Verification pending.',
      data: {
        school: {
          _id: school._id,
          name: school.name,
          code: school.code,
          type: school.type,
          district: school.address.district,
          isVerified: school.verification.isVerified,
          preparednessScore: school.preparedness.overallScore
        }
      }
    });

  } catch (error: any) {
    console.error('School registration error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'School code or contact email already exists'
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
      message: 'Server error during school registration'
    });
  }
};

// @desc    Get all schools (with filters)
// @route   GET /api/schools
// @access  Public
export const getSchools = async (req: Request, res: Response) => {
  try {
    const {
      district,
      type,
      board,
      verified,
      page = 1,
      limit = 10,
      search,
      sortBy = 'preparedness.overallScore',
      order = 'desc'
    } = req.query;

    // Build filter object
    const filter: any = { isActive: true };

    if (district) filter['address.district'] = district;
    if (type) filter.type = type;
    if (board) filter.board = board;
    if (verified !== undefined) filter['verification.isVerified'] = verified === 'true';

    // Add search functionality
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Sort object
    const sort: any = {};
    sort[sortBy as string] = order === 'desc' ? -1 : 1;

    const schools = await School.find(filter)
      .select('name code type board address.district address.city preparedness.overallScore verification.isVerified infrastructure.totalStudents createdAt')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await School.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: schools,
      pagination: {
        total,
        pages: Math.ceil(total / Number(limit)),
        currentPage: Number(page),
        limit: Number(limit)
      }
    });

  } catch (error) {
    console.error('Get schools error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching schools'
    });
  }
};

// @desc    Get school by ID
// @route   GET /api/schools/:id
// @access  Public
export const getSchoolById = async (req: Request, res: Response) => {
  try {
    const school = await School.findById(req.params.id);

    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }

    res.status(200).json({
      success: true,
      data: school
    });

  } catch (error) {
    console.error('Get school by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching school details'
    });
  }
};

// @desc    Update school details
// @route   PUT /api/schools/:id
// @access  Private (Admin/School Admin)
export const updateSchool = async (req: AuthRequest, res: Response) => {
  try {
    const school = await School.findById(req.params.id);

    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }

    // Check permissions
    if (req.user.role !== 'admin' && req.user.schoolId !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this school'
      });
    }

    const allowedUpdates = [
      'contact', 'administration', 'infrastructure', 'preparedness',
      'settings', 'hazardProfile'
    ];

    const updates = Object.keys(req.body);
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({
        success: false,
        message: 'Invalid updates'
      });
    }

    // Update school
    updates.forEach(update => {
      if (req.body[update] !== undefined) {
        (school as any)[update] = req.body[update];
      }
    });

    // Recalculate preparedness score if relevant fields updated
    if (updates.some(update => ['infrastructure', 'preparedness'].includes(update))) {
      await school.calculatePreparednessScore();
    }

    await school.save();

    res.status(200).json({
      success: true,
      message: 'School updated successfully',
      data: school
    });

  } catch (error: any) {
    console.error('Update school error:', error);
    
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
      message: 'Error updating school'
    });
  }
};

// @desc    Verify school
// @route   POST /api/schools/:id/verify
// @access  Private (Admin only)
export const verifySchool = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can verify schools'
      });
    }

    const school = await School.findById(req.params.id);

    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }

    if (school.verification.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'School is already verified'
      });
    }

    // Update verification status
    school.verification.isVerified = true;
    school.verification.verifiedBy = req.user.id;
    school.verification.verifiedAt = new Date();

    // Upgrade to premium features if applicable
    if (school.subscription.plan === 'basic') {
      school.subscription.features.push(
        'advanced_modules',
        'group_drills',
        'detailed_analytics',
        'custom_scenarios'
      );
    }

    await school.save();

    // TODO: Send verification email to school

    res.status(200).json({
      success: true,
      message: 'School verified successfully',
      data: {
        schoolId: school._id,
        verificationStatus: school.verification.isVerified,
        verifiedAt: school.verification.verifiedAt
      }
    });

  } catch (error) {
    console.error('Verify school error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying school'
    });
  }
};

// @desc    Get school analytics
// @route   GET /api/schools/:id/analytics
// @access  Private (School Admin/Admin)
export const getSchoolAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const school = await School.findById(req.params.id);

    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }

    // Check permissions
    if (req.user.role !== 'admin' && req.user.schoolId !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this school analytics'
      });
    }

    // Get user statistics
    const userStats = await User.aggregate([
      { $match: { schoolId: req.params.id, isActive: true } },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          averagePoints: { $avg: '$points' }
        }
      }
    ]);

    // Calculate preparedness score
    const currentScore = await school.calculatePreparednessScore();

    // Get recent drill data (would be from DrillSession model)
    // const recentDrills = await DrillSession.find({ schoolId: req.params.id })
    //   .sort({ createdAt: -1 })
    //   .limit(5);

    const analytics = {
      school: {
        id: school._id,
        name: school.name,
        code: school.code,
        district: school.address.district
      },
      preparedness: {
        overallScore: currentScore,
        lastDrillDate: school.preparedness.lastDrillDate,
        equipmentStatus: school.preparedness.equipmentStatus,
        staffTrainingLevel: school.preparedness.staffTrainingLevel
      },
      demographics: {
        totalStudents: school.infrastructure.totalStudents,
        totalTeachers: school.infrastructure.totalTeachers,
        totalStaff: school.infrastructure.totalStaff,
        userStats: userStats
      },
      infrastructure: {
        buildingFloors: school.infrastructure.buildingFloors,
        evacuationRoutes: school.infrastructure.evacuationRoutes,
        assemblyPoints: school.infrastructure.assemblyPoints
      },
      hazards: {
        overallLevel: school.getHazardLevel(),
        floodRisk: school.hazardProfile.floodRisk,
        earthquakeRisk: school.hazardProfile.earthquakeRisk,
        fireRisk: school.hazardProfile.fireRisk
      },
      engagement: {
        studentEngagement: school.analytics.studentEngagement,
        parentEngagement: school.analytics.parentEngagement,
        totalDrillsCompleted: school.analytics.totalDrillsCompleted,
        averageDrillScore: school.analytics.averageDrillScore
      },
      nextDrill: school.scheduleNextDrill()
    };

    res.status(200).json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Get school analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching school analytics'
    });
  }
};

// @desc    Upload school documents
// @route   POST /api/schools/:id/documents
// @access  Private (School Admin)
export const uploadDocuments = async (req: AuthRequest, res: Response) => {
  try {
    const school = await School.findById(req.params.id);

    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }

    // Check permissions
    if (req.user.schoolId !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to upload documents for this school'
      });
    }

    const { type, url } = req.body;

    if (!type || !url) {
      return res.status(400).json({
        success: false,
        message: 'Document type and URL are required'
      });
    }

    // Add document to school
    school.verification.documents.push({
      type,
      url,
      uploadedAt: new Date()
    });

    await school.save();

    res.status(200).json({
      success: true,
      message: 'Document uploaded successfully',
      data: school.verification.documents
    });

  } catch (error) {
    console.error('Upload documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading documents'
    });
  }
};

// @desc    Search schools by location
// @route   GET /api/schools/nearby
// @access  Public
export const findNearbySchools = async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, radius = 10, limit = 10 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    // Find schools with coordinates
    const schools = await School.find({
      'address.coordinates.latitude': { $exists: true },
      'address.coordinates.longitude': { $exists: true },
      isActive: true
    }).select('name code address preparedness.overallScore infrastructure.totalStudents');

    // Calculate distance and filter
    const nearbySchools = schools.filter(school => {
      const distance = calculateDistance(
        Number(latitude),
        Number(longitude),
        school.address.coordinates!.latitude,
        school.address.coordinates!.longitude
      );
      
      (school as any).distance = distance;
      return distance <= Number(radius);
    }).sort((a, b) => (a as any).distance - (b as any).distance)
      .slice(0, Number(limit));

    res.status(200).json({
      success: true,
      data: nearbySchools,
      count: nearbySchools.length
    });

  } catch (error) {
    console.error('Find nearby schools error:', error);
    res.status(500).json({
      success: false,
      message: 'Error finding nearby schools'
    });
  }
};

// @desc    Get district-wise school statistics
// @route   GET /api/schools/stats/district
// @access  Public
export const getDistrictStats = async (req: Request, res: Response) => {
  try {
    const stats = await School.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$address.district',
          totalSchools: { $sum: 1 },
          verifiedSchools: {
            $sum: { $cond: ['$verification.isVerified', 1, 0] }
          },
          totalStudents: { $sum: '$infrastructure.totalStudents' },
          averagePreparedness: { $avg: '$preparedness.overallScore' },
          schoolTypes: {
            $push: '$type'
          }
        }
      },
      {
        $addFields: {
          verificationRate: {
            $multiply: [
              { $divide: ['$verifiedSchools', '$totalSchools'] },
              100
            ]
          }
        }
      },
      { $sort: { totalSchools: -1 } }
    ]);

    // Process school types distribution
    const processedStats = stats.map(district => {
      const typeCount = district.schoolTypes.reduce((acc: any, type: string) => {
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      return {
        district: district._id,
        totalSchools: district.totalSchools,
        verifiedSchools: district.verifiedSchools,
        verificationRate: Math.round(district.verificationRate),
        totalStudents: district.totalStudents,
        averagePreparedness: Math.round(district.averagePreparedness),
        schoolTypes: typeCount
      };
    });

    res.status(200).json({
      success: true,
      data: processedStats
    });

  } catch (error) {
    console.error('Get district stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching district statistics'
    });
  }
};

export default {
  registerSchool,
  getSchools,
  getSchoolById,
  updateSchool,
  verifySchool,
  getSchoolAnalytics,
  uploadDocuments,
  findNearbySchools,
  getDistrictStats
};
