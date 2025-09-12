import api from './api';

export interface EnhancedScenario {
  id: string;
  type: string;
  name: string;
  description: string;
  intensity: 'low' | 'medium' | 'high' | 'critical';
  duration: number;
  weatherCondition: string;
  timeOfDay: string;
  specialConditions: string[];
  environmentalEffects: {
    visibility: number;
    lighting: number;
    soundLevel: number;
    temperature: number;
    windSpeed: number;
  };
  uniqueChallenges: Array<{
    id: string;
    name: string;
    description: string;
    severity: string;
    requiredAction: string;
  }>;
  evacuationConstraints: string[];
  priorityAreas: string[];
  emergencyProtocols: Array<{
    step: number;
    instruction: string;
    timing: number;
    validationRequired: boolean;
    alternativeActions: string[];
  }>;
}

export interface DrillSession {
  id: string;
  scenario: EnhancedScenario;
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

export interface UserStats {
  totalDrills: number;
  averageScore: number;
  bestTime: number;
  completionRate: number;
  rank: number;
  totalUsers: number;
  recentActivity: {
    lastDrillDate: string | null;
    drillsThisWeek: number;
  };
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  school?: string;
  grade?: number;
  totalDrills: number;
  averageScore: number;
  bestScore: number;
  rank: number;
}

// Enhanced Drills API Service
class EnhancedDrillsApiService {
  private baseUrl = '/api/enhanced-drills';

  // Get scenarios by difficulty
  async getScenarios(difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert' = 'intermediate') {
    try {
      const response = await api.get(`${this.baseUrl}/scenarios`, {
        params: { difficulty }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching scenarios:', error);
      throw error;
    }
  }

  // Create a new drill session
  async createSession(data: {
    scenarioId: string;
    difficulty: string;
    maxParticipants?: number;
  }) {
    try {
      const response = await api.post(`${this.baseUrl}/sessions`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  // Get active drill sessions
  async getActiveSessions() {
    try {
      const response = await api.get(`${this.baseUrl}/sessions/active`);
      return response.data;
    } catch (error) {
      console.error('Error fetching active sessions:', error);
      throw error;
    }
  }

  // Join a drill session
  async joinSession(sessionId: string) {
    try {
      const response = await api.post(`${this.baseUrl}/sessions/${sessionId}/join`);
      return response.data;
    } catch (error) {
      console.error('Error joining session:', error);
      throw error;
    }
  }

  // Start a drill session
  async startSession(sessionId: string) {
    try {
      const response = await api.post(`${this.baseUrl}/sessions/${sessionId}/start`);
      return response.data;
    } catch (error) {
      console.error('Error starting session:', error);
      throw error;
    }
  }

  // Update participant status
  async updateParticipantStatus(sessionId: string, participantId: string, status: string) {
    try {
      const response = await api.put(
        `${this.baseUrl}/sessions/${sessionId}/participants/${participantId}/status`,
        { status }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating participant status:', error);
      throw error;
    }
  }

  // Get user statistics
  async getUserStats(): Promise<{ success: boolean; data: UserStats }> {
    try {
      const response = await api.get(`${this.baseUrl}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }

  // Get user achievements
  async getUserAchievements(): Promise<{ success: boolean; data: Achievement[] }> {
    try {
      const response = await api.get(`${this.baseUrl}/achievements`);
      return response.data;
    } catch (error) {
      console.error('Error fetching achievements:', error);
      throw error;
    }
  }

  // Get leaderboard
  async getLeaderboard(timeframe: 'all' | 'week' | 'month' = 'all', limit: number = 50) {
    try {
      const response = await api.get(`${this.baseUrl}/leaderboard`, {
        params: { timeframe, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }
  }
}

export const enhancedDrillsApi = new EnhancedDrillsApiService();
export default enhancedDrillsApi;
