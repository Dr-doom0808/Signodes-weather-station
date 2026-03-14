// Utility functions for sensor data calibration

/**
 * Default clean-air baseline for the MQ-7 sensor.
 * Used as fallback when no historical data is available.
 * This is overridden at runtime by computeCoBaseline().
 */
export const CO_CLEAN_AIR_BASELINE = 40;

/**
 * Compute a dynamic clean-air baseline from a collection of historical CO readings.
 * Takes the 10th-percentile of non-zero values — this represents the cleanest air
 * the sensor has recorded.
 * @param values - Array of raw MQ-7 sensor readings
 * @returns Computed baseline, or CO_CLEAN_AIR_BASELINE if insufficient data
 */
export function computeCoBaseline(values: number[]): number {
  const valid = values.filter((v) => v > 0 && isFinite(v)).sort((a, b) => a - b);
  if (valid.length < 5) return CO_CLEAN_AIR_BASELINE;
  // Use 10th percentile as the "clean air" reference
  const idx = Math.floor(valid.length * 0.10);
  return Math.max(1, valid[idx]);
}

/**
 * Convert a raw MQ-7 CO sensor value to a 0–100% Pollution Index.
 * The sensor outputs 0–100 mW/cm², so the percentage is the direct value.
 * Values above 100 are clamped to 100%.
 * @param rawValue - Raw sensor reading (mW/cm²)
 * @returns Pollution percentage 0–100
 */
export function coToPollutionPercent(rawValue: number): number {
  return Math.min(100, Math.max(0, rawValue));
}

/**
 * Get the pollution category and colors for a given CO Pollution Index percentage.
 */
export function getCOPollutionCategory(pct: number): {
  label: string;
  dotColor: string;
  textColor: string;
  borderColor: string;
  bgColor: string;
} {
  if (pct < 25)  return { label: 'Very Clean',         dotColor: 'bg-emerald-400', textColor: 'text-emerald-400', borderColor: 'border-emerald-700/50', bgColor: 'bg-emerald-900/20' };
  if (pct < 50)  return { label: 'Normal',              dotColor: 'bg-yellow-400',  textColor: 'text-yellow-400',  borderColor: 'border-yellow-700/50',  bgColor: 'bg-yellow-900/20'  };
  if (pct < 75)  return { label: 'Moderate Pollution',  dotColor: 'bg-orange-400',  textColor: 'text-orange-400',  borderColor: 'border-orange-700/50',  bgColor: 'bg-orange-900/20'  };
  if (pct < 90)  return { label: 'High Pollution',      dotColor: 'bg-red-500',     textColor: 'text-red-400',     borderColor: 'border-red-700/50',     bgColor: 'bg-red-900/20'     };
  return          { label: 'Dangerous Pollution',       dotColor: 'bg-purple-400',  textColor: 'text-purple-300',  borderColor: 'border-purple-700/50',  bgColor: 'bg-purple-900/30'  };
}

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
 * Normalizes UV sensor value to a percentage scale (0-100%)
 * Sensor outputs raw mW/cm² in the range 0-100
 * @param uvIndex - Raw UV sensor value (0-100 mW/cm²)
 * @returns Normalized UV percentage (0-100)
 */
export const normalizeUVIndex = (uvIndex: number): number => {
  // Direct 1:1 mapping — sensor already outputs 0-100
  const normalizedValue = Math.min(100, Math.max(0, uvIndex));
  return Math.round(normalizedValue);
};

/**
 * Gets UV risk category based on sensor value (0-100 mW/cm²)
 * @param uvIndex - UV sensor value (0-100 mW/cm²)
 * @returns Risk category (Low, Moderate, High, Very High, Extreme)
 */
export const getUVRiskCategory = (uvIndex: number): string => {
  if (uvIndex <= 20) return 'Low';
  if (uvIndex <= 40) return 'Moderate';
  if (uvIndex <= 60) return 'High';
  if (uvIndex <= 80) return 'Very High';
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

// ─── Relative Pollution Index (RPI) ─────────────────────────────────────────

export interface RPIResult {
  rpi: number;
  category: string;
  color: string;
  textColor: string;
  dotColor: string;
  borderColor: string;
}

/**
 * Calculates the Relative Pollution Index for an MQ-7 CO sensor reading.
 * RPI = CurrentSensorValue / CleanAirBaseline
 * Scale: <1 Very Clean, 1–1.5 Normal, 1.5–2 Moderate, 2–3 High, >3 Dangerous
 */
export function calculateRPI(
  sensorValue: number,
  baseline: number = CO_CLEAN_AIR_BASELINE
): RPIResult {
  const rpi = baseline > 0 ? sensorValue / baseline : 0;
  if (rpi < 1.0) return { rpi, category: 'Very Clean Air',      color: 'bg-emerald-900/20', textColor: 'text-emerald-400', dotColor: 'bg-emerald-400', borderColor: 'border-emerald-700/50' };
  if (rpi < 1.5) return { rpi, category: 'Normal Air Quality',  color: 'bg-yellow-900/20',  textColor: 'text-yellow-400',  dotColor: 'bg-yellow-400',  borderColor: 'border-yellow-700/50' };
  if (rpi < 2.0) return { rpi, category: 'Moderate Pollution',  color: 'bg-orange-900/20',  textColor: 'text-orange-400',  dotColor: 'bg-orange-400',  borderColor: 'border-orange-700/50' };
  if (rpi < 3.0) return { rpi, category: 'High Pollution',      color: 'bg-red-900/20',     textColor: 'text-red-400',     dotColor: 'bg-red-500',     borderColor: 'border-red-700/50' };
  return           { rpi, category: 'Dangerous Pollution', color: 'bg-purple-900/30',  textColor: 'text-purple-300',  dotColor: 'bg-purple-400',  borderColor: 'border-purple-700/50' };
}