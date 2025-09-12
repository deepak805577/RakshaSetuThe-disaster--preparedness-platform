import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LeaderboardEntry } from '../../types';

const LeaderboardPage: React.FC = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [filteredLeaderboard, setFilteredLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'global' | 'school' | 'grade'>('global');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLeaderboard = async () => {
      setIsLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        const mockLeaderboard: LeaderboardEntry[] = [
          {
            userId: '1',
            name: 'Arjun Singh',
            points: 2450,
            badges: 12,
            completedModules: 8,
            rank: 1,
            school: 'Punjab Public School',
            grade: 10
          },
          {
            userId: '2',
            name: 'Priya Sharma',
            points: 2380,
            badges: 11,
            completedModules: 7,
            rank: 2,
            school: 'Delhi Public School',
            grade: 11
          },
          {
            userId: '3',
            name: 'Raj Kumar',
            points: 2200,
            badges: 10,
            completedModules: 6,
            rank: 3,
            school: 'Punjab Public School',
            grade: 9
          },
          {
            userId: '4',
            name: 'Sneha Patel',
            points: 2150,
            badges: 9,
            completedModules: 6,
            rank: 4,
            school: 'St. Mary\'s School',
            grade: 10
          },
          {
            userId: '5',
            name: 'Vikram Singh',
            points: 2000,
            badges: 8,
            completedModules: 5,
            rank: 5,
            school: 'Punjab Public School',
            grade: 12
          },
          {
            userId: '6',
            name: 'Anita Verma',
            points: 1950,
            badges: 8,
            completedModules: 5,
            rank: 6,
            school: 'Delhi Public School',
            grade: 9
          },
          {
            userId: '7',
            name: 'Rohit Gupta',
            points: 1800,
            badges: 7,
            completedModules: 4,
            rank: 7,
            school: 'St. Mary\'s School',
            grade: 11
          },
          {
            userId: '8',
            name: 'Kavita Singh',
            points: 1750,
            badges: 7,
            completedModules: 4,
            rank: 8,
            school: 'Punjab Public School',
            grade: 10
          },
          {
            userId: '9',
            name: 'Amit Kumar',
            points: 1650,
            badges: 6,
            completedModules: 3,
            rank: 9,
            school: 'Delhi Public School',
            grade: 12
          },
          {
            userId: '10',
            name: 'Sunita Devi',
            points: 1600,
            badges: 6,
            completedModules: 3,
            rank: 10,
            school: 'St. Mary\'s School',
            grade: 9
          }
        ];

        setLeaderboard(mockLeaderboard);
        setFilteredLeaderboard(mockLeaderboard);
        setIsLoading(false);
      }, 1000);
    };

    loadLeaderboard();
  }, []);

  useEffect(() => {
    let filtered = leaderboard;

    if (selectedFilter === 'school' && user?.school) {
      filtered = leaderboard.filter(entry => entry.school === user.school);
    } else if (selectedFilter === 'grade' && user?.grade) {
      filtered = leaderboard.filter(entry => entry.grade === user.grade);
    }

    // Re-rank the filtered results
    filtered = filtered.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));

    setFilteredLeaderboard(filtered);
  }, [leaderboard, selectedFilter, user]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-yellow-100 text-yellow-800';
      case 2: return 'bg-gray-100 text-gray-800';
      case 3: return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  const getCurrentUserRank = () => {
    return filteredLeaderboard.find(entry => entry.userId === user?._id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Leaderboard</h1>
          <p className="text-lg text-gray-600">
            See how you rank against other students in disaster preparedness learning.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setSelectedFilter('global')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedFilter === 'global'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Global
            </button>
            <button
              onClick={() => setSelectedFilter('school')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedFilter === 'school'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              My School
            </button>
            <button
              onClick={() => setSelectedFilter('grade')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedFilter === 'grade'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              My Grade
            </button>
          </div>
        </div>

        {/* Current User Stats */}
        {getCurrentUserRank() && (
          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg shadow-lg p-6 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold mb-2">Your Ranking</h2>
                <div className="flex items-center space-x-6">
                  <div>
                    <div className="text-3xl font-bold">{getCurrentUserRank()?.rank}</div>
                    <div className="text-sm opacity-90">Rank</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">{getCurrentUserRank()?.points}</div>
                    <div className="text-sm opacity-90">Points</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">{getCurrentUserRank()?.badges}</div>
                    <div className="text-sm opacity-90">Badges</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">{getCurrentUserRank()?.completedModules}</div>
                    <div className="text-sm opacity-90">Modules</div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-6xl opacity-20">
                  {getRankIcon(getCurrentUserRank()?.rank || 0)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {selectedFilter === 'global' ? 'Global Leaderboard' : 
               selectedFilter === 'school' ? 'School Leaderboard' : 'Grade Leaderboard'}
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredLeaderboard.map((entry, index) => (
              <div key={entry.userId} className={`p-6 hover:bg-gray-50 transition-colors ${
                entry.userId === user?._id ? 'bg-red-50 border-l-4 border-red-500' : ''
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${getRankColor(entry.rank)}`}>
                      {getRankIcon(entry.rank)}
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        {entry.name}
                        {entry.userId === user?._id && (
                          <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                            You
                          </span>
                        )}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        {entry.school && <span>{entry.school}</span>}
                        {entry.grade && <span>Grade {entry.grade}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-8">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{entry.points.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">Points</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{entry.badges}</div>
                      <div className="text-sm text-gray-500">Badges</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{entry.completedModules}</div>
                      <div className="text-sm text-gray-500">Modules</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredLeaderboard.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-4xl mb-4">📊</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
              <p className="text-gray-600">Try a different filter or check back later.</p>
            </div>
          )}
        </div>

        {/* Stats Summary */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Participants</p>
                <p className="text-2xl font-semibold text-gray-900">{filteredLeaderboard.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Average Score</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {Math.round(filteredLeaderboard.reduce((sum, entry) => sum + entry.points, 0) / filteredLeaderboard.length).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Badges</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {filteredLeaderboard.reduce((sum, entry) => sum + entry.badges, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
