export interface IUser {
  _id?: string;
  name: string;
  email: string;
  password: string;
  role: 'student' | 'teacher' | 'admin' | 'parent';
  phone?: string;
  school?: string;
  grade?: number;
  points?: number;
  badges?: string[];
  isActive: boolean;
  lastLogin?: Date;
  profile?: {
    avatar?: string;
    district?: string;
    emergencyContact?: string;
  };
  district?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IDisasterModule {
  _id?: string;
  title: string;
  description: string;
  type: 'earthquake' | 'flood' | 'fire' | 'cyclone' | 'drought' | 'heatwave';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  content: {
    introduction: string;
    keyPoints: string[];
    preventionMeasures: string[];
    duringDisaster: string[];
    afterDisaster: string[];
    images?: string[];
    videos?: IVideo[];
  };
  quiz: IQuiz;
  completions?: number;
  ratings?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IQuiz {
  questions: IQuestion[];
  passingScore: number;
  timeLimit?: number; // in minutes
}

export interface IQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  points: number;
}

export interface IVideo {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail?: string;
  duration: number;
  section: 'introduction' | 'keyPoints' | 'preventionMeasures' | 'duringDisaster' | 'afterDisaster';
  isActive?: boolean;
}

export interface IUserProgress {
  _id?: string;
  userId: string;
  moduleId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  score?: number;
  attempts: number;
  timeSpent: number; // in minutes
  completedAt?: Date;
  completed?: boolean;
  user?: any;
  module?: any;
  xpEarned?: number;
  pointsEarned?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IDrillSession {
  _id?: string;
  userId: string;
  drillType: 'evacuation' | 'fire' | 'earthquake' | 'flood';
  startTime: Date;
  endTime?: Date;
  steps: IDrillStep[];
  totalTime?: number;
  score?: number;
  isCompleted: boolean;
  completed?: boolean;
  user?: any;
  drill?: any;
  createdAt?: Date;
}

export interface IDrillStep {
  stepNumber: number;
  description: string;
  isCompleted: boolean;
  completionTime?: number;
  feedback?: string;
}

export interface IEmergencyContact {
  _id?: string;
  name: string;
  designation: string;
  phone: string;
  email?: string;
  district: string;
  type: 'police' | 'fire' | 'medical' | 'disaster_management' | 'school_admin';
  isActive: boolean;
  createdAt?: Date;
}

export interface IPunjabAlert {
  _id?: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'weather' | 'earthquake' | 'flood' | 'fire' | 'health' | 'security';
  affectedDistricts: string[];
  isActive: boolean;
  validUntil: Date;
  actionRequired?: string;
  contactInfo?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IBadge {
  _id?: string;
  name: string;
  description: string;
  icon: string;
  criteria: string;
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  title?: string;
  user?: any;
  earnedAt?: Date;
  createdAt?: Date;
}

export interface ILeaderboard {
  userId: string;
  name: string;
  points: number;
  badges: number;
  completedModules: number;
  rank: number;
  school?: string;
  grade?: number;
}
