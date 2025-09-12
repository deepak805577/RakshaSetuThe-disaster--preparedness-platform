import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

interface Child {
  _id: string;
  name: string;
  email: string;
  grade: string;
  school: string;
}

interface ChildData {
  child: Child;
  relationship: {
    id: string;
    relationshipType: string;
    permissions: {
      viewProgress: boolean;
      receiveNotifications: boolean;
      manageAccount: boolean;
      accessEmergencyInfo: boolean;
    };
    notifications: {
      achievements: boolean;
      drillReminders: boolean;
      emergencyAlerts: boolean;
      progressReports: boolean;
    };
  };
  stats: {
    modulesCompleted: number;
    drillsCompleted: number;
    averageScore: number;
    totalBadges: number;
    recentActivity: {
      modulesThisWeek: number;
      drillsThisWeek: number;
    };
  };
  recentAchievements: any[];
}

interface DashboardData {
  children: ChildData[];
  overallStats: {
    totalChildren: number;
    totalModulesCompleted: number;
    totalDrillsCompleted: number;
    averageScore: number;
    totalBadges: number;
  };
}

const ParentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkChildForm, setLinkChildForm] = useState({
    childEmail: '',
    relationshipType: 'parent',
    emergencyContact: {
      phone: '',
      email: '',
      address: ''
    }
  });

  useEffect(() => {
    if (user?.role !== 'parent') {
      navigate('/dashboard');
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/family/dashboard`);
      
      if (response.data.success) {
        setDashboardData(response.data.data);
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkChild = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/family/link-child`, linkChildForm);
      
      if (response.data.success) {
        alert('Family relationship request created! Please check your phone for the verification code.');
        setShowLinkModal(false);
        setLinkChildForm({
          childEmail: '',
          relationshipType: 'parent',
          emergencyContact: {
            phone: '',
            email: '',
            address: ''
          }
        });
        // Navigate to verification page or show verification modal
        navigate(`/family/verify/${response.data.data.relationshipId}`);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to link child account');
    }
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">{error}</div>
          <button 
            onClick={fetchDashboardData}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Family Dashboard</h1>
              <p className="text-gray-600">Monitor your children's disaster preparedness progress</p>
            </div>
            <button
              onClick={() => setShowLinkModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Link Child Account</span>
            </button>
          </div>
        </div>

        {/* Overall Statistics */}
        {dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-blue-600">{dashboardData.overallStats.totalChildren}</div>
              <div className="text-gray-600">Children</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-green-600">{dashboardData.overallStats.totalModulesCompleted}</div>
              <div className="text-gray-600">Modules Completed</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-purple-600">{dashboardData.overallStats.totalDrillsCompleted}</div>
              <div className="text-gray-600">Drills Completed</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className={`text-3xl font-bold ${getProgressColor(dashboardData.overallStats.averageScore)}`}>
                {dashboardData.overallStats.averageScore}%
              </div>
              <div className="text-gray-600">Average Score</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-yellow-600">{dashboardData.overallStats.totalBadges}</div>
              <div className="text-gray-600">Total Badges</div>
            </div>
          </div>
        )}

        {/* Children Progress Cards */}
        {dashboardData?.children.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-400 text-xl mb-4">No children linked yet</div>
            <p className="text-gray-600 mb-6">
              Link your child's account to monitor their disaster preparedness progress
            </p>
            <button
              onClick={() => setShowLinkModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Link Your First Child
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {dashboardData?.children.map((childData, index) => (
              <div key={childData.child._id} className="bg-white rounded-lg shadow-lg p-6">
                {/* Child Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{childData.child.name}</h3>
                    <p className="text-gray-600">Grade {childData.child.grade} • {childData.child.school}</p>
                    <p className="text-sm text-gray-500">{childData.child.email}</p>
                  </div>
                  <div className="text-right">
                    <div className={`px-3 py-1 rounded-full text-sm ${getProgressBgColor(childData.stats.averageScore)} ${getProgressColor(childData.stats.averageScore)}`}>
                      {childData.stats.averageScore}% Average
                    </div>
                  </div>
                </div>

                {/* Progress Statistics */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{childData.stats.modulesCompleted}</div>
                    <div className="text-sm text-gray-600">Modules</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{childData.stats.drillsCompleted}</div>
                    <div className="text-sm text-gray-600">Drills</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{childData.stats.totalBadges}</div>
                    <div className="text-sm text-gray-600">Badges</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {childData.stats.recentActivity.modulesThisWeek + childData.stats.recentActivity.drillsThisWeek}
                    </div>
                    <div className="text-sm text-gray-600">This Week</div>
                  </div>
                </div>

                {/* Recent Achievements */}
                {childData.recentAchievements.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Recent Achievements</h4>
                    <div className="flex flex-wrap gap-2">
                      {childData.recentAchievements.slice(0, 3).map((badge, badgeIndex) => (
                        <div key={badgeIndex} className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                          {badge.title}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => navigate(`/family/child/${childData.child._id}/progress`)}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => navigate(`/family/child/${childData.child._id}/settings`)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                  >
                    Settings
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Link Child Modal */}
        {showLinkModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Link Child Account</h3>
                <button
                  onClick={() => setShowLinkModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleLinkChild} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Child's Email</label>
                  <input
                    type="email"
                    value={linkChildForm.childEmail}
                    onChange={(e) => setLinkChildForm({ ...linkChildForm, childEmail: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Relationship</label>
                  <select
                    value={linkChildForm.relationshipType}
                    onChange={(e) => setLinkChildForm({ ...linkChildForm, relationshipType: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="parent">Parent</option>
                    <option value="guardian">Guardian</option>
                    <option value="family_member">Family Member</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Emergency Phone</label>
                  <input
                    type="tel"
                    value={linkChildForm.emergencyContact.phone}
                    onChange={(e) => setLinkChildForm({ 
                      ...linkChildForm, 
                      emergencyContact: { ...linkChildForm.emergencyContact, phone: e.target.value }
                    })}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Emergency Email</label>
                  <input
                    type="email"
                    value={linkChildForm.emergencyContact.email}
                    onChange={(e) => setLinkChildForm({ 
                      ...linkChildForm, 
                      emergencyContact: { ...linkChildForm.emergencyContact, email: e.target.value }
                    })}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <textarea
                    value={linkChildForm.emergencyContact.address}
                    onChange={(e) => setLinkChildForm({ 
                      ...linkChildForm, 
                      emergencyContact: { ...linkChildForm.emergencyContact, address: e.target.value }
                    })}
                    rows={3}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowLinkModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                  >
                    Send Link Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentDashboard;
