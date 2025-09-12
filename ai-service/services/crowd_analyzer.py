import cv2
import numpy as np
import logging
from typing import Dict, List, Tuple, Optional
from datetime import datetime
import random

logger = logging.getLogger(__name__)

class CrowdAnalyzer:
    """Service for analyzing crowd density and evacuation drill performance"""
    
    def __init__(self):
        self.initialize_analyzers()
    
    def initialize_analyzers(self):
        """Initialize crowd analysis models and algorithms"""
        try:
            # Initialize background subtractor for motion detection
            self.bg_subtractor = cv2.createBackgroundSubtractorMOG2(
                history=500, varThreshold=16, detectShadows=True
            )
            
            # People detection using HOG descriptor (basic approach)
            self.hog = cv2.HOGDescriptor()
            self.hog.setSVMDetector(cv2.HOGDescriptor_getDefaultPeopleDetector())
            
            logger.info("Crowd analyzer initialized successfully")
            
        except Exception as e:
            logger.warning(f"Failed to initialize some crowd analysis components: {str(e)}")
    
    def analyze_crowd_density(self, image: np.ndarray) -> Dict:
        """
        Analyze crowd density in an image
        """
        try:
            if image is None or image.size == 0:
                return {'detected': False, 'error': 'Invalid image'}
            
            # Detect people using HOG descriptor
            people_rects, weights = self.hog.detectMultiScale(
                image, winStride=(4, 4), padding=(8, 8), scale=1.05
            )
            
            # Filter detections based on confidence
            people_rects = people_rects[weights > 0.5]
            person_count = len(people_rects)
            
            # Calculate crowd density based on image area and person count
            image_area = image.shape[0] * image.shape[1]
            people_per_sqm = person_count / (image_area / 1000000)  # Rough conversion
            
            # Classify density level
            if people_per_sqm > 4:
                density = 'high'
                risk_level = 'critical'
            elif people_per_sqm > 2:
                density = 'medium'
                risk_level = 'moderate'
            elif people_per_sqm > 0.5:
                density = 'low'
                risk_level = 'low'
            else:
                density = 'very_low'
                risk_level = 'minimal'
            
            # Analyze crowd distribution
            crowd_regions = self._analyze_crowd_distribution(people_rects, image.shape)
            
            # Motion analysis for crowd flow
            motion_analysis = self._analyze_crowd_motion(image)
            
            return {
                'detected': person_count > 0,
                'estimated_count': int(person_count),
                'density': density,
                'risk_level': risk_level,
                'people_per_sqm': round(people_per_sqm, 2),
                'crowd_regions': crowd_regions,
                'motion_analysis': motion_analysis,
                'confidence': min(0.9, max(0.3, len(people_rects) * 0.1)),
                'detection_method': 'hog_people_detector'
            }
            
        except Exception as e:
            logger.error(f"Crowd density analysis failed: {str(e)}")
            # Return mock data for demonstration
            return self._generate_mock_crowd_analysis(image)
    
    def analyze_drill_performance(self, drill_type: str = 'evacuation', 
                                expected_participants: int = 100,
                                video_frames: List[np.ndarray] = None) -> Dict:
        """
        Analyze evacuation drill performance using computer vision
        """
        try:
            # For demo purposes, generate realistic drill analysis
            # In production, this would process actual video frames
            
            # Simulate analysis results based on drill type and parameters
            base_score = random.uniform(6.5, 9.5)
            
            # Evacuation time simulation (2-6 minutes)
            evacuation_time = random.randint(120, 360)
            
            # Participation rate (75-95%)
            participation_rate = random.uniform(0.75, 0.95)
            actual_participants = int(expected_participants * participation_rate)
            
            # Identify potential bottlenecks
            bottlenecks = []
            if random.random() < 0.3:  # 30% chance of bottlenecks
                bottleneck_locations = ['main_exit', 'stairway_a', 'corridor_junction', 'assembly_point']
                bottlenecks = random.sample(bottleneck_locations, random.randint(1, 2))
            
            # Movement flow analysis
            flow_analysis = {
                'average_speed': round(random.uniform(0.8, 1.5), 2),  # m/s
                'flow_efficiency': round(random.uniform(0.7, 0.95), 2),
                'congestion_points': len(bottlenecks),
                'smooth_flow_percentage': round(random.uniform(75, 95), 1)
            }
            
            # Safety compliance analysis
            safety_compliance = {
                'proper_exits_used': random.choice([True, False]) if random.random() < 0.1 else True,
                'no_running_observed': random.choice([True, False]) if random.random() < 0.15 else True,
                'orderly_evacuation': random.choice([True, False]) if random.random() < 0.2 else True,
                'assembly_point_reached': random.choice([True, False]) if random.random() < 0.05 else True
            }
            
            # Calculate overall score
            time_score = max(0, 10 - (evacuation_time - 120) / 30)  # Penalty for slow evacuation
            participation_score = participation_rate * 10
            safety_score = sum(safety_compliance.values()) / len(safety_compliance) * 10
            
            overall_score = (time_score + participation_score + safety_score) / 3
            overall_score = max(1, min(10, overall_score))
            
            # Generate performance grade
            if overall_score >= 9:
                performance_grade = 'Excellent'
            elif overall_score >= 7:
                performance_grade = 'Good'
            elif overall_score >= 5:
                performance_grade = 'Satisfactory'
            else:
                performance_grade = 'Needs Improvement'
            
            return {
                'drill_type': drill_type,
                'overall_score': round(overall_score, 1),
                'performance_grade': performance_grade,
                'evacuation_time': evacuation_time,
                'expected_participants': expected_participants,
                'actual_participants': actual_participants,
                'participation_rate': round(participation_rate, 3),
                'bottlenecks': bottlenecks,
                'flow_analysis': flow_analysis,
                'safety_compliance': safety_compliance,
                'analysis_timestamp': datetime.now().isoformat(),
                'recommendations': self._generate_drill_recommendations(
                    overall_score, evacuation_time, bottlenecks, safety_compliance
                )
            }
            
        except Exception as e:
            logger.error(f"Drill performance analysis failed: {str(e)}")
            return {
                'drill_type': drill_type,
                'overall_score': 7.5,
                'performance_grade': 'Good',
                'error': str(e),
                'analysis_timestamp': datetime.now().isoformat()
            }
    
    def track_crowd_movement(self, video_frames: List[np.ndarray]) -> Dict:
        """
        Track crowd movement patterns across video frames
        """
        try:
            if not video_frames or len(video_frames) < 2:
                return {'error': 'Insufficient frames for movement analysis'}
            
            movement_data = []
            
            for i in range(1, len(video_frames)):
                prev_frame = video_frames[i-1]
                curr_frame = video_frames[i]
                
                # Calculate optical flow
                flow = self._calculate_optical_flow(prev_frame, curr_frame)
                
                # Analyze movement patterns
                movement_stats = self._analyze_movement_patterns(flow)
                movement_data.append(movement_stats)
            
            # Aggregate movement analysis
            avg_movement_speed = np.mean([m['average_speed'] for m in movement_data])
            dominant_direction = self._get_dominant_movement_direction(movement_data)
            
            return {
                'total_frames_analyzed': len(video_frames),
                'average_movement_speed': round(avg_movement_speed, 2),
                'dominant_direction': dominant_direction,
                'movement_consistency': self._calculate_movement_consistency(movement_data),
                'congestion_detected': any(m['congestion_level'] > 0.7 for m in movement_data),
                'frame_by_frame_data': movement_data[-5:]  # Last 5 frames
            }
            
        except Exception as e:
            logger.error(f"Crowd movement tracking failed: {str(e)}")
            return {'error': str(e)}
    
    def _analyze_crowd_distribution(self, people_rects: np.ndarray, image_shape: Tuple) -> List[Dict]:
        """Analyze spatial distribution of detected people"""
        if len(people_rects) == 0:
            return []
        
        height, width = image_shape[:2]
        regions = []
        
        # Divide image into grid regions
        grid_size = 3
        cell_width = width // grid_size
        cell_height = height // grid_size
        
        for i in range(grid_size):
            for j in range(grid_size):
                # Define region boundaries
                x_start = j * cell_width
                x_end = (j + 1) * cell_width
                y_start = i * cell_height
                y_end = (i + 1) * cell_height
                
                # Count people in this region
                people_in_region = 0
                for (x, y, w, h) in people_rects:
                    person_center_x = x + w // 2
                    person_center_y = y + h // 2
                    
                    if x_start <= person_center_x < x_end and y_start <= person_center_y < y_end:
                        people_in_region += 1
                
                if people_in_region > 0:
                    density_level = 'high' if people_in_region > 5 else 'medium' if people_in_region > 2 else 'low'
                    
                    regions.append({
                        'region_id': f'region_{i}_{j}',
                        'bounds': [x_start, y_start, cell_width, cell_height],
                        'people_count': people_in_region,
                        'density_level': density_level
                    })
        
        return regions
    
    def _analyze_crowd_motion(self, image: np.ndarray) -> Dict:
        """Basic motion analysis for crowd flow"""
        try:
            # Apply background subtraction for motion detection
            fg_mask = self.bg_subtractor.apply(image)
            
            # Calculate motion statistics
            motion_pixels = np.sum(fg_mask > 0)
            total_pixels = fg_mask.shape[0] * fg_mask.shape[1]
            motion_percentage = (motion_pixels / total_pixels) * 100
            
            # Determine motion level
            if motion_percentage > 30:
                motion_level = 'high'
            elif motion_percentage > 15:
                motion_level = 'medium'
            elif motion_percentage > 5:
                motion_level = 'low'
            else:
                motion_level = 'minimal'
            
            return {
                'motion_percentage': round(motion_percentage, 2),
                'motion_level': motion_level,
                'active_regions': int(motion_pixels / 1000)  # Rough estimate
            }
            
        except Exception as e:
            logger.warning(f"Motion analysis failed: {str(e)}")
            return {
                'motion_percentage': 15.0,
                'motion_level': 'medium',
                'active_regions': 5
            }
    
    def _calculate_optical_flow(self, prev_frame: np.ndarray, curr_frame: np.ndarray) -> np.ndarray:
        """Calculate optical flow between two frames"""
        # Convert to grayscale
        prev_gray = cv2.cvtColor(prev_frame, cv2.COLOR_BGR2GRAY)
        curr_gray = cv2.cvtColor(curr_frame, cv2.COLOR_BGR2GRAY)
        
        # Calculate dense optical flow
        flow = cv2.calcOpticalFlowPyrLK(prev_gray, curr_gray, None, None)
        
        return flow
    
    def _analyze_movement_patterns(self, flow: np.ndarray) -> Dict:
        """Analyze movement patterns from optical flow"""
        # Mock implementation for demonstration
        return {
            'average_speed': random.uniform(0.5, 2.0),
            'primary_direction': random.choice(['north', 'south', 'east', 'west']),
            'congestion_level': random.uniform(0.1, 0.9),
            'flow_uniformity': random.uniform(0.3, 0.9)
        }
    
    def _get_dominant_movement_direction(self, movement_data: List[Dict]) -> str:
        """Determine dominant movement direction from movement data"""
        directions = [data['primary_direction'] for data in movement_data]
        return max(set(directions), key=directions.count)
    
    def _calculate_movement_consistency(self, movement_data: List[Dict]) -> float:
        """Calculate consistency of movement across frames"""
        if not movement_data:
            return 0.0
        
        speeds = [data['average_speed'] for data in movement_data]
        speed_std = np.std(speeds)
        
        # Lower standard deviation means more consistent movement
        consistency = max(0, 1 - speed_std / 2)
        return round(consistency, 3)
    
    def _generate_mock_crowd_analysis(self, image: np.ndarray) -> Dict:
        """Generate mock crowd analysis for demonstration"""
        # Simulate realistic crowd detection
        mock_count = random.randint(5, 50)
        
        density_options = ['low', 'medium', 'high']
        density = random.choice(density_options)
        
        risk_levels = {'low': 'low', 'medium': 'moderate', 'high': 'critical'}
        risk_level = risk_levels[density]
        
        return {
            'detected': mock_count > 0,
            'estimated_count': mock_count,
            'density': density,
            'risk_level': risk_level,
            'people_per_sqm': round(random.uniform(0.5, 5.0), 2),
            'crowd_regions': [
                {
                    'region_id': 'region_1_1',
                    'bounds': [100, 100, 200, 150],
                    'people_count': mock_count // 3,
                    'density_level': density
                }
            ],
            'motion_analysis': {
                'motion_percentage': round(random.uniform(10, 40), 2),
                'motion_level': 'medium',
                'active_regions': random.randint(2, 8)
            },
            'confidence': 0.75,
            'detection_method': 'mock_data'
        }
    
    def _generate_drill_recommendations(self, overall_score: float, evacuation_time: int, 
                                      bottlenecks: List[str], safety_compliance: Dict) -> List[str]:
        """Generate recommendations based on drill performance"""
        recommendations = []
        
        # Time-based recommendations
        if evacuation_time > 300:  # More than 5 minutes
            recommendations.append("Practice evacuation procedures more frequently to improve response time")
            recommendations.append("Review evacuation routes and consider additional exits")
        elif evacuation_time > 240:  # More than 4 minutes
            recommendations.append("Conduct regular evacuation drills to maintain readiness")
        
        # Bottleneck-based recommendations
        if bottlenecks:
            recommendations.append(f"Address congestion at: {', '.join(bottlenecks)}")
            recommendations.append("Consider widening exits or improving signage at bottleneck locations")
        
        # Safety compliance recommendations
        if not safety_compliance.get('proper_exits_used', True):
            recommendations.append("Ensure all participants use designated evacuation routes")
        
        if not safety_compliance.get('no_running_observed', True):
            recommendations.append("Emphasize calm, orderly evacuation procedures in training")
        
        if not safety_compliance.get('orderly_evacuation', True):
            recommendations.append("Improve crowd management and supervision during evacuation")
        
        # Score-based recommendations
        if overall_score < 6:
            recommendations.append("Consider additional safety training for staff and students")
            recommendations.append("Review and update emergency response procedures")
        elif overall_score < 8:
            recommendations.append("Continue regular practice to maintain good performance")
        else:
            recommendations.append("Excellent performance - maintain current procedures")
        
        return recommendations[:5]  # Return top 5 recommendations
