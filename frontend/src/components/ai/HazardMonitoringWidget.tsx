import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardContent } from '../common/Card';
import { aiService } from '../../services/aiService';

interface HazardMonitoringWidgetProps {
  schoolId?: string;
  className?: string;
}

interface HazardResult {
  detected_hazards: string[];
  overall_risk_level: string;
  detection_results: Record<string, any>;
  confidence_scores: Record<string, number>;
  alert_generated: boolean;
}

const HazardMonitoringWidget: React.FC<HazardMonitoringWidgetProps> = ({ 
  schoolId, 
  className = '' 
}) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HazardResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const detectionTypes = [
    { id: 'fire', label: '🔥 Fire Detection', color: 'text-red-600' },
    { id: 'smoke', label: '💨 Smoke Detection', color: 'text-gray-600' },
    { id: 'flood', label: '🌊 Flood Detection', color: 'text-blue-600' },
    { id: 'crowd', label: '👥 Crowd Monitoring', color: 'text-purple-600' }
  ];

  const [selectedTypes, setSelectedTypes] = useState(['fire', 'smoke', 'flood']);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      
      setSelectedImage(file);
      setError(null);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await aiService.processImageForHazards(
        selectedImage,
        schoolId,
        'camera_feed_1',
        selectedTypes
      );
      
      setResult(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze image');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getHazardIcon = (hazard: string) => {
    switch (hazard.toLowerCase()) {
      case 'fire': return '🔥';
      case 'smoke': return '💨';
      case 'flood': return '🌊';
      case 'overcrowding': return '👥';
      case 'structural_damage': return '🏗️';
      default: return '⚠️';
    }
  };

  return (
    <div className={`hazard-monitoring-widget ${className}`}>
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center">
            🔍 AI Hazard Detection
          </h3>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            {/* Detection Types Selection */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Detection Types</h4>
              <div className="flex flex-wrap gap-3">
                {detectionTypes.map(type => (
                  <label key={type.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(type.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTypes(prev => [...prev, type.id]);
                        } else {
                          setSelectedTypes(prev => prev.filter(t => t !== type.id));
                        }
                      }}
                      className="mr-2"
                    />
                    <span className={`text-sm ${type.color}`}>{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Upload Image for Analysis</h4>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                
                <div className="text-center">
                  {selectedImage ? (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Selected: {selectedImage.name}</p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        Choose different image
                      </button>
                    </div>
                  ) : (
                    <div>
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="mt-2">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          Click to upload image
                        </button>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Analyze Button */}
            <button
              onClick={analyzeImage}
              disabled={loading || !selectedImage || selectedTypes.length === 0}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Analyzing Image...
                </div>
              ) : (
                '🔍 Analyze Image for Hazards'
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
                  <h4 className="font-medium text-gray-900 mb-3">Detection Results</h4>
                  
                  {/* Overall Risk Level */}
                  <div className="mb-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(result.overall_risk_level)}`}>
                      Overall Risk: {result.overall_risk_level}
                    </span>
                  </div>

                  {/* Detected Hazards */}
                  {result.detected_hazards.length > 0 ? (
                    <div className="space-y-3">
                      <h5 className="font-medium text-red-600">⚠️ Hazards Detected:</h5>
                      <div className="grid gap-3">
                        {result.detected_hazards.map((hazard, index) => (
                          <div key={index} className="flex items-center justify-between bg-red-50 p-3 rounded-lg">
                            <span className="flex items-center">
                              <span className="mr-2">{getHazardIcon(hazard)}</span>
                              <span className="capitalize text-red-700 font-medium">
                                {hazard.replace('_', ' ')}
                              </span>
                            </span>
                            {result.confidence_scores[hazard] && (
                              <span className="text-red-600 text-sm">
                                Confidence: {Math.round(result.confidence_scores[hazard] * 100)}%
                              </span>
                            )}
                          </div>
                        ))}
                      </div>

                      {result.alert_generated && (
                        <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                          <p className="text-red-800 text-sm font-medium">
                            🚨 Alert Generated: Emergency notification sent to relevant authorities
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-green-700 flex items-center">
                        <span className="mr-2">✅</span>
                        No hazards detected in the image
                      </p>
                    </div>
                  )}

                  {/* Detection Details */}
                  <div className="mt-4">
                    <h5 className="font-medium text-gray-700 mb-2">Detection Details:</h5>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(result.detection_results).map(([type, data]: [string, any]) => (
                        <div key={type} className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-sm">
                            <div className="font-medium capitalize text-gray-700">{type}</div>
                            <div className="text-xs text-gray-600 mt-1">
                              {data?.detected ? '✓ Detected' : '○ Not detected'}
                              {data?.confidence && ` (${Math.round(data.confidence * 100)}%)`}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Demo Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                💡 <strong>Demo Feature:</strong> Upload images of fire, smoke, flooding, or crowds to test the AI hazard detection system.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HazardMonitoringWidget;
