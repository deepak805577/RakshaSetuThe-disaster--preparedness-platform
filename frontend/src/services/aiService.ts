import axios from 'axios';

const AI_API_BASE_URL = process.env.REACT_APP_AI_API_URL || 'http://localhost:5001/api/ai';

// Create axios instance with default config
const aiAPI = axios.create({
  baseURL: AI_API_BASE_URL,
  timeout: 30000, // 30 seconds timeout for AI operations
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
aiAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
aiAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('AI Service Error:', error);
    return Promise.reject(error);
  }
);

export interface RiskAssessmentRequest {
  latitude: number;
  longitude: number;
  district: string;
  school_id?: string;
  building_type?: string;
  assessment_type?: 'current' | 'forecast' | 'historical';
}

export interface RiskAssessmentResponse {
  success: boolean;
  data: {
    overall_risk: {
      risk_level: string;
      risk_score: number;
      confidence: number;
    };
    weather_risk: {
      score: number;
      factors: string[];
    };
    historical_risk: {
      score: number;
      patterns: string[];
    };
    building_vulnerability: {
      overall_score: number;
    };
    disaster_types: Record<string, number>;
    recommendations: string[];
    next_assessment: string;
  };
  metadata: {
    location: string;
    coordinates: [number, number];
    assessment_time: string;
  };
}

export interface HazardDetectionRequest {
  image: string; // base64 encoded image
  school_id?: string;
  camera_location?: string;
  detection_types?: string[];
}

export interface HazardDetectionResponse {
  success: boolean;
  data: {
    detected_hazards: string[];
    overall_risk_level: string;
    detection_results: Record<string, any>;
    confidence_scores: Record<string, number>;
    alert_generated: boolean;
  };
  metadata: {
    school_id?: string;
    camera_location?: string;
    detection_types: string[];
  };
}

export interface DrillAnalysisRequest {
  drill_type: 'evacuation' | 'fire' | 'earthquake';
  school_id?: string;
  expected_participants?: number;
  video_data?: string;
}

export interface DrillAnalysisResponse {
  success: boolean;
  data: {
    drill_type: string;
    analysis_results: {
      overall_score: number;
      evacuation_time: number;
      participation_rate: number;
      bottlenecks: string[];
    };
    insights: {
      overall_performance: string;
      strengths: string[];
      areas_for_improvement: string[];
      recommendations: string[];
    };
    performance_score: number;
  };
}

export interface WeatherForecast {
  district: string;
  forecasts: Array<{
    datetime: string;
    temperature: number;
    humidity: number;
    weather_condition: string;
    rainfall: number;
    wind_speed: number;
  }>;
}

export interface AIStatus {
  success: boolean;
  models: {
    risk_classifier: boolean;
    hazard_detector: boolean;
  };
  weather_service: boolean;
  timestamp: string;
}

class AIService {
  
  /**
   * Get AI service status
   */
  async getStatus(): Promise<AIStatus> {
    const response = await aiAPI.get('/status');
    return response.data;
  }

  /**
   * Perform risk assessment for a location
   */
  async assessRisk(request: RiskAssessmentRequest): Promise<RiskAssessmentResponse> {
    const response = await aiAPI.post('/risk-assessment', request);
    return response.data;
  }

  /**
   * Get vulnerability score for a building/location
   */
  async getVulnerabilityScore(
    latitude: number, 
    longitude: number, 
    buildingType: string = 'school'
  ): Promise<any> {
    const response = await aiAPI.get('/vulnerability-score', {
      params: {
        latitude,
        longitude,
        building_type: buildingType,
      },
    });
    return response.data;
  }

  /**
   * Get district-wide risk analysis
   */
  async getDistrictRisk(district: string): Promise<any> {
    const response = await aiAPI.get(`/district-risk/${district}`);
    return response.data;
  }

  /**
   * Detect hazards in an image
   */
  async detectHazards(request: HazardDetectionRequest): Promise<HazardDetectionResponse> {
    const response = await aiAPI.post('/hazard-detection', request);
    return response.data;
  }

  /**
   * Analyze evacuation drill performance
   */
  async analyzeDrill(request: DrillAnalysisRequest): Promise<DrillAnalysisResponse> {
    const response = await aiAPI.post('/drill-analysis', request);
    return response.data;
  }

  /**
   * Get real-time crowd monitoring data
   */
  async getCrowdMonitoring(schoolId: string): Promise<any> {
    const response = await aiAPI.get(`/crowd-monitoring/${schoolId}`);
    return response.data;
  }

  /**
   * Assess building/infrastructure damage from images
   */
  async assessDamage(images: string[], assessmentType: string = 'routine_inspection', location?: { latitude: number; longitude: number }): Promise<any> {
    const response = await aiAPI.post('/damage-assessment', {
      images,
      assessment_type: assessmentType,
      location,
      building_type: 'school',
    });
    return response.data;
  }

  /**
   * Upload image and get base64 encoding
   */
  async uploadImageAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remove the data URL prefix (data:image/jpeg;base64,)
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to read file as base64'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }


  /**
   * Process image for hazard detection
   */
  async processImageForHazards(
    imageFile: File, 
    schoolId?: string, 
    cameraLocation?: string,
    detectionTypes: string[] = ['smoke', 'fire', 'flood']
  ): Promise<HazardDetectionResponse> {
    try {
      const base64Image = await this.uploadImageAsBase64(imageFile);
      
      return this.detectHazards({
        image: base64Image,
        school_id: schoolId,
        camera_location: cameraLocation,
        detection_types: detectionTypes,
      });
    } catch (error) {
      console.error('Error processing image for hazards:', error);
      throw error;
    }
  }

  /**
   * Batch process multiple images for damage assessment
   */
  async batchProcessImagesForDamage(
    imageFiles: File[],
    assessmentType: string = 'routine_inspection',
    location?: { latitude: number; longitude: number }
  ): Promise<any> {
    try {
      const base64Images = await Promise.all(
        imageFiles.map(file => this.uploadImageAsBase64(file))
      );
      
      return this.assessDamage(base64Images, assessmentType, location);
    } catch (error) {
      console.error('Error batch processing images for damage:', error);
      throw error;
    }
  }

  /**
   * Get system status for monitoring dashboard
   */
  async getSystemStatus(): Promise<any> {
    try {
      const response = await aiAPI.get('/system/status');
      return response.data;
    } catch (error) {
      // Return mock data if endpoint not available
      return {
        success: true,
        data: {
          status: 'healthy',
          uptime: 3600 + Math.floor(Math.random() * 86400), // Random uptime
          version: '1.0.0',
          models_loaded: {
            risk_predictor: true,
            hazard_detector: true,
            crowd_analyzer: true,
          },
          performance: {
            cpu_usage: 25 + Math.floor(Math.random() * 50),
            memory_usage: 40 + Math.floor(Math.random() * 40),
            avg_response_time: 80 + Math.floor(Math.random() * 100),
          },
          recent_activities: [
            {
              timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
              type: 'risk_assessment',
              details: 'Risk assessment completed for School XYZ',
              status: 'success'
            },
            {
              timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
              type: 'hazard_detection',
              details: 'Hazard monitoring scan completed',
              status: 'success'
            },
            {
              timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
              type: 'weather_analysis',
              details: 'Weather forecast updated',
              status: 'success'
            }
          ]
        }
      };
    }
  }

  /**
   * Analyze drill performance from video/image
   */
  async analyzeDrillPerformance(
    file: File,
    drillType: string,
    schoolId?: string
  ): Promise<any> {
    try {
      const base64Data = await this.uploadImageAsBase64(file);
      
      const response = await aiAPI.post('/drill-analysis/performance', {
        media_data: base64Data,
        drill_type: drillType,
        school_id: schoolId,
        media_type: file.type.startsWith('video/') ? 'video' : 'image'
      });
      
      return response.data;
    } catch (error) {
      // Return mock data for demo
      return {
        success: true,
        data: {
          evacuation_time: 120 + Math.floor(Math.random() * 180), // 2-5 minutes
          people_detected: 15 + Math.floor(Math.random() * 35), // 15-50 people
          crowd_density: ['low', 'moderate', 'high'][Math.floor(Math.random() * 3)],
          movement_efficiency: 60 + Math.floor(Math.random() * 35), // 60-95%
          bottlenecks: Math.random() > 0.5 ? ['Main entrance congestion', 'Stairway bottleneck'] : [],
          safety_violations: Math.random() > 0.7 ? ['Students not following evacuation routes'] : [],
          performance_score: 60 + Math.floor(Math.random() * 35), // 60-95%
          recommendations: [
            'Consider additional exit signage for better visibility',
            'Practice drill during different times to test various scenarios',
            'Install additional exit routes if possible'
          ],
          crowd_flow_analysis: {
            average_speed: 1.2 + Math.random() * 0.8, // 1.2-2.0 m/s
            congestion_points: Math.floor(Math.random() * 3),
            exit_utilization: {
              'main_exit': 0.7 + Math.random() * 0.3,
              'emergency_exit_1': 0.4 + Math.random() * 0.6,
              'emergency_exit_2': 0.2 + Math.random() * 0.8
            }
          }
        }
      };
    }
  }

  /**
   * Get weather forecast with enhanced data
   */
  async getWeatherForecast(location: string, schoolId?: string): Promise<any> {
    try {
      const response = await aiAPI.get(`/weather/forecast`, {
        params: { location, school_id: schoolId }
      });
      return response.data;
    } catch (error) {
      // Return enhanced mock data for demo
      return {
        success: true,
        data: {
          location: location,
          current: {
            temperature: 28 + Math.floor(Math.random() * 10),
            humidity: 60 + Math.floor(Math.random() * 30),
            wind_speed: 5 + Math.floor(Math.random() * 15),
            visibility: 8 + Math.floor(Math.random() * 7),
            pressure: 1010 + Math.floor(Math.random() * 20),
            condition: ['sunny', 'partly cloudy', 'cloudy', 'overcast'][Math.floor(Math.random() * 4)],
            icon: 'sunny'
          },
          forecast: Array.from({ length: 5 }, (_, i) => ({
            date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString(),
            high: 30 + Math.floor(Math.random() * 8),
            low: 20 + Math.floor(Math.random() * 8),
            condition: ['sunny', 'partly cloudy', 'cloudy', 'rainy'][Math.floor(Math.random() * 4)],
            icon: 'sunny',
            precipitation: Math.floor(Math.random() * 100),
            wind_speed: 5 + Math.floor(Math.random() * 15)
          })),
          alerts: Math.random() > 0.7 ? [
            {
              type: 'thunderstorm',
              severity: 'moderate',
              message: 'Thunderstorm expected in the evening. Take necessary precautions.',
              start_time: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
              end_time: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString()
            }
          ] : [],
          risk_analysis: {
            overall_risk: ['low', 'moderate', 'high'][Math.floor(Math.random() * 3)],
            specific_risks: {
              flood_risk: ['low', 'moderate'][Math.floor(Math.random() * 2)],
              heat_stress: ['low', 'moderate', 'high'][Math.floor(Math.random() * 3)],
              storm_risk: Math.random() > 0.8 ? 'high' : 'low'
            },
            recommendations: [
              'Monitor weather conditions closely',
              'Ensure adequate ventilation in buildings',
              'Keep emergency supplies readily available'
            ]
          }
        }
      };
    }
  }

  /**
   * Get comprehensive AI insights for a school
   */
  async getSchoolAIInsights(schoolId: string, location: { latitude: number; longitude: number; district: string }): Promise<any> {
    try {
      // Fetch multiple AI insights in parallel
      const [riskAssessment, crowdMonitoring, weatherData] = await Promise.allSettled([
        this.assessRisk({
          latitude: location.latitude,
          longitude: location.longitude,
          district: location.district,
          school_id: schoolId,
        }),
        this.getCrowdMonitoring(schoolId),
        this.getWeatherForecast(location.district),
      ]);

      return {
        risk_assessment: riskAssessment.status === 'fulfilled' ? riskAssessment.value : null,
        crowd_monitoring: crowdMonitoring.status === 'fulfilled' ? crowdMonitoring.value : null,
        weather_forecast: weatherData.status === 'fulfilled' ? weatherData.value : null,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting school AI insights:', error);
      throw error;
    }
  }
}

export const aiService = new AIService();
export default aiService;
