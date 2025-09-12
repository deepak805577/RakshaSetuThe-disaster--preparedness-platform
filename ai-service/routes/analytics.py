from flask import Blueprint, request, jsonify
import logging
from datetime import datetime, timedelta
from config.database import get_db
from utils.validators import validate_district, validate_school_id

logger = logging.getLogger(__name__)
analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/analytics/dashboard', methods=['GET'])
def get_dashboard_analytics():
    """Get comprehensive analytics for AI dashboard"""
    try:
        # Get query parameters
        district = request.args.get('district')
        time_range = request.args.get('time_range', '7d')  # 7d, 30d, 90d
        
        # Calculate time filter
        if time_range == '30d':
            start_date = datetime.now() - timedelta(days=30)
        elif time_range == '90d':
            start_date = datetime.now() - timedelta(days=90)
        else:
            start_date = datetime.now() - timedelta(days=7)
        
        db = get_db()
        
        # Risk assessment analytics
        risk_pipeline = [
            {'$match': {'timestamp': {'$gte': start_date}}},
            {'$group': {
                '_id': '$risk_level',
                'count': {'$sum': 1},
                'avg_score': {'$avg': '$risk_score'}
            }}
        ]
        
        if district:
            risk_pipeline[0]['$match']['district'] = district
        
        risk_analytics = list(db.risk_assessments.aggregate(risk_pipeline))
        
        # Hazard detection analytics
        hazard_pipeline = [
            {'$match': {'timestamp': {'$gte': start_date}}},
            {'$group': {
                '_id': '$overall_risk_level',
                'count': {'$sum': 1},
                'detected_hazards': {'$addToSet': '$detected_hazards'}
            }}
        ]
        
        hazard_analytics = list(db.camera_feeds.aggregate(hazard_pipeline))
        
        # Drill analysis summary
        drill_pipeline = [
            {'$match': {'timestamp': {'$gte': start_date}}},
            {'$group': {
                '_id': '$drill_type',
                'count': {'$sum': 1},
                'avg_score': {'$avg': '$analysis_results.overall_score'},
                'avg_time': {'$avg': '$analysis_results.evacuation_time'}
            }}
        ]
        
        drill_analytics = list(db.drill_analyses.aggregate(drill_pipeline))
        
        # Weather alerts summary
        weather_pipeline = [
            {'$match': {'issue_time': {'$gte': start_date}}},
            {'$group': {
                '_id': '$type',
                'count': {'$sum': 1},
                'severity_counts': {'$push': '$severity'}
            }}
        ]
        
        weather_analytics = list(db.weather_alerts.aggregate(weather_pipeline))
        
        return jsonify({
            'success': True,
            'data': {
                'time_range': time_range,
                'district': district,
                'risk_assessments': risk_analytics,
                'hazard_detections': hazard_analytics,
                'drill_analyses': drill_analytics,
                'weather_alerts': weather_analytics,
                'generated_at': datetime.now().isoformat()
            }
        })
        
    except Exception as e:
        logger.error(f"Dashboard analytics failed: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to generate dashboard analytics'
        }), 500

@analytics_bp.route('/analytics/trends', methods=['GET'])
def get_trends_analytics():
    """Get trend analysis for AI metrics"""
    try:
        metric_type = request.args.get('type', 'risk_scores')  # risk_scores, hazard_frequency
        time_range = request.args.get('range', '30d')
        district = request.args.get('district')
        
        # Calculate time buckets for trends
        if time_range == '90d':
            days_back = 90
            bucket_size = 7  # Weekly buckets
        elif time_range == '30d':
            days_back = 30
            bucket_size = 1  # Daily buckets
        else:
            days_back = 7
            bucket_size = 1  # Daily buckets
        
        start_date = datetime.now() - timedelta(days=days_back)
        
        db = get_db()
        trends_data = []
        
        if metric_type == 'risk_scores':
            # Aggregate risk scores over time
            pipeline = [
                {'$match': {'timestamp': {'$gte': start_date}}},
                {'$group': {
                    '_id': {
                        'date': {'$dateToString': {'format': '%Y-%m-%d', 'date': '$timestamp'}},
                        'district': '$district'
                    },
                    'avg_risk_score': {'$avg': '$risk_score'},
                    'count': {'$sum': 1}
                }},
                {'$sort': {'_id.date': 1}}
            ]
            
            if district:
                pipeline[0]['$match']['district'] = district
            
            trends_data = list(db.risk_assessments.aggregate(pipeline))
            
        elif metric_type == 'hazard_frequency':
            # Aggregate hazard detections over time
            pipeline = [
                {'$match': {'timestamp': {'$gte': start_date}}},
                {'$group': {
                    '_id': {
                        'date': {'$dateToString': {'format': '%Y-%m-%d', 'date': '$timestamp'}},
                        'risk_level': '$overall_risk_level'
                    },
                    'count': {'$sum': 1}
                }},
                {'$sort': {'_id.date': 1}}
            ]
            
            trends_data = list(db.camera_feeds.aggregate(pipeline))
        
        return jsonify({
            'success': True,
            'data': {
                'metric_type': metric_type,
                'time_range': time_range,
                'trends': trends_data,
                'generated_at': datetime.now().isoformat()
            }
        })
        
    except Exception as e:
        logger.error(f"Trends analytics failed: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to generate trends analytics'
        }), 500

@analytics_bp.route('/analytics/school/<school_id>', methods=['GET'])
def get_school_analytics(school_id):
    """Get detailed analytics for a specific school"""
    try:
        if not validate_school_id(school_id):
            return jsonify({
                'success': False,
                'error': 'Invalid school ID'
            }), 400
        
        time_range = request.args.get('range', '30d')
        days_back = 30 if time_range == '30d' else 7
        start_date = datetime.now() - timedelta(days=days_back)
        
        db = get_db()
        
        # Risk assessments for this school
        risk_assessments = list(db.risk_assessments.find(
            {
                'school_id': school_id,
                'timestamp': {'$gte': start_date}
            },
            {'_id': 0}
        ).sort('timestamp', -1).limit(20))
        
        # Hazard detections for this school
        hazard_detections = list(db.camera_feeds.find(
            {
                'school_id': school_id,
                'timestamp': {'$gte': start_date}
            },
            {'_id': 0}
        ).sort('timestamp', -1).limit(20))
        
        # Drill analyses for this school
        drill_analyses = list(db.drill_analyses.find(
            {
                'school_id': school_id,
                'timestamp': {'$gte': start_date}
            },
            {'_id': 0}
        ).sort('timestamp', -1).limit(10))
        
        # Calculate summary statistics
        avg_risk_score = 0
        total_hazards_detected = 0
        avg_drill_score = 0
        
        if risk_assessments:
            avg_risk_score = sum(r['risk_score'] for r in risk_assessments) / len(risk_assessments)
        
        if hazard_detections:
            total_hazards_detected = sum(len(h['detected_hazards']) for h in hazard_detections)
        
        if drill_analyses:
            drill_scores = [d['analysis_results']['overall_score'] for d in drill_analyses]
            avg_drill_score = sum(drill_scores) / len(drill_scores)
        
        return jsonify({
            'success': True,
            'data': {
                'school_id': school_id,
                'time_range': time_range,
                'summary': {
                    'avg_risk_score': round(avg_risk_score, 2),
                    'total_risk_assessments': len(risk_assessments),
                    'total_hazards_detected': total_hazards_detected,
                    'total_drill_analyses': len(drill_analyses),
                    'avg_drill_score': round(avg_drill_score, 2)
                },
                'recent_risk_assessments': risk_assessments[:5],
                'recent_hazard_detections': hazard_detections[:5],
                'recent_drill_analyses': drill_analyses[:3],
                'generated_at': datetime.now().isoformat()
            }
        })
        
    except Exception as e:
        logger.error(f"School analytics failed: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to generate school analytics'
        }), 500

@analytics_bp.route('/analytics/performance', methods=['GET'])
def get_performance_analytics():
    """Get AI service performance metrics"""
    try:
        time_range = request.args.get('range', '24h')
        
        if time_range == '7d':
            start_date = datetime.now() - timedelta(days=7)
        elif time_range == '30d':
            start_date = datetime.now() - timedelta(days=30)
        else:
            start_date = datetime.now() - timedelta(hours=24)
        
        db = get_db()
        
        # Count total operations by type
        risk_assessments_count = db.risk_assessments.count_documents(
            {'timestamp': {'$gte': start_date}}
        )
        
        hazard_detections_count = db.camera_feeds.count_documents(
            {'timestamp': {'$gte': start_date}}
        )
        
        drill_analyses_count = db.drill_analyses.count_documents(
            {'timestamp': {'$gte': start_date}}
        )
        
        # Response time analysis (simulated for demo)
        import random
        response_times = {
            'risk_assessment_avg_ms': random.randint(500, 1500),
            'hazard_detection_avg_ms': random.randint(800, 2000),
            'drill_analysis_avg_ms': random.randint(1000, 3000)
        }
        
        # Error rates (simulated)
        error_rates = {
            'risk_assessment_error_rate': random.uniform(0.001, 0.01),
            'hazard_detection_error_rate': random.uniform(0.005, 0.02),
            'drill_analysis_error_rate': random.uniform(0.002, 0.015)
        }
        
        # Model accuracy metrics (simulated)
        model_performance = {
            'risk_classifier_accuracy': random.uniform(0.85, 0.95),
            'hazard_detector_precision': random.uniform(0.80, 0.92),
            'crowd_analyzer_recall': random.uniform(0.78, 0.90)
        }
        
        return jsonify({
            'success': True,
            'data': {
                'time_range': time_range,
                'operation_counts': {
                    'risk_assessments': risk_assessments_count,
                    'hazard_detections': hazard_detections_count,
                    'drill_analyses': drill_analyses_count,
                    'total_operations': risk_assessments_count + hazard_detections_count + drill_analyses_count
                },
                'response_times': response_times,
                'error_rates': error_rates,
                'model_performance': model_performance,
                'system_health': {
                    'status': 'healthy',
                    'uptime_percentage': random.uniform(98, 99.9),
                    'last_health_check': datetime.now().isoformat()
                },
                'generated_at': datetime.now().isoformat()
            }
        })
        
    except Exception as e:
        logger.error(f"Performance analytics failed: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to generate performance analytics'
        }), 500
