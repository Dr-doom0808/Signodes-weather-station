/**
 * API Configuration
 * Centralized configuration for Google Apps Script integration
 */

// ✅ Google Apps Script URL - Must be set via environment variables
export const GOOGLE_SCRIPT_URL = (import.meta as unknown as { env?: { VITE_GOOGLE_SCRIPT_URL?: string } }).env?.VITE_GOOGLE_SCRIPT_URL || '';

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
  humidity: 3,      // DHThumid_percent
  aqi10: 5,
  aqi25: 6,
  latitude: 7,      // lat
  longitude: 8,     // lng
  mq_co: 10,        // MQ-7 Carbon Monoxide sensor column
  rain: 13,
  uvIndex: 14,
  uvRisk: 15,
} as const;

/**
 * Determine UV risk level based on sensor output (0-100 mW/cm² scale)
 * Sensor: GUVA-S12SD or similar analog UV sensor
 * @param {number} uvIndex - UV value in mW/cm² (0-100)
 * @returns {string} - Risk level: Low, Moderate, High, Very High, or Extreme
 */
export function getUVRisk(uvIndex: number): string {
  if (uvIndex <= 20) return 'Low';
  if (uvIndex <= 40) return 'Moderate';
  if (uvIndex <= 60) return 'High';
  if (uvIndex <= 80) return 'Very High';
  return 'Extreme';
}

/**
 * Validate sensor data object has all required fields
 * @param {any} data - Data to validate
 * @returns {boolean} - True if all required fields are present
 */
export function isValidSensorData(data: unknown): boolean {
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
  return typeof data === 'object' && data !== null && requiredFields.every((field) => field in data);
}