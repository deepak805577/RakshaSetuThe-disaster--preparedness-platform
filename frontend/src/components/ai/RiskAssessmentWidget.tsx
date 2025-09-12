import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../common/Card';
import { aiService, RiskAssessmentRequest } from '../../services/aiService';

interface RiskAssessmentWidgetProps {
  schoolId?: string;
  className?: string;
}

interface RiskData {
  overall_risk: {
    risk_level: string;
    risk_score: number;
    confidence: number;
  };
  weather_risk: {
    score: number;
    factors: string[];
  };
  disaster_types: Record<string, number>;
  recommendations: string[];
}

const RiskAssessmentWidget: React.FC<RiskAssessmentWidgetProps> = ({ 
  schoolId, 
  className = '' 
}) => {
  const [riskData, setRiskData] = useState<RiskData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState('Amritsar');

  const punjabDistricts = [
    'Amritsar', 'Ludhiana', 'Jalandhar', 'Patiala', 'Bathinda',
    'Mohali', 'Gurdaspur', 'Pathankot', 'Hoshiarpur', 'Kapurthala'
  ];

  const districtCoords: Record<string, [number, number]> = {
    'Amritsar': [31.6340, 74.8723],
    'Ludhiana': [30.9010, 75.8573],
    'Jalandhar': [31.3260, 75.5762],
    'Patiala': [30.3398, 76.3869],
    'Bathinda': [30.2110, 74.9455],
    'Mohali': [30.7046, 76.7179],
    'Gurdaspur': [32.0409, 75.4065],
    'Pathankot': [32.2741, 75.6522],
    'Hoshiarpur': [31.5385, 75.9117],
    'Kapurthala': [31.3800, 75.3800]
  };

  const assessRisk = async () => {
    if (!selectedDistrict) return;

    setLoading(true);
    setError(null);

    try {
      const [lat, lon] = districtCoords[selectedDistrict];
      const request: RiskAssessmentRequest = {
        latitude: lat,
        longitude: lon,
        district: selectedDistrict,
        school_id: schoolId,
        building_type: 'school'
      };

      const response = await aiService.assessRisk(request);
      setRiskData(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to assess risk');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    assessRisk();
  }, [selectedDistrict]);

  const getRiskLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'moderate': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className={`risk-assessment-widget ${className}`}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center">
              🎯 AI Risk Assessment
            </h3>
            <div className="flex items-center space-x-4">
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                {punjabDistricts.map(district => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
              <button
                onClick={assessRisk}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
              >
                {loading ? '🔄' : '📊'} Assess Risk
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Analyzing risk factors...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600">Error: {error}</p>
            </div>
          )}

          {riskData && !loading && (
            <div className="space-y-6">
              {/* Overall Risk Score */}
              <div className="text-center">
                <div className={`inline-block px-6 py-3 rounded-lg ${getRiskLevelColor(riskData.overall_risk.risk_level)}`}>
                  <div className="text-2xl font-bold">
                    {riskData.overall_risk.risk_score.toFixed(1)}/10
                  </div>
                  <div className="text-sm capitalize">
                    {riskData.overall_risk.risk_level} Risk
                  </div>
                  <div className="text-xs">
                    Confidence: {Math.round(riskData.overall_risk.confidence * 100)}%
                  </div>
                </div>
              </div>

              {/* Disaster Types */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Disaster Risk Breakdown</h4>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(riskData.disaster_types).map(([type, score]) => (
                    <div key={type} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm capitalize text-gray-700">
                          {type.replace('_', ' ')}
                        </span>
                        <span className={`text-sm font-medium ${
                          score > 7 ? 'text-red-600' : 
                          score > 4 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {score.toFixed(1)}
                        </span>
                      </div>
                      <div className="mt-1 bg-gray-200 rounded-full h-1">
                        <div 
                          className={`h-1 rounded-full ${
                            score > 7 ? 'bg-red-500' : 
                            score > 4 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(100, score * 10)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weather Risk Factors */}
              {riskData.weather_risk.factors.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Current Weather Risk Factors</h4>
                  <div className="flex flex-wrap gap-2">
                    {riskData.weather_risk.factors.map((factor, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs">
                        {factor}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {riskData.recommendations.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">AI Recommendations</h4>
                  <ul className="space-y-2">
                    {riskData.recommendations.slice(0, 4).map((rec, index) => (
                      <li key={index} className="flex items-start text-sm text-gray-700">
                        <span className="text-blue-600 mr-2">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RiskAssessmentWidget;
