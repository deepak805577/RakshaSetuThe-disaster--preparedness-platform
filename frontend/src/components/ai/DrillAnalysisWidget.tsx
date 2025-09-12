import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardContent } from '../common/Card';
import { aiService } from '../../services/aiService';

interface DrillAnalysisWidgetProps {
  schoolId?: string;
  className?: string;
}

interface DrillAnalysisResult {
  evacuation_time: number;
  people_detected: number;
  crowd_density: string;
  movement_efficiency: number;
  bottlenecks: string[];
  safety_violations: string[];
  performance_score: number;
  recommendations: string[];
  crowd_flow_analysis: {
    average_speed: number;
    congestion_points: number;
    exit_utilization: Record<string, number>;
  };
}

const DrillAnalysisWidget: React.FC<DrillAnalysisWidgetProps> = ({ 
  schoolId, 
  className = '' 
}) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DrillAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [drillType, setDrillType] = useState<string>('fire');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const drillTypes = [
    { value: 'fire', label: '🔥 Fire Drill', icon: '🔥' },
    { value: 'earthquake', label: '⚡ Earthquake Drill', icon: '⚡' },
    { value: 'flood', label: '🌊 Flood Evacuation', icon: '🌊' },
    { value: 'lockdown', label: '🔒 Lockdown Drill', icon: '🔒' }
  ];

  const handleVideoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('video/') && !file.type.startsWith('image/')) {
        setError('Please select a valid video or image file');
        return;
      }
      
      // Validate file size (max 50MB for video, 5MB for image)
      const maxSize = file.type.startsWith('video/') ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setError(`File size must be less than ${file.type.startsWith('video/') ? '50MB' : '5MB'}`);
        return;
      }
      
      setSelectedVideo(file);
      setError(null);
    }
  };

  const analyzeDrill = async () => {
    if (!selectedVideo) {
      setError('Please select a video or image first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await aiService.analyzeDrillPerformance(
        selectedVideo,
        drillType,
        schoolId
      );
      
      setResult(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze drill');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    if (score >= 40) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getDensityColor = (density: string) => {
    switch (density?.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  return (
    <div className={`drill-analysis-widget ${className}`}>
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center">
            📊 AI Drill Performance Analysis
          </h3>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            {/* Drill Type Selection */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Drill Type</h4>
              <div className="grid grid-cols-2 gap-3">
                {drillTypes.map(type => (
                  <label
                    key={type.value}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      drillType === type.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="drillType"
                      value={type.value}
                      checked={drillType === type.value}
                      onChange={(e) => setDrillType(e.target.value)}
                      className="sr-only"
                    />
                    <span className="mr-2">{type.icon}</span>
                    <span className="text-sm font-medium">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Video Upload */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Upload Drill Recording</h4>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*,image/*"
                  onChange={handleVideoSelect}
                  className="hidden"
                />
                
                <div className="text-center">
                  {selectedVideo ? (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Selected: {selectedVideo.name}</p>
                      <p className="text-xs text-gray-500">
                        Size: {(selectedVideo.size / (1024 * 1024)).toFixed(1)} MB
                      </p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        Choose different file
                      </button>
                    </div>
                  ) : (
                    <div>
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v2m0 0v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4m0 0h16"
                        />
                      </svg>
                      <div className="mt-2">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          Click to upload video or image
                        </button>
                        <p className="text-xs text-gray-500 mt-1">
                          MP4, MOV, AVI up to 50MB | PNG, JPG up to 5MB
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Analyze Button */}
            <button
              onClick={analyzeDrill}
              disabled={loading || !selectedVideo}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Analyzing Drill Performance...
                </div>
              ) : (
                '📊 Analyze Drill Performance'
              )}
            </button>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-600 text-sm">Error: {error}</p>
              </div>
            )}

            {/* Results */}
            {result && !loading && (
              <div className="space-y-4">
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-4">Analysis Results</h4>
                  
                  {/* Performance Score */}
                  <div className="text-center mb-6">
                    <div className={`text-4xl font-bold mb-2 ${getScoreColor(result.performance_score)}`}>
                      {result.performance_score}%
                    </div>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getScoreBadge(result.performance_score)}`}>
                      Overall Performance Score
                    </span>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{formatTime(result.evacuation_time)}</div>
                      <div className="text-sm text-blue-700">Evacuation Time</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{result.people_detected}</div>
                      <div className="text-sm text-purple-700">People Detected</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{result.movement_efficiency.toFixed(1)}%</div>
                      <div className="text-sm text-green-700">Movement Efficiency</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getDensityColor(result.crowd_density)}`}>
                        {result.crowd_density}
                      </span>
                      <div className="text-sm text-gray-700 mt-1">Crowd Density</div>
                    </div>
                  </div>

                  {/* Crowd Flow Analysis */}
                  {result.crowd_flow_analysis && (
                    <div className="mb-6">
                      <h5 className="font-medium text-gray-700 mb-3">📈 Crowd Flow Analysis</h5>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-gray-50 p-3 rounded-lg text-center">
                          <div className="font-semibold text-gray-800">
                            {result.crowd_flow_analysis.average_speed.toFixed(1)} m/s
                          </div>
                          <div className="text-xs text-gray-600">Average Speed</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg text-center">
                          <div className="font-semibold text-gray-800">
                            {result.crowd_flow_analysis.congestion_points}
                          </div>
                          <div className="text-xs text-gray-600">Congestion Points</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg text-center">
                          <div className="font-semibold text-gray-800">
                            {Object.keys(result.crowd_flow_analysis.exit_utilization).length}
                          </div>
                          <div className="text-xs text-gray-600">Exits Monitored</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Issues Found */}
                  {(result.bottlenecks.length > 0 || result.safety_violations.length > 0) && (
                    <div className="mb-6">
                      <h5 className="font-medium text-red-600 mb-3">⚠️ Issues Identified</h5>
                      
                      {result.bottlenecks.length > 0 && (
                        <div className="mb-3">
                          <h6 className="text-sm font-medium text-gray-700 mb-2">🚧 Bottlenecks:</h6>
                          <ul className="space-y-1">
                            {result.bottlenecks.map((bottleneck, index) => (
                              <li key={index} className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
                                • {bottleneck}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {result.safety_violations.length > 0 && (
                        <div>
                          <h6 className="text-sm font-medium text-gray-700 mb-2">🚨 Safety Violations:</h6>
                          <ul className="space-y-1">
                            {result.safety_violations.map((violation, index) => (
                              <li key={index} className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
                                • {violation}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Recommendations */}
                  {result.recommendations.length > 0 && (
                    <div>
                      <h5 className="font-medium text-green-600 mb-3">💡 Recommendations</h5>
                      <ul className="space-y-2">
                        {result.recommendations.map((recommendation, index) => (
                          <li key={index} className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                            <span className="font-medium">#{index + 1}</span> {recommendation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Demo Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                💡 <strong>Demo Feature:</strong> Upload evacuation drill videos or crowd photos to get AI-powered performance analysis with actionable insights.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DrillAnalysisWidget;
