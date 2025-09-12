"""
Validation utilities for AI service
"""
import re
from typing import Union

def validate_coordinates(latitude: float, longitude: float) -> bool:
    """
    Validate if coordinates are within Punjab boundaries
    Punjab approximate boundaries:
    - Latitude: 29.5°N to 32.5°N  
    - Longitude: 73.5°E to 77°E
    """
    try:
        lat = float(latitude)
        lon = float(longitude)
        
        # Punjab boundaries with some buffer
        if 29.0 <= lat <= 33.0 and 73.0 <= lon <= 77.5:
            return True
        return False
    except (ValueError, TypeError):
        return False

def validate_district(district: str) -> bool:
    """Validate if district is a valid Punjab district"""
    if not district or not isinstance(district, str):
        return False
    
    punjab_districts = {
        'Amritsar', 'Barnala', 'Bathinda', 'Faridkot', 'Fatehgarh Sahib',
        'Fazilka', 'Ferozepur', 'Gurdaspur', 'Hoshiarpur', 'Jalandhar',
        'Kapurthala', 'Ludhiana', 'Mansa', 'Moga', 'Muktsar', 'Nawanshahr',
        'Pathankot', 'Patiala', 'Rupnagar', 'Sangrur', 'Tarn Taran', 'Mohali'
    }
    
    return district.strip().title() in punjab_districts

def validate_school_id(school_id: Union[str, int]) -> bool:
    """Validate school ID format"""
    if not school_id:
        return False
    
    school_id = str(school_id).strip()
    
    # Basic validation - should be alphanumeric and reasonable length
    if len(school_id) < 3 or len(school_id) > 20:
        return False
    
    # Allow alphanumeric characters, hyphens, and underscores
    if re.match(r'^[a-zA-Z0-9_-]+$', school_id):
        return True
    
    return False

def validate_risk_level(risk_level: str) -> bool:
    """Validate risk level"""
    if not risk_level or not isinstance(risk_level, str):
        return False
    
    valid_levels = {'low', 'moderate', 'high', 'critical'}
    return risk_level.lower().strip() in valid_levels

def validate_disaster_type(disaster_type: str) -> bool:
    """Validate disaster type"""
    if not disaster_type or not isinstance(disaster_type, str):
        return False
    
    valid_types = {
        'earthquake', 'flood', 'fire', 'cyclone', 'drought', 
        'heatwave', 'landslide', 'storm', 'accident'
    }
    return disaster_type.lower().strip() in valid_types

def validate_email(email: str) -> bool:
    """Basic email validation"""
    if not email or not isinstance(email, str):
        return False
    
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(email_pattern, email.strip()) is not None

def validate_phone_number(phone: str) -> bool:
    """Validate Indian phone number"""
    if not phone or not isinstance(phone, str):
        return False
    
    # Remove spaces, hyphens, and parentheses
    cleaned_phone = re.sub(r'[\s\-\(\)]', '', phone.strip())
    
    # Check for Indian mobile number patterns
    patterns = [
        r'^[6-9]\d{9}$',        # 10 digit mobile
        r'^\+91[6-9]\d{9}$',    # +91 prefix
        r'^91[6-9]\d{9}$',      # 91 prefix
        r'^0[6-9]\d{9}$'        # 0 prefix
    ]
    
    return any(re.match(pattern, cleaned_phone) for pattern in patterns)
