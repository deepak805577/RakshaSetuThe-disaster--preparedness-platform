import crypto from 'crypto';

// District code mapping for Punjab
const DISTRICT_CODES: Record<string, string> = {
  'Amritsar': 'AM',
  'Barnala': 'BA',
  'Bathinda': 'BT',
  'Faridkot': 'FK',
  'Fatehgarh Sahib': 'FS',
  'Fazilka': 'FZ',
  'Ferozepur': 'FP',
  'Gurdaspur': 'GD',
  'Hoshiarpur': 'HP',
  'Jalandhar': 'JL',
  'Kapurthala': 'KP',
  'Ludhiana': 'LD',
  'Mansa': 'MA',
  'Moga': 'MG',
  'Muktsar': 'MK',
  'Nawanshahr': 'NS',
  'Pathankot': 'PK',
  'Patiala': 'PT',
  'Rupnagar': 'RN',
  'Sangrur': 'SG',
  'Tarn Taran': 'TT',
  'Mohali': 'MH'
};

// School type codes
const SCHOOL_TYPE_CODES: Record<string, string> = {
  'primary': 'P',
  'secondary': 'S',
  'higher_secondary': 'H',
  'college': 'C',
  'university': 'U'
};

/**
 * Generate unique school code
 * Format: PB + District Code + 4 digit number + School Type
 * Example: PBAM1234P (Punjab Amritsar 1234 Primary)
 */
export const generateSchoolCode = async (district: string, type: string): Promise<string> => {
  const districtCode = DISTRICT_CODES[district] || 'XX';
  const typeCode = SCHOOL_TYPE_CODES[type] || 'X';
  
  // Generate random 4 digit number
  const number = Math.floor(1000 + Math.random() * 9000);
  
  const code = `PB${districtCode}${number}${typeCode}`;
  
  // TODO: Check if code already exists in database and regenerate if needed
  return code;
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

/**
 * Generate secure random token for various purposes
 */
export const generateSecureToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Sanitize filename for safe storage
 */
export const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
};

/**
 * Format phone number to Indian format
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }
  return phone;
};

/**
 * Validate Indian PIN code
 */
export const isValidPincode = (pincode: string): boolean => {
  return /^\d{6}$/.test(pincode);
};

/**
 * Get current academic year
 */
export const getCurrentAcademicYear = (): string => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // JavaScript months are 0-based
  
  // Academic year in India typically starts in April
  if (currentMonth >= 4) {
    return `${currentYear}-${currentYear + 1}`;
  } else {
    return `${currentYear - 1}-${currentYear}`;
  }
};

/**
 * Parse and validate coordinates
 */
export const parseCoordinates = (lat: string | number, lng: string | number) => {
  const latitude = typeof lat === 'string' ? parseFloat(lat) : lat;
  const longitude = typeof lng === 'string' ? parseFloat(lng) : lng;
  
  if (isNaN(latitude) || isNaN(longitude)) {
    throw new Error('Invalid coordinates');
  }
  
  if (latitude < -90 || latitude > 90) {
    throw new Error('Latitude must be between -90 and 90');
  }
  
  if (longitude < -180 || longitude > 180) {
    throw new Error('Longitude must be between -180 and 180');
  }
  
  return { latitude, longitude };
};

/**
 * Convert file size to human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Generate pagination metadata
 */
export const generatePagination = (
  total: number,
  page: number,
  limit: number
) => {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;
  
  return {
    total,
    totalPages,
    currentPage: page,
    limit,
    hasNext,
    hasPrev,
    nextPage: hasNext ? page + 1 : null,
    prevPage: hasPrev ? page - 1 : null
  };
};

/**
 * Slugify text for URLs
 */
export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '');
};

/**
 * Deep merge objects
 */
export const deepMerge = (target: any, source: any): any => {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  
  return result;
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Generate OTP
 */
export const generateOTP = (length: number = 6): string => {
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  
  return otp;
};

/**
 * Check if time is within working hours
 */
export const isWithinWorkingHours = (
  time: Date,
  startTime: string,
  endTime: string
): boolean => {
  const currentHour = time.getHours();
  const currentMinute = time.getMinutes();
  const currentTimeMinutes = currentHour * 60 + currentMinute;
  
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  const startTimeMinutes = startHour * 60 + startMinute;
  const endTimeMinutes = endHour * 60 + endMinute;
  
  return currentTimeMinutes >= startTimeMinutes && currentTimeMinutes <= endTimeMinutes;
};

/**
 * Get Punjab district by coordinates (approximate)
 */
export const getDistrictByCoordinates = (lat: number, lng: number): string | null => {
  // This is a simplified version - in production, you'd use a proper geocoding service
  // Punjab boundaries approximately: 29.5-32.5°N, 74.0-76.5°E
  
  if (lat < 29.5 || lat > 32.5 || lng < 74.0 || lng > 76.5) {
    return null; // Outside Punjab
  }
  
  // Simplified district detection based on rough coordinates
  // In production, use proper geospatial queries or external APIs
  const districtMap = [
    { district: 'Amritsar', lat: 31.634, lng: 74.872 },
    { district: 'Ludhiana', lat: 30.901, lng: 75.857 },
    { district: 'Jalandhar', lat: 31.326, lng: 75.576 },
    { district: 'Patiala', lat: 30.336, lng: 76.392 },
    { district: 'Bathinda', lat: 30.211, lng: 74.946 }
  ];
  
  let closestDistrict = districtMap[0];
  let minDistance = calculateDistance(lat, lng, closestDistrict.lat, closestDistrict.lng);
  
  districtMap.forEach(district => {
    const distance = calculateDistance(lat, lng, district.lat, district.lng);
    if (distance < minDistance) {
      minDistance = distance;
      closestDistrict = district;
    }
  });
  
  return closestDistrict.district;
};
