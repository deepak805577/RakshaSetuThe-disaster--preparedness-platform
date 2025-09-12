import { Request, Response } from 'express';
import DrillSession from '../models/DrillSession';
import User from '../models/User';
import { VirtualDrill, DrillSession as VirtualDrillSession } from '../models/VirtualDrill';
import { io } from '../server';
import mongoose from 'mongoose';

interface AuthRequest extends Request {
  user?: any;
}

interface DrillSessionData {
  id: string;
  scenario: any;
  participants: Array<{
    id: string;
    name: string;
    role: string;
    status: 'joined' | 'ready' | 'in_progress' | 'completed';
    score?: number;
  }>;
  status: 'lobby' | 'starting' | 'in_progress' | 'completed';
  maxParticipants: number;
  createdAt: Date;
  estimatedDuration: number;
}

// Enhanced drill scenarios with more sophisticated features
const ENHANCED_DRILL_SCENARIOS = {
  beginner: [
    {
      id: 'fire_basic_classroom',
      type: 'fire',
      name: '🔥 Basic Fire Drill - Classroom',
      description: 'Simple fire evacuation from classroom to assembly point',
      intensity: 'low',
      duration: 180,
      weatherCondition: 'clear',
      timeOfDay: 'morning',
      specialConditions: ['clear_visibility'],
      environmentalEffects: {
        visibility: 1.0,
        lighting: 1.0,
        soundLevel: 0.3,
        temperature: 22,
        windSpeed: 2
      },
      uniqueChallenges: [
        {
          id: 'door_check',
          name: 'Door Temperature Check',
          description: 'Check if doors are hot before opening',
          severity: 'low',
          requiredAction: 'Feel door with back of hand'
        }
      ],
      evacuationConstraints: ['walk_dont_run', 'stay_calm'],
      priorityAreas: ['classroom_ground_floor'],
      emergencyProtocols: [
        {
          step: 1,
          instruction: 'Stop all activities immediately',
          timing: 5,
          validationRequired: true,
          alternativeActions: ['raise_hand_if_confused']
        },
        {
          step: 2,
          instruction: 'Line up at door calmly',
          timing: 15,
          validationRequired: true,
          alternativeActions: ['follow_teacher_guidance']
        }
      ]
    },
    {
      id: 'earthquake_simple',
      type: 'earthquake',
      name: '🌍 Basic Earthquake Drill',
      description: 'Drop, Cover, Hold On procedure practice',
      intensity: 'medium',
      duration: 120,
      weatherCondition: 'clear',
      timeOfDay: 'afternoon',
      specialConditions: ['stable_furniture'],
      environmentalEffects: {
        visibility: 1.0,
        lighting: 1.0,
        soundLevel: 0.5,
        temperature: 25,
        windSpeed: 0
      },
      uniqueChallenges: [
        {
          id: 'drop_cover_hold',
          name: 'Drop Cover Hold',
          description: 'Execute proper earthquake response',
          severity: 'medium',
          requiredAction: 'Drop to knees, take cover, hold on'
        }
      ],
      evacuationConstraints: ['stay_under_desk', 'no_running_during_shaking'],
      priorityAreas: ['all_classrooms'],
      emergencyProtocols: [
        {
          step: 1,
          instruction: 'DROP to hands and knees immediately',
          timing: 3,
          validationRequired: true,
          alternativeActions: ['get_away_from_windows']
        }
      ]
    }
  ],
  intermediate: [
    {
      id: 'fire_chemistry_lab',
      type: 'fire',
      name: '🔥 Chemistry Lab Fire',
      description: 'Chemical fire emergency with toxic fumes',
      intensity: 'high',
      duration: 240,
      weatherCondition: 'clear',
      timeOfDay: 'afternoon',
      specialConditions: ['toxic_smoke', 'spreading_fire'],
      environmentalEffects: {
        visibility: 0.3,
        lighting: 0.4,
        soundLevel: 0.9,
        temperature: 35,
        windSpeed: 8
      },
      uniqueChallenges: [
        {
          id: 'chemical_hazard',
          name: 'Chemical Smoke Hazard',
          description: 'Navigate through toxic smoke areas',
          severity: 'high',
          requiredAction: 'Use wet cloth, stay low, find alternate route'
        },
        {
          id: 'equipment_shutdown',
          name: 'Lab Equipment Shutdown',
          description: 'Safely shut down lab equipment if possible',
          severity: 'medium',
          requiredAction: 'Turn off gas valves and electrical equipment'
        }
      ],
      evacuationConstraints: ['avoid_smoke', 'stay_low', 'no_elevators'],
      priorityAreas: ['chemistry_lab', 'adjacent_classrooms'],
      emergencyProtocols: [
        {
          step: 1,
          instruction: 'Alert others and activate fire alarm',
          timing: 10,
          validationRequired: true,
          alternativeActions: ['shout_fire_warning']
        },
        {
          step: 2,
          instruction: 'Shut down equipment if safe to do so',
          timing: 20,
          validationRequired: false,
          alternativeActions: ['evacuate_immediately_if_unsafe']
        }
      ]
    },
    {
      id: 'flood_ground_floor',
      type: 'flood',
      name: '🌊 Ground Floor Flood',
      description: 'Flash flood affecting ground floor areas',
      intensity: 'medium',
      duration: 300,
      weatherCondition: 'heavy_rain',
      timeOfDay: 'evening',
      specialConditions: ['rising_water', 'slippery_surfaces'],
      environmentalEffects: {
        visibility: 0.6,
        lighting: 0.5,
        soundLevel: 0.8,
        temperature: 18,
        windSpeed: 15
      },
      uniqueChallenges: [
        {
          id: 'water_navigation',
          name: 'Navigate Through Water',
          description: 'Safely move through ankle-deep water',
          severity: 'medium',
          requiredAction: 'Move slowly, test ground, help others'
        }
      ],
      evacuationConstraints: ['move_to_higher_ground', 'avoid_electrical_areas'],
      priorityAreas: ['ground_floor_all'],
      emergencyProtocols: [
        {
          step: 1,
          instruction: 'Move to higher ground immediately',
          timing: 30,
          validationRequired: true,
          alternativeActions: ['use_stairs_not_elevators']
        }
      ]
    }
  ],
  advanced: [
    {
      id: 'multi_hazard_fire_earthquake',
      type: 'multi_hazard',
      name: '🔥🌍 Fire + Earthquake Scenario',
      description: 'Earthquake triggers fire in multiple locations',
      intensity: 'critical',
      duration: 360,
      weatherCondition: 'windy',
      timeOfDay: 'night',
      specialConditions: ['multiple_fires', 'structural_damage', 'power_outage'],
      environmentalEffects: {
        visibility: 0.2,
        lighting: 0.1,
        soundLevel: 1.0,
        temperature: 28,
        windSpeed: 25
      },
      uniqueChallenges: [
        {
          id: 'route_blockage',
          name: 'Primary Route Blocked',
          description: 'Main evacuation route blocked by debris',
          severity: 'critical',
          requiredAction: 'Find alternate route, clear minor debris safely'
        },
        {
          id: 'injured_person',
          name: 'Assist Injured Person',
          description: 'Help person with mobility issues',
          severity: 'high',
          requiredAction: 'Provide assistance, call for help'
        }
      ],
      evacuationConstraints: ['avoid_damaged_areas', 'check_for_aftershocks'],
      priorityAreas: ['entire_building'],
      emergencyProtocols: [
        {
          step: 1,
          instruction: 'Assess immediate area for safety',
          timing: 15,
          validationRequired: true,
          alternativeActions: ['take_shelter_if_aftershock']
        }
      ]
    }
  ],
  expert: [
    {
      id: 'lockdown_active_threat',
      type: 'lockdown',
      name: '🔒 Active Threat Lockdown',
      description: 'Security lockdown with potential threat on campus',
      intensity: 'critical',
      duration: 600,
      weatherCondition: 'clear',
      timeOfDay: 'morning',
      specialConditions: ['limited_communication', 'uncertain_threat_location'],
      environmentalEffects: {
        visibility: 1.0,
        lighting: 1.0,
        soundLevel: 0.1,
        temperature: 22,
        windSpeed: 0
      },
      uniqueChallenges: [
        {
          id: 'silent_movement',
          name: 'Silent Movement Required',
          description: 'Move without making noise',
          severity: 'critical',
          requiredAction: 'Remove shoes, communicate with hand signals'
        },
        {
          id: 'decision_making',
          name: 'Run, Hide, or Fight Decision',
          description: 'Choose appropriate response based on situation',
          severity: 'critical',
          requiredAction: 'Assess threat proximity and choose safest option'
        }
      ],
      evacuationConstraints: ['maintain_silence', 'avoid_main_corridors'],
      priorityAreas: ['secure_classrooms'],
      emergencyProtocols: [
        {
          step: 1,
          instruction: 'Lock and barricade classroom door',
          timing: 30,
          validationRequired: true,
          alternativeActions: ['move_away_from_windows']
        }
      ]
    }
  ]
};

// @desc    Get enhanced drill scenarios based on difficulty
// @route   GET /api/enhanced-drills/scenarios
// @access  Private
export const getEnhancedScenarios = async (req: AuthRequest, res: Response) => {
  try {
    const { difficulty = 'intermediate' } = req.query;
    
    const scenarios = ENHANCED_DRILL_SCENARIOS[difficulty as keyof typeof ENHANCED_DRILL_SCENARIOS] || 
                     ENHANCED_DRILL_SCENARIOS.intermediate;

    res.status(200).json({
      success: true,
      data: {
        scenarios,
        difficulty,
        availableDifficulties: Object.keys(ENHANCED_DRILL_SCENARIOS)
      }
    });

  } catch (error) {
    console.error('Get enhanced scenarios error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching enhanced scenarios'
    });
  }
};

// @desc    Create a new enhanced drill session
// @route   POST /api/enhanced-drills/sessions
// @access  Private
export const createDrillSession = async (req: AuthRequest, res: Response) => {
  try {
    const { scenarioId, difficulty, maxParticipants = 30 } = req.body;
    const userId = req.user.id;

    // Find the scenario
    const allScenarios = Object.values(ENHANCED_DRILL_SCENARIOS).flat();
    const scenario = allScenarios.find(s => s.id === scenarioId);

    if (!scenario) {
      return res.status(400).json({
        success: false,
        message: 'Scenario not found'
      });
    }

    // Create session ID
    const sessionId = `session_${Date.now()}_${userId}`;

    // Create drill session data
    const sessionData: DrillSessionData = {
      id: sessionId,
      scenario,
      participants: [
        {
          id: userId,
          name: req.user.name || 'Host',
          role: req.user.role || 'student',
          status: 'ready'
        }
      ],
      status: 'lobby',
      maxParticipants,
      createdAt: new Date(),
      estimatedDuration: scenario.duration
    };

    // Store session in Redis/Memory (for simplicity, using memory)
    // In production, use Redis or database
    global.activeDrillSessions = global.activeDrillSessions || new Map();
    global.activeDrillSessions.set(sessionId, sessionData);

    // Create socket room
    const roomId = `drill-session-${sessionId}`;
    
    // Emit session created event
    io.emit('new-drill-session', {
      sessionId,
      scenario: scenario.name,
      host: req.user.name,
      participants: 1,
      maxParticipants,
      status: 'lobby'
    });

    res.status(201).json({
      success: true,
      message: 'Drill session created successfully',
      data: {
        sessionId,
        session: sessionData,
        roomId
      }
    });

  } catch (error) {
    console.error('Create drill session error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating drill session'
    });
  }
};

// @desc    Get active drill sessions
// @route   GET /api/enhanced-drills/sessions/active
// @access  Private
export const getActiveSessions = async (req: AuthRequest, res: Response) => {
  try {
    global.activeDrillSessions = global.activeDrillSessions || new Map();
    
    const activeSessions = Array.from(global.activeDrillSessions.values())
      .filter((session: any) => session.status !== 'completed');

    res.status(200).json({
      success: true,
      data: activeSessions
    });

  } catch (error) {
    console.error('Get active sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching active sessions'
    });
  }
};

// @desc    Join a drill session
// @route   POST /api/enhanced-drills/sessions/:sessionId/join
// @access  Private
export const joinDrillSession = async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    global.activeDrillSessions = global.activeDrillSessions || new Map();
    const session = global.activeDrillSessions.get(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    if (session.participants.length >= session.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Session is full'
      });
    }

    // Check if user already in session
    if (session.participants.find(p => p.id === userId)) {
      return res.status(400).json({
        success: false,
        message: 'You are already in this session'
      });
    }

    // Add participant
    session.participants.push({
      id: userId,
      name: req.user.name || 'Participant',
      role: req.user.role || 'student',
      status: 'joined'
    });

    // Update session
    global.activeDrillSessions.set(sessionId, session);

    // Emit participant joined event
    const roomId = `drill-session-${sessionId}`;
    io.to(roomId).emit('participant-joined', {
      sessionId,
      participant: {
        id: userId,
        name: req.user.name,
        role: req.user.role
      },
      participantCount: session.participants.length
    });

    res.status(200).json({
      success: true,
      message: 'Successfully joined session',
      data: { session }
    });

  } catch (error) {
    console.error('Join drill session error:', error);
    res.status(500).json({
      success: false,
      message: 'Error joining drill session'
    });
  }
};

// @desc    Get user drill statistics
// @route   GET /api/enhanced-drills/stats
// @access  Private
export const getUserStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;

    // Get drill sessions from database
    const completedDrills = await DrillSession.find({ 
      userId, 
      isCompleted: true 
    });

    // Calculate stats
    const totalDrills = completedDrills.length;
    const totalScore = completedDrills.reduce((sum, drill) => sum + (drill.score || 0), 0);
    const averageScore = totalDrills > 0 ? Math.round(totalScore / totalDrills) : 0;
    
    const completionTimes = completedDrills
      .filter(drill => drill.totalTime)
      .map(drill => drill.totalTime!);
    
    const bestTime = completionTimes.length > 0 ? Math.min(...completionTimes) : 0;
    
    // Calculate completion rate (completed vs attempted)
    const allAttempts = await DrillSession.find({ userId });
    const completionRate = allAttempts.length > 0 ? 
      Math.round((totalDrills / allAttempts.length) * 100) : 0;

    // Get user ranking
    const allUsers = await User.find({ role: 'student' }, { _id: 1, points: 1 })
      .sort({ points: -1 });
    
    const userIndex = allUsers.findIndex(u => u._id.toString() === userId);
    const rank = userIndex >= 0 ? userIndex + 1 : allUsers.length + 1;

    const stats = {
      totalDrills,
      averageScore,
      bestTime,
      completionRate,
      rank,
      totalUsers: allUsers.length,
      recentActivity: {
        lastDrillDate: completedDrills[0]?.startTime || null,
        drillsThisWeek: completedDrills.filter(drill => {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return drill.startTime >= weekAgo;
        }).length
      }
    };

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user statistics'
    });
  }
};

// @desc    Get user achievements
// @route   GET /api/enhanced-drills/achievements
// @access  Private
export const getUserAchievements = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;

    // Get user's completed drills
    const completedDrills = await DrillSession.find({ 
      userId, 
      isCompleted: true 
    });

    // Define achievements
    const allAchievements = [
      {
        id: 'first_drill',
        name: 'First Steps',
        description: 'Complete your first emergency drill',
        icon: '🎯',
        rarity: 'common',
        condition: (drills: any[]) => drills.length >= 1
      },
      {
        id: 'speed_demon',
        name: 'Speed Demon',
        description: 'Complete evacuation in under 2 minutes',
        icon: '⚡',
        rarity: 'rare',
        condition: (drills: any[]) => drills.some(d => d.totalTime && d.totalTime < 120)
      },
      {
        id: 'perfect_score',
        name: 'Perfect Performance',
        description: 'Achieve 100% score on any drill',
        icon: '🏆',
        rarity: 'legendary',
        condition: (drills: any[]) => drills.some(d => d.score === 100)
      },
      {
        id: 'dedicated_learner',
        name: 'Dedicated Learner',
        description: 'Complete 10 emergency drills',
        icon: '📚',
        rarity: 'rare',
        condition: (drills: any[]) => drills.length >= 10
      },
      {
        id: 'consistent_performer',
        name: 'Consistent Performer',
        description: 'Maintain 80%+ average score over 5 drills',
        icon: '🌟',
        rarity: 'epic',
        condition: (drills: any[]) => {
          if (drills.length < 5) return false;
          const total = drills.reduce((sum, d) => sum + (d.score || 0), 0);
          return (total / drills.length) >= 80;
        }
      },
      {
        id: 'fire_master',
        name: 'Fire Safety Master',
        description: 'Score 95%+ on 3 fire drills',
        icon: '🔥',
        rarity: 'epic',
        condition: (drills: any[]) => {
          const fireDrills = drills.filter(d => d.drillType === 'fire' && (d.score || 0) >= 95);
          return fireDrills.length >= 3;
        }
      }
    ];

    // Check which achievements are unlocked
    const achievements = allAchievements.map(achievement => {
      const unlocked = achievement.condition(completedDrills);
      return {
        ...achievement,
        unlockedAt: unlocked ? completedDrills[completedDrills.length - 1]?.createdAt || new Date() : undefined
      };
    });

    res.status(200).json({
      success: true,
      data: achievements
    });

  } catch (error) {
    console.error('Get user achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user achievements'
    });
  }
};

// @desc    Start drill session
// @route   POST /api/enhanced-drills/sessions/:sessionId/start
// @access  Private
export const startDrillSession = async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    global.activeDrillSessions = global.activeDrillSessions || new Map();
    const session = global.activeDrillSessions.get(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check if user is host (first participant)
    if (session.participants[0].id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only session host can start the drill'
      });
    }

    // Update session status
    session.status = 'in_progress';
    session.participants.forEach(p => p.status = 'in_progress');
    
    global.activeDrillSessions.set(sessionId, session);

    // Create database record
    const drillSession = await DrillSession.create({
      userId: session.participants[0].id,
      drillType: session.scenario.type === 'multi_hazard' ? 'fire' : session.scenario.type,
      startTime: new Date(),
      steps: session.scenario.emergencyProtocols.map((protocol: any, index: number) => ({
        stepNumber: index + 1,
        description: protocol.instruction,
        isCompleted: false
      })),
      isCompleted: false
    });

    // Emit session started event
    const roomId = `drill-session-${sessionId}`;
    io.to(roomId).emit('drill-session-started', {
      sessionId,
      scenario: session.scenario,
      dbSessionId: drillSession._id,
      startTime: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Drill session started',
      data: {
        session,
        dbSessionId: drillSession._id
      }
    });

  } catch (error) {
    console.error('Start drill session error:', error);
    res.status(500).json({
      success: false,
      message: 'Error starting drill session'
    });
  }
};

// @desc    Update participant status in session
// @route   PUT /api/enhanced-drills/sessions/:sessionId/participants/:participantId/status
// @access  Private
export const updateParticipantStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId, participantId } = req.params;
    const { status } = req.body;

    global.activeDrillSessions = global.activeDrillSessions || new Map();
    const session = global.activeDrillSessions.get(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    const participant = session.participants.find(p => p.id === participantId);
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant not found'
      });
    }

    participant.status = status;
    global.activeDrillSessions.set(sessionId, session);

    // Emit status update
    const roomId = `drill-session-${sessionId}`;
    io.to(roomId).emit('participant-status-updated', {
      sessionId,
      participantId,
      status,
      participant
    });

    res.status(200).json({
      success: true,
      data: { participant }
    });

  } catch (error) {
    console.error('Update participant status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating participant status'
    });
  }
};

// @desc    Get leaderboard
// @route   GET /api/enhanced-drills/leaderboard
// @access  Private
export const getLeaderboard = async (req: AuthRequest, res: Response) => {
  try {
    const { timeframe = 'all', limit = 50 } = req.query;

    let dateFilter = {};
    if (timeframe === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter = { startTime: { $gte: weekAgo } };
    } else if (timeframe === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      dateFilter = { startTime: { $gte: monthAgo } };
    }

    // Aggregate user drill statistics
    const leaderboard = await DrillSession.aggregate([
      {
        $match: { 
          isCompleted: true,
          ...dateFilter
        }
      },
      {
        $group: {
          _id: '$userId',
          totalDrills: { $sum: 1 },
          averageScore: { $avg: '$score' },
          bestScore: { $max: '$score' },
          totalTime: { $sum: '$totalTime' },
          averageTime: { $avg: '$totalTime' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          userId: '$_id',
          name: '$user.name',
          school: '$user.school',
          grade: '$user.grade',
          totalDrills: 1,
          averageScore: { $round: ['$averageScore', 1] },
          bestScore: 1,
          totalTime: 1,
          averageTime: { $round: ['$averageTime', 1] }
        }
      },
      {
        $sort: { averageScore: -1, totalDrills: -1 }
      },
      {
        $limit: Number(limit)
      }
    ]);

    // Add rankings
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));

    res.status(200).json({
      success: true,
      data: {
        leaderboard: rankedLeaderboard,
        timeframe,
        total: rankedLeaderboard.length
      }
    });

  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching leaderboard'
    });
  }
};

export default {
  getEnhancedScenarios,
  createDrillSession,
  getActiveSessions,
  joinDrillSession,
  getUserStats,
  getUserAchievements,
  startDrillSession,
  updateParticipantStatus,
  getLeaderboard
};
