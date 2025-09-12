import cv2
import numpy as np
import logging
from typing import Dict, Tuple, List
import os

logger = logging.getLogger(__name__)

class HazardDetector:
    """Computer vision-based hazard detection system"""
    
    def __init__(self):
        self.initialized = False
        self.initialize_detectors()
    
    def initialize_detectors(self):
        """Initialize detection models and algorithms"""
        try:
            # Initialize color ranges for different hazards (HSV color space)
            self.fire_hsv_ranges = [
                (np.array([0, 50, 50]), np.array([10, 255, 255])),    # Red-orange
                (np.array([170, 50, 50]), np.array([180, 255, 255]))  # Red wraparound
            ]
            
            self.smoke_hsv_range = (
                np.array([0, 0, 50]), np.array([180, 30, 200])  # Gray smoke
            )
            
            self.flood_hsv_range = (
                np.array([100, 50, 50]), np.array([130, 255, 255])  # Blue water
            )
            
            # Load pre-trained cascade classifiers if available
            cascades_dir = 'models/cascades'
            if os.path.exists(cascades_dir):
                fire_cascade_path = os.path.join(cascades_dir, 'fire_cascade.xml')
                if os.path.exists(fire_cascade_path):
                    self.fire_cascade = cv2.CascadeClassifier(fire_cascade_path)
                    logger.info("Loaded fire cascade classifier")
            
            self.initialized = True
            logger.info("Hazard detector initialized successfully")
            
        except Exception as e:
            logger.warning(f"Failed to initialize some detection models: {str(e)}")
            self.initialized = True  # Continue with basic detection
    
    def detect_fire(self, image: np.ndarray) -> Dict:
        """
        Detect fire in an image using color-based detection and motion analysis
        """
        try:
            if image is None or image.size == 0:
                return {'detected': False, 'error': 'Invalid image'}
            
            # Convert to HSV for better color detection
            hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
            
            # Create mask for fire colors
            fire_mask = np.zeros(hsv.shape[:2], dtype=np.uint8)
            
            for lower, upper in self.fire_hsv_ranges:
                mask = cv2.inRange(hsv, lower, upper)
                fire_mask = cv2.bitwise_or(fire_mask, mask)
            
            # Apply morphological operations to reduce noise
            kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
            fire_mask = cv2.morphologyEx(fire_mask, cv2.MORPH_OPEN, kernel)
            fire_mask = cv2.morphologyEx(fire_mask, cv2.MORPH_CLOSE, kernel)
            
            # Find contours
            contours, _ = cv2.findContours(
                fire_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
            )
            
            # Analyze contours
            fire_regions = []
            total_fire_area = 0
            
            for contour in contours:
                area = cv2.contourArea(contour)
                if area > 100:  # Minimum area threshold
                    x, y, w, h = cv2.boundingRect(contour)
                    fire_regions.append({
                        'bbox': (x, y, w, h),
                        'area': area,
                        'center': (x + w//2, y + h//2)
                    })
                    total_fire_area += area
            
            # Calculate confidence and risk level
            image_area = image.shape[0] * image.shape[1]
            fire_percentage = (total_fire_area / image_area) * 100
            
            detected = len(fire_regions) > 0
            confidence = min(fire_percentage * 10, 95) if detected else 0
            
            # Determine risk level
            if fire_percentage > 5:
                risk_level = 'critical'
            elif fire_percentage > 1:
                risk_level = 'high'
            elif detected:
                risk_level = 'medium'
            else:
                risk_level = 'low'
            
            # Additional analysis for flame characteristics
            flame_characteristics = self._analyze_flame_characteristics(
                image, fire_mask, fire_regions
            ) if detected else {}
            
            return {
                'detected': detected,
                'confidence': confidence,
                'risk_level': risk_level,
                'fire_regions': fire_regions,
                'fire_percentage': fire_percentage,
                'flame_characteristics': flame_characteristics,
                'detection_method': 'color_based_cv'
            }
            
        except Exception as e:
            logger.error(f"Fire detection failed: {str(e)}")
            return {
                'detected': False,
                'error': f'Detection failed: {str(e)}',
                'confidence': 0
            }
    
    def detect_smoke(self, image: np.ndarray) -> Dict:
        """
        Detect smoke in an image using color and texture analysis
        """
        try:
            if image is None or image.size == 0:
                return {'detected': False, 'error': 'Invalid image'}
            
            # Convert to different color spaces
            hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Smoke detection using color
            smoke_mask = cv2.inRange(hsv, self.smoke_hsv_range[0], self.smoke_hsv_range[1])
            
            # Texture analysis for smoke patterns
            # Apply Gaussian blur to identify smoky regions
            blurred = cv2.GaussianBlur(gray, (21, 21), 0)
            texture_diff = cv2.absdiff(gray, blurred)
            
            # Combine color and texture masks
            _, texture_thresh = cv2.threshold(texture_diff, 25, 255, cv2.THRESH_BINARY)
            combined_mask = cv2.bitwise_and(smoke_mask, texture_thresh)
            
            # Apply morphological operations
            kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
            combined_mask = cv2.morphologyEx(combined_mask, cv2.MORPH_OPEN, kernel)
            combined_mask = cv2.dilate(combined_mask, kernel, iterations=2)
            
            # Find smoke regions
            contours, _ = cv2.findContours(
                combined_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
            )
            
            smoke_regions = []
            total_smoke_area = 0
            
            for contour in contours:
                area = cv2.contourArea(contour)
                if area > 200:  # Minimum area for smoke region
                    x, y, w, h = cv2.boundingRect(contour)
                    
                    # Analyze shape characteristics (smoke tends to be irregular)
                    perimeter = cv2.arcLength(contour, True)
                    circularity = 4 * np.pi * area / (perimeter * perimeter) if perimeter > 0 else 0
                    
                    # Smoke regions are typically less circular
                    if circularity < 0.7:
                        smoke_regions.append({
                            'bbox': (x, y, w, h),
                            'area': area,
                            'center': (x + w//2, y + h//2),
                            'circularity': circularity
                        })
                        total_smoke_area += area
            
            # Calculate metrics
            image_area = image.shape[0] * image.shape[1]
            smoke_percentage = (total_smoke_area / image_area) * 100
            
            detected = len(smoke_regions) > 0
            confidence = min(smoke_percentage * 15, 90) if detected else 0
            
            # Determine risk level
            if smoke_percentage > 3:
                risk_level = 'high'
            elif smoke_percentage > 1:
                risk_level = 'medium'
            elif detected:
                risk_level = 'low'
            else:
                risk_level = 'none'
            
            return {
                'detected': detected,
                'confidence': confidence,
                'risk_level': risk_level,
                'smoke_regions': smoke_regions,
                'smoke_percentage': smoke_percentage,
                'detection_method': 'color_texture_analysis'
            }
            
        except Exception as e:
            logger.error(f"Smoke detection failed: {str(e)}")
            return {
                'detected': False,
                'error': f'Detection failed: {str(e)}',
                'confidence': 0
            }
    
    def detect_flooding(self, image: np.ndarray) -> Dict:
        """
        Detect flooding/water accumulation in an image
        """
        try:
            if image is None or image.size == 0:
                return {'detected': False, 'error': 'Invalid image'}
            
            # Convert to HSV
            hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
            
            # Create mask for water-like colors (blue tones)
            water_mask = cv2.inRange(hsv, self.flood_hsv_range[0], self.flood_hsv_range[1])
            
            # Also look for reflective surfaces (characteristic of water)
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Apply adaptive threshold to find reflective areas
            adaptive_thresh = cv2.adaptiveThreshold(
                gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
            )
            
            # Combine water color and reflection masks
            reflection_mask = cv2.bitwise_not(adaptive_thresh)
            combined_mask = cv2.bitwise_or(water_mask, reflection_mask)
            
            # Apply morphological operations
            kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (10, 10))
            combined_mask = cv2.morphologyEx(combined_mask, cv2.MORPH_OPEN, kernel)
            combined_mask = cv2.morphologyEx(combined_mask, cv2.MORPH_CLOSE, kernel)
            
            # Find water regions
            contours, _ = cv2.findContours(
                combined_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
            )
            
            water_regions = []
            total_water_area = 0
            
            for contour in contours:
                area = cv2.contourArea(contour)
                if area > 500:  # Minimum area for water body
                    x, y, w, h = cv2.boundingRect(contour)
                    
                    # Check if region is in lower part of image (more likely to be flooding)
                    region_y_center = y + h // 2
                    image_height = image.shape[0]
                    y_position_ratio = region_y_center / image_height
                    
                    # Weight regions in lower part of image higher
                    position_weight = 1.0 if y_position_ratio > 0.6 else 0.7
                    
                    water_regions.append({
                        'bbox': (x, y, w, h),
                        'area': area * position_weight,
                        'center': (x + w//2, y + h//2),
                        'y_position_ratio': y_position_ratio
                    })
                    total_water_area += area * position_weight
            
            # Calculate metrics
            image_area = image.shape[0] * image.shape[1]
            water_percentage = (total_water_area / image_area) * 100
            
            detected = len(water_regions) > 0
            confidence = min(water_percentage * 8, 85) if detected else 0
            
            # Determine flood risk level
            if water_percentage > 10:
                risk_level = 'critical'
            elif water_percentage > 5:
                risk_level = 'high'
            elif water_percentage > 2:
                risk_level = 'medium'
            elif detected:
                risk_level = 'low'
            else:
                risk_level = 'none'
            
            return {
                'detected': detected,
                'confidence': confidence,
                'risk_level': risk_level,
                'water_regions': water_regions,
                'water_percentage': water_percentage,
                'flood_indicators': {
                    'ground_level_water': any(r['y_position_ratio'] > 0.8 for r in water_regions),
                    'widespread_water': water_percentage > 8,
                    'multiple_regions': len(water_regions) > 3
                },
                'detection_method': 'color_reflection_analysis'
            }
            
        except Exception as e:
            logger.error(f"Flood detection failed: {str(e)}")
            return {
                'detected': False,
                'error': f'Detection failed: {str(e)}',
                'confidence': 0
            }
    
    def _analyze_flame_characteristics(self, image: np.ndarray, fire_mask: np.ndarray, 
                                     fire_regions: List[Dict]) -> Dict:
        """
        Analyze flame characteristics for better fire detection accuracy
        """
        try:
            characteristics = {
                'flickering_detected': False,
                'flame_height': 0,
                'flame_intensity': 0,
                'flame_color_distribution': {}
            }
            
            if not fire_regions:
                return characteristics
            
            # Analyze flame intensity (brightness in fire regions)
            fire_area = cv2.bitwise_and(image, image, mask=fire_mask)
            fire_pixels = fire_area[fire_mask > 0]
            
            if len(fire_pixels) > 0:
                # Calculate intensity
                intensity = np.mean(fire_pixels)
                characteristics['flame_intensity'] = float(intensity)
                
                # Calculate flame height (max vertical extent)
                max_height = 0
                for region in fire_regions:
                    height = region['bbox'][3]  # height of bounding box
                    max_height = max(max_height, height)
                
                characteristics['flame_height'] = max_height
                
                # Analyze color distribution
                hsv_fire = cv2.cvtColor(fire_area, cv2.COLOR_BGR2HSV)
                fire_hsv_pixels = hsv_fire[fire_mask > 0]
                
                if len(fire_hsv_pixels) > 0:
                    hue_values = fire_hsv_pixels[:, 0]
                    red_orange_pixels = np.sum((hue_values <= 15) | (hue_values >= 170))
                    yellow_pixels = np.sum((hue_values > 15) & (hue_values <= 30))
                    
                    total_pixels = len(fire_hsv_pixels)
                    characteristics['flame_color_distribution'] = {
                        'red_orange_ratio': float(red_orange_pixels / total_pixels),
                        'yellow_ratio': float(yellow_pixels / total_pixels)
                    }
            
            return characteristics
            
        except Exception as e:
            logger.warning(f"Flame analysis failed: {str(e)}")
            return {'analysis_error': str(e)}
    
    def detect_multiple_hazards(self, image: np.ndarray, 
                               hazard_types: List[str] = None) -> Dict:
        """
        Detect multiple types of hazards in a single image
        """
        if hazard_types is None:
            hazard_types = ['fire', 'smoke', 'flood']
        
        results = {}
        overall_risk = 'low'
        detected_hazards = []
        
        try:
            for hazard_type in hazard_types:
                if hazard_type == 'fire':
                    result = self.detect_fire(image)
                elif hazard_type == 'smoke':
                    result = self.detect_smoke(image)
                elif hazard_type == 'flood':
                    result = self.detect_flooding(image)
                else:
                    continue
                
                results[hazard_type] = result
                
                if result.get('detected', False):
                    detected_hazards.append(hazard_type)
                    
                    # Update overall risk level
                    risk = result.get('risk_level', 'low')
                    if risk == 'critical':
                        overall_risk = 'critical'
                    elif risk == 'high' and overall_risk != 'critical':
                        overall_risk = 'high'
                    elif risk == 'medium' and overall_risk == 'low':
                        overall_risk = 'medium'
            
            return {
                'detected_hazards': detected_hazards,
                'overall_risk_level': overall_risk,
                'individual_results': results,
                'hazard_count': len(detected_hazards),
                'analysis_timestamp': cv2.getTickCount()
            }
            
        except Exception as e:
            logger.error(f"Multiple hazard detection failed: {str(e)}")
            return {
                'detected_hazards': [],
                'overall_risk_level': 'unknown',
                'error': str(e)
            }
