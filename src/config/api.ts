/**
 * API Configuration
 * Centralized configuration for Google Apps Script integration
 */

// ✅ Google Apps Script URL - Must be set via environment variables
export const GOOGLE_SCRIPT_URL = (import.meta as any).env?.VITE_GOOGLE_SCRIPT_URL || '';

// ✅ Validate critical configuration
if (!GOOGLE_SCRIPT_URL) {
  console.warn(
    'Warning: VITE_GOOGLE_SCRIPT_URL is not configured. ' +
    'Sensor data fetching will fail. Please set this in your .env file.'
  );
}

// ✅ API Base URL for proxy (development) or direct (production)
export const API_BASE = '/api';

/**
 * Column index mapping for sensor data from Google Sheets
 * These indices correspond to the columns in your Google Sheets data
 */
export const COLS = {
  datetime: 0,
  pressure: 1,
  temperature: 2,
  humidity: 3,
  aqi10: 5,
  aqi25: 6,
  rain: 13,
  uvIndex: 14,
  uvRisk: 15,
  mq_co: 16, // MQ-7 Carbon Monoxide sensor column
  latitude: 10,
  longitude: 11,
} as const;

/**
 * Determine UV risk level based on UV Index (0-10 scale)
 * Following WHO guidelines for UV exposure risk
 * @param {number} uvIndex - UV Index value (0-10+)
 * @returns {string} - Risk level: Low, Moderate, High, Very High, or Extreme
 */
export function getUVRisk(uvIndex: number): string {
  if (uvIndex <= 2) return 'Low';
  if (uvIndex <= 5) return 'Moderate';
  if (uvIndex <= 7) return 'High';
  if (uvIndex <= 10) return 'Very High';
  return 'Extreme';
}

/**
 * Validate sensor data object has all required fields
 * @param {any} data - Data to validate
 * @returns {boolean} - True if all required fields are present
 */
export function isValidSensorData(data: any): boolean {
  const requiredFields = [
    'id',
    'name',
    'location',
    'temperature',
    'humidity',
    'pressure',
    'aqi25val',
    'aqi10val',
    'uvIndex',
    'lastUpdated',
  ];
  return requiredFields.every((field) => field in data);
}