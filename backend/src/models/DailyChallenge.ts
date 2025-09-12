import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from '../types';

export interface IDailyChallenge extends Document {
  title: string;
  description: string;
  type: 'quiz' | 'drill' | 'learning' | 'social' | 'family';
  difficulty: 'easy' | 'medium' | 'hard';
  xpReward: number;
  pointsReward: number;
  badgeReward?: string;
  requirements: {
    moduleCompletion?: string[];
    drillCompletion?: string[];
    scoreThreshold?: number;
    timeLimit?: number; // in minutes
    participantCount?: number; // for social challenges
  };
  targetAudience: {
    roles: ('student' | 'teacher' | 'parent')[];
    grades?: string[];
    districts?: string[];
  };
  validDate: Date;
  expiryDate: Date;
  isActive: boolean;
  maxParticipants?: number;
  currentParticipants: number;
  completionInstructions: string;
  hints?: string[];
  relatedContent?: {
    moduleId?: mongoose.Types.ObjectId;
    drillId?: mongoose.Types.ObjectId;
    resourceUrl?: string;
  };
  createdBy: mongoose.Types.ObjectId | IUser;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserChallenge extends Document {
  user: mongoose.Types.ObjectId | IUser;
  challenge: mongoose.Types.ObjectId | IDailyChallenge;
  status: 'assigned' | 'in_progress' | 'completed' | 'failed' | 'expired';
  startedAt?: Date;
  completedAt?: Date;
  score?: number;
  timeSpent?: number; // in minutes
  attempts: number;
  maxAttempts: number;
  progress: {
    currentStep: number;
    totalSteps: number;
    completedTasks: string[];
  };
  xpEarned: number;
  pointsEarned: number;
  badgeEarned?: string;
  notes?: string;
  submissionData?: any; // Flexible field for challenge-specific data
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserStreak extends Document {
  user: mongoose.Types.ObjectId | IUser;
  type: 'daily_login' | 'daily_challenge' | 'learning_modules' | 'drill_practice' | 'family_activities';
  currentStreak: number;
  longestStreak: number;
  lastActivity: Date;
  streakStartDate: Date;
  totalActiveDays: number;
  weeklyGoal: number;
  monthlyGoal: number;
  milestones: {
    days: number;
    achievedAt: Date;
    rewardClaimed: boolean;
    xpBonus: number;
    pointsBonus: number;
    badgeEarned?: string;
  }[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Daily Challenge Schema
const dailyChallengeSchema = new Schema<IDailyChallenge>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['quiz', 'drill', 'learning', 'social', 'family'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true,
    default: 'medium'
  },
  xpReward: {
    type: Number,
    required: true,
    min: 0
  },
  pointsReward: {
    type: Number,
    required: true,
    min: 0
  },
  badgeReward: {
    type: String,
    required: false
  },
  requirements: {
    moduleCompletion: [{
      type: Schema.Types.ObjectId,
      ref: 'DisasterModule'
    }],
    drillCompletion: [{
      type: Schema.Types.ObjectId,
      ref: 'VirtualDrill'
    }],
    scoreThreshold: {
      type: Number,
      min: 0,
      max: 100
    },
    timeLimit: {
      type: Number,
      min: 1
    },
    participantCount: {
      type: Number,
      min: 1
    }
  },
  targetAudience: {
    roles: [{
      type: String,
      enum: ['student', 'teacher', 'parent'],
      required: true
    }],
    grades: [{
      type: String
    }],
    districts: [{
      type: String
    }]
  },
  validDate: {
    type: Date,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  maxParticipants: {
    type: Number,
    min: 1
  },
  currentParticipants: {
    type: Number,
    default: 0,
    min: 0
  },
  completionInstructions: {
    type: String,
    required: true
  },
  hints: [{
    type: String
  }],
  relatedContent: {
    moduleId: {
      type: Schema.Types.ObjectId,
      ref: 'DisasterModule'
    },
    drillId: {
      type: Schema.Types.ObjectId,
      ref: 'VirtualDrill'
    },
    resourceUrl: {
      type: String
    }
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// User Challenge Schema
const userChallengeSchema = new Schema<IUserChallenge>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  challenge: {
    type: Schema.Types.ObjectId,
    ref: 'DailyChallenge',
    required: true
  },
  status: {
    type: String,
    enum: ['assigned', 'in_progress', 'completed', 'failed', 'expired'],
    default: 'assigned'
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  score: {
    type: Number,
    min: 0,
    max: 100
  },
  timeSpent: {
    type: Number,
    min: 0
  },
  attempts: {
    type: Number,
    default: 0,
    min: 0
  },
  maxAttempts: {
    type: Number,
    default: 3,
    min: 1
  },
  progress: {
    currentStep: {
      type: Number,
      default: 0,
      min: 0
    },
    totalSteps: {
      type: Number,
      required: true,
      min: 1
    },
    completedTasks: [{
      type: String
    }]
  },
  xpEarned: {
    type: Number,
    default: 0,
    min: 0
  },
  pointsEarned: {
    type: Number,
    default: 0,
    min: 0
  },
  badgeEarned: {
    type: String
  },
  notes: {
    type: String
  },
  submissionData: {
    type: Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// User Streak Schema
const userStreakSchema = new Schema<IUserStreak>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['daily_login', 'daily_challenge', 'learning_modules', 'drill_practice', 'family_activities'],
    required: true
  },
  currentStreak: {
    type: Number,
    default: 0,
    min: 0
  },
  longestStreak: {
    type: Number,
    default: 0,
    min: 0
  },
  lastActivity: {
    type: Date,
    required: true
  },
  streakStartDate: {
    type: Date,
    required: true
  },
  totalActiveDays: {
    type: Number,
    default: 0,
    min: 0
  },
  weeklyGoal: {
    type: Number,
    default: 5,
    min: 1
  },
  monthlyGoal: {
    type: Number,
    default: 20,
    min: 1
  },
  milestones: [{
    days: {
      type: Number,
      required: true
    },
    achievedAt: {
      type: Date,
      required: true
    },
    rewardClaimed: {
      type: Boolean,
      default: false
    },
    xpBonus: {
      type: Number,
      default: 0
    },
    pointsBonus: {
      type: Number,
      default: 0
    },
    badgeEarned: {
      type: String
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
dailyChallengeSchema.index({ validDate: 1, expiryDate: 1, isActive: 1 });
dailyChallengeSchema.index({ 'targetAudience.roles': 1 });
dailyChallengeSchema.index({ type: 1, difficulty: 1 });
dailyChallengeSchema.index({ createdBy: 1 });

userChallengeSchema.index({ user: 1, challenge: 1 }, { unique: true });
userChallengeSchema.index({ user: 1, status: 1 });
userChallengeSchema.index({ challenge: 1, status: 1 });
userChallengeSchema.index({ completedAt: 1 });

userStreakSchema.index({ user: 1, type: 1 }, { unique: true });
userStreakSchema.index({ lastActivity: 1 });
userStreakSchema.index({ currentStreak: -1 });

// Middleware to update streak when challenge is completed
userChallengeSchema.post('save', async function(doc: IUserChallenge) {
  if (doc.status === 'completed' && doc.isModified('status')) {
    try {
      const UserStreak = mongoose.model('UserStreak');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const streak = await UserStreak.findOne({ 
        user: doc.user, 
        type: 'daily_challenge' 
      });
      
      if (streak) {
        const lastActivityDate = new Date(streak.lastActivity);
        lastActivityDate.setHours(0, 0, 0, 0);
        const daysDiff = Math.floor((today.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          // Consecutive day - increment streak
          streak.currentStreak += 1;
          streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
        } else if (daysDiff === 0) {
          // Same day - don't increment streak but update activity
          // Already updated for today
        } else {
          // Streak broken - reset to 1
          streak.currentStreak = 1;
          streak.streakStartDate = today;
        }
        
        streak.lastActivity = new Date();
        streak.totalActiveDays += 1;
        
        // Check for milestone achievements
        const milestoneThresholds = [3, 7, 14, 30, 60, 100];
        for (const threshold of milestoneThresholds) {
          if (streak.currentStreak === threshold) {
            const existingMilestone = streak.milestones.find(m => m.days === threshold);
            if (!existingMilestone) {
              streak.milestones.push({
                days: threshold,
                achievedAt: new Date(),
                rewardClaimed: false,
                xpBonus: threshold * 10,
                pointsBonus: threshold * 5,
                badgeEarned: `${threshold}_day_streak`
              });
            }
          }
        }
        
        await streak.save();
      } else {
        // Create new streak record
        await UserStreak.create({
          user: doc.user,
          type: 'daily_challenge',
          currentStreak: 1,
          longestStreak: 1,
          lastActivity: new Date(),
          streakStartDate: today,
          totalActiveDays: 1
        });
      }
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  }
});

// Static methods for challenge management
dailyChallengeSchema.statics.getActiveChallengesForUser = function(userId: string, userRole: string, userGrade?: string, userDistrict?: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const query: any = {
    isActive: true,
    validDate: { $lte: today },
    expiryDate: { $gt: today },
    'targetAudience.roles': userRole
  };
  
  if (userGrade) {
    query['$or'] = [
      { 'targetAudience.grades': { $exists: false } },
      { 'targetAudience.grades': { $size: 0 } },
      { 'targetAudience.grades': userGrade }
    ];
  }
  
  if (userDistrict) {
    query['$or'] = query['$or'] || [];
    query['$or'].push(
      { 'targetAudience.districts': { $exists: false } },
      { 'targetAudience.districts': { $size: 0 } },
      { 'targetAudience.districts': userDistrict }
    );
  }
  
  return this.find(query).populate('relatedContent.moduleId relatedContent.drillId');
};

export const DailyChallenge = mongoose.model<IDailyChallenge>('DailyChallenge', dailyChallengeSchema);
export const UserChallenge = mongoose.model<IUserChallenge>('UserChallenge', userChallengeSchema);
export const UserStreak = mongoose.model<IUserStreak>('UserStreak', userStreakSchema);
