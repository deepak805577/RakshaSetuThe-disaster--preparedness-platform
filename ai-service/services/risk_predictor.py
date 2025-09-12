import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import logging
from typing import Dict, List, Optional, Tuple
from sklearn.ensemble import RandomForestRegressor, GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
import joblib
import os
from config.database import get_db

logger = logging.getLogger(__name__)

class RiskPredictor:
    """Machine Learning-based risk prediction system for disaster preparedness"""
    
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.feature_columns = [
            'temperature', 'humidity', 'wind_speed', 'rainfall',
            'historical_disaster_count', 'days_since_last_disaster',
            'building_vulnerability_score', 'population_density',
            'elevation', 'distance_to_river', 'monsoon_season'
        ]
        self.load_models()
        
        # Punjab districts with their coordinates and characteristics
        self.district_data = {
            'Amritsar': {'lat': 31.6340, 'lon': 74.8723, 'elevation': 234, 'river_distance': 2.1},
            'Ludhiana': {'lat': 30.9010, 'lon': 75.8573, 'elevation': 247, 'river_distance': 1.5},
            'Jalandhar': {'lat': 31.3260, 'lon': 75.5762, 'elevation': 228, 'river_distance': 0.8},
            'Patiala': {'lat': 30.3398, 'lon': 76.3869, 'elevation': 250, 'river_distance': 3.2},
            'Bathinda': {'lat': 30.2110, 'lon': 74.9455, 'elevation': 211, 'river_distance': 5.1},
            'Mohali': {'lat': 30.7046, 'lon': 76.7179, 'elevation': 310, 'river_distance': 1.8},
            'Gurdaspur': {'lat': 32.0409, 'lon': 75.4065, 'elevation': 265, 'river_distance': 1.2},
            'Pathankot': {'lat': 32.2741, 'lon': 75.6522, 'elevation': 332, 'river_distance': 2.8},
            'Hoshiarpur': {'lat': 31.5385, 'lon': 75.9117, 'elevation': 296, 'river_distance': 2.5},
            'Kapurthala': {'lat': 31.3800, 'lon': 75.3800, 'elevation': 226, 'river_distance': 1.1},
            'Faridkot': {'lat': 30.6735, 'lon': 74.7553, 'elevation': 201, 'river_distance': 4.2},
            'Ferozepur': {'lat': 30.9259, 'lon': 74.6109, 'elevation': 208, 'river_distance': 0.5},
            'Muktsar': {'lat': 30.4759, 'lon': 74.5139, 'elevation': 189, 'river_distance': 6.8},
            'Moga': {'lat': 30.8158, 'lon': 75.1708, 'elevation': 217, 'river_distance': 3.1},
            'Barnala': {'lat': 30.3783, 'lon': 75.5456, 'elevation': 227, 'river_distance': 4.5},
            'Sangrur': {'lat': 30.2468, 'lon': 75.8439, 'elevation': 235, 'river_distance': 5.2},
            'Mansa': {'lat': 29.9988, 'lon': 75.3936, 'elevation': 215, 'river_distance': 7.1},
            'Nawanshahr': {'lat': 31.1265, 'lon': 76.1178, 'elevation': 287, 'river_distance': 2.9},
            'Rupnagar': {'lat': 30.9645, 'lon': 76.5270, 'elevation': 260, 'river_distance': 0.9},
            'Fatehgarh Sahib': {'lat': 30.6446, 'lon': 76.3971, 'elevation': 259, 'river_distance': 3.8},
            'Tarn Taran': {'lat': 31.4515, 'lon': 74.9289, 'elevation': 217, 'river_distance': 2.3},
            'Fazilka': {'lat': 30.4028, 'lon': 74.0284, 'elevation': 169, 'river_distance': 8.9}
        }
    
    def load_models(self):
        """Load pre-trained ML models"""
        model_dir = 'models'
        try:
            if os.path.exists(os.path.join(model_dir, 'risk_classifier.joblib')):
                self.models['risk_classifier'] = joblib.load(
                    os.path.join(model_dir, 'risk_classifier.joblib')
                )
                self.scalers['risk'] = joblib.load(
                    os.path.join(model_dir, 'risk_scaler.joblib')
                )
                logger.info("Loaded pre-trained risk assessment models")
            else:
                logger.info("No pre-trained models found, will use rule-based predictions")
                self.initialize_default_models()
        except Exception as e:
            logger.warning(f"Failed to load models: {str(e)}, using rule-based predictions")
            self.initialize_default_models()
    
    def initialize_default_models(self):
        """Initialize default models with synthetic training data"""
        try:
            # Create synthetic training data
            X_train, y_train = self._generate_training_data()
            
            # Train risk classifier
            self.models['risk_classifier'] = GradientBoostingClassifier(
                n_estimators=100, random_state=42
            )
            self.scalers['risk'] = StandardScaler()
            
            X_scaled = self.scalers['risk'].fit_transform(X_train)
            self.models['risk_classifier'].fit(X_scaled, y_train)
            
            # Save models
            os.makedirs('models', exist_ok=True)
            joblib.dump(self.models['risk_classifier'], 'models/risk_classifier.joblib')
            joblib.dump(self.scalers['risk'], 'models/risk_scaler.joblib')
            
            logger.info("Initialized and saved default ML models")
        except Exception as e:
            logger.error(f"Failed to initialize models: {str(e)}")
    
    def _generate_training_data(self) -> Tuple[np.ndarray, np.ndarray]:
        """Generate synthetic training data for model initialization"""
        np.random.seed(42)
        n_samples = 1000
        
        # Generate features
        temperature = np.random.normal(30, 10, n_samples)  # Average temp in Punjab
        humidity = np.random.normal(65, 15, n_samples)
        wind_speed = np.random.exponential(10, n_samples)
        rainfall = np.random.exponential(5, n_samples)
        historical_count = np.random.poisson(3, n_samples)
        days_since_last = np.random.exponential(180, n_samples)
        vulnerability = np.random.uniform(1, 10, n_samples)
        population_density = np.random.lognormal(5, 1, n_samples)
        elevation = np.random.normal(250, 50, n_samples)
        river_distance = np.random.exponential(3, n_samples)
        monsoon_season = np.random.binomial(1, 0.3, n_samples)  # 30% chance of monsoon
        
        X = np.column_stack([
            temperature, humidity, wind_speed, rainfall,
            historical_count, days_since_last, vulnerability,
            population_density, elevation, river_distance, monsoon_season
        ])
        
        # Generate risk levels based on feature combinations
        y = np.zeros(n_samples)
        for i in range(n_samples):
            risk_score = 0
            
            # Temperature risk
            if temperature[i] > 45: risk_score += 3
            elif temperature[i] < 5: risk_score += 2
            
            # Weather risk
            if rainfall[i] > 100: risk_score += 4
            if wind_speed[i] > 50: risk_score += 3
            
            # Historical risk
            if historical_count[i] > 5: risk_score += 2
            if days_since_last[i] < 30: risk_score += 3
            
            # Vulnerability risk
            risk_score += vulnerability[i] / 3
            
            # Monsoon amplification
            if monsoon_season[i]: risk_score *= 1.5
            
            # Convert to risk categories (0: low, 1: moderate, 2: high, 3: critical)
            if risk_score <= 3: y[i] = 0
            elif risk_score <= 6: y[i] = 1
            elif risk_score <= 9: y[i] = 2
            else: y[i] = 3
        
        return X, y.astype(int)
    
    def predict_risk(self, latitude: float, longitude: float, district: str,
                    weather_data: Dict, historical_data: List[Dict],
                    building_vulnerability: Dict) -> Dict:
        """Predict disaster risk using ML models and rule-based systems"""
        try:
            # Prepare features
            features = self._prepare_features(
                latitude, longitude, district, weather_data,
                historical_data, building_vulnerability
            )
            
            if 'risk_classifier' in self.models:
                # Use ML model
                features_scaled = self.scalers['risk'].transform([features])
                risk_class = self.models['risk_classifier'].predict(features_scaled)[0]
                risk_probability = self.models['risk_classifier'].predict_proba(features_scaled)[0]
                
                risk_levels = ['low', 'moderate', 'high', 'critical']
                risk_level = risk_levels[risk_class]
                confidence = float(np.max(risk_probability))
                risk_score = float(risk_class * 2.5 + 1 + np.random.normal(0, 0.5))
                risk_score = max(1, min(10, risk_score))  # Clamp between 1-10
            else:
                # Use rule-based prediction
                risk_assessment = self._rule_based_prediction(
                    weather_data, historical_data, building_vulnerability, district
                )
                risk_level = risk_assessment['risk_level']
                risk_score = risk_assessment['risk_score']
                confidence = 0.8  # Default confidence for rule-based
            
            return {
                'risk_level': risk_level,
                'risk_score': risk_score,
                'confidence': confidence,
                'prediction_method': 'ml' if 'risk_classifier' in self.models else 'rule-based',
                'features_used': self.feature_columns,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Risk prediction failed: {str(e)}")
            # Fallback to basic rule-based prediction
            return self._rule_based_prediction(
                weather_data, historical_data, building_vulnerability, district
            )
    
    def _prepare_features(self, latitude: float, longitude: float, district: str,
                         weather_data: Dict, historical_data: List[Dict],
                         building_vulnerability: Dict) -> List[float]:
        """Prepare feature vector for ML model"""
        features = []
        
        # Weather features
        features.append(weather_data.get('temperature', 25))
        features.append(weather_data.get('humidity', 50))
        features.append(weather_data.get('wind_speed', 10))
        features.append(weather_data.get('rainfall', 0))
        
        # Historical disaster features
        disaster_count = len(historical_data) if historical_data else 0
        features.append(disaster_count)
        
        # Days since last disaster
        if historical_data:
            last_disaster = max(historical_data, key=lambda x: x.get('date', '2000-01-01'))
            last_date = pd.to_datetime(last_disaster.get('date', '2000-01-01'))
            days_since = (datetime.now() - last_date).days
        else:
            days_since = 1000  # No recorded disasters
        features.append(days_since)
        
        # Building vulnerability
        vulnerability_score = building_vulnerability.get('overall_score', 5)
        features.append(vulnerability_score)
        
        # Geographic features
        district_info = self.district_data.get(district, {})
        population_density = self._estimate_population_density(district)
        features.append(population_density)
        features.append(district_info.get('elevation', 250))
        features.append(district_info.get('river_distance', 3))
        
        # Seasonal features
        current_month = datetime.now().month
        is_monsoon = 1 if 6 <= current_month <= 9 else 0
        features.append(is_monsoon)
        
        return features
    
    def _rule_based_prediction(self, weather_data: Dict, historical_data: List[Dict],
                              building_vulnerability: Dict, district: str) -> Dict:
        """Fallback rule-based risk prediction"""
        risk_score = 1.0
        risk_factors = []
        
        # Weather-based risk
        if weather_data:
            temp = weather_data.get('temperature', 25)
            rainfall = weather_data.get('rainfall', 0)
            wind_speed = weather_data.get('wind_speed', 0)
            
            if temp > 45:
                risk_score += 3
                risk_factors.append('extreme_heat')
            elif temp < 5:
                risk_score += 2
                risk_factors.append('cold_wave')
            
            if rainfall > 100:
                risk_score += 4
                risk_factors.append('heavy_rainfall')
            elif rainfall > 50:
                risk_score += 2
                risk_factors.append('moderate_rainfall')
            
            if wind_speed > 50:
                risk_score += 3
                risk_factors.append('high_winds')
        
        # Historical risk
        if historical_data:
            recent_disasters = [d for d in historical_data 
                              if pd.to_datetime(d.get('date', '2000-01-01')) > 
                              datetime.now() - timedelta(days=1825)]  # 5 years
            
            if len(recent_disasters) > 3:
                risk_score += 2
                risk_factors.append('frequent_disasters')
        
        # Building vulnerability
        vulnerability_score = building_vulnerability.get('overall_score', 5)
        risk_score += vulnerability_score / 3
        if vulnerability_score > 7:
            risk_factors.append('high_building_vulnerability')
        
        # District-specific adjustments
        if district in ['Gurdaspur', 'Pathankot']:
            risk_score += 0.5  # Border areas
        if district in ['Ludhiana', 'Jalandhar']:
            risk_score += 0.3  # Urban flooding risk
        
        # Determine risk level
        risk_score = max(1, min(10, risk_score))
        if risk_score <= 3:
            risk_level = 'low'
        elif risk_score <= 5:
            risk_level = 'moderate'
        elif risk_score <= 8:
            risk_level = 'high'
        else:
            risk_level = 'critical'
        
        return {
            'risk_level': risk_level,
            'risk_score': float(risk_score),
            'confidence': 0.7,
            'prediction_method': 'rule-based',
            'risk_factors': risk_factors,
            'timestamp': datetime.now().isoformat()
        }
    
    def get_historical_disasters(self, district: str) -> List[Dict]:
        """Retrieve historical disaster data for a district"""
        try:
            db = get_db()
            if db:
                historical_data = list(db.historical_data.find(
                    {'district': district},
                    {'_id': 0}
                ).sort('date', -1).limit(50))
                
                if historical_data:
                    return historical_data
            
            # Fallback: return sample historical data
            return self._get_sample_historical_data(district)
            
        except Exception as e:
            logger.error(f"Error retrieving historical data: {str(e)}")
            return self._get_sample_historical_data(district)
    
    def _get_sample_historical_data(self, district: str) -> List[Dict]:
        """Generate sample historical disaster data"""
        sample_data = []
        
        # Simulate some historical disasters based on Punjab's patterns
        base_year = 2015
        for year in range(base_year, datetime.now().year):
            # Monsoon flooding (common in Punjab)
            if year % 2 == 0:  # Every other year
                sample_data.append({
                    'district': district,
                    'type': 'flood',
                    'date': f'{year}-07-15',
                    'severity': 'moderate',
                    'affected_population': 10000 + (year - base_year) * 1000
                })
            
            # Heat waves (annual occurrence)
            sample_data.append({
                'district': district,
                'type': 'heatwave',
                'date': f'{year}-05-20',
                'severity': 'high' if year % 3 == 0 else 'moderate',
                'affected_population': 5000
            })
        
        return sample_data[-10:]  # Return last 10 events
    
    def assess_district_risk(self, district: str) -> Dict:
        """Assess overall risk for a district"""
        try:
            historical_data = self.get_historical_disasters(district)
            district_info = self.district_data.get(district, {})
            
            # Calculate base risk factors
            recent_disasters = len([d for d in historical_data 
                                 if pd.to_datetime(d.get('date', '2000-01-01')) > 
                                 datetime.now() - timedelta(days=1825)])
            
            base_risk = 3.0  # Base risk for Punjab
            
            # Adjust based on historical frequency
            if recent_disasters > 5:
                base_risk += 2
            elif recent_disasters > 3:
                base_risk += 1
            
            # Geographic risk factors
            elevation = district_info.get('elevation', 250)
            river_distance = district_info.get('river_distance', 3)
            
            if elevation < 200:
                base_risk += 0.5  # Lower elevation = flood risk
            if river_distance < 2:
                base_risk += 1  # Close to rivers = flood risk
            
            risk_level = 'low'
            if base_risk > 6:
                risk_level = 'high'
            elif base_risk > 4:
                risk_level = 'moderate'
            
            return {
                'district': district,
                'overall_risk_score': min(10, base_risk),
                'risk_level': risk_level,
                'recent_disaster_count': recent_disasters,
                'primary_risks': self._get_primary_risks(district),
                'assessment_date': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"District risk assessment failed: {str(e)}")
            return {
                'district': district,
                'overall_risk_score': 4.0,
                'risk_level': 'moderate',
                'error': str(e)
            }
    
    def get_district_historical_patterns(self, district: str) -> Dict:
        """Get historical disaster patterns for a district"""
        historical_data = self.get_historical_disasters(district)
        
        if not historical_data:
            return {
                'patterns': ['Limited historical data available'],
                'seasonal_risk': 'moderate',
                'most_common_disaster': 'heatwave'
            }
        
        # Analyze patterns
        disaster_types = {}
        monthly_distribution = [0] * 12
        
        for disaster in historical_data:
            disaster_type = disaster.get('type', 'unknown')
            disaster_types[disaster_type] = disaster_types.get(disaster_type, 0) + 1
            
            # Extract month from date
            date_str = disaster.get('date', '2000-01-01')
            month = pd.to_datetime(date_str).month
            monthly_distribution[month - 1] += 1
        
        most_common = max(disaster_types.keys(), key=lambda x: disaster_types[x])
        peak_month = monthly_distribution.index(max(monthly_distribution)) + 1
        
        patterns = []
        if peak_month in [6, 7, 8, 9]:
            patterns.append('High monsoon season activity')
        if peak_month in [4, 5, 6]:
            patterns.append('Summer heat-related incidents')
        
        return {
            'disaster_frequency': disaster_types,
            'most_common_disaster': most_common,
            'peak_month': peak_month,
            'patterns': patterns,
            'total_events': len(historical_data)
        }
    
    def _estimate_population_density(self, district: str) -> float:
        """Estimate population density for a district"""
        # Approximate population densities for Punjab districts (per sq km)
        densities = {
            'Ludhiana': 1295, 'Amritsar': 928, 'Jalandhar': 831,
            'Patiala': 441, 'Gurdaspur': 353, 'Hoshiarpur': 405,
            'Kapurthala': 628, 'Mohali': 1114, 'Pathankot': 652,
            'Bathinda': 253, 'Faridkot': 447, 'Ferozepur': 296,
            'Mansa': 296, 'Moga': 469, 'Muktsar': 350,
            'Nawanshahr': 543, 'Rupnagar': 351, 'Sangrur': 341,
            'Tarn Taran': 364, 'Barnala': 560, 'Fatehgarh Sahib': 688,
            'Fazilka': 217
        }
        return densities.get(district, 400)  # Default density
    
    def _get_primary_risks(self, district: str) -> List[str]:
        """Get primary disaster risks for a district"""
        risk_profiles = {
            'Amritsar': ['heatwave', 'flood', 'earthquake'],
            'Ludhiana': ['flood', 'heatwave', 'fire'],
            'Jalandhar': ['flood', 'heatwave', 'earthquake'],
            'Patiala': ['heatwave', 'flood', 'drought'],
            'Bathinda': ['heatwave', 'drought', 'flood'],
            'Gurdaspur': ['flood', 'heatwave', 'earthquake'],
            'Pathankot': ['flood', 'earthquake', 'heatwave'],
            'Mohali': ['flood', 'heatwave', 'fire']
        }
        return risk_profiles.get(district, ['heatwave', 'flood', 'earthquake'])
