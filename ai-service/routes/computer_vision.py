from flask import Blueprint, request, jsonify, current_app
import logging
import cv2
import numpy as np
import base64
from datetime import datetime, timedelta
import io
from PIL import Image
from services.hazard_detector import HazardDetector
from services.crowd_analyzer import CrowdAnalyzer
from services.damage_assessor import DamageAssessor
from config.database import get_db, get_redis
from utils.image_utils import encode_image, decode_image, validate_image
from utils.validators import validate_school_id

logger = logging.getLogger(__name__)
cv_bp = Blueprint('computer_vision', __name__)

# Initialize CV services
hazard_detector = HazardDetector()
crowd_analyzer = CrowdAnalyzer()
damage_assessor = DamageAssessor()

@cv_bp.route('/hazard-detection', methods=['POST'])
def detect_hazards():
    """
    Real-time hazard detection from camera feeds or uploaded images
    Body: {
        "image": "base64_encoded_image_data" or file upload,
        "school_id": "string",
        "camera_location": "string",
        "detection_types": ["smoke", "fire", "flood", "crowd", "damage"]
    }
    """
    try:
        # Handle both form data and JSON input
        if request.content_type.startswith('multipart/form-data'):
            # File upload
            if 'image' not in request.files:
                return jsonify({
                    'success': False,
                    'error': 'No image file provided'
                }), 400
            
            image_file = request.files['image']
            if image_file.filename == '':
                return jsonify({
                    'success': False,
                    'error': 'No image file selected'
                }), 400
            
            # Read and validate image
            image_data = image_file.read()
            image = Image.open(io.BytesIO(image_data))
            
            school_id = request.form.get('school_id', '')
            camera_location = request.form.get('camera_location', 'unknown')
            detection_types = request.form.getlist('detection_types')
            
        else:
            # JSON data
            data = request.get_json()
            if not data or 'image' not in data:
                return jsonify({
                    'success': False,
                    'error': 'No image data provided'
                }), 400
            
            # Decode base64 image
            try:
                image_data = base64.b64decode(data['image'])
                image = Image.open(io.BytesIO(image_data))
            except Exception as e:
                return jsonify({
                    'success': False,
                    'error': f'Invalid image data: {str(e)}'
                }), 400
            
            school_id = data.get('school_id', '')
            camera_location = data.get('camera_location', 'unknown')
            detection_types = data.get('detection_types', ['smoke', 'fire', 'flood'])
        
        # Validate inputs
        if not validate_image(image):
            return jsonify({
                'success': False,
                'error': 'Invalid or unsupported image format'
            }), 400
        
        # Convert PIL image to OpenCV format
        cv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        # Perform hazard detection
        detection_results = {}
        overall_risk_level = 'low'
        detected_hazards = []
        confidence_scores = {}
        
        for detection_type in detection_types:
            if detection_type == 'smoke':
                smoke_result = hazard_detector.detect_smoke(cv_image)
                detection_results['smoke'] = smoke_result
                if smoke_result['detected']:
                    detected_hazards.append('smoke')
                    confidence_scores['smoke'] = smoke_result['confidence']
                    if smoke_result['risk_level'] == 'high':
                        overall_risk_level = 'high'
                        
            elif detection_type == 'fire':
                fire_result = hazard_detector.detect_fire(cv_image)
                detection_results['fire'] = fire_result
                if fire_result['detected']:
                    detected_hazards.append('fire')
                    confidence_scores['fire'] = fire_result['confidence']
                    overall_risk_level = 'critical'
                    
            elif detection_type == 'flood':
                flood_result = hazard_detector.detect_flooding(cv_image)
                detection_results['flood'] = flood_result
                if flood_result['detected']:
                    detected_hazards.append('flood')
                    confidence_scores['flood'] = flood_result['confidence']
                    if overall_risk_level != 'critical':
                        overall_risk_level = 'high'
                        
            elif detection_type == 'crowd':
                crowd_result = crowd_analyzer.analyze_crowd_density(cv_image)
                detection_results['crowd'] = crowd_result
                if crowd_result['density'] == 'high':
                    detected_hazards.append('overcrowding')
                    confidence_scores['crowd'] = crowd_result['confidence']
                    if overall_risk_level == 'low':
                        overall_risk_level = 'moderate'
                        
            elif detection_type == 'damage':
                damage_result = damage_assessor.assess_structural_damage(cv_image)
                detection_results['damage'] = damage_result
                if damage_result['damage_detected']:
                    detected_hazards.append('structural_damage')
                    confidence_scores['damage'] = damage_result['confidence']
                    if overall_risk_level == 'low':
                        overall_risk_level = 'moderate'
        
        # Generate alert if hazards detected
        alert_generated = False
        if detected_hazards:
            alert_result = _generate_hazard_alert(
                detected_hazards, school_id, camera_location, confidence_scores
            )
            alert_generated = alert_result['success']
        
        # Store detection results in database
        db = get_db()
        detection_record = {
            'school_id': school_id,
            'camera_location': camera_location,
            'detection_types': detection_types,
            'detection_results': detection_results,
            'detected_hazards': detected_hazards,
            'overall_risk_level': overall_risk_level,
            'confidence_scores': confidence_scores,
            'alert_generated': alert_generated,
            'timestamp': datetime.now(),
            'image_metadata': {
                'size': image.size,
                'format': image.format,
                'mode': image.mode
            }
        }
        
        db.camera_feeds.insert_one(detection_record)
        
        # Cache recent detections
        redis_client = get_redis()
        if redis_client and detected_hazards:
            cache_key = f"recent_hazards:{school_id}"
            import json
            redis_client.setex(
                cache_key, 
                1800,  # 30 minutes
                json.dumps({
                    'hazards': detected_hazards,
                    'timestamp': datetime.now().isoformat(),
                    'location': camera_location
                })
            )
        
        return jsonify({
            'success': True,
            'data': {
                'detected_hazards': detected_hazards,
                'overall_risk_level': overall_risk_level,
                'detection_results': detection_results,
                'confidence_scores': confidence_scores,
                'alert_generated': alert_generated,
                'processing_time': datetime.now().isoformat()
            },
            'metadata': {
                'school_id': school_id,
                'camera_location': camera_location,
                'detection_types': detection_types,
                'image_processed': True
            }
        })
        
    except Exception as e:
        logger.error(f"Hazard detection failed: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error during hazard detection'
        }), 500

@cv_bp.route('/drill-analysis', methods=['POST'])
def analyze_drill_performance():
    """
    Analyze evacuation drill performance using computer vision
    Body: {
        "video_data": "base64_encoded_video" or "video_url",
        "drill_type": "evacuation|fire|earthquake",
        "school_id": "string",
        "expected_participants": number
    }
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        drill_type = data.get('drill_type', 'evacuation')
        school_id = data.get('school_id', '')
        expected_participants = data.get('expected_participants', 0)
        
        # For demo, we'll simulate analysis results
        # In production, this would process actual video data
        analysis_results = crowd_analyzer.analyze_drill_performance(
            drill_type=drill_type,
            expected_participants=expected_participants
        )
        
        # Generate performance insights
        insights = _generate_drill_insights(analysis_results, drill_type)
        
        # Store analysis results
        db = get_db()
        drill_analysis = {
            'school_id': school_id,
            'drill_type': drill_type,
            'expected_participants': expected_participants,
            'analysis_results': analysis_results,
            'insights': insights,
            'timestamp': datetime.now()
        }
        
        db.drill_analyses.insert_one(drill_analysis)
        
        return jsonify({
            'success': True,
            'data': {
                'drill_type': drill_type,
                'analysis_results': analysis_results,
                'insights': insights,
                'performance_score': analysis_results.get('overall_score', 7.5),
                'recommendations': insights.get('recommendations', [])
            },
            'metadata': {
                'school_id': school_id,
                'analysis_time': datetime.now().isoformat(),
                'expected_participants': expected_participants
            }
        })
        
    except Exception as e:
        logger.error(f"Drill analysis failed: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error analyzing drill performance'
        }), 500

@cv_bp.route('/crowd-monitoring/<school_id>', methods=['GET'])
def get_crowd_monitoring(school_id):
    """Get real-time crowd monitoring status for a school"""
    try:
        if not validate_school_id(school_id):
            return jsonify({
                'success': False,
                'error': 'Invalid school ID'
            }), 400
        
        # Get recent crowd detection data
        db = get_db()
        recent_detections = list(db.camera_feeds.find(
            {
                'school_id': school_id,
                'detection_types': 'crowd',
                'timestamp': {'$gte': datetime.now() - timedelta(hours=1)}
            },
            {'_id': 0, 'detection_results.crowd': 1, 'timestamp': 1, 'camera_location': 1}
        ).sort('timestamp', -1).limit(10))
        
        # Analyze crowd patterns
        current_status = 'normal'
        locations_status = {}
        
        for detection in recent_detections:
            location = detection.get('camera_location', 'unknown')
            crowd_data = detection.get('detection_results', {}).get('crowd', {})
            density = crowd_data.get('density', 'low')
            
            if density == 'high':
                current_status = 'high_density'
            elif density == 'medium' and current_status == 'normal':
                current_status = 'moderate_density'
            
            locations_status[location] = {
                'density': density,
                'count': crowd_data.get('estimated_count', 0),
                'timestamp': detection['timestamp'].isoformat()
            }
        
        return jsonify({
            'success': True,
            'data': {
                'school_id': school_id,
                'current_status': current_status,
                'locations': locations_status,
                'recent_detections': len(recent_detections),
                'monitoring_active': len(recent_detections) > 0,
                'last_update': datetime.now().isoformat()
            }
        })
        
    except Exception as e:
        logger.error(f"Crowd monitoring failed: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error retrieving crowd monitoring data'
        }), 500

@cv_bp.route('/damage-assessment', methods=['POST'])
def assess_damage():
    """
    Assess building/infrastructure damage from images
    Body: {
        "images": ["base64_image1", "base64_image2", ...],
        "assessment_type": "post_disaster|routine_inspection",
        "location": {"latitude": float, "longitude": float},
        "building_type": "school|residential|commercial"
    }
    """
    try:
        data = request.get_json()
        if not data or 'images' not in data:
            return jsonify({
                'success': False,
                'error': 'No images provided for assessment'
            }), 400
        
        images_data = data['images']
        assessment_type = data.get('assessment_type', 'routine_inspection')
        location = data.get('location', {})
        building_type = data.get('building_type', 'school')
        
        damage_assessments = []
        overall_damage_level = 'none'
        
        for i, image_b64 in enumerate(images_data):
            try:
                # Decode image
                image_data = base64.b64decode(image_b64)
                image = Image.open(io.BytesIO(image_data))
                cv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
                
                # Assess damage
                damage_result = damage_assessor.assess_structural_damage(
                    cv_image, building_type=building_type
                )
                damage_result['image_index'] = i
                damage_assessments.append(damage_result)
                
                # Update overall damage level
                if damage_result['damage_level'] == 'severe':
                    overall_damage_level = 'severe'
                elif damage_result['damage_level'] == 'moderate' and overall_damage_level != 'severe':
                    overall_damage_level = 'moderate'
                elif damage_result['damage_level'] == 'minor' and overall_damage_level == 'none':
                    overall_damage_level = 'minor'
                    
            except Exception as e:
                logger.warning(f"Failed to process image {i}: {str(e)}")
                damage_assessments.append({
                    'image_index': i,
                    'error': f'Failed to process image: {str(e)}',
                    'damage_detected': False
                })
        
        # Generate assessment report
        assessment_report = {
            'overall_damage_level': overall_damage_level,
            'individual_assessments': damage_assessments,
            'total_images_processed': len(images_data),
            'successful_assessments': len([a for a in damage_assessments if 'error' not in a]),
            'recommendations': _generate_damage_recommendations(overall_damage_level),
            'priority_actions': _get_priority_actions(overall_damage_level)
        }
        
        # Store assessment in database
        db = get_db()
        assessment_record = {
            'assessment_type': assessment_type,
            'location': location,
            'building_type': building_type,
            'assessment_report': assessment_report,
            'timestamp': datetime.now()
        }
        
        db.damage_assessments.insert_one(assessment_record)
        
        return jsonify({
            'success': True,
            'data': assessment_report,
            'metadata': {
                'assessment_type': assessment_type,
                'location': location,
                'building_type': building_type,
                'assessment_time': datetime.now().isoformat()
            }
        })
        
    except Exception as e:
        logger.error(f"Damage assessment failed: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error processing damage assessment'
        }), 500

def _generate_hazard_alert(hazards, school_id, location, confidence_scores):
    """Generate alert for detected hazards"""
    try:
        alert_level = 'medium'
        if 'fire' in hazards:
            alert_level = 'critical'
        elif any(h in ['smoke', 'flood'] for h in hazards):
            alert_level = 'high'
        
        alert_message = f"Hazard detected at {location}: {', '.join(hazards)}"
        
        # Store alert in database
        db = get_db()
        alert_record = {
            'school_id': school_id,
            'alert_level': alert_level,
            'hazards': hazards,
            'location': location,
            'message': alert_message,
            'confidence_scores': confidence_scores,
            'timestamp': datetime.now(),
            'status': 'active'
        }
        
        db.hazard_alerts.insert_one(alert_record)
        
        return {'success': True, 'alert_id': str(alert_record['_id'])}
    except Exception as e:
        logger.error(f"Failed to generate alert: {str(e)}")
        return {'success': False, 'error': str(e)}

def _generate_drill_insights(analysis_results, drill_type):
    """Generate insights from drill analysis"""
    insights = {
        'overall_performance': 'good',
        'strengths': [],
        'areas_for_improvement': [],
        'recommendations': []
    }
    
    evacuation_time = analysis_results.get('evacuation_time', 180)  # seconds
    participation_rate = analysis_results.get('participation_rate', 0.85)
    bottlenecks = analysis_results.get('bottlenecks', [])
    
    # Analyze evacuation time
    if evacuation_time < 120:
        insights['strengths'].append('Fast evacuation time')
    elif evacuation_time > 300:
        insights['areas_for_improvement'].append('Evacuation time too slow')
        insights['recommendations'].append('Practice more frequent drills')
        insights['overall_performance'] = 'needs_improvement'
    
    # Analyze participation
    if participation_rate > 0.9:
        insights['strengths'].append('High participation rate')
    elif participation_rate < 0.7:
        insights['areas_for_improvement'].append('Low participation rate')
        insights['recommendations'].append('Improve drill communication and awareness')
    
    # Analyze bottlenecks
    if bottlenecks:
        insights['areas_for_improvement'].append('Traffic bottlenecks identified')
        insights['recommendations'].append('Review evacuation routes and signage')
    
    return insights

def _generate_damage_recommendations(damage_level):
    """Generate recommendations based on damage level"""
    recommendations = []
    
    if damage_level == 'severe':
        recommendations.extend([
            'Immediate evacuation and area closure required',
            'Contact structural engineer for detailed assessment',
            'Arrange temporary alternative facilities',
            'Document damage for insurance claims',
            'Implement emergency safety measures'
        ])
    elif damage_level == 'moderate':
        recommendations.extend([
            'Schedule professional structural inspection',
            'Restrict access to damaged areas',
            'Plan repair and restoration work',
            'Monitor for further deterioration',
            'Update safety protocols'
        ])
    elif damage_level == 'minor':
        recommendations.extend([
            'Schedule routine maintenance and repairs',
            'Document damage for tracking',
            'Continue regular inspections',
            'Address minor issues promptly'
        ])
    else:
        recommendations.extend([
            'Continue regular maintenance schedule',
            'Maintain documentation of inspections',
            'Keep monitoring for any changes'
        ])
    
    return recommendations

def _get_priority_actions(damage_level):
    """Get priority actions based on damage level"""
    if damage_level == 'severe':
        return ['immediate_evacuation', 'structural_assessment', 'emergency_response']
    elif damage_level == 'moderate':
        return ['professional_inspection', 'area_restriction', 'repair_planning']
    elif damage_level == 'minor':
        return ['maintenance_scheduling', 'documentation', 'monitoring']
    else:
        return ['routine_maintenance', 'regular_inspections']
