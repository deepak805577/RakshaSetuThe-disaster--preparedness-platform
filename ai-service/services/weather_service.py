import requests
import logging
from datetime import datetime, timedelta
from typing import Dict, Optional, List
import os
from config.database import get_db, get_redis

logger = logging.getLogger(__name__)

class WeatherService:
    """Service for fetching weather data from IMD and other weather APIs"""
    
    def __init__(self):
        self.imd_api_key = os.getenv('IMD_API_KEY', '')
        self.backup_api_key = os.getenv('OPENWEATHER_API_KEY', '')
        self.base_urls = {
            'imd': 'https://api.imd.gov.in/v1',
            'openweather': 'https://api.openweathermap.org/data/2.5'
        }
        
        # Punjab district coordinates for weather monitoring
        self.district_coords = {
            'Amritsar': (31.6340, 74.8723),
            'Ludhiana': (30.9010, 75.8573),
            'Jalandhar': (31.3260, 75.5762),
            'Patiala': (30.3398, 76.3869),
            'Bathinda': (30.2110, 74.9455),
            'Mohali': (30.7046, 76.7179),
            'Gurdaspur': (32.0409, 75.4065),
            'Pathankot': (32.2741, 75.6522),
            'Hoshiarpur': (31.5385, 75.9117),
            'Kapurthala': (31.3800, 75.3800),
            'Faridkot': (30.6735, 74.7553),
            'Ferozepur': (30.9259, 74.6109),
            'Muktsar': (30.4759, 74.5139),
            'Moga': (30.8158, 75.1708),
            'Barnala': (30.3783, 75.5456),
            'Sangrur': (30.2468, 75.8439),
            'Mansa': (29.9988, 75.3936),
            'Nawanshahr': (31.1265, 76.1178),
            'Rupnagar': (30.9645, 76.5270),
            'Fatehgarh Sahib': (30.6446, 76.3971),
            'Tarn Taran': (31.4515, 74.9289),
            'Fazilka': (30.4028, 74.0284)
        }
    
    def get_current_weather(self, latitude: float, longitude: float) -> Optional[Dict]:
        """Get current weather data for given coordinates"""
        try:
            # Check cache first
            redis_client = get_redis()
            cache_key = f"weather_current:{latitude}:{longitude}"
            
            if redis_client:
                cached_data = redis_client.get(cache_key)
                if cached_data:
                    import json
                    return json.loads(cached_data)
            
            # Try IMD API first
            weather_data = self._fetch_from_imd(latitude, longitude)
            
            # If IMD fails, use OpenWeatherMap as backup
            if not weather_data and self.backup_api_key:
                weather_data = self._fetch_from_openweather(latitude, longitude)
            
            # If both fail, generate mock data for demo
            if not weather_data:
                weather_data = self._generate_mock_weather(latitude, longitude)
            
            # Cache the result
            if redis_client and weather_data:
                import json
                redis_client.setex(cache_key, 1800, json.dumps(weather_data))  # 30 min cache
            
            # Store in database for historical analysis
            self._store_weather_data(weather_data, latitude, longitude)
            
            return weather_data
            
        except Exception as e:
            logger.error(f"Failed to get current weather: {str(e)}")
            return self._generate_mock_weather(latitude, longitude)
    
    def get_district_forecast(self, district: str, days: int = 5) -> Dict:
        """Get weather forecast for a specific Punjab district"""
        try:
            if district not in self.district_coords:
                return {'error': 'Invalid district'}
            
            lat, lon = self.district_coords[district]
            
            # Check cache
            redis_client = get_redis()
            cache_key = f"weather_forecast:{district}:{days}"
            
            if redis_client:
                cached_data = redis_client.get(cache_key)
                if cached_data:
                    import json
                    return json.loads(cached_data)
            
            # Fetch forecast data
            forecast_data = self._fetch_forecast_data(lat, lon, days)
            
            if not forecast_data:
                forecast_data = self._generate_mock_forecast(district, days)
            
            # Cache for 6 hours
            if redis_client:
                import json
                redis_client.setex(cache_key, 21600, json.dumps(forecast_data))
            
            return forecast_data
            
        except Exception as e:
            logger.error(f"Failed to get district forecast: {str(e)}")
            return self._generate_mock_forecast(district, days)
    
    def get_weather_alerts(self, district: str = None) -> List[Dict]:
        """Get weather alerts for Punjab or specific district"""
        try:
            alerts = []
            
            # Check for existing alerts in database
            db = get_db()
            if db:
                query = {'state': 'Punjab'}
                if district:
                    query['district'] = district
                
                stored_alerts = list(db.weather_alerts.find(
                    query,
                    {'_id': 0}
                ).sort('issue_time', -1).limit(10))
                
                alerts.extend(stored_alerts)
            
            # If no stored alerts, fetch from API or generate mock
            if not alerts:
                alerts = self._fetch_weather_alerts(district)
            
            return alerts
            
        except Exception as e:
            logger.error(f"Failed to get weather alerts: {str(e)}")
            return []
    
    def check_connection(self) -> Dict:
        """Check weather service connectivity"""
        status = {
            'imd_api': False,
            'backup_api': False,
            'last_check': datetime.now().isoformat()
        }
        
        try:
            # Test IMD API
            if self.imd_api_key:
                response = requests.get(
                    f"{self.base_urls['imd']}/health",
                    headers={'X-API-Key': self.imd_api_key},
                    timeout=10
                )
                status['imd_api'] = response.status_code == 200
        except:
            pass
        
        try:
            # Test OpenWeatherMap API
            if self.backup_api_key:
                response = requests.get(
                    f"{self.base_urls['openweather']}/weather",
                    params={
                        'lat': 31.6340,  # Amritsar
                        'lon': 74.8723,
                        'appid': self.backup_api_key
                    },
                    timeout=10
                )
                status['backup_api'] = response.status_code == 200
        except:
            pass
        
        return status
    
    def _fetch_from_imd(self, latitude: float, longitude: float) -> Optional[Dict]:
        """Fetch weather data from IMD API"""
        if not self.imd_api_key:
            return None
        
        try:
            response = requests.get(
                f"{self.base_urls['imd']}/current",
                params={
                    'lat': latitude,
                    'lon': longitude
                },
                headers={'X-API-Key': self.imd_api_key},
                timeout=15
            )
            
            if response.status_code == 200:
                data = response.json()
                return self._normalize_imd_data(data)
            
        except Exception as e:
            logger.warning(f"IMD API request failed: {str(e)}")
        
        return None
    
    def _fetch_from_openweather(self, latitude: float, longitude: float) -> Optional[Dict]:
        """Fetch weather data from OpenWeatherMap API"""
        try:
            response = requests.get(
                f"{self.base_urls['openweather']}/weather",
                params={
                    'lat': latitude,
                    'lon': longitude,
                    'appid': self.backup_api_key,
                    'units': 'metric'
                },
                timeout=15
            )
            
            if response.status_code == 200:
                data = response.json()
                return self._normalize_openweather_data(data)
            
        except Exception as e:
            logger.warning(f"OpenWeatherMap API request failed: {str(e)}")
        
        return None
    
    def _normalize_imd_data(self, data: Dict) -> Dict:
        """Normalize IMD API response to standard format"""
        try:
            return {
                'temperature': data.get('temp', 25),
                'humidity': data.get('humidity', 60),
                'wind_speed': data.get('wind_speed', 5),
                'rainfall': data.get('rainfall_mm', 0),
                'pressure': data.get('pressure', 1013),
                'visibility': data.get('visibility', 10),
                'weather_condition': data.get('weather', 'clear'),
                'timestamp': datetime.now().isoformat(),
                'source': 'IMD'
            }
        except Exception as e:
            logger.error(f"Failed to normalize IMD data: {str(e)}")
            return None
    
    def _normalize_openweather_data(self, data: Dict) -> Dict:
        """Normalize OpenWeatherMap API response to standard format"""
        try:
            main = data.get('main', {})
            wind = data.get('wind', {})
            weather = data.get('weather', [{}])[0]
            
            return {
                'temperature': main.get('temp', 25),
                'humidity': main.get('humidity', 60),
                'wind_speed': wind.get('speed', 5) * 3.6,  # Convert m/s to km/h
                'rainfall': data.get('rain', {}).get('1h', 0),  # mm in last hour
                'pressure': main.get('pressure', 1013),
                'visibility': data.get('visibility', 10000) / 1000,  # Convert to km
                'weather_condition': weather.get('main', 'Clear').lower(),
                'timestamp': datetime.now().isoformat(),
                'source': 'OpenWeatherMap'
            }
        except Exception as e:
            logger.error(f"Failed to normalize OpenWeatherMap data: {str(e)}")
            return None
    
    def _generate_mock_weather(self, latitude: float, longitude: float) -> Dict:
        """Generate mock weather data for demonstration"""
        import random
        
        # Base weather on current season and location
        current_month = datetime.now().month
        
        # Summer months (April-June)
        if 4 <= current_month <= 6:
            base_temp = random.uniform(35, 45)
            base_humidity = random.uniform(40, 70)
        # Monsoon months (July-September)
        elif 7 <= current_month <= 9:
            base_temp = random.uniform(28, 38)
            base_humidity = random.uniform(70, 90)
        # Winter months (December-February)
        elif current_month in [12, 1, 2]:
            base_temp = random.uniform(8, 25)
            base_humidity = random.uniform(50, 80)
        # Spring/Post-monsoon (March, October, November)
        else:
            base_temp = random.uniform(20, 35)
            base_humidity = random.uniform(45, 75)
        
        return {
            'temperature': round(base_temp, 1),
            'humidity': round(base_humidity, 1),
            'wind_speed': round(random.uniform(5, 25), 1),
            'rainfall': round(random.exponential(2), 1) if 7 <= current_month <= 9 else 0,
            'pressure': round(random.uniform(1005, 1020), 1),
            'visibility': round(random.uniform(8, 15), 1),
            'weather_condition': self._get_seasonal_weather_condition(current_month),
            'timestamp': datetime.now().isoformat(),
            'source': 'Mock Data'
        }
    
    def _get_seasonal_weather_condition(self, month: int) -> str:
        """Get appropriate weather condition based on season"""
        import random
        
        if 4 <= month <= 6:  # Summer
            return random.choice(['clear', 'sunny', 'hot', 'hazy'])
        elif 7 <= month <= 9:  # Monsoon
            return random.choice(['rainy', 'cloudy', 'overcast', 'drizzle'])
        elif month in [12, 1, 2]:  # Winter
            return random.choice(['clear', 'foggy', 'misty', 'cool'])
        else:  # Spring/Post-monsoon
            return random.choice(['clear', 'partly_cloudy', 'pleasant'])
    
    def _fetch_forecast_data(self, latitude: float, longitude: float, days: int) -> Optional[Dict]:
        """Fetch forecast data from weather APIs"""
        # Try OpenWeatherMap for forecast (IMD might not have reliable forecast API)
        if self.backup_api_key:
            try:
                response = requests.get(
                    f"{self.base_urls['openweather']}/forecast",
                    params={
                        'lat': latitude,
                        'lon': longitude,
                        'appid': self.backup_api_key,
                        'units': 'metric',
                        'cnt': days * 8  # 8 forecasts per day (3-hour intervals)
                    },
                    timeout=15
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return self._normalize_forecast_data(data)
                    
            except Exception as e:
                logger.warning(f"Forecast API request failed: {str(e)}")
        
        return None
    
    def _normalize_forecast_data(self, data: Dict) -> Dict:
        """Normalize forecast API response"""
        try:
            forecasts = []
            
            for item in data.get('list', [])[:40]:  # 5 days * 8 forecasts
                dt = datetime.fromtimestamp(item['dt'])
                main = item['main']
                weather = item['weather'][0]
                
                forecasts.append({
                    'datetime': dt.isoformat(),
                    'temperature': main['temp'],
                    'humidity': main['humidity'],
                    'pressure': main['pressure'],
                    'weather_condition': weather['main'].lower(),
                    'description': weather['description'],
                    'wind_speed': item.get('wind', {}).get('speed', 0) * 3.6,
                    'rainfall': item.get('rain', {}).get('3h', 0)
                })
            
            return {
                'forecasts': forecasts,
                'location': data.get('city', {}).get('name', 'Unknown'),
                'source': 'OpenWeatherMap',
                'fetch_time': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to normalize forecast data: {str(e)}")
            return None
    
    def _generate_mock_forecast(self, district: str, days: int) -> Dict:
        """Generate mock forecast data"""
        import random
        
        forecasts = []
        base_date = datetime.now()
        
        for day in range(days):
            for hour in [6, 12, 18, 0]:  # 4 forecasts per day
                forecast_time = base_date + timedelta(days=day, hours=hour)
                
                # Generate realistic temperature variations
                base_temp = 30 + random.uniform(-8, 8)
                if hour == 6:  # Morning
                    temp = base_temp - 5
                elif hour == 12:  # Noon
                    temp = base_temp + 5
                elif hour == 18:  # Evening
                    temp = base_temp
                else:  # Midnight
                    temp = base_temp - 8
                
                forecasts.append({
                    'datetime': forecast_time.isoformat(),
                    'temperature': round(temp, 1),
                    'humidity': round(random.uniform(45, 85), 1),
                    'pressure': round(random.uniform(1008, 1018), 1),
                    'weather_condition': self._get_seasonal_weather_condition(base_date.month),
                    'description': 'Partly cloudy',
                    'wind_speed': round(random.uniform(5, 20), 1),
                    'rainfall': round(random.exponential(1), 1) if random.random() < 0.3 else 0
                })
        
        return {
            'forecasts': forecasts,
            'location': district,
            'source': 'Mock Data',
            'fetch_time': datetime.now().isoformat()
        }
    
    def _fetch_weather_alerts(self, district: str = None) -> List[Dict]:
        """Fetch weather alerts from APIs or generate mock alerts"""
        # For demo purposes, generate some mock alerts
        import random
        
        alerts = []
        current_month = datetime.now().month
        
        # Generate seasonal alerts
        if 4 <= current_month <= 6:  # Summer
            if random.random() < 0.3:
                alerts.append({
                    'type': 'heatwave',
                    'severity': 'high',
                    'title': 'Heat Wave Warning',
                    'description': 'Temperature expected to exceed 45°C',
                    'district': district or 'Punjab',
                    'issue_time': datetime.now().isoformat(),
                    'valid_until': (datetime.now() + timedelta(days=2)).isoformat()
                })
        
        elif 7 <= current_month <= 9:  # Monsoon
            if random.random() < 0.4:
                alerts.append({
                    'type': 'heavy_rain',
                    'severity': 'medium',
                    'title': 'Heavy Rainfall Alert',
                    'description': 'Expect heavy rainfall in next 24 hours',
                    'district': district or 'Punjab',
                    'issue_time': datetime.now().isoformat(),
                    'valid_until': (datetime.now() + timedelta(hours=24)).isoformat()
                })
        
        return alerts
    
    def _store_weather_data(self, weather_data: Dict, latitude: float, longitude: float):
        """Store weather data in database for historical analysis"""
        try:
            db = get_db()
            if db and weather_data:
                weather_record = {
                    'coordinates': {
                        'type': 'Point',
                        'coordinates': [longitude, latitude]
                    },
                    'weather_data': weather_data,
                    'timestamp': datetime.now()
                }
                
                db.weather_data.insert_one(weather_record)
                
        except Exception as e:
            logger.warning(f"Failed to store weather data: {str(e)}")
