import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Alert {
  id: string;
  type: 'flood' | 'earthquake' | 'storm' | 'heat' | 'drought' | 'other';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  district: string;
  issuedAt: string;
  expiresAt: string;
}

const HazardAlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');

  const punjabDistricts = [
    'All Districts', 'Amritsar', 'Barnala', 'Bathinda', 'Faridkot', 'Fatehgarh Sahib',
    'Fazilka', 'Ferozepur', 'Gurdaspur', 'Hoshiarpur', 'Jalandhar', 'Kapurthala',
    'Ludhiana', 'Malerkotla', 'Mansa', 'Moga', 'Mohali', 'Muktsar', 'Pathankot',
    'Patiala', 'Rupnagar', 'Sangrur', 'Shaheed Bhagat Singh Nagar', 'Tarn Taran'
  ];

  // Sample alerts data
  const sampleAlerts: Alert[] = [
    {
      id: '1',
      type: 'flood',
      title: 'Flood Warning for Sutlej River Basin',
      description: 'Heavy rainfall in upstream areas may cause water levels to rise in Sutlej River. Residents in low-lying areas are advised to stay alert.',
      severity: 'high',
      district: 'Ludhiana',
      issuedAt: '2024-01-06T10:00:00Z',
      expiresAt: '2024-01-08T18:00:00Z'
    },
    {
      id: '2',
      type: 'storm',
      title: 'Thunderstorm Warning',
      description: 'Severe thunderstorm with gusty winds expected. Avoid outdoor activities and stay indoors.',
      severity: 'medium',
      district: 'Amritsar',
      issuedAt: '2024-01-06T08:00:00Z',
      expiresAt: '2024-01-06T20:00:00Z'
    },
    {
      id: '3',
      type: 'heat',
      title: 'Heat Wave Alert',
      description: 'Temperature expected to reach 45°C. Take precautions against heat-related illnesses.',
      severity: 'high',
      district: 'Bathinda',
      issuedAt: '2024-01-06T06:00:00Z',
      expiresAt: '2024-01-09T18:00:00Z'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setAlerts(sampleAlerts);
      setLoading(false);
    }, 1000);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'flood': return '🌊';
      case 'earthquake': return '🌍';
      case 'storm': return '⛈️';
      case 'heat': return '🌡️';
      case 'drought': return '🏜️';
      default: return '⚠️';
    }
  };

  const filteredAlerts = selectedDistrict === 'all' 
    ? alerts 
    : alerts.filter(alert => alert.district.toLowerCase() === selectedDistrict.toLowerCase());

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading hazard alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Punjab Hazard Alerts</h1>
              <p className="text-gray-600 mt-2">Real-time disaster and weather alerts for Punjab</p>
            </div>
            <Link
              to="/"
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter by District</h2>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            {punjabDistricts.map((district) => (
              <option key={district} value={district === 'All Districts' ? 'all' : district}>
                {district}
              </option>
            ))}
          </select>
        </div>

        {/* Alerts Section */}
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Alerts</h3>
            <p className="text-gray-600">There are currently no hazard alerts for the selected area.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Active Alerts ({filteredAlerts.length})
            </h2>
            
            {filteredAlerts.map((alert) => (
              <div key={alert.id} className="bg-white rounded-lg shadow-sm border-l-4 border-red-500">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="text-3xl">{getTypeIcon(alert.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{alert.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(alert.severity)}`}>
                            {alert.severity.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-3">{alert.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {alert.district}
                          </span>
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Issued: {new Date(alert.issuedAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Expires: {new Date(alert.expiresAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Emergency Guidelines */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Emergency Guidelines</h3>
          <ul className="space-y-2 text-blue-800">
            <li>• Stay tuned to official sources for updates</li>
            <li>• Follow evacuation orders if issued</li>
            <li>• Keep emergency supplies ready</li>
            <li>• Avoid traveling unless absolutely necessary</li>
            <li>• Contact local authorities for assistance</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HazardAlertsPage;
