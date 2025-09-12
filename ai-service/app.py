from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging
import pandas as pd
from dotenv import load_dotenv

from routes.risk_assessment import risk_bp
from routes.computer_vision import cv_bp
from routes.analytics import analytics_bp
from config.database import init_db
from services.model_manager import ModelManager
from services.weather_service import WeatherService

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins=['http://localhost:3000', 'http://localhost:5000'])

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# App configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'ai-disaster-app-secret')
app.config['MONGODB_URI'] = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/disaster-ai')
app.config['REDIS_URL'] = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
app.config['IMD_API_KEY'] = os.getenv('IMD_API_KEY', '')
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Initialize database
init_db(app)

# Initialize services
model_manager = ModelManager()
weather_service = WeatherService()

# Register blueprints
app.register_blueprint(risk_bp, url_prefix='/api/ai')
app.register_blueprint(cv_bp, url_prefix='/api/ai')
app.register_blueprint(analytics_bp, url_prefix='/api/ai')

@app.route('/', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'AI Disaster Preparedness Service',
        'version': '1.0.0',
        'features': [
            'Risk Assessment',
            'Computer Vision',
            'Predictive Analytics',
            'Real-time Monitoring'
        ]
    })

@app.route('/api/ai/status', methods=['GET'])
def ai_status():
    """AI service status endpoint"""
    try:
        model_status = model_manager.get_model_status()
        weather_status = weather_service.check_connection()
        
        return jsonify({
            'success': True,
            'models': model_status,
            'weather_service': weather_status,
            'timestamp': pd.Timestamp.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Status check failed: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': 'Endpoint not found'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal server error: {str(error)}")
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500

if __name__ == '__main__':
    # Create upload directory if it doesn't exist
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Start the Flask development server
    port = int(os.getenv('AI_PORT', 5001))
    debug = os.getenv('FLASK_ENV') == 'development'
    
    logger.info(f"Starting AI service on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug, threaded=True)
