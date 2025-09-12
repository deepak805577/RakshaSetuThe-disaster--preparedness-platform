from flask import Blueprint, request, jsonify
import logging
from datetime import datetime, timedelta
import numpy as np
from services.risk_predictor import RiskPredictor
from services.weather_service import WeatherService
from services.vulnerability_assessor import VulnerabilityAssessor
from config.database import get_db, get_redis
from utils.validators import validate_coordinates, validate_district

logger = logging.getLogger(__name__)
risk_bp = Blueprint('risk', __name__)

# Initialize services
risk_predictor = RiskPredictor()
weather_service = WeatherService()
vulnerability_assessor = VulnerabilityAssessor()

@risk_bp.route('/risk-assessment', methods=['POST'])
def assess_risk():
    """
    Comprehensive risk assessment for a specific location
    Body: {
        "latitude": float,
        "longitude": float,
        "district": string,
        "school_id": string (optional),
        "building_type": string (optional),
        "assessment_type": ["current", "forecast", "historical"]
    }
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        if not all(key in data for key in ['latitude', 'longitude', 'district']):
            return jsonify({
                'success': False,
                'error': 'Missing required fields: latitude, longitude, district'
            }), 400
        
        latitude = float(data['latitude'])
        longitude = float(data['longitude'])
        district = data['district']
        school_id = data.get('school_id', '')
        building_type = data.get('building_type', 'school')
        assessment_type = data.get('assessment_type', 'current')
        
        # Validate coordinates and district
        if not validate_coordinates(latitude, longitude):
            return jsonify({
                'success': False,
                'error': 'Invalid coordinates for Punjab region'
            }), 400
        
        if not validate_district(district):
            return jsonify({
                'success': False,
                'error': 'Invalid Punjab district'
            }), 400
        
        # Check cache first
        redis_client = get_redis()
        cache_key = f"risk_assessment:{district}:{latitude}:{longitude}:{assessment_type}"
        
        if redis_client:
            cached_result = redis_client.get(cache_key)
            if cached_result:
                import json
                logger.info(f"Returning cached risk assessment for {district}")
                return jsonify(json.loads(cached_result))
        
        # Gather data for risk assessment
        weather_data = weather_service.get_current_weather(latitude, longitude)
        historical_data = risk_predictor.get_historical_disasters(district)
        vulnerability_score = vulnerability_assessor.assess_building_vulnerability(
            building_type, latitude, longitude
        )
        
        # Perform risk assessment
        risk_assessment = risk_predictor.predict_risk(
            latitude=latitude,
            longitude=longitude,
            district=district,
            weather_data=weather_data,
            historical_data=historical_data,
            building_vulnerability=vulnerability_score
        )
        
        # Add detailed breakdown
        detailed_assessment = {
            'overall_risk': risk_assessment,
            'weather_risk': _calculate_weather_risk(weather_data),
            'historical_risk': _calculate_historical_risk(historical_data, district),
            'building_vulnerability': vulnerability_score,
            'disaster_types': _get_disaster_type_risks(
                weather_data, historical_data, latitude, longitude
            ),
            'recommendations': _generate_recommendations(risk_assessment, district),
            'next_assessment': (datetime.now() + timedelta(hours=6)).isoformat()
        }
        
        # Store in database
        db = get_db()
        assessment_record = {
            'school_id': school_id,
            'district': district,
            'coordinates': {
                'type': 'Point',
                'coordinates': [longitude, latitude]
            },
            'assessment_type': assessment_type,
            'risk_level': risk_assessment['risk_level'],
            'risk_score': risk_assessment['risk_score'],
            'detailed_assessment': detailed_assessment,
            'timestamp': datetime.now(),
            'valid_until': datetime.now() + timedelta(hours=6)
        }
        
        db.risk_assessments.insert_one(assessment_record)
        
        # Cache result for 1 hour
        if redis_client:
            import json
            redis_client.setex(
                cache_key, 
                3600, 
                json.dumps({
                    'success': True,
                    'data': detailed_assessment,
                    'metadata': {
                        'location': f"{district}, Punjab",
                        'coordinates': [latitude, longitude],
                        'assessment_time': datetime.now().isoformat(),
                        'cache_hit': False
                    }
                })
            )
        
        return jsonify({
            'success': True,
            'data': detailed_assessment,
            'metadata': {
                'location': f"{district}, Punjab",
                'coordinates': [latitude, longitude],
                'assessment_time': datetime.now().isoformat(),
                'cache_hit': False
            }
        })
        
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': f'Invalid input: {str(e)}'
        }), 400
    except Exception as e:
        logger.error(f"Risk assessment failed: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error during risk assessment'
        }), 500

@risk_bp.route('/vulnerability-score', methods=['GET'])
def get_vulnerability_score():
    """
    Get building vulnerability score
    Query params: latitude, longitude, building_type
    """
    try:
        latitude = float(request.args.get('latitude', 0))
        longitude = float(request.args.get('longitude', 0))
        building_type = request.args.get('building_type', 'school')
        
        if not validate_coordinates(latitude, longitude):
            return jsonify({
                'success': False,
                'error': 'Invalid coordinates'
            }), 400
        
        vulnerability_score = vulnerability_assessor.assess_building_vulnerability(
            building_type, latitude, longitude
        )
        
        return jsonify({
            'success': True,
            'data': vulnerability_score,
            'metadata': {
                'coordinates': [latitude, longitude],
                'building_type': building_type,
                'assessment_time': datetime.now().isoformat()
            }
        })
        
    except Exception as e:
        logger.error(f"Vulnerability assessment failed: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error calculating vulnerability score'
        }), 500

@risk_bp.route('/district-risk/<district>', methods=['GET'])
def get_district_risk(district):
    """Get comprehensive district-wide risk analysis"""
    try:
        if not validate_district(district):
            return jsonify({
                'success': False,
                'error': 'Invalid Punjab district'
            }), 400
        
        # Get aggregated risk data for the district
        db = get_db()
        pipeline = [
            {
                '$match': {
                    'district': district,
                    'timestamp': {
                        '$gte': datetime.now() - timedelta(hours=24)
                    }
                }
            },
            {
                '$group': {
                    '_id': '$district',
                    'avg_risk_score': {'$avg': '$risk_score'},
                    'max_risk_score': {'$max': '$risk_score'},
                    'high_risk_locations': {
                        '$push': {
                            '$cond': [
                                {'$gte': ['$risk_score', 7]},
                                {
                                    'school_id': '$school_id',
                                    'coordinates': '$coordinates',
                                    'risk_score': '$risk_score'
                                },
                                '$$REMOVE'
                            ]
                        }
                    },
                    'total_assessments': {'$sum': 1}
                }
            }
        ]
        
        district_stats = list(db.risk_assessments.aggregate(pipeline))
        
        if not district_stats:
            # Generate fresh district assessment
            district_risk = risk_predictor.assess_district_risk(district)
        else:
            district_risk = district_stats[0]
        
        # Get weather forecast for district
        weather_forecast = weather_service.get_district_forecast(district)
        
        # Get historical disaster patterns
        historical_patterns = risk_predictor.get_district_historical_patterns(district)
        
        return jsonify({
            'success': True,
            'data': {
                'district': district,
                'risk_summary': district_risk,
                'weather_forecast': weather_forecast,
                'historical_patterns': historical_patterns,
                'last_updated': datetime.now().isoformat()
            }
        })
        
    except Exception as e:
        logger.error(f"District risk assessment failed: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error getting district risk data'
        }), 500

def _calculate_weather_risk(weather_data):
    """Calculate weather-based risk score"""
    if not weather_data:
        return {'score': 5, 'factors': ['No weather data available']}
    
    risk_factors = []
    score = 1
    
    # Temperature extremes
    temp = weather_data.get('temperature', 25)
    if temp > 45:
        score += 3
        risk_factors.append('Extreme heat warning')
    elif temp < 5:
        score += 2
        risk_factors.append('Cold wave conditions')
    
    # Wind speed
    wind_speed = weather_data.get('wind_speed', 0)
    if wind_speed > 60:
        score += 4
        risk_factors.append('High wind speed')
    elif wind_speed > 30:
        score += 2
        risk_factors.append('Moderate wind conditions')
    
    # Precipitation
    rainfall = weather_data.get('rainfall', 0)
    if rainfall > 100:
        score += 4
        risk_factors.append('Heavy rainfall expected')
    elif rainfall > 50:
        score += 2
        risk_factors.append('Moderate rainfall')
    
    return {
        'score': min(score, 10),
        'factors': risk_factors,
        'weather_data': weather_data
    }

def _calculate_historical_risk(historical_data, district):
    """Calculate historical disaster risk"""
    if not historical_data:
        return {'score': 3, 'patterns': ['Limited historical data']}
    
    # Analyze frequency and severity of past disasters
    recent_disasters = [d for d in historical_data 
                       if d.get('year', 0) >= datetime.now().year - 10]
    
    score = 1
    patterns = []
    
    if len(recent_disasters) > 5:
        score += 3
        patterns.append('High frequency of disasters in last 10 years')
    elif len(recent_disasters) > 2:
        score += 2
        patterns.append('Moderate disaster frequency')
    
    # Check for seasonal patterns
    monsoon_disasters = [d for d in recent_disasters 
                        if d.get('month', 0) in [6, 7, 8, 9]]
    if len(monsoon_disasters) > 3:
        score += 2
        patterns.append('High monsoon season risk')
    
    return {
        'score': min(score, 10),
        'patterns': patterns,
        'recent_count': len(recent_disasters)
    }

def _get_disaster_type_risks(weather_data, historical_data, lat, lon):
    """Get risk scores for different disaster types"""
    disaster_risks = {}
    
    # Flood risk
    rainfall = weather_data.get('rainfall', 0) if weather_data else 0
    flood_historical = len([d for d in historical_data 
                           if d.get('type') == 'flood']) if historical_data else 0
    disaster_risks['flood'] = min(
        (rainfall / 20) + (flood_historical / 2), 10
    )
    
    # Earthquake risk (based on geological data - simplified)
    # Punjab has moderate seismic activity
    earthquake_risk = 4  # Base risk for Punjab
    disaster_risks['earthquake'] = earthquake_risk
    
    # Heatwave risk
    temp = weather_data.get('temperature', 25) if weather_data else 25
    disaster_risks['heatwave'] = min((temp - 35) / 2, 10) if temp > 35 else 1
    
    # Fire risk
    humidity = weather_data.get('humidity', 50) if weather_data else 50
    wind_speed = weather_data.get('wind_speed', 0) if weather_data else 0
    disaster_risks['fire'] = min(
        ((100 - humidity) / 10) + (wind_speed / 15), 10
    )
    
    return disaster_risks

def _generate_recommendations(risk_assessment, district):
    """Generate actionable recommendations based on risk level"""
    risk_level = risk_assessment.get('risk_level', 'low')
    recommendations = []
    
    if risk_level == 'critical':
        recommendations.extend([
            'Immediate evacuation plan review required',
            'Emergency supplies check mandatory',
            'Cancel outdoor activities',
            'Activate emergency response team',
            'Issue safety alerts to all stakeholders'
        ])
    elif risk_level == 'high':
        recommendations.extend([
            'Review and update emergency protocols',
            'Conduct safety briefing for staff and students',
            'Monitor weather conditions closely',
            'Prepare emergency supplies',
            'Consider postponing non-essential activities'
        ])
    elif risk_level == 'moderate':
        recommendations.extend([
            'Regular safety drill reminder',
            'Check emergency equipment',
            'Stay updated with weather alerts',
            'Review evacuation routes'
        ])
    else:
        recommendations.extend([
            'Routine safety maintenance',
            'Regular safety education sessions',
            'Keep emergency plans updated'
        ])
    
    # District-specific recommendations
    if district in ['Amritsar', 'Gurdaspur', 'Pathankot']:
        recommendations.append('Monitor cross-border security alerts')
    
    if district in ['Ludhiana', 'Jalandhar', 'Patiala']:
        recommendations.append('Urban flooding precautions during monsoon')
    
    return recommendations
