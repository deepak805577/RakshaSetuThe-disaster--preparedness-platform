import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import DrillScenarioEngine, { DisasterScenario } from '../../components/drills/DrillScenarioEngine';
import enhancedDrillsApi, { DrillSession, UserStats, Achievement, EnhancedScenario } from '../../services/enhancedDrillsApi';
import useSocket from '../../hooks/useSocket';

// Remove local interfaces as they're imported from the API service

const EnhancedDrillsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const socket = useSocket();
  
  // State management
  const [selectedScenario, setSelectedScenario] = useState<EnhancedScenario | null>(null);
  const [activeSessions, setActiveSessions] = useState<DrillSession[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced' | 'expert'>('intermediate');
  
  // Loading states
  const [loading, setLoading] = useState({
    sessions: false,
    stats: false,
    achievements: false,
    creating: false
  });
  
  // Error handling
  const [error, setError] = useState<string | null>(null);

  // API Functions
  const loadActiveSessions = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, sessions: true }));
      const response = await enhancedDrillsApi.getActiveSessions();
      if (response.success) {
        setActiveSessions(response.data || []);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
      setError('Failed to load active sessions');
    } finally {
      setLoading(prev => ({ ...prev, sessions: false }));
    }
  }, []);
  
  // Load data on component mount
  useEffect(() => {
    loadActiveSessions();
    loadUserStats();
    loadUserAchievements();
  }, [loadActiveSessions]);
  
  // Socket.io event listeners
  useEffect(() => {
    if (!socket.isConnected) return;
    
    const handleNewDrillSession = (data: any) => {
      console.log('New drill session created:', data);
      loadActiveSessions(); // Refresh sessions list
    };
    
    const handleParticipantJoined = (data: any) => {
      console.log('Participant joined:', data);
      setActiveSessions(prev => prev.map(session => {
        if (session.id === data.sessionId) {
          return {
            ...session,
            participants: [...session.participants, data.participant]
          };
        }
        return session;
      }));
    };
    
    const handleDrillSessionStarted = (data: any) => {
      console.log('Drill session started:', data);
      // Navigate to the drill session if user is participating
      if (user?._id && data.sessionId.includes(user._id)) {
        navigate(`/drills/session/${data.sessionId}`);
      }
    };
    
    // Listen for events
    socket.on('new-drill-session', handleNewDrillSession);
    socket.on('participant-joined', handleParticipantJoined);
    socket.on('drill-session-started', handleDrillSessionStarted);
    
    return () => {
      socket.off('new-drill-session', handleNewDrillSession);
      socket.off('participant-joined', handleParticipantJoined);
      socket.off('drill-session-started', handleDrillSessionStarted);
    };
  }, [socket.isConnected, user?._id, navigate, loadActiveSessions]);
  
  const loadUserStats = async () => {
    try {
      setLoading(prev => ({ ...prev, stats: true }));
      const response = await enhancedDrillsApi.getUserStats();
      if (response.success) {
        setUserStats(response.data);
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
      // Set default stats on error
      setUserStats({
        totalDrills: 0,
        averageScore: 0,
        bestTime: 0,
        completionRate: 0,
        rank: 0,
        totalUsers: 0,
        recentActivity: {
          lastDrillDate: null,
          drillsThisWeek: 0
        }
      });
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  };
  
  const loadUserAchievements = async () => {
    try {
      setLoading(prev => ({ ...prev, achievements: true }));
      const response = await enhancedDrillsApi.getUserAchievements();
      if (response.success) {
        setAchievements(response.data || []);
      }
    } catch (error) {
      console.error('Error loading achievements:', error);
      setError('Failed to load achievements');
    } finally {
      setLoading(prev => ({ ...prev, achievements: false }));
    }
  };

  const createNewSession = async () => {
    if (!selectedScenario) {
      setError('Please select a scenario first!');
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, creating: true }));
      setError(null);
      
      const response = await enhancedDrillsApi.createSession({
        scenarioId: selectedScenario.id,
        difficulty,
        maxParticipants: 30
      });
      
      if (response.success) {
        console.log('Session created:', response.data);
        setShowCreateSession(false);
        setSelectedScenario(null);
        // Refresh sessions list
        await loadActiveSessions();
        
        // Show success message
        alert(`Session created successfully! Session ID: ${response.data.sessionId}`);
      }
    } catch (error: any) {
      console.error('Error creating session:', error);
      setError(error.response?.data?.message || 'Failed to create session');
    } finally {
      setLoading(prev => ({ ...prev, creating: false }));
    }
  };

  const joinSession = async (sessionId: string) => {
    try {
      const response = await enhancedDrillsApi.joinSession(sessionId);
      if (response.success) {
        console.log('Joined session:', response.data);
        navigate(`/drills/session/${sessionId}`);
      }
    } catch (error: any) {
      console.error('Error joining session:', error);
      setError(error.response?.data?.message || 'Failed to join session');
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'rare': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'epic': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'legendary': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <div className="flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-red-700 hover:text-red-900"
              >
                ×
              </button>
            </div>
          </div>
        )}
        
        {/* Socket Connection Status */}
        {!socket.isConnected && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
            <div className="flex items-center">
              <span className="mr-2">⚠️</span>
              <span>Real-time features disconnected. Attempting to reconnect...</span>
            </div>
          </div>
        )}
        {/* Header with Stats */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🚨 Virtual Emergency Drills</h1>
              <p className="text-gray-600 mt-2">
                Practice with realistic scenarios, compete with classmates, and master emergency procedures
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {loading.stats ? (
                <div className="flex space-x-4">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                    <div className="text-xs text-gray-500">Loading...</div>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                    <div className="text-xs text-gray-500">Loading...</div>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                    <div className="text-xs text-gray-500">Loading...</div>
                  </div>
                </div>
              ) : userStats ? (
                <>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{userStats.totalDrills}</div>
                    <div className="text-xs text-gray-500">Drills Completed</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getScoreColor(userStats.averageScore)}`}>{userStats.averageScore.toFixed(1)}%</div>
                    <div className="text-xs text-gray-500">Avg Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">#{userStats.rank}</div>
                    <div className="text-xs text-gray-500">Global Rank</div>
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-500">
                  <div className="text-sm">No stats available</div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex space-x-4">
            <button
              onClick={() => setShowCreateSession(true)}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center"
            >
              🎯 Create New Drill
            </button>
            <Link
              to="/drills/visualization"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              🏗️ 3D Route Planner
            </Link>
            <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
              📊 Performance Analytics
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Sessions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">🔥 Active Drill Sessions</h2>
              
              {loading.sessions ? (
                <div className="space-y-4">
                  {[1, 2].map(i => (
                    <div key={i} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                          <div>
                            <div className="w-48 h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                            <div className="w-64 h-3 bg-gray-200 rounded animate-pulse"></div>
                          </div>
                        </div>
                        <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex space-x-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                        </div>
                        <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : activeSessions.length > 0 ? (
                <div className="space-y-4">
                  {activeSessions.map((session) => (
                    <div key={session.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{session.scenario.name.split(' ')[0]}</span>
                          <div>
                            <h3 className="font-semibold text-gray-900">{session.scenario.name}</h3>
                            <p className="text-sm text-gray-600">{session.scenario.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            session.status === 'lobby' ? 'bg-blue-100 text-blue-800' :
                            session.status === 'in_progress' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {session.status.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Participants:</span>
                          <span className="ml-1 text-gray-900">{session.participants.length}/{session.maxParticipants}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Duration:</span>
                          <span className="ml-1 text-gray-900">{Math.floor(session.estimatedDuration / 60)}m</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Intensity:</span>
                          <span className={`ml-1 ${
                            session.scenario.intensity === 'critical' ? 'text-red-600 font-semibold' :
                            session.scenario.intensity === 'high' ? 'text-orange-600 font-medium' :
                            session.scenario.intensity === 'medium' ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {session.scenario.intensity.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-2">
                          {session.participants.slice(0, 5).map((participant, idx) => (
                            <div key={idx} className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white text-xs font-medium">
                              {participant.name.charAt(0)}
                            </div>
                          ))}
                          {session.participants.length > 5 && (
                            <div className="w-8 h-8 rounded-full bg-gray-400 border-2 border-white flex items-center justify-center text-white text-xs">
                              +{session.participants.length - 5}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => joinSession(session.id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          Join Session
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🏫</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Sessions</h3>
                  <p className="text-gray-600 mb-4">Create a new drill session to get started!</p>
                  <button
                    onClick={() => setShowCreateSession(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Create First Session
                  </button>
                </div>
              )}
            </div>

            {/* Scenario Selection Modal */}
            {showCreateSession && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-gray-900">Create New Drill Session</h2>
                      <button
                        onClick={() => setShowCreateSession(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level:</label>
                      <div className="flex space-x-3">
                        {(['beginner', 'intermediate', 'advanced', 'expert'] as const).map((level) => (
                          <button
                            key={level}
                            onClick={() => setDifficulty(level)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              difficulty === level
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <DrillScenarioEngine
                      difficulty={difficulty}
                      selectedScenario={selectedScenario as unknown as DisasterScenario || undefined}
                      onScenarioSelect={(scenario) => setSelectedScenario(scenario as unknown as EnhancedScenario)}
                    />

                    <div className="flex items-center justify-end space-x-4 mt-6 pt-6 border-t border-gray-200">
                      <button
                        onClick={() => setShowCreateSession(false)}
                        className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={createNewSession}
                        disabled={!selectedScenario || loading.creating}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center"
                      >
                        {loading.creating ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Creating...
                          </>
                        ) : (
                          'Create Session'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Achievements */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">🏆 Achievements</h3>
              <div className="space-y-3">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className={`p-3 rounded-lg border-2 ${
                    achievement.unlockedAt 
                      ? `${getRarityColor(achievement.rarity)} bg-opacity-20` 
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{achievement.icon}</span>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">{achievement.name}</h4>
                        <p className="text-xs text-gray-600">{achievement.description}</p>
                        {achievement.unlockedAt && (
                          <p className="text-xs text-green-600 mt-1">
                            Unlocked {achievement.unlockedAt.toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getRarityColor(achievement.rarity)}`}>
                        {achievement.rarity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Insights */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">📈 Performance Insights</h3>
              {loading.stats ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="w-24 h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                        <div className="w-16 h-3 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                      <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              ) : userStats ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <div className="font-medium text-blue-900">Completion Rate</div>
                      <div className="text-sm text-blue-700">All time</div>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">{userStats.completionRate}%</div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <div className="font-medium text-green-900">Best Evacuation Time</div>
                      <div className="text-sm text-green-700">Personal record</div>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {userStats.bestTime > 0 
                        ? `${Math.floor(userStats.bestTime / 60)}:${(userStats.bestTime % 60).toString().padStart(2, '0')}` 
                        : 'N/A'
                      }
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div>
                      <div className="font-medium text-purple-900">Global Ranking</div>
                      <div className="text-sm text-purple-700">Out of {userStats.totalUsers.toLocaleString()} users</div>
                    </div>
                    <div className="text-2xl font-bold text-purple-600">
                      {userStats.rank > 0 ? `#${userStats.rank}` : 'Unranked'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  <div className="text-sm">No performance data available</div>
                </div>
              )}
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">🔗 Quick Access</h3>
              <div className="space-y-2">
                <Link
                  to="/drills/history"
                  className="block w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  📋 Drill History
                </Link>
                <Link
                  to="/drills/schedule"
                  className="block w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  📅 Scheduled Drills
                </Link>
                <Link
                  to="/drills/leaderboard"
                  className="block w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  🏆 Leaderboard
                </Link>
                <Link
                  to="/support"
                  className="block w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ❓ Help & Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDrillsPage;
