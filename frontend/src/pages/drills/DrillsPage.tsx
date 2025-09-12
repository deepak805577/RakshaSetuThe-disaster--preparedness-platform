import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';

interface DrillTemplate {
  id: string;
  type: 'evacuation' | 'fire' | 'earthquake' | 'flood';
  title: string;
  description: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  steps: number;
  points: number;
  icon: string;
  color: string;
}

const DrillsPage: React.FC = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [drillTemplates, setDrillTemplates] = useState<DrillTemplate[]>([]);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');

  const drillTypes = [
    { value: 'all', label: 'All Drills', color: 'bg-gray-100 text-gray-800' },
    { value: 'evacuation', label: 'Evacuation', color: 'bg-blue-100 text-blue-800' },
    { value: 'fire', label: 'Fire Safety', color: 'bg-red-100 text-red-800' },
    { value: 'earthquake', label: 'Earthquake', color: 'bg-orange-100 text-orange-800' },
    { value: 'flood', label: 'Flood', color: 'bg-cyan-100 text-cyan-800' }
  ];

  useEffect(() => {
    const loadDrills = async () => {
      setIsLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        const mockTemplates: DrillTemplate[] = [
          {
            id: '1',
            type: 'evacuation',
            title: 'School Evacuation Drill',
            description: 'Practice the complete evacuation procedure from your classroom to the assembly point.',
            duration: 15,
            difficulty: 'beginner',
            steps: 8,
            points: 100,
            icon: '🚨',
            color: 'bg-blue-500'
          },
          {
            id: '2',
            type: 'fire',
            title: 'Fire Emergency Drill',
            description: 'Learn and practice fire safety procedures including using fire extinguishers.',
            duration: 20,
            difficulty: 'intermediate',
            steps: 12,
            points: 150,
            icon: '🔥',
            color: 'bg-red-500'
          },
          {
            id: '3',
            type: 'earthquake',
            title: 'Earthquake Response Drill',
            description: 'Practice drop, cover, and hold procedures during earthquake simulation.',
            duration: 10,
            difficulty: 'beginner',
            steps: 6,
            points: 80,
            icon: '🌍',
            color: 'bg-orange-500'
          },
          {
            id: '4',
            type: 'flood',
            title: 'Flood Evacuation Drill',
            description: 'Practice moving to higher ground and following flood safety protocols.',
            duration: 25,
            difficulty: 'advanced',
            steps: 15,
            points: 200,
            icon: '🌊',
            color: 'bg-cyan-500'
          },
          {
            id: '5',
            type: 'evacuation',
            title: 'Advanced Evacuation Drill',
            description: 'Complex evacuation scenario with multiple obstacles and time constraints.',
            duration: 30,
            difficulty: 'advanced',
            steps: 20,
            points: 250,
            icon: '🏃',
            color: 'bg-purple-500'
          },
          {
            id: '6',
            type: 'fire',
            title: 'Fire Extinguisher Training',
            description: 'Hands-on training for using different types of fire extinguishers.',
            duration: 18,
            difficulty: 'intermediate',
            steps: 10,
            points: 120,
            icon: '🧯',
            color: 'bg-red-600'
          }
        ];

        const mockRecentSessions = [
          {
            id: '1',
            type: 'evacuation',
            title: 'School Evacuation Drill',
            completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
            score: 85,
            time: 12,
            points: 100
          },
          {
            id: '2',
            type: 'fire',
            title: 'Fire Emergency Drill',
            completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
            score: 92,
            time: 18,
            points: 150
          },
          {
            id: '3',
            type: 'earthquake',
            title: 'Earthquake Response Drill',
            completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            score: 78,
            time: 8,
            points: 80
          }
        ];

        setDrillTemplates(mockTemplates);
        setRecentSessions(mockRecentSessions);
        setIsLoading(false);
      }, 1000);
    };

    loadDrills();
  }, []);

  const filteredTemplates = selectedType === 'all' 
    ? drillTemplates 
    : drillTemplates.filter(template => template.type === selectedType);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const startDrill = (templateId: string) => {
    // Generate a session ID and navigate to drill detail page
    const sessionId = `session_${Date.now()}`;
    // In a real app, you would create a drill session on the backend
    window.location.href = `/drills/${sessionId}?template=${templateId}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading drills...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Virtual Emergency Drills</h1>
          <p className="text-lg text-gray-600">
            Practice emergency procedures with interactive virtual drills. Improve your response time and safety knowledge.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Drills</p>
                <p className="text-2xl font-semibold text-gray-900">{drillTemplates.length}</p>
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
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">{recentSessions.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Best Time</p>
                <p className="text-2xl font-semibold text-gray-900">8m 32s</p>
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
                <p className="text-sm font-medium text-gray-500">Total Points</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {recentSessions.reduce((sum, session) => sum + session.points, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Drill Templates */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Available Drills</h2>
              </div>
              <div className="p-6">
                {/* Filter */}
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {drillTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setSelectedType(type.value)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          selectedType === type.value
                            ? type.color
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Drill Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredTemplates.map((template) => (
                    <div key={template.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <div className={`w-12 h-12 ${template.color} rounded-lg flex items-center justify-center text-2xl mr-4`}>
                            {template.icon}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{template.title}</h3>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(template.difficulty)}`}>
                              {template.difficulty}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-4">{template.description}</p>

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {template.duration} min
                        </div>
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          {template.steps} steps
                        </div>
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        {template.points} pts
                        </div>
                      </div>

                      <button
                        onClick={() => startDrill(template.id)}
                        className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
                      >
                        Start Drill
                      </button>
                    </div>
                  ))}
                </div>

                {filteredTemplates.length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-4">🔍</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No drills found</h3>
                    <p className="text-gray-600">Try adjusting your filter to see more drills.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Sessions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Sessions</h2>
              </div>
              <div className="p-6">
                {recentSessions.length > 0 ? (
                  <div className="space-y-4">
                    {recentSessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">{session.title}</h4>
                          <p className="text-sm text-gray-500">
                            {session.completedAt.toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">{session.score}%</div>
                          <div className="text-xs text-gray-500">{session.time}m</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-4">📊</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No recent sessions</h3>
                    <p className="text-gray-600">Start a drill to see your progress here.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrillsPage;
