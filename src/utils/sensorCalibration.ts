// Utility functions for sensor data calibration

/**
 * Calibrates AQI value from PM2.5 and PM10 readings to a 0-500 scale
 * Based on EPA's AQI calculation methodology
 * @param pm25 - PM2.5 value in μg/m³
 * @param pm10 - PM10 value in μg/m³
 * @returns Calibrated AQI value (0-500)
 */
export const calibrateAQI = (pm25: number, pm10: number): number => {
  // Calculate AQI for PM2.5
  const pm25AQI = calculatePM25AQI(pm25);
  
  // Calculate AQI for PM10
  const pm10AQI = calculatePM10AQI(pm10);
  
  // Return the higher of the two values
  return Math.max(pm25AQI, pm10AQI);
};

/**
 * Calculates AQI for PM2.5 based on EPA breakpoints
 * @param pm25 - PM2.5 concentration in μg/m³
 * @returns AQI value (0-500)
 */
const calculatePM25AQI = (pm25: number): number => {
  // EPA breakpoints for PM2.5
  const breakpoints = [
    { min: 0, max: 12.0, aqiMin: 0, aqiMax: 50 },
    { min: 12.1, max: 35.4, aqiMin: 51, aqiMax: 100 },
    { min: 35.5, max: 55.4, aqiMin: 101, aqiMax: 150 },
    { min: 55.5, max: 150.4, aqiMin: 151, aqiMax: 200 },
    { min: 150.5, max: 250.4, aqiMin: 201, aqiMax: 300 },
    { min: 250.5, max: 350.4, aqiMin: 301, aqiMax: 400 },
    { min: 350.5, max: 500.4, aqiMin: 401, aqiMax: 500 }
  ];
  
  // Find the appropriate breakpoint
  for (const bp of breakpoints) {
    if (pm25 >= bp.min && pm25 <= bp.max) {
      // Linear interpolation formula
      return Math.round(
        ((bp.aqiMax - bp.aqiMin) / (bp.max - bp.min)) * (pm25 - bp.min) + bp.aqiMin
      );
    }
  }
  
  // If PM2.5 is above the highest breakpoint
  if (pm25 > 500.4) {
    return 500;
  }
  
  // Default to 0 if PM2.5 is negative or invalid
  return 0;
};

/**
 * Calculates AQI for PM10 based on EPA breakpoints
 * @param pm10 - PM10 concentration in μg/m³
 * @returns AQI value (0-500)
 */
const calculatePM10AQI = (pm10: number): number => {
  // EPA breakpoints for PM10
  const breakpoints = [
    { min: 0, max: 54, aqiMin: 0, aqiMax: 50 },
    { min: 55, max: 154, aqiMin: 51, aqiMax: 100 },
    { min: 155, max: 254, aqiMin: 101, aqiMax: 150 },
    { min: 255, max: 354, aqiMin: 151, aqiMax: 200 },
    { min: 355, max: 424, aqiMin: 201, aqiMax: 300 },
    { min: 425, max: 504, aqiMin: 301, aqiMax: 400 },
    { min: 505, max: 604, aqiMin: 401, aqiMax: 500 }
  ];
  
  // Find the appropriate breakpoint
  for (const bp of breakpoints) {
    if (pm10 >= bp.min && pm10 <= bp.max) {
      // Linear interpolation formula
      return Math.round(
        ((bp.aqiMax - bp.aqiMin) / (bp.max - bp.min)) * (pm10 - bp.min) + bp.aqiMin
      );
    }
  }
  
  // If PM10 is above the highest breakpoint
  if (pm10 > 604) {
    return 500;
  }
  
  // Default to 0 if PM10 is negative or invalid
  return 0;
};

/**
 * Normalizes UV index to a percentage scale (0-100%)
 * @param uvIndex - Raw UV index value
 * @returns Normalized UV percentage (0-100)
 */
export const normalizeUVIndex = (uvIndex: number): number => {
  // Direct 1:1 mapping to percentage (0-100%)
  // Clamping to ensure it stays within 0-100 range
  const normalizedValue = Math.min(100, Math.max(0, uvIndex));
  
  return Math.round(normalizedValue);
};

/**
 * Gets UV risk category based on UV index
 * @param uvIndex - UV index value
 * @returns Risk category (Low, Moderate, High, Very High, Extreme)
 */
export const getUVRiskCategory = (uvIndex: number): string => {
  if (uvIndex < 3) return 'Low';
  if (uvIndex < 6) return 'Moderate';
  if (uvIndex < 8) return 'High';
  if (uvIndex < 11) return 'Very High';
  return 'Extreme';
};

/**
 * Gets AQI category and color based on AQI value
 * @param aqi - AQI value (0-500)
 * @returns Object with category and color information
 */
export const getAQICategory = (aqi: number): { category: string; color: string; textColor: string; bgColor: string } => {
  if (aqi <= 50) {
    return { 
      category: 'Good', 
      color: '#4ade80', 
      textColor: 'text-green-500',
      bgColor: 'bg-green-100'
    };
  }
  if (aqi <= 100) {
    return { 
      category: 'Moderate', 
      color: '#facc15', 
      textColor: 'text-yellow-500',
      bgColor: 'bg-yellow-100'
    };
  }
  if (aqi <= 150) {
    return { 
      category: 'Unhealthy for Sensitive Groups', 
      color: '#f97316', 
      textColor: 'text-orange-500',
      bgColor: 'bg-orange-100'
    };
  }
  if (aqi <= 200) {
    return { 
      category: 'Unhealthy', 
      color: '#ef4444', 
      textColor: 'text-red-500',
      bgColor: 'bg-red-100'
    };
  }
  if (aqi <= 300) {
    return { 
      category: 'Very Unhealthy', 
      color: '#8b5cf6', 
      textColor: 'text-purple-500',
      bgColor: 'bg-purple-100'
    };
  }
  return { 
    category: 'Hazardous', 
    color: '#7f1d1d', 
    textColor: 'text-red-900',
    bgColor: 'bg-red-200'
  };
};