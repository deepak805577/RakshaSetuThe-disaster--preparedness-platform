import pymongo
from pymongo import MongoClient
import redis
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# Global database connections
mongo_client: Optional[MongoClient] = None
mongo_db = None
redis_client = None

def init_db(app):
    """Initialize database connections"""
    global mongo_client, mongo_db, redis_client
    
    try:
        # MongoDB connection
        mongo_uri = app.config['MONGODB_URI']
        mongo_client = MongoClient(mongo_uri)
        
        # Test MongoDB connection
        mongo_client.admin.command('ping')
        db_name = mongo_uri.split('/')[-1] if '/' in mongo_uri else 'disaster-ai'
        mongo_db = mongo_client[db_name]
        
        # Create indexes for better performance
        create_indexes()
        
        logger.info("MongoDB connected successfully")
        
        # Redis connection for caching (optional)
        try:
            redis_url = app.config['REDIS_URL']
            redis_client = redis.from_url(redis_url, decode_responses=True)
            
            # Test Redis connection
            redis_client.ping()
            logger.info("Redis connected successfully")
        except Exception as redis_error:
            logger.warning(f"Redis connection failed: {str(redis_error)}. Continuing without caching.")
            redis_client = None
        
    except Exception as e:
        logger.error(f"Database connection failed: {str(e)}")
        raise

def create_indexes():
    """Create database indexes for AI collections"""
    global mongo_db
    
    if mongo_db is None:
        return
    
    try:
        # Risk assessments collection
        risk_assessments = mongo_db.risk_assessments
        risk_assessments.create_index([("school_id", 1), ("timestamp", -1)])
        risk_assessments.create_index([("district", 1), ("risk_level", 1)])
        risk_assessments.create_index([("coordinates", "2dsphere")])
        
        # ML predictions collection
        ml_predictions = mongo_db.ml_predictions
        ml_predictions.create_index([("model_type", 1), ("timestamp", -1)])
        ml_predictions.create_index([("location", "2dsphere")])
        
        # Camera feeds collection
        camera_feeds = mongo_db.camera_feeds
        camera_feeds.create_index([("school_id", 1), ("timestamp", -1)])
        camera_feeds.create_index([("status", 1)])
        
        # Historical data collection
        historical_data = mongo_db.historical_data
        historical_data.create_index([("district", 1), ("disaster_type", 1)])
        historical_data.create_index([("date", -1)])
        
        # Weather data collection
        weather_data = mongo_db.weather_data
        weather_data.create_index([("district", 1), ("timestamp", -1)])
        weather_data.create_index([("coordinates", "2dsphere")])
        
        logger.info("Database indexes created successfully")
        
    except Exception as e:
        logger.error(f"Error creating indexes: {str(e)}")

def get_db():
    """Get MongoDB database instance"""
    return mongo_db

def get_redis():
    """Get Redis client instance"""
    return redis_client

def close_db():
    """Close database connections"""
    global mongo_client, redis_client
    
    if mongo_client:
        mongo_client.close()
        logger.info("MongoDB connection closed")
    
    if redis_client:
        redis_client.close()
        logger.info("Redis connection closed")
