import { Request, Response } from 'express';
import DrillSession from '../models/DrillSession';
import User from '../models/User';
import { io } from '../server';

interface AuthRequest extends Request {
  user?: any;
}

// Drill templates for different types
const DRILL_TEMPLATES = {
  evacuation: {
    title: 'School Evacuation Drill',
    description: 'Practice safe evacuation procedures for emergency situations',
    steps: [
      {
        stepNumber: 1,
        description: 'Upon hearing the evacuation alarm, immediately stop all activities and listen for instructions.',
        isCompleted: false
      },
      {
        stepNumber: 2,
        description: 'Quickly but calmly turn off any equipment you are using (computers, lab equipment, etc.).',
        isCompleted: false
      },
      {
        stepNumber: 3,
        description: 'Leave bags and personal belongings behind unless specifically instructed otherwise.',
        isCompleted: false
      },
      {
        stepNumber: 4,
        description: 'Form a single file line and follow your teacher to the designated evacuation route.',
        isCompleted: false
      },
      {
        stepNumber: 5,
        description: 'Walk quickly but do not run. Keep noise to a minimum and listen for instructions.',
        isCompleted: false
      },
      {
        stepNumber: 6,
        description: 'Exit through the nearest safe exit as directed. Do not use elevators.',
        isCompleted: false
      },
      {
        stepNumber: 7,
        description: 'Proceed to the designated assembly point (usually the school playground or parking area).',
        isCompleted: false
      },
      {
        stepNumber: 8,
        description: 'Remain quiet and in line while your teacher takes attendance.',
        isCompleted: false
      },
      {
        stepNumber: 9,
        description: 'Stay at the assembly point until given the all-clear signal to return.',
        isCompleted: false
      },
      {
        stepNumber: 10,
        description: 'Return to class only when instructed by school officials.',
        isCompleted: false
      }
    ]
  },
  earthquake: {
    title: 'Earthquake Response Drill',
    description: 'Practice Drop, Cover, and Hold On procedure during earthquake',
    steps: [
      {
        stepNumber: 1,
        description: 'As soon as you feel shaking or hear "Earthquake!", immediately DROP to hands and knees.',
        isCompleted: false
      },
      {
        stepNumber: 2,
        description: 'Take COVER under a sturdy desk or table. If none available, cover head and neck with arms.',
        isCompleted: false
      },
      {
        stepNumber: 3,
        description: 'HOLD ON to your shelter and be prepared to move with it.',
        isCompleted: false
      },
      {
        stepNumber: 4,
        description: 'Stay in position until shaking stops completely (usually 1-2 minutes in drill).',
        isCompleted: false
      },
      {
        stepNumber: 5,
        description: 'After shaking stops, carefully look around for hazards before moving.',
        isCompleted: false
      },
      {
        stepNumber: 6,
        description: 'If evacuation is called, follow standard evacuation procedures carefully.',
        isCompleted: false
      },
      {
        stepNumber: 7,
        description: 'Watch for falling objects and move carefully to avoid debris.',
        isCompleted: false
      },
      {
        stepNumber: 8,
        description: 'Proceed to assembly point, staying alert for aftershocks.',
        isCompleted: false
      }
    ]
  },
  fire: {
    title: 'Fire Emergency Drill',
    description: 'Practice fire evacuation procedures and safety measures',
    steps: [
      {
        stepNumber: 1,
        description: 'Upon hearing fire alarm, immediately stop all activities.',
        isCompleted: false
      },
      {
        stepNumber: 2,
        description: 'If you see smoke, stay low and cover nose/mouth with cloth.',
        isCompleted: false
      },
      {
        stepNumber: 3,
        description: 'Feel doors before opening - if hot, find alternate route.',
        isCompleted: false
      },
      {
        stepNumber: 4,
        description: 'Close doors behind you as you exit to prevent fire spread.',
        isCompleted: false
      },
      {
        stepNumber: 5,
        description: 'Use stairs only - never use elevators during fire emergency.',
        isCompleted: false
      },
      {
        stepNumber: 6,
        description: 'Exit quickly but calmly, following designated fire evacuation routes.',
        isCompleted: false
      },
      {
        stepNumber: 7,
        description: 'Move far from the building to the designated assembly area.',
        isCompleted: false
      },
      {
        stepNumber: 8,
        description: 'Report to your teacher for attendance and wait for instructions.',
        isCompleted: false
      }
    ]
  },
  flood: {
    title: 'Flood Response Drill',
    description: 'Practice flood emergency response and evacuation procedures',
    steps: [
      {
        stepNumber: 1,
        description: 'Upon flood warning announcement, remain calm and listen carefully.',
        isCompleted: false
      },
      {
        stepNumber: 2,
        description: 'Gather only essential items if time permits (medicine, ID).',
        isCompleted: false
      },
      {
        stepNumber: 3,
        description: 'Move to higher ground immediately - upper floors or elevated areas.',
        isCompleted: false
      },
      {
        stepNumber: 4,
        description: 'Avoid walking or driving through moving water.',
        isCompleted: false
      },
      {
        stepNumber: 5,
        description: 'Follow evacuation routes to higher ground away from flood zones.',
        isCompleted: false
      },
      {
        stepNumber: 6,
        description: 'Stay together as a group and help others if safe to do so.',
        isCompleted: false
      },
      {
        stepNumber: 7,
        description: 'Proceed to designated flood evacuation center.',
        isCompleted: false
      },
      {
        stepNumber: 8,
        description: 'Wait for emergency services and follow their instructions.',
        isCompleted: false
      }
    ]
  }
};

// @desc    Get available drill types
// @route   GET /api/drills/types
// @access  Public
export const getDrillTypes = async (req: Request, res: Response) => {
  try {
    const drillTypes = Object.keys(DRILL_TEMPLATES).map(type => ({
      type,
      title: DRILL_TEMPLATES[type].title,
      description: DRILL_TEMPLATES[type].description,
      stepCount: DRILL_TEMPLATES[type].steps.length
    }));

    res.status(200).json({
      success: true,
      data: drillTypes
    });

  } catch (error) {
    console.error('Get drill types error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching drill types'
    });
  }
};

// @desc    Start a new drill session
// @route   POST /api/drills/start
// @access  Private
export const startDrill = async (req: AuthRequest, res: Response) => {
  try {
    const { drillType } = req.body;
    const userId = req.user.id;

    // Validate drill type
    if (!DRILL_TEMPLATES[drillType]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid drill type'
      });
    }

    // Check if user has an active drill session
    const activeDrill = await DrillSession.findOne({
      userId,
      isCompleted: false
    });

    if (activeDrill) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active drill session. Please complete or cancel it first.',
        activeDrill
      });
    }

    // Create new drill session
    const drillSession = await DrillSession.create({
      userId,
      drillType,
      startTime: new Date(),
      steps: DRILL_TEMPLATES[drillType].steps,
      isCompleted: false
    });

    // Emit drill started event via Socket.io
    const roomId = `drill-${userId}`;
    io.to(roomId).emit('drill-started', {
      sessionId: drillSession._id,
      drillType,
      title: DRILL_TEMPLATES[drillType].title,
      description: DRILL_TEMPLATES[drillType].description,
      totalSteps: drillSession.steps.length,
      startTime: drillSession.startTime
    });

    res.status(201).json({
      success: true,
      message: 'Drill session started successfully',
      data: {
        session: drillSession,
        template: DRILL_TEMPLATES[drillType]
      }
    });

  } catch (error) {
    console.error('Start drill error:', error);
    res.status(500).json({
      success: false,
      message: 'Error starting drill session'
    });
  }
};

// @desc    Complete a drill step
// @route   PUT /api/drills/:sessionId/step/:stepNumber
// @access  Private
export const completeStep = async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId, stepNumber } = req.params;
    const userId = req.user.id;
    const { completionTime } = req.body;

    // Find drill session
    const drillSession = await DrillSession.findOne({
      _id: sessionId,
      userId,
      isCompleted: false
    });

    if (!drillSession) {
      return res.status(404).json({
        success: false,
        message: 'Active drill session not found'
      });
    }

    // Find and update the specific step
    const stepIndex = drillSession.steps.findIndex(
      step => step.stepNumber === Number(stepNumber)
    );

    if (stepIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid step number'
      });
    }

    // Mark step as completed
    drillSession.steps[stepIndex].isCompleted = true;
    drillSession.steps[stepIndex].completionTime = completionTime || Math.floor((Date.now() - drillSession.startTime.getTime()) / 1000);

    await drillSession.save();

    // Check if all steps are completed
    const allCompleted = drillSession.steps.every(step => step.isCompleted);
    const completionPercentage = Math.round(
      (drillSession.steps.filter(step => step.isCompleted).length / drillSession.steps.length) * 100
    );

    // Emit step completion via Socket.io
    const roomId = `drill-${userId}`;
    io.to(roomId).emit('step-completed', {
      sessionId: drillSession._id,
      stepNumber: Number(stepNumber),
      completionTime: drillSession.steps[stepIndex].completionTime,
      completionPercentage,
      allCompleted
    });

    res.status(200).json({
      success: true,
      message: `Step ${stepNumber} completed successfully`,
      data: {
        step: drillSession.steps[stepIndex],
        completionPercentage,
        allCompleted,
        nextStep: allCompleted ? null : drillSession.steps.find(step => !step.isCompleted)
      }
    });

  } catch (error) {
    console.error('Complete step error:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing drill step'
    });
  }
};

// @desc    Complete entire drill session
// @route   PUT /api/drills/:sessionId/complete
// @access  Private
export const completeDrill = async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    // Find drill session
    const drillSession = await DrillSession.findOne({
      _id: sessionId,
      userId,
      isCompleted: false
    });

    if (!drillSession) {
      return res.status(404).json({
        success: false,
        message: 'Active drill session not found'
      });
    }

    // Calculate final score based on completion and speed
    const completedSteps = drillSession.steps.filter(step => step.isCompleted).length;
    const totalSteps = drillSession.steps.length;
    const completionRate = (completedSteps / totalSteps) * 100;
    
    const totalTime = Math.floor((Date.now() - drillSession.startTime.getTime()) / 1000);
    const averageTimePerStep = totalTime / totalSteps;
    
    // Scoring algorithm
    let score = completionRate; // Base score from completion
    
    // Bonus for speed (if average time per step < 30 seconds)
    if (averageTimePerStep < 30) {
      score += Math.min(20, 30 - averageTimePerStep);
    }
    
    // Cap at 100
    score = Math.min(100, Math.round(score));

    // Update drill session
    drillSession.isCompleted = true;
    drillSession.endTime = new Date();
    drillSession.totalTime = totalTime;
    drillSession.score = score;

    await drillSession.save();

    // Award points to user
    const user = await User.findById(userId);
    if (user) {
      const pointsEarned = Math.round(score * 2); // 2 points per score point
      user.points = (user.points || 0) + pointsEarned;
      await user.save();
    }

    // Emit drill completion via Socket.io
    const roomId = `drill-${userId}`;
    io.to(roomId).emit('drill-completed', {
      sessionId: drillSession._id,
      score,
      totalTime,
      completedSteps,
      totalSteps,
      pointsEarned: Math.round(score * 2)
    });

    res.status(200).json({
      success: true,
      message: 'Drill completed successfully!',
      data: {
        score,
        totalTime,
        completedSteps,
        totalSteps,
        pointsEarned: Math.round(score * 2),
        performance: score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Improvement'
      }
    });

  } catch (error) {
    console.error('Complete drill error:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing drill session'
    });
  }
};

// @desc    Get user's drill history
// @route   GET /api/drills/history
// @access  Private
export const getDrillHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const { limit = 20, page = 1 } = req.query;

    const drillSessions = await DrillSession.find({ userId })
      .sort({ startTime: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await DrillSession.countDocuments({ userId });

    const sessionsWithDetails = drillSessions.map(session => ({
      ...session.toObject(),
      template: {
        title: DRILL_TEMPLATES[session.drillType]?.title || 'Unknown Drill',
        description: DRILL_TEMPLATES[session.drillType]?.description || ''
      }
    }));

    res.status(200).json({
      success: true,
      count: drillSessions.length,
      total,
      data: sessionsWithDetails
    });

  } catch (error) {
    console.error('Get drill history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching drill history'
    });
  }
};

// @desc    Get current active drill session
// @route   GET /api/drills/active
// @access  Private
export const getActiveDrill = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;

    const activeDrill = await DrillSession.findOne({
      userId,
      isCompleted: false
    });

    if (!activeDrill) {
      return res.status(200).json({
        success: true,
        message: 'No active drill session',
        data: null
      });
    }

    res.status(200).json({
      success: true,
      data: {
        session: activeDrill,
        template: DRILL_TEMPLATES[activeDrill.drillType]
      }
    });

  } catch (error) {
    console.error('Get active drill error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching active drill session'
    });
  }
};
