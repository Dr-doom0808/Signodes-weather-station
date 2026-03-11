/**
 * Google Sheets Sensor Data Service
 * Handles fetching and parsing sensor data from Google Apps Script
 * Falls back to mock data in development when API is unavailable
 */

// ✅ Sensor Data Interface
export interface SensorData {
  id: string;
  name: string;
  location: string;
  latitude: number; // GPS latitude
  longitude: number; // GPS longitude
  temperature: number; // DHTtemp_C
  pressure: number; // BMPpressure_hPa
  humidity: number; // DHThumid_percent
  aqi25val: number; // AQI PM2.5
  aqi10val: number; // AQI PM10
  uvIndex: number; // UV Index (0-10+ scale)
  uvRisk: string; // UV Risk level (Low/Moderate/High/Very High/Extreme)
  rain: string; // Yes/No
  mq_co: number; // MQ-7 Carbon Monoxide sensor (ppm)
  lastUpdated: string; // ISO datetime string
}

import { API_BASE } from '../config/api';
import { generateMockSensorData, generateHistoricalMockData } from './mockData';

// API Configuration
const API_URL = `${API_BASE}`;
const REQUEST_TIMEOUT = 30000; // 30 seconds
const USE_MOCK_DATA = import.meta.env.MODE === 'development' && import.meta.env.VITE_USE_MOCK_DATA === 'true';
const FORCE_REAL_API = import.meta.env.MODE === 'development' && import.meta.env.VITE_USE_MOCK_DATA === 'false';

/**
 * Fetch request with timeout
 * @param {string} url - URL to fetch
 * @param {RequestInit} options - Fetch options
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<Response>} - Fetch response
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = REQUEST_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'Cache-Control': 'no-cache',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
}

/**
 * Validate sensor data object
 * @param {any} data - Data to validate
 * @returns {boolean} - True if data is valid SensorData
 */
function isValidSensorData(data: any): data is SensorData {
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
    'uvRisk',
    'rain',
    'mq_co',
    'lastUpdated',
  ];

  return (
    typeof data === 'object' &&
    data !== null &&
    requiredFields.every((field) => field in data)
  );
}

/**
 * Fetch all sensor data (from start of sheet to present)
 * Uses multiple strategies to ensure complete historical data retrieval
 * Falls back to mock data in development when API is unavailable
 * @returns {Promise<SensorData[]>} - Array of all sensor data from beginning of sheet
 * @throws {Error} - If fetch fails and not in development mode
 */
export async function fetchSensorData(): Promise<SensorData[]> {
  // In development mode with mock data enabled, skip API calls entirely
  if (USE_MOCK_DATA) {
    console.log('[fetchSensorData] Using mock data for development');
    return generateHistoricalMockData(192); // ~6 months: Aug 30 to Mar 9
  }

  try {
    console.log('[fetchSensorData] Starting data fetch from Google Sheet...');
    
    // First attempt: Try with a very large range to get all data
    let allData: SensorData[] = [];
    
    // Try fetching with readrange100000 (100k rows - should be enough for most sheets)
    try {
      console.log('[fetchSensorData] Attempting to fetch 100,000 rows...');
      const response = await fetchWithTimeout(`${API_URL}?sts=readrange100000`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error('Expected array of sensor data');
      }

      console.log(`[fetchSensorData] Received ${data.length} raw records from API`);

      // Validate data
      const validData = data.filter((item) => {
        if (!isValidSensorData(item)) {
          return false;
        }
        return true;
      });

      console.log(`[fetchSensorData] Validated ${validData.length} sensor records`);
      allData = validData;
    } catch (err1) {
      console.warn('[fetchSensorData] Failed with readrange100000, trying alternate endpoint...');
      
      // Fallback: Try with read endpoint which might return all available data
      try {
        const response = await fetchWithTimeout(`${API_URL}?sts=readall`, {
          method: 'GET',
        });

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            const validData = data.filter((item) => isValidSensorData(item));
            console.log(`[fetchSensorData] Got ${validData.length} records from readall endpoint`);
            allData = validData;
          }
        }
      } catch (err2) {
        console.warn('[fetchSensorData] readall endpoint also failed');
      }
    }

    if (allData.length === 0) {
      throw new Error('No valid sensor data received from any endpoint');
    }

    console.log(`[fetchSensorData] Successfully loaded ${allData.length} total records`);
    return allData;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[fetchSensorData] Error fetching sensor data:', errorMessage);
    
    // Development fallback: use historical mock data to allow testing without backend
    if (import.meta.env.MODE === 'development') {
      console.warn('[fetchSensorData] API unavailable - using mock data fallback for development');
      return generateHistoricalMockData(192); // ~6 months: Aug 30 to Mar 9
    }

    throw new Error(`Failed to fetch sensor data: ${errorMessage}`);
  }
}

/**
 * Fetch most recent N rows of sensor data
 * Uses Apps Script "readrangeN" endpoint (e.g., readrange5 for last 5 rows)
 * Falls back to mock data in development when API is unavailable
 * @param {number} count - Number of recent rows to fetch
 * @returns {Promise<SensorData[]>} - Array of recent sensor data
 * @throws {Error} - If fetch fails and not in development mode
 */
export async function fetchRecentSensorData(count: number): Promise<SensorData[]> {
  const validCount = Math.max(1, Math.floor(count));

  try {
    const response = await fetchWithTimeout(
      `${API_URL}?sts=readrange${validCount}`,
      {
        method: 'GET',
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error('Expected array of sensor data');
    }

    // Validate data
    const validData = data.filter((item) => {
      if (!isValidSensorData(item)) {
        console.warn('Invalid sensor data object:', item);
        return false;
      }
      return true;
    });

    return validData;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[fetchRecentSensorData] Error fetching recent sensor data:', errorMessage);
    
    // Development fallback
    if (import.meta.env.MODE === 'development') {
      console.warn('[fetchRecentSensorData] API unavailable - using mock data fallback');
      return generateMockSensorData().slice(0, validCount);
    }

    throw new Error(`Failed to fetch recent sensor data: ${errorMessage}`);
  }
}

/**
 * Fetch only the latest sensor reading
 * Falls back to mock data in development when API is unavailable
 * @returns {Promise<SensorData | null>} - Latest sensor data or null if none available
 * @throws {Error} - If fetch fails and not in development mode
 */
export async function fetchLatestSensorData(): Promise<SensorData | null> {
  try {
    const data = await fetchSensorData();
    return data.length > 0 ? data[data.length - 1] : null;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[fetchLatestSensorData] Error fetching latest sensor data:', errorMessage);
    
    // Development fallback
    if (USE_MOCK_DATA) {
      console.warn('[fetchLatestSensorData] API unavailable - using mock data fallback');
      const mockData = generateMockSensorData();
      return mockData.length > 0 ? mockData[mockData.length - 1] : null;
    }

    throw new Error(`Failed to fetch latest sensor data: ${errorMessage}`);
  }
}