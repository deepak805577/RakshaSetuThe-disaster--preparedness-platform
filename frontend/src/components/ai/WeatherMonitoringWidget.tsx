import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../common/Card';
import { aiService } from '../../services/aiService';

interface WeatherMonitoringWidgetProps {
  schoolId?: string;
  className?: string;
}

interface WeatherData {
  location: string;
  current: {
    temperature: number;
    humidity: number;
    wind_speed: number;
    visibility: number;
    pressure: number;
    condition: string;
    icon: string;
  };
  forecast: Array<{
    date: string;
    high: number;
    low: number;
    condition: string;
    icon: string;
    precipitation: number;
    wind_speed: number;
  }>;
  alerts: Array<{
    type: string;
    severity: string;
    message: string;
    start_time: string;
    end_time: string;
  }>;
  risk_analysis: {
    overall_risk: string;
    specific_risks: Record<string, string>;
    recommendations: string[];
  };
}

const WeatherMonitoringWidget: React.FC<WeatherMonitoringWidgetProps> = ({ 
  schoolId, 
  className = '' 
}) => {
  const [loading, setLoading] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>('Chandigarh');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const punjabCities = [
    'Chandigarh', 'Amritsar', 'Ludhiana', 'Jalandhar', 'Patiala', 
    'Bathinda', 'Mohali', 'Hoshiarpur', 'Kapurthala', 'Firozpur'
  ];

  useEffect(() => {
    fetchWeatherData();
    // Set up auto-refresh every 15 minutes
    const interval = setInterval(fetchWeatherData, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [selectedLocation]);

  const fetchWeatherData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await aiService.getWeatherForecast(selectedLocation, schoolId);
      setWeatherData(response.data);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message || 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'minor': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'moderate': return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'severe': return 'bg-red-50 border-red-200 text-red-800';
      case 'extreme': return 'bg-purple-50 border-purple-200 text-purple-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition?.toLowerCase()) {
      case 'sunny': case 'clear': return '☀️';
      case 'cloudy': case 'overcast': return '☁️';
      case 'partly cloudy': return '⛅';
      case 'rainy': case 'rain': return '🌧️';
      case 'thunderstorm': return '⛈️';
      case 'snow': case 'snowy': return '❄️';
      case 'foggy': case 'mist': return '🌫️';
      case 'windy': return '💨';
      default: return '🌤️';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`weather-monitoring-widget ${className}`}>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold flex items-center">
              🌦️ Weather Monitoring & Risk Analysis
            </h3>
            <button
              onClick={fetchWeatherData}
              disabled={loading}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '⟳' : '🔄'} Refresh
            </button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            {/* Location Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Location
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {punjabCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-600 text-sm">Error: {error}</p>
              </div>
            )}

            {/* Loading State */}
            {loading && !weatherData && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Fetching weather data...</p>
              </div>
            )}

            {/* Weather Data */}
            {weatherData && !loading && (
              <div className="space-y-6">
                {/* Current Weather */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Current Weather - {weatherData.location}</h4>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-4xl">{getWeatherIcon(weatherData.current.condition)}</span>
                      <div>
                        <div className="text-3xl font-bold text-gray-900">
                          {weatherData.current.temperature}°C
                        </div>
                        <div className="text-gray-700 capitalize">
                          {weatherData.current.condition}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-gray-500">Humidity</div>
                        <div className="font-semibold">{weatherData.current.humidity}%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-500">Wind</div>
                        <div className="font-semibold">{weatherData.current.wind_speed} km/h</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-500">Visibility</div>
                        <div className="font-semibold">{weatherData.current.visibility} km</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-500">Pressure</div>
                        <div className="font-semibold">{weatherData.current.pressure} mb</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Weather Alerts */}
                {weatherData.alerts.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">🚨 Active Weather Alerts</h4>
                    <div className="space-y-3">
                      {weatherData.alerts.map((alert, index) => (
                        <div 
                          key={index}
                          className={`border rounded-lg p-4 ${getAlertColor(alert.severity)}`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-semibold capitalize">{alert.type} Alert</div>
                            <span className="text-xs px-2 py-1 bg-white bg-opacity-50 rounded">
                              {alert.severity.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm mb-2">{alert.message}</p>
                          <div className="text-xs">
                            Valid: {formatTime(alert.start_time)} - {formatTime(alert.end_time)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Risk Analysis */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">⚠️ Risk Analysis</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Overall Risk Level:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(weatherData.risk_analysis.overall_risk)}`}>
                        {weatherData.risk_analysis.overall_risk}
                      </span>
                    </div>

                    {/* Specific Risks */}
                    {Object.keys(weatherData.risk_analysis.specific_risks).length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Specific Risk Factors:</h5>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(weatherData.risk_analysis.specific_risks).map(([risk, level]) => (
                            <div key={risk} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded">
                              <span className="text-sm capitalize">{risk.replace('_', ' ')}</span>
                              <span className={`text-xs px-2 py-1 rounded ${getRiskColor(level)}`}>
                                {level}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    {weatherData.risk_analysis.recommendations.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Recommendations:</h5>
                        <ul className="space-y-1">
                          {weatherData.risk_analysis.recommendations.map((recommendation, index) => (
                            <li key={index} className="text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded">
                              • {recommendation}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* 5-Day Forecast */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">📅 5-Day Forecast</h4>
                  <div className="grid gap-3">
                    {weatherData.forecast.slice(0, 5).map((day, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{getWeatherIcon(day.condition)}</span>
                          <div>
                            <div className="font-medium">{formatDate(day.date)}</div>
                            <div className="text-sm text-gray-600 capitalize">{day.condition}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            {day.high}° / {day.low}°
                          </div>
                          <div className="text-xs text-gray-500">
                            {day.precipitation}% rain • {day.wind_speed} km/h
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Last Updated */}
                {lastUpdated && (
                  <div className="text-center text-xs text-gray-500">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </div>
                )}
              </div>
            )}

            {/* Demo Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                💡 <strong>Live Weather Data:</strong> Real-time weather monitoring with AI-powered risk analysis for disaster preparedness planning.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeatherMonitoringWidget;
