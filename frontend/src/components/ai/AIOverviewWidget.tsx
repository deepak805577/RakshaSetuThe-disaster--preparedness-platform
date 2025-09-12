import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../common/Card';
import { aiService } from '../../services/aiService';

interface AIOverviewWidgetProps {
  schoolId?: string;
  className?: string;
}

interface SystemStatus {
  status: string;
  uptime: number;
  version: string;
  models_loaded: {
    risk_predictor: boolean;
    hazard_detector: boolean;
    crowd_analyzer: boolean;
  };
  performance: {
    cpu_usage: number;
    memory_usage: number;
    avg_response_time: number;
  };
  recent_activities: Array<{
    timestamp: string;
    type: string;
    details: string;
    status: string;
  }>;
}

interface QuickStats {
  total_analyses: number;
  high_risk_alerts: number;
  hazards_detected: number;
  drills_analyzed: number;
  last_updated: string;
}

const AIOverviewWidget: React.FC<AIOverviewWidgetProps> = ({ 
  schoolId, 
  className = '' 
}) => {
  const [loading, setLoading] = useState(false);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [quickStats, setQuickStats] = useState<QuickStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  useEffect(() => {
    fetchSystemStatus();
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchSystemStatus, 30 * 1000);
    return () => clearInterval(interval);
  }, [schoolId]);

  const fetchSystemStatus = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch system status
      const statusResponse = await aiService.getSystemStatus();
      setSystemStatus(statusResponse.data);

      // Generate mock quick stats for demo
      const mockStats: QuickStats = {
        total_analyses: Math.floor(Math.random() * 1000) + 500,
        high_risk_alerts: Math.floor(Math.random() * 20) + 5,
        hazards_detected: Math.floor(Math.random() * 50) + 10,
        drills_analyzed: Math.floor(Math.random() * 100) + 25,
        last_updated: new Date().toISOString()
      };
      setQuickStats(mockStats);
      
      setLastRefresh(new Date());
    } catch (err: any) {
      setError(err.message || 'Failed to fetch system status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'healthy': case 'online': case 'success': 
        return 'bg-green-100 text-green-800';
      case 'warning': case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'error': case 'offline': case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'risk_assessment': return '⚠️';
      case 'hazard_detection': return '🔍';
      case 'drill_analysis': return '📊';
      case 'weather_analysis': return '🌦️';
      case 'system_health': return '💻';
      default: return '📋';
    }
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className={`ai-overview-widget ${className}`}>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold flex items-center">
              🤖 AI System Overview
            </h3>
            <button
              onClick={fetchSystemStatus}
              disabled={loading}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '⟳' : '🔄'} Refresh
            </button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-600 text-sm">Error: {error}</p>
              </div>
            )}

            {/* Loading State */}
            {loading && !systemStatus && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Fetching system status...</p>
              </div>
            )}

            {/* System Status */}
            {systemStatus && (
              <div className="space-y-6">
                {/* Overall Status */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-900">System Status</h4>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(systemStatus.status)}`}>
                      {systemStatus.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-gray-500">Uptime</div>
                      <div className="font-semibold">{formatUptime(systemStatus.uptime)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-500">Version</div>
                      <div className="font-semibold">{systemStatus.version}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-500">Response Time</div>
                      <div className="font-semibold">{systemStatus.performance?.avg_response_time || 120}ms</div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                {quickStats && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">📈 Activity Summary</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{quickStats.total_analyses}</div>
                        <div className="text-sm text-blue-700">Total AI Analyses</div>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{quickStats.high_risk_alerts}</div>
                        <div className="text-sm text-red-700">High Risk Alerts</div>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{quickStats.hazards_detected}</div>
                        <div className="text-sm text-orange-700">Hazards Detected</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{quickStats.drills_analyzed}</div>
                        <div className="text-sm text-green-700">Drills Analyzed</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Models Status */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">🧠 AI Models Status</h4>
                  <div className="grid gap-3">
                    <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                      <span className="text-sm font-medium">Risk Prediction Model</span>
                      <span className={`text-xs px-2 py-1 rounded ${systemStatus.models_loaded?.risk_predictor ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {systemStatus.models_loaded?.risk_predictor ? '✓ Loaded' : '✗ Not Loaded'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                      <span className="text-sm font-medium">Hazard Detection Model</span>
                      <span className={`text-xs px-2 py-1 rounded ${systemStatus.models_loaded?.hazard_detector ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {systemStatus.models_loaded?.hazard_detector ? '✓ Loaded' : '✗ Not Loaded'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                      <span className="text-sm font-medium">Crowd Analysis Model</span>
                      <span className={`text-xs px-2 py-1 rounded ${systemStatus.models_loaded?.crowd_analyzer ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {systemStatus.models_loaded?.crowd_analyzer ? '✓ Loaded' : '✗ Not Loaded'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* System Performance */}
                {systemStatus.performance && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">⚡ Performance Metrics</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">CPU Usage</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 bg-blue-500 rounded-full"
                              style={{ width: `${systemStatus.performance.cpu_usage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{systemStatus.performance.cpu_usage}%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Memory Usage</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 bg-green-500 rounded-full"
                              style={{ width: `${systemStatus.performance.memory_usage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{systemStatus.performance.memory_usage}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recent Activities */}
                {systemStatus.recent_activities && systemStatus.recent_activities.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">📋 Recent Activities</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {systemStatus.recent_activities.slice(0, 10).map((activity, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">{getActivityIcon(activity.type)}</span>
                            <div>
                              <div className="text-sm font-medium">{activity.details}</div>
                              <div className="text-xs text-gray-500">{formatTimestamp(activity.timestamp)}</div>
                            </div>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${getStatusColor(activity.status)}`}>
                            {activity.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Last Refresh */}
                {lastRefresh && (
                  <div className="text-center text-xs text-gray-500">
                    Last refreshed: {lastRefresh.toLocaleTimeString()}
                  </div>
                )}
              </div>
            )}

            {/* Quick Actions */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">⚡ Quick Actions</h4>
              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                  <span className="mr-2">🔍</span>
                  <span className="text-sm font-medium">Run System Diagnostic</span>
                </button>
                <button className="flex items-center justify-center p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
                  <span className="mr-2">📊</span>
                  <span className="text-sm font-medium">View Full Analytics</span>
                </button>
                <button className="flex items-center justify-center p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
                  <span className="mr-2">⚙️</span>
                  <span className="text-sm font-medium">Model Settings</span>
                </button>
                <button className="flex items-center justify-center p-3 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors">
                  <span className="mr-2">📋</span>
                  <span className="text-sm font-medium">Export Report</span>
                </button>
              </div>
            </div>

            {/* Demo Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                💡 <strong>AI System Monitor:</strong> Real-time monitoring of AI services, model performance, and system health for optimal disaster preparedness capabilities.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIOverviewWidget;
