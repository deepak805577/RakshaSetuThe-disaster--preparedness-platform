"""
Image processing utilities for AI service
"""
import base64
import cv2
import numpy as np
from PIL import Image
import io
from typing import Optional, Tuple, Union
import logging

logger = logging.getLogger(__name__)

def validate_image(image: Union[Image.Image, np.ndarray, str]) -> bool:
    """
    Validate if image is valid and processable
    """
    try:
        if isinstance(image, Image.Image):
            # PIL Image validation
            if image.mode not in ['RGB', 'RGBA', 'L']:
                return False
            if image.size[0] < 100 or image.size[1] < 100:  # Minimum size
                return False
            if image.size[0] > 4000 or image.size[1] > 4000:  # Maximum size
                return False
            return True
        
        elif isinstance(image, np.ndarray):
            # OpenCV image validation
            if len(image.shape) not in [2, 3]:  # Grayscale or color
                return False
            if image.shape[0] < 100 or image.shape[1] < 100:
                return False
            if image.shape[0] > 4000 or image.shape[1] > 4000:
                return False
            return True
        
        elif isinstance(image, str):
            # Base64 string validation
            try:
                decode_image(image)
                return True
            except:
                return False
        
        return False
        
    except Exception as e:
        logger.warning(f"Image validation failed: {str(e)}")
        return False

def encode_image(image: Union[Image.Image, np.ndarray], format: str = 'JPEG') -> str:
    """
    Encode image to base64 string
    """
    try:
        if isinstance(image, np.ndarray):
            # Convert OpenCV image to PIL
            if len(image.shape) == 3:
                # Convert BGR to RGB
                image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
                pil_image = Image.fromarray(image_rgb)
            else:
                pil_image = Image.fromarray(image)
        else:
            pil_image = image
        
        # Convert to bytes
        buffer = io.BytesIO()
        pil_image.save(buffer, format=format, quality=85)
        image_bytes = buffer.getvalue()
        
        # Encode to base64
        base64_string = base64.b64encode(image_bytes).decode('utf-8')
        return base64_string
        
    except Exception as e:
        logger.error(f"Image encoding failed: {str(e)}")
        raise

def decode_image(base64_string: str) -> Image.Image:
    """
    Decode base64 string to PIL Image
    """
    try:
        # Remove data URL prefix if present
        if base64_string.startswith('data:image'):
            base64_string = base64_string.split(',')[1]
        
        # Decode base64
        image_bytes = base64.b64decode(base64_string)
        
        # Convert to PIL Image
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        return image
        
    except Exception as e:
        logger.error(f"Image decoding failed: {str(e)}")
        raise

def resize_image(image: Union[Image.Image, np.ndarray], 
                max_size: Tuple[int, int] = (1024, 1024),
                maintain_aspect: bool = True) -> Union[Image.Image, np.ndarray]:
    """
    Resize image to fit within max_size while optionally maintaining aspect ratio
    """
    try:
        if isinstance(image, np.ndarray):
            height, width = image.shape[:2]
            
            if maintain_aspect:
                # Calculate new dimensions maintaining aspect ratio
                aspect_ratio = width / height
                max_width, max_height = max_size
                
                if width > height:
                    new_width = min(max_width, width)
                    new_height = int(new_width / aspect_ratio)
                else:
                    new_height = min(max_height, height)
                    new_width = int(new_height * aspect_ratio)
            else:
                new_width, new_height = max_size
            
            # Resize using OpenCV
            resized = cv2.resize(image, (new_width, new_height), interpolation=cv2.INTER_AREA)
            return resized
        
        else:  # PIL Image
            if maintain_aspect:
                image.thumbnail(max_size, Image.Resampling.LANCZOS)
                return image
            else:
                return image.resize(max_size, Image.Resampling.LANCZOS)
                
    except Exception as e:
        logger.error(f"Image resizing failed: {str(e)}")
        return image  # Return original on failure

def preprocess_for_cv(image: Union[Image.Image, np.ndarray]) -> np.ndarray:
    """
    Preprocess image for computer vision tasks
    """
    try:
        # Convert to OpenCV format
        if isinstance(image, Image.Image):
            cv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        else:
            cv_image = image.copy()
        
        # Ensure it's in the right format
        if len(cv_image.shape) == 3 and cv_image.shape[2] == 4:
            # Convert RGBA to RGB
            cv_image = cv2.cvtColor(cv_image, cv2.COLOR_RGBA2BGR)
        
        return cv_image
        
    except Exception as e:
        logger.error(f"Image preprocessing failed: {str(e)}")
        raise

def enhance_image_quality(image: np.ndarray) -> np.ndarray:
    """
    Enhance image quality for better computer vision results
    """
    try:
        # Apply bilateral filter to reduce noise while preserving edges
        enhanced = cv2.bilateralFilter(image, 9, 75, 75)
        
        # Enhance contrast using CLAHE (Contrast Limited Adaptive Histogram Equalization)
        if len(enhanced.shape) == 3:
            # For color images, apply to each channel
            lab = cv2.cvtColor(enhanced, cv2.COLOR_BGR2LAB)
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
            lab[:,:,0] = clahe.apply(lab[:,:,0])
            enhanced = cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)
        else:
            # For grayscale images
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
            enhanced = clahe.apply(enhanced)
        
        return enhanced
        
    except Exception as e:
        logger.warning(f"Image enhancement failed: {str(e)}")
        return image  # Return original on failure

def extract_image_features(image: np.ndarray) -> dict:
    """
    Extract basic features from image for analysis
    """
    try:
        features = {}
        
        # Basic properties
        features['height'], features['width'] = image.shape[:2]
        features['channels'] = image.shape[2] if len(image.shape) == 3 else 1
        features['total_pixels'] = features['height'] * features['width']
        
        # Color analysis
        if len(image.shape) == 3:
            # Mean colors
            features['mean_blue'] = float(np.mean(image[:,:,0]))
            features['mean_green'] = float(np.mean(image[:,:,1]))
            features['mean_red'] = float(np.mean(image[:,:,2]))
            
            # Dominant colors
            features['dominant_color'] = get_dominant_color(image)
        else:
            features['mean_intensity'] = float(np.mean(image))
        
        # Texture features
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
        features['contrast'] = float(np.std(gray))
        
        # Edge detection
        edges = cv2.Canny(gray, 50, 150)
        features['edge_density'] = float(np.sum(edges > 0) / features['total_pixels'])
        
        # Brightness and exposure
        features['brightness'] = float(np.mean(gray))
        features['is_overexposed'] = float(np.sum(gray > 240) / features['total_pixels']) > 0.1
        features['is_underexposed'] = float(np.sum(gray < 20) / features['total_pixels']) > 0.1
        
        return features
        
    except Exception as e:
        logger.error(f"Feature extraction failed: {str(e)}")
        return {}

def get_dominant_color(image: np.ndarray, k: int = 3) -> list:
    """
    Get dominant colors in image using K-means clustering
    """
    try:
        # Reshape image to be a list of pixels
        data = image.reshape((-1, 3))
        data = np.float32(data)
        
        # Apply K-means clustering
        criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 20, 1.0)
        _, labels, centers = cv2.kmeans(data, k, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)
        
        # Convert back to uint8 and return dominant colors
        centers = np.uint8(centers)
        
        # Count pixels for each cluster
        unique, counts = np.unique(labels, return_counts=True)
        
        # Sort by frequency
        dominant_colors = []
        for i in np.argsort(counts)[::-1]:
            color = centers[i]
            percentage = counts[i] / len(labels) * 100
            dominant_colors.append({
                'color': [int(color[2]), int(color[1]), int(color[0])],  # BGR to RGB
                'percentage': float(percentage)
            })
        
        return dominant_colors
        
    except Exception as e:
        logger.warning(f"Dominant color extraction failed: {str(e)}")
        return []

def crop_to_region(image: np.ndarray, bbox: Tuple[int, int, int, int]) -> np.ndarray:
    """
    Crop image to specified bounding box (x, y, width, height)
    """
    try:
        x, y, w, h = bbox
        
        # Ensure coordinates are within image bounds
        height, width = image.shape[:2]
        x = max(0, min(x, width))
        y = max(0, min(y, height))
        w = min(w, width - x)
        h = min(h, height - y)
        
        return image[y:y+h, x:x+w]
        
    except Exception as e:
        logger.error(f"Image cropping failed: {str(e)}")
        return image

def create_thumbnail(image: Union[Image.Image, np.ndarray], size: Tuple[int, int] = (150, 150)) -> str:
    """
    Create a base64-encoded thumbnail of the image
    """
    try:
        if isinstance(image, np.ndarray):
            # Convert OpenCV to PIL
            if len(image.shape) == 3:
                pil_image = Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
            else:
                pil_image = Image.fromarray(image)
        else:
            pil_image = image.copy()
        
        # Create thumbnail
        pil_image.thumbnail(size, Image.Resampling.LANCZOS)
        
        # Convert to base64
        return encode_image(pil_image, format='JPEG')
        
    except Exception as e:
        logger.error(f"Thumbnail creation failed: {str(e)}")
        return ""
