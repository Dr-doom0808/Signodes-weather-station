/**
 * Google Sheets Sensor Data Service
 * Handles fetching and parsing sensor data from Google Apps Script
 * Falls back to mock data in development when API is unavailable
 */

import { z } from 'zod';

export const SensorDataSchema = z.object({
  id: z.string(),
  name: z.string(),
  location: z.string(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  temperature: z.number().nullable(),
  pressure: z.number().nullable(),
  humidity: z.number().nullable(),
  aqi25val: z.number().nullable(),
  aqi10val: z.number().nullable(),
  uvIndex: z.number().nullable(),
  uvRisk: z.string().nullable(),
  rain: z.string().nullable(),
  mq_co: z.number().nullable(),
  lastUpdated: z.string().nullable(),
});

export type SensorData = z.infer<typeof SensorDataSchema>;

import { API_BASE } from '../config/api';
import { generateMockSensorData, generateHistoricalMockData } from './mockData';

// API Configuration
const API_URL = `${API_BASE}`;
const REQUEST_TIMEOUT = 30000; // 30 seconds
const USE_MOCK_DATA = import.meta.env.MODE === 'development' && import.meta.env.VITE_USE_MOCK_DATA === 'true';

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

function isValidSensorData(data: unknown): data is SensorData {
  const result = SensorDataSchema.safeParse(data);
  if (!result.success) {
    console.warn('[Validation Failed]', result.error);
  }
  return result.success;
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
    } catch {
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
      } catch {
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
 * Fetch ALL historical sensor data using chunked requests of 5000 records at a time.
 * This avoids Google Apps Script timeouts that occur with very large single requests.
 * @param {function} onProgress - Optional callback called after each chunk with running total
 * @returns {Promise<SensorData[]>} - All historical sensor records
 */
export async function fetchAllHistoricalData(
  onProgress?: (loaded: number) => void
): Promise<SensorData[]> {
  const CHUNK_SIZE = 5000;
  const allData: SensorData[] = [];
  const seen = new Set<string>();

  if (USE_MOCK_DATA) {
    console.log('[fetchAllHistoricalData] Using mock data');
    return generateHistoricalMockData(192);
  }

  let hasMore = true;
  let attempt = 0;
  const MAX_CHUNKS = 20; // safety cap: 20 × 5000 = 100 000 rows max

  while (hasMore && attempt < MAX_CHUNKS) {
    attempt++;
    const chunkCount = CHUNK_SIZE * attempt;
    console.log(`[fetchAllHistoricalData] Fetching chunk ${attempt}: readrange${chunkCount}`);

    try {
      const response = await fetchWithTimeout(`${API_URL}?sts=readrange${chunkCount}`, { method: 'GET' }, 35000);

      if (!response.ok) {
        console.warn(`[fetchAllHistoricalData] Chunk ${attempt} returned ${response.status}, stopping.`);
        break;
      }

      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0) break;

      const valid = data.filter((item) => isValidSensorData(item));

      // Add only new records (de-duplicate by lastUpdated)
      let newCount = 0;
      for (const row of valid) {
        const key = row.lastUpdated ?? '';
        if (!seen.has(key)) {
          seen.add(key);
          allData.push(row);
          newCount++;
        }
      }

      console.log(`[fetchAllHistoricalData] Chunk ${attempt}: got ${valid.length} valid, ${newCount} new. Total: ${allData.length}`);
      if (onProgress) onProgress(allData.length);

      // If the API returned fewer than the full chunk size, we've reached the end
      if (valid.length < CHUNK_SIZE) {
        hasMore = false;
        console.log('[fetchAllHistoricalData] Reached end of data.');
      }
    } catch (err) {
      console.error(`[fetchAllHistoricalData] Chunk ${attempt} failed:`, err);
      break;
    }
  }

  if (allData.length === 0 && import.meta.env.MODE === 'development') {
    console.warn('[fetchAllHistoricalData] No data received — using mock fallback');
    return generateHistoricalMockData(192);
  }

  console.log(`[fetchAllHistoricalData] Done. Total records: ${allData.length}`);
  return allData;
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