import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface FamilyMember {
  id: string;
  name: string;
  email: string;
  role: 'parent' | 'student';
  avatar?: string;
  points: number;
  completedModules: number;
  lastActive: string;
  preparednessScore: number;
}

interface FamilyChallenge {
  id: string;
  title: string;
  description: string;
  targetRole: 'family' | 'parent' | 'student';
  points: number;
  deadline: string;
  progress: number;
  participants: string[];
  isCompleted: boolean;
}

interface EmergencyPlan {
  id: string;
  meetingPoint: string;
  emergencyContacts: {
    name: string;
    phone: string;
    relation: string;
  }[];
  evacuationRoute: string;
  supplies: {
    item: string;
    quantity: number;
    lastChecked: string;
  }[];
  lastUpdated: string;
}

const FamilyDashboard: React.FC = () => {
  const { user } = useAuth();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [familyChallenges, setFamilyChallenges] = useState<FamilyChallenge[]>([]);
  const [emergencyPlan, setEmergencyPlan] = useState<EmergencyPlan | null>(null);
  const [inviteCode, setInviteCode] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'challenges' | 'emergency' | 'progress'>('overview');
  const [joinCode, setJoinCode] = useState('');

  useEffect(() => {
    fetchFamilyData();
  }, []);

  const fetchFamilyData = async () => {
    try {
      // Fetch family members
      const membersResponse = await axios.get('/api/family/members');
      setFamilyMembers(membersResponse.data.data);

      // Fetch family challenges
      const challengesResponse = await axios.get('/api/family/challenges');
      setFamilyChallenges(challengesResponse.data.data);

      // Fetch emergency plan
      const planResponse = await axios.get('/api/family/emergency-plan');
      setEmergencyPlan(planResponse.data.data);
    } catch (error) {
      console.error('Error fetching family data:', error);
      // Use mock data for demonstration
      setFamilyMembers(mockFamilyMembers);
      setFamilyChallenges(mockChallenges);
      setEmergencyPlan(mockEmergencyPlan);
    }
  };

  const generateInviteCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setInviteCode(code);
    setShowInviteModal(true);
  };

  const joinFamily = async () => {
    try {
      await axios.post('/api/family/join', { code: joinCode });
      fetchFamilyData();
      setJoinCode('');
      alert('Successfully joined family!');
    } catch (error) {
      alert('Invalid family code. Please try again.');
    }
  };

  const calculateFamilyPreparedness = () => {
    if (familyMembers.length === 0) return 0;
    const totalScore = familyMembers.reduce((sum, member) => sum + member.preparednessScore, 0);
    return Math.round(totalScore / familyMembers.length);
  };

  const getFamilyBadge = (score: number) => {
    if (score >= 90) return { badge: '🏆', label: 'Expert Family', color: 'text-yellow-500' };
    if (score >= 70) return { badge: '🥈', label: 'Prepared Family', color: 'text-gray-400' };
    if (score >= 50) return { badge: '🥉', label: 'Learning Family', color: 'text-orange-600' };
    return { badge: '🌱', label: 'Beginner Family', color: 'text-green-500' };
  };

  const familyScore = calculateFamilyPreparedness();
  const familyBadge = getFamilyBadge(familyScore);

  // Mock data for demonstration
  const mockFamilyMembers: FamilyMember[] = [
    {
      id: '1',
      name: 'Rajesh Kumar',
      email: 'rajesh@example.com',
      role: 'parent',
      points: 450,
      completedModules: 12,
      lastActive: '2 hours ago',
      preparednessScore: 85
    },
    {
      id: '2',
      name: 'Priya Kumar',
      email: 'priya@example.com',
      role: 'parent',
      points: 380,
      completedModules: 10,
      lastActive: '1 day ago',
      preparednessScore: 78
    },
    {
      id: '3',
      name: 'Arjun Kumar',
      email: 'arjun@example.com',
      role: 'student',
      points: 520,
      completedModules: 15,
      lastActive: '30 minutes ago',
      preparednessScore: 92
    },
    {
      id: '4',
      name: 'Ananya Kumar',
      email: 'ananya@example.com',
      role: 'student',
      points: 280,
      completedModules: 8,
      lastActive: '3 hours ago',
      preparednessScore: 65
    }
  ];

  const mockChallenges: FamilyChallenge[] = [
    {
      id: '1',
      title: 'Family Emergency Kit Preparation',
      description: 'Work together to prepare a complete emergency kit for your home',
      targetRole: 'family',
      points: 100,
      deadline: '2024-01-15',
      progress: 75,
      participants: ['1', '2', '3', '4'],
      isCompleted: false
    },
    {
      id: '2',
      title: 'Home Evacuation Drill',
      description: 'Practice your home evacuation plan and time yourselves',
      targetRole: 'family',
      points: 150,
      deadline: '2024-01-20',
      progress: 50,
      participants: ['1', '2', '3', '4'],
      isCompleted: false
    },
    {
      id: '3',
      title: 'Learn First Aid Together',
      description: 'Complete the first aid module as a family',
      targetRole: 'family',
      points: 200,
      deadline: '2024-01-25',
      progress: 100,
      participants: ['1', '2', '3', '4'],
      isCompleted: true
    }
  ];

  const mockEmergencyPlan: EmergencyPlan = {
    id: '1',
    meetingPoint: 'Neighborhood Park near Main Gate',
    emergencyContacts: [
      { name: 'Emergency Services', phone: '112', relation: 'Emergency' },
      { name: 'Dr. Sharma', phone: '+91 98765 43210', relation: 'Family Doctor' },
      { name: 'Uncle Vikram', phone: '+91 98765 12345', relation: 'Relative' }
    ],
    evacuationRoute: 'Main door → Street → Left turn → Park',
    supplies: [
      { item: 'Water (Liters)', quantity: 20, lastChecked: '2024-01-01' },
      { item: 'First Aid Kit', quantity: 1, lastChecked: '2024-01-01' },
      { item: 'Flashlights', quantity: 3, lastChecked: '2024-01-01' },
      { item: 'Emergency Food', quantity: 10, lastChecked: '2024-01-01' }
    ],
    lastUpdated: '2024-01-01'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Family Preparedness Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Work together to make your family disaster-ready
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className={`text-5xl ${familyBadge.color}`}>{familyBadge.badge}</div>
                <div className="text-sm font-medium text-gray-600 mt-1">{familyBadge.label}</div>
              </div>
              <div className="text-center bg-gradient-to-r from-red-50 to-orange-50 px-6 py-3 rounded-lg">
                <div className="text-3xl font-bold text-red-600">{familyScore}%</div>
                <div className="text-sm text-gray-600">Family Preparedness</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mt-6 border-b">
            {(['overview', 'challenges', 'emergency', 'progress'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'text-red-600 border-b-2 border-red-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Family Members */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Family Members</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={generateInviteCode}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Invite Member
                  </button>
                  <input
                    type="text"
                    placeholder="Enter code"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <button
                    onClick={joinFamily}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Join Family
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {familyMembers.map((member) => (
                  <div key={member.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {member.name.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <h3 className="font-semibold text-gray-900">{member.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          member.role === 'parent' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {member.role}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Points:</span>
                        <span className="font-medium">{member.points}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Modules:</span>
                        <span className="font-medium">{member.completedModules}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Preparedness:</span>
                        <span className={`font-medium ${
                          member.preparednessScore >= 80 ? 'text-green-600' :
                          member.preparednessScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {member.preparednessScore}%
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 pt-2">
                        Active {member.lastActive}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                <div className="text-3xl font-bold mb-2">
                  {familyMembers.reduce((sum, m) => sum + m.points, 0)}
                </div>
                <div className="text-sm opacity-90">Total Family Points</div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
                <div className="text-3xl font-bold mb-2">
                  {familyMembers.reduce((sum, m) => sum + m.completedModules, 0)}
                </div>
                <div className="text-sm opacity-90">Modules Completed</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                <div className="text-3xl font-bold mb-2">
                  {familyChallenges.filter(c => c.isCompleted).length}
                </div>
                <div className="text-sm opacity-90">Challenges Won</div>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                <div className="text-3xl font-bold mb-2">
                  #{Math.floor(Math.random() * 50) + 1}
                </div>
                <div className="text-sm opacity-90">District Ranking</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'challenges' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Family Challenges</h2>
              <div className="space-y-4">
                {familyChallenges.map((challenge) => (
                  <div key={challenge.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="font-semibold text-lg text-gray-900">{challenge.title}</h3>
                          {challenge.isCompleted && (
                            <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              Completed
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3">{challenge.description}</p>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-gray-500">
                            Deadline: {new Date(challenge.deadline).toLocaleDateString()}
                          </span>
                          <span className="text-purple-600 font-medium">
                            +{challenge.points} points
                          </span>
                          <span className="text-gray-500">
                            {challenge.participants.length} participants
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {challenge.progress}%
                          </div>
                          <div className="text-xs text-gray-600">Progress</div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            challenge.isCompleted ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${challenge.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    {!challenge.isCompleted && (
                      <div className="mt-4 flex space-x-2">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                          Continue Challenge
                        </button>
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                          View Details
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Challenges */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Upcoming Challenges</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <div className="text-purple-600 text-2xl mb-2">🌊</div>
                  <h4 className="font-medium text-gray-900">Flood Preparedness Week</h4>
                  <p className="text-sm text-gray-600 mt-1">Starting next Monday</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <div className="text-purple-600 text-2xl mb-2">🔥</div>
                  <h4 className="font-medium text-gray-900">Fire Safety Challenge</h4>
                  <p className="text-sm text-gray-600 mt-1">Starting in 2 weeks</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <div className="text-purple-600 text-2xl mb-2">🏃</div>
                  <h4 className="font-medium text-gray-900">Speed Evacuation Competition</h4>
                  <p className="text-sm text-gray-600 mt-1">Starting next month</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'emergency' && (
          <div className="space-y-6">
            {emergencyPlan && (
              <>
                {/* Emergency Contacts */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Emergency Contacts</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {emergencyPlan.emergencyContacts.map((contact, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                        <p className="text-sm text-gray-600">{contact.relation}</p>
                        <p className="text-lg font-medium text-blue-600 mt-2">{contact.phone}</p>
                        <button className="mt-3 w-full px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                          Call Now
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Meeting Point & Route */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Evacuation Plan</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium text-gray-700 mb-2">Family Meeting Point</h3>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <span className="text-3xl mr-3">📍</span>
                          <div>
                            <p className="font-semibold text-gray-900">{emergencyPlan.meetingPoint}</p>
                            <p className="text-sm text-gray-600 mt-1">All family members should gather here</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-700 mb-2">Evacuation Route</h3>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <span className="text-3xl mr-3">🗺️</span>
                          <div>
                            <p className="font-semibold text-gray-900">{emergencyPlan.evacuationRoute}</p>
                            <p className="text-sm text-gray-600 mt-1">Primary route from home</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Emergency Supplies */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Emergency Supplies Checklist</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {emergencyPlan.supplies.map((supply, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-medium text-gray-900">{supply.item}</h3>
                        <p className="text-2xl font-bold text-blue-600 my-2">{supply.quantity}</p>
                        <p className="text-xs text-gray-500">
                          Last checked: {new Date(supply.lastChecked).toLocaleDateString()}
                        </p>
                        <button className="mt-3 text-sm text-blue-600 hover:text-blue-700">
                          Update ✓
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      Last updated: {new Date(emergencyPlan.lastUpdated).toLocaleDateString()}
                    </p>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                      Update Emergency Plan
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="space-y-6">
            {/* Family Progress Chart */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Family Learning Progress</h2>
              <div className="space-y-4">
                {familyMembers.map((member) => (
                  <div key={member.id} className="flex items-center">
                    <div className="w-32 font-medium text-gray-700">{member.name}</div>
                    <div className="flex-1 mx-4">
                      <div className="w-full bg-gray-200 rounded-full h-8">
                        <div
                          className="h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium"
                          style={{ width: `${member.preparednessScore}%` }}
                        >
                          {member.preparednessScore}%
                        </div>
                      </div>
                    </div>
                    <Link
                      to={`/profile/${member.id}`}
                      className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
                    >
                      View Details →
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievement Highlights */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Family Achievements</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border border-yellow-200">
                  <div className="text-3xl mb-2">🏅</div>
                  <h3 className="font-medium text-gray-900">First Aid Masters</h3>
                  <p className="text-sm text-gray-600 mt-1">All members completed first aid training</p>
                  <p className="text-xs text-gray-500 mt-2">Earned 2 days ago</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-yellow-200">
                  <div className="text-3xl mb-2">⚡</div>
                  <h3 className="font-medium text-gray-900">Speed Evacuators</h3>
                  <p className="text-sm text-gray-600 mt-1">Completed home drill in under 2 minutes</p>
                  <p className="text-xs text-gray-500 mt-2">Earned 1 week ago</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-yellow-200">
                  <div className="text-3xl mb-2">📚</div>
                  <h3 className="font-medium text-gray-900">Knowledge Seekers</h3>
                  <p className="text-sm text-gray-600 mt-1">50+ modules completed as a family</p>
                  <p className="text-xs text-gray-500 mt-2">Earned 2 weeks ago</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Invite Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Invite Family Member</h3>
              <div className="bg-gray-100 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-2">Share this code with your family member:</p>
                <p className="text-3xl font-bold text-blue-600 tracking-wider">{inviteCode}</p>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                This code will expire in 24 hours. The family member can use this code to join your family group.
              </p>
              <div className="mt-6 flex space-x-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(inviteCode);
                    alert('Code copied to clipboard!');
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Copy Code
                </button>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FamilyDashboard;
