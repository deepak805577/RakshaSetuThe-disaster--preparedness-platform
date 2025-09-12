import { Request, Response } from 'express';
import DisasterModule from '../models/DisasterModule';
import UserProgress from '../models/UserProgress';
import User from '../models/User';

interface AuthRequest extends Request {
  user?: any;
}

// @desc    Get all disaster modules
// @route   GET /api/modules
// @access  Public
export const getModules = async (req: Request, res: Response) => {
  try {
    const { type, difficulty, limit = 10, page = 1 } = req.query;
    
    const query: any = {};
    if (type) query.type = type;
    if (difficulty) query.difficulty = difficulty;

    const modules = await DisasterModule.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit))
      .select('-quiz.questions.correctAnswer'); // Don't send correct answers initially

    const total = await DisasterModule.countDocuments(query);

    res.status(200).json({
      success: true,
      count: modules.length,
      total,
      data: modules
    });

  } catch (error) {
    console.error('Get modules error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching modules'
    });
  }
};

// @desc    Get single disaster module
// @route   GET /api/modules/:id
// @access  Public
export const getModule = async (req: Request, res: Response) => {
  try {
    const module = await DisasterModule.findById(req.params.id)
      .select('-quiz.questions.correctAnswer'); // Don't send correct answers

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    res.status(200).json({
      success: true,
      data: module
    });

  } catch (error) {
    console.error('Get module error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching module'
    });
  }
};

// @desc    Start module (track user progress)
// @route   POST /api/modules/:id/start
// @access  Private
export const startModule = async (req: AuthRequest, res: Response) => {
  try {
    const moduleId = req.params.id;
    const userId = req.user.id;

    // Check if module exists
    const module = await DisasterModule.findById(moduleId);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    // Check if user progress already exists
    let progress = await UserProgress.findOne({ userId, moduleId });
    
    if (!progress) {
      // Create new progress record
      progress = await UserProgress.create({
        userId,
        moduleId,
        status: 'in_progress',
        attempts: 1
      });
    } else {
      // Update existing progress
      progress.status = 'in_progress';
      progress.attempts += 1;
      await progress.save();
    }

    res.status(200).json({
      success: true,
      message: 'Module started successfully',
      data: {
        progress,
        module: {
          ...module.toObject(),
          quiz: {
            ...module.quiz,
            questions: module.quiz.questions.map(q => ({
              ...q,
              correctAnswer: undefined // Remove correct answer from response
            }))
          }
        }
      }
    });

  } catch (error) {
    console.error('Start module error:', error);
    res.status(500).json({
      success: false,
      message: 'Error starting module'
    });
  }
};

// @desc    Submit quiz answers
// @route   POST /api/modules/:id/submit-quiz
// @access  Private
export const submitQuiz = async (req: AuthRequest, res: Response) => {
  try {
    const moduleId = req.params.id;
    const userId = req.user.id;
    const { answers, timeSpent } = req.body;

    // Get module with correct answers
    const module = await DisasterModule.findById(moduleId);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    // Get user progress
    let progress = await UserProgress.findOne({ userId, moduleId });
    if (!progress) {
      return res.status(400).json({
        success: false,
        message: 'Please start the module first'
      });
    }

    // Calculate score
    let correctAnswers = 0;
    let totalPoints = 0;
    let earnedPoints = 0;
    
    const results = module.quiz.questions.map((question, index) => {
      const userAnswer = answers[question.id];
      const isCorrect = userAnswer === question.correctAnswer;
      
      if (isCorrect) {
        correctAnswers++;
        earnedPoints += question.points;
      }
      
      totalPoints += question.points;
      
      return {
        questionId: question.id,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        points: isCorrect ? question.points : 0,
        explanation: question.explanation
      };
    });

    const score = Math.round((earnedPoints / totalPoints) * 100);
    const passed = score >= module.quiz.passingScore;

    // Update user progress
    progress.score = score;
    progress.status = passed ? 'completed' : 'in_progress';
    progress.timeSpent += timeSpent || 0;
    await progress.save();

    // Update user points if passed
    let badgesEarned = [];
    if (passed) {
      const user = await User.findById(userId);
      if (user) {
        user.points = (user.points || 0) + earnedPoints;
        await user.save();
        
        // Check for badges (simple implementation)
        if (user.points >= 100 && !user.badges?.some(b => b.toString().includes('first'))) {
          badgesEarned.push('first_completion');
        }
        if (score === 100 && !user.badges?.some(b => b.toString().includes('perfect'))) {
          badgesEarned.push('perfect_score');
        }
      }

      // Update module completion count
      module.completions = (module.completions || 0) + 1;
      await module.save();
    }

    res.status(200).json({
      success: true,
      message: passed ? 'Quiz passed! Module completed.' : 'Quiz submitted. Try again to pass.',
      data: {
        score,
        passed,
        correctAnswers,
        totalQuestions: module.quiz.questions.length,
        earnedPoints,
        totalPoints,
        passingScore: module.quiz.passingScore,
        results,
        badgesEarned,
        progress
      }
    });

  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting quiz'
    });
  }
};

// @desc    Get user's module progress
// @route   GET /api/modules/progress
// @access  Private
export const getUserProgress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    const query: any = { userId };
    if (status) query.status = status;

    const progress = await UserProgress.find(query)
      .populate('moduleId', 'title type difficulty')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: progress.length,
      data: progress
    });

  } catch (error) {
    console.error('Get user progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching progress'
    });
  }
};

// @desc    Create new disaster module (Admin only)
// @route   POST /api/modules
// @access  Private (Admin)
export const createModule = async (req: Request, res: Response) => {
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
