import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../common/Card';
import RiskAssessmentWidget from './RiskAssessmentWidget';
import HazardMonitoringWidget from './HazardMonitoringWidget';
import DrillAnalysisWidget from './DrillAnalysisWidget';
import WeatherMonitoringWidget from './WeatherMonitoringWidget';
import { aiService } from '../../services/aiService';
import { useAuth } from '../../contexts/AuthContext';

interface AIDashboardProps {
  schoolId?: string;
  className?: string;
}

interface AIStatus {
  success: boolean;
  models: {
    risk_classifier: boolean;
    hazard_detector: boolean;
  };
  weather_service: boolean;
  timestamp: string;
}

const AIDashboard: React.FC<AIDashboardProps> = ({ 
  schoolId, 
  className = '' 
}) => {
  const { user } = useAuth();
  const [aiStatus, setAiStatus] = useState<AIStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadAIStatus();
    
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(loadAIStatus, 5 * 60 * 1000);
    setRefreshInterval(interval);
    
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

  const loadAIStatus = async () => {
    try {
      const status = await aiService.getStatus();
      setAiStatus(status);
    } catch (error) {
      console.error('Failed to load AI status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: boolean) => {
    return status ? 'text-green-600' : 'text-red-600';
  };

  const getStatusText = (status: boolean) => {
    return status ? 'Online' : 'Offline';
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'risk', label: 'Risk Assessment', icon: '⚠️' },
    { id: 'hazards', label: 'Hazard Monitoring', icon: '🔍' },
    { id: 'drills', label: 'Drill Analysis', icon: '🏃' },
    { id: 'weather', label: 'Weather', icon: '🌤️' }
  ];

  if (loading) {
    return (
      <div className={`ai-dashboard ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading AI Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`ai-dashboard ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              🤖 AI Intelligence Center
            </h2>
            <p className="text-gray-600 mt-1">
              Real-time disaster preparedness insights powered by AI
            </p>
          </div>
          
          {/* AI Status Indicator */}
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <div className="font-medium text-gray-900">AI Services</div>
                <div className={`${aiStatus?.models.risk_classifier ? 'text-green-600' : 'text-red-600'}`}>
                  Risk Prediction: {getStatusText(aiStatus?.models.risk_classifier || false)}
                </div>
                <div className={`${aiStatus?.weather_service ? 'text-green-600' : 'text-red-600'}`}>
                  Weather Service: {getStatusText(aiStatus?.weather_service || false)}
                </div>
              </div>
              
              <button
                onClick={loadAIStatus}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Refresh Status"
              >
                🔄
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">AI Insights Summary</h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">Live</div>
                    <div className="text-sm text-gray-600">Risk Assessment</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">24/7</div>
                    <div className="text-sm text-gray-600">Hazard Monitoring</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">Smart</div>
                    <div className="text-sm text-gray-600">Drill Analysis</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">Real-time</div>
                    <div className="text-sm text-gray-600">Weather Data</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Alerts */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Recent AI Alerts</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <span className="text-yellow-600 mr-3">⚠️</span>
                    <div>
                      <div className="font-medium text-yellow-800">Moderate Risk Detected</div>
                      <div className="text-sm text-yellow-600">Weather conditions show increased flood risk</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-green-600 mr-3">✅</span>
                    <div>
                      <div className="font-medium text-green-800">Drill Analysis Complete</div>
                      <div className="text-sm text-green-600">Evacuation drill scored 8.5/10 - Good performance</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <span className="text-blue-600 mr-3">🔍</span>
                    <div>
                      <div className="font-medium text-blue-800">Hazard Monitoring Active</div>
                      <div className="text-sm text-blue-600">3 cameras actively monitoring for hazards</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'risk' && (
          <RiskAssessmentWidget schoolId={schoolId} />
        )}

        {activeTab === 'hazards' && (
          <HazardMonitoringWidget schoolId={schoolId} />
        )}

        {activeTab === 'drills' && (
          <DrillAnalysisWidget schoolId={schoolId} />
        )}

        {activeTab === 'weather' && (
          <WeatherMonitoringWidget schoolId={schoolId} />
        )}
      </div>

      {/* Feature Description */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          🚀 AI-Powered Disaster Preparedness Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-3">
            <div className="text-2xl mb-2">🎯</div>
            <div className="font-medium text-gray-900">Predictive Risk Assessment</div>
            <div className="text-sm text-gray-600 mt-1">
              ML-powered risk prediction using weather, geography, and historical data
            </div>
          </div>
          
          <div className="text-center p-3">
            <div className="text-2xl mb-2">👁️</div>
            <div className="font-medium text-gray-900">Computer Vision</div>
            <div className="text-sm text-gray-600 mt-1">
              Real-time hazard detection from camera feeds using AI
            </div>
          </div>
          
          <div className="text-center p-3">
            <div className="text-2xl mb-2">📊</div>
            <div className="font-medium text-gray-900">Drill Analysis</div>
            <div className="text-sm text-gray-600 mt-1">
              AI-powered analysis of evacuation drill performance
            </div>
          </div>
          
          <div className="text-center p-3">
            <div className="text-2xl mb-2">🌦️</div>
            <div className="font-medium text-gray-900">Weather Intelligence</div>
            <div className="text-sm text-gray-600 mt-1">
              Integration with IMD and weather APIs for risk modeling
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIDashboard;
