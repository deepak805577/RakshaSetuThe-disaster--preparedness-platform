export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin' | 'parent';
  phone?: string;
  school?: string;
  grade?: number;
  points?: number;
  badges?: Badge[];
  isActive: boolean;
  lastLogin?: Date;
  profile?: {
    avatar?: string;
    district?: string;
    emergencyContact?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface VideoContent {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  duration: number;
  section: 'introduction' | 'preventionMeasures' | 'duringDisaster' | 'afterDisaster';
}

export interface DisasterModule {
  _id: string;
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
    videos?: VideoContent[];
  };
  quiz: Quiz;
  completions?: number;
  ratings?: number;
  estimatedTime?: number;
  totalQuizPoints?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Quiz {
  questions: Question[];
  passingScore: number;
  timeLimit?: number;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  points: number;
}

export interface UserProgress {
  _id: string;
  userId: string;
  moduleId: string | DisasterModule;
  status: 'not_started' | 'in_progress' | 'completed';
  score?: number;
  attempts: number;
  timeSpent: number;
  completedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DrillSession {
  _id: string;
  userId: string;
  drillType: 'evacuation' | 'fire' | 'earthquake' | 'flood';
  startTime: Date;
  endTime?: Date;
  steps: DrillStep[];
  totalTime?: number;
  score?: number;
  isCompleted: boolean;
  completionPercentage?: number;
  createdAt?: Date;
}

export interface DrillStep {
  stepNumber: number;
  description: string;
  isCompleted: boolean;
  completionTime?: number;
  feedback?: string;
}

export interface DrillTemplate {
  type: string;
  title: string;
  description: string;
  stepCount: number;
  steps?: DrillStep[];
}

export interface Badge {
  _id: string;
  name: string;
  description: string;
  icon: string;
  criteria: string;
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  createdAt?: Date;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  points: number;
  badges: number;
  completedModules: number;
  rank: number;
  school?: string;
  grade?: number;
}

export interface EmergencyContact {
  _id: string;
  name: string;
  designation: string;
  phone: string;
  email?: string;
  district: string;
  type: 'police' | 'fire' | 'medical' | 'disaster_management' | 'school_admin';
  isActive: boolean;
  createdAt?: Date;
}

export interface PunjabAlert {
  _id: string;
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

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  total?: number;
  errors?: string[];
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  totalPages?: number;
  currentPage?: number;
  limit?: number;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'teacher' | 'parent';
  phone?: string;
  school?: string;
  grade?: number;
  profile?: {
    district?: string;
    emergencyContact?: string;
  };
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Quiz Types
export interface QuizAnswers {
  [questionId: string]: number;
}

export interface QuizResult {
  score: number;
  passed: boolean;
  correctAnswers: number;
  totalQuestions: number;
  earnedPoints: number;
  totalPoints: number;
  passingScore: number;
  results: QuestionResult[];
  badgesEarned: string[];
}

export interface QuestionResult {
  questionId: string;
  userAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  points: number;
  explanation?: string;
}

// Dashboard Analytics Types
export interface DashboardAnalytics {
  overview: {
    totalUsers: number;
    totalModules: number;
    totalDrillSessions: number;
    totalBadges: number;
  };
  userDistribution: {
    byRole: Array<{ _id: string; count: number }>;
    byDistrict: Array<{ _id: string; count: number }>;
  };
  moduleStats: {
    completionStats: Array<{ _id: string; count: number }>;
    popularity: Array<{
      _id: string;
      title: string;
      type: string;
      difficulty: string;
      totalAttempts: number;
      completions: number;
      completionRate: number;
    }>;
  };
  drillStats: {
    performance: Array<{
      _id: string;
      totalSessions: number;
      averageScore: number;
      averageTime: number;
    }>;
  };
  topSchools: Array<{
    _id: string;
    totalStudents: number;
    totalPoints: number;
    averagePoints: number;
  }>;
  recentActivity: {
    newUsers: number;
    completedModules: number;
    completedDrills: number;
  };
  badgeStats: Array<{
    _id: string;
    name: string;
    rarity: string;
    points: number;
    holdersCount: number;
  }>;
  learningProgress: Array<{
    _id: {
      year: number;
      month: number;
      day: number;
    };
    completions: number;
    averageScore: number;
  }>;
}

// Punjab Districts
export const PUNJAB_DISTRICTS = [
  'Amritsar', 'Barnala', 'Bathinda', 'Faridkot', 'Fatehgarh Sahib',
  'Fazilka', 'Ferozepur', 'Gurdaspur', 'Hoshiarpur', 'Jalandhar',
  'Kapurthala', 'Ludhiana', 'Mansa', 'Moga', 'Muktsar', 'Nawanshahr',
  'Pathankot', 'Patiala', 'Rupnagar', 'Sangrur', 'Tarn Taran', 'Mohali'
] as const;

export type PunjabDistrict = typeof PUNJAB_DISTRICTS[number];
