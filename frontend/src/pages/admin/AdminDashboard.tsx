import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { DashboardAnalytics } from '../../types';
import VideoManagement from '../../components/admin/VideoManagement';

const AdminDashboard: React.FC = () => {
  const location = useLocation();
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      setIsLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        const mockAnalytics: DashboardAnalytics = {
          overview: {
            totalUsers: 1250,
            totalModules: 12,
            totalDrillSessions: 3400,
            totalBadges: 15
          },
          userDistribution: {
            byRole: [
              { _id: 'student', count: 1000 },
              { _id: 'teacher', count: 200 },
              { _id: 'parent', count: 50 }
            ],
            byDistrict: [
              { _id: 'Ludhiana', count: 300 },
              { _id: 'Amritsar', count: 250 },
              { _id: 'Jalandhar', count: 200 },
              { _id: 'Patiala', count: 180 },
              { _id: 'Bathinda', count: 150 },
              { _id: 'Others', count: 170 }
            ]
          },
          moduleStats: {
            completionStats: [
              { _id: 'earthquake', count: 800 },
              { _id: 'fire', count: 750 },
              { _id: 'flood', count: 600 },
              { _id: 'cyclone', count: 400 }
            ],
            popularity: [
              {
                _id: '1',
                title: 'Earthquake Preparedness',
                type: 'earthquake',
                difficulty: 'beginner',
                totalAttempts: 1200,
                completions: 800,
                completionRate: 66.7
              },
              {
                _id: '2',
                title: 'Fire Safety',
                type: 'fire',
                difficulty: 'beginner',
                totalAttempts: 1100,
                completions: 750,
                completionRate: 68.2
              }
            ]
          },
          drillStats: {
            performance: [
              {
                _id: 'evacuation',
                totalSessions: 1500,
                averageScore: 85.5,
                averageTime: 12.3
              },
              {
                _id: 'fire',
                totalSessions: 1000,
                averageScore: 82.1,
                averageTime: 15.7
              }
            ]
          },
          topSchools: [
            {
              _id: 'Punjab Public School',
              totalStudents: 200,
              totalPoints: 45000,
              averagePoints: 225
            },
            {
              _id: 'Delhi Public School',
              totalStudents: 150,
              totalPoints: 32000,
              averagePoints: 213
            }
          ],
          recentActivity: {
            newUsers: 25,
            completedModules: 45,
            completedDrills: 120
          },
          badgeStats: [
            {
              _id: '1',
              name: 'First Steps',
              rarity: 'common',
              points: 50,
              holdersCount: 800
            },
            {
              _id: '2',
              name: 'Module Master',
              rarity: 'epic',
              points: 500,
              holdersCount: 150
            }
          ],
          learningProgress: [
            { _id: { year: 2024, month: 1, day: 1 }, completions: 45, averageScore: 78.5 },
            { _id: { year: 2024, month: 1, day: 2 }, completions: 52, averageScore: 82.1 }
          ]
        };

        setAnalytics(mockAnalytics);
        setIsLoading(false);
      }, 1000);
    };

    loadAnalytics();
  }, []);

  const navigation = [
    { name: 'Overview', href: '/admin', current: location.pathname === '/admin' },
    { name: 'Users', href: '/admin/users', current: location.pathname === '/admin/users' },
    { name: 'Modules', href: '/admin/modules', current: location.pathname === '/admin/modules' },
    { name: 'Videos', href: '/admin/videos', current: location.pathname === '/admin/videos' },
    { name: 'Drills', href: '/admin/drills', current: location.pathname === '/admin/drills' },
    { name: 'Reports', href: '/admin/reports', current: location.pathname === '/admin/reports' },
    { name: 'Settings', href: '/admin/settings', current: location.pathname === '/admin/settings' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-lg text-gray-600">Manage the disaster preparedness platform</p>
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-lg shadow mb-8">
          <nav className="flex space-x-8 px-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  item.current
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <Routes>
          <Route path="/" element={<OverviewTab analytics={analytics} />} />
          <Route path="/users" element={<UsersTab />} />
          <Route path="/modules" element={<ModulesTab />} />
          <Route path="/videos" element={<VideoManagement />} />
          <Route path="/drills" element={<DrillsTab />} />
          <Route path="/reports" element={<ReportsTab />} />
          <Route path="/settings" element={<SettingsTab />} />
        </Routes>
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab: React.FC<{ analytics: DashboardAnalytics | null }> = ({ analytics }) => {
  if (!analytics) return null;

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.overview.totalUsers.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Learning Modules</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.overview.totalModules}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Drill Sessions</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.overview.totalDrillSessions.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Available Badges</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.overview.totalBadges}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Users by Role</h3>
          <div className="space-y-3">
            {analytics.userDistribution.byRole.map((role) => (
              <div key={role._id} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 capitalize">{role._id}s</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-red-600 h-2 rounded-full"
                      style={{ width: `${(role.count / analytics.overview.totalUsers) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{role.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">New Users Today</span>
              <span className="text-lg font-semibold text-gray-900">{analytics.recentActivity.newUsers}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Modules Completed Today</span>
              <span className="text-lg font-semibold text-gray-900">{analytics.recentActivity.completedModules}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Drills Completed Today</span>
              <span className="text-lg font-semibold text-gray-900">{analytics.recentActivity.completedDrills}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Schools */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Schools</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">School</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Points</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Points</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.topSchools.map((school) => (
                <tr key={school._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{school._id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{school.totalStudents}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{school.totalPoints.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{school.averagePoints}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Placeholder components for other tabs
const UsersTab = () => (
  <div className="bg-white rounded-lg shadow p-6">
    <h2 className="text-xl font-semibold text-gray-900 mb-4">User Management</h2>
    <p className="text-gray-600">User management features coming soon...</p>
  </div>
);

const ModulesTab = () => (
  <div className="bg-white rounded-lg shadow p-6">
    <h2 className="text-xl font-semibold text-gray-900 mb-4">Module Management</h2>
    <p className="text-gray-600">Module management features coming soon...</p>
  </div>
);

const DrillsTab = () => (
  <div className="bg-white rounded-lg shadow p-6">
    <h2 className="text-xl font-semibold text-gray-900 mb-4">Drill Management</h2>
    <p className="text-gray-600">Drill management features coming soon...</p>
  </div>
);

const ReportsTab = () => (
  <div className="bg-white rounded-lg shadow p-6">
    <h2 className="text-xl font-semibold text-gray-900 mb-4">Reports & Analytics</h2>
    <p className="text-gray-600">Advanced reporting features coming soon...</p>
  </div>
);

const SettingsTab = () => (
  <div className="bg-white rounded-lg shadow p-6">
    <h2 className="text-xl font-semibold text-gray-900 mb-4">System Settings</h2>
    <p className="text-gray-600">System configuration features coming soon...</p>
  </div>
);

export default AdminDashboard;
