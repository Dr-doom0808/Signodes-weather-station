const axios = require('axios');

// Import API configuration
const { SCRIPT_ID, getUVRisk } = require('../../src/config/api.cjs');

// Validate environment configuration
if (!process.env.GOOGLE_SCRIPT_URL && !process.env.VITE_GOOGLE_SCRIPT_URL && !SCRIPT_ID) {
  console.error('CRITICAL: GOOGLE_SCRIPT_URL or GOOGLE_SCRIPT_ID not configured');
}

// Google Apps Script URL - priority: process.env.GOOGLE_SCRIPT_URL > process.env.VITE_GOOGLE_SCRIPT_URL > SCRIPT_ID fallback
const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || 
  process.env.VITE_GOOGLE_SCRIPT_URL || 
  (SCRIPT_ID ? `https://script.google.com/macros/s/${SCRIPT_ID}/exec` : '');

// Get allowed origins from environment (comma-separated)
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean);

/**
 * Validate and get CORS origin header
 * @param {string} origin - Origin header from request
 * @returns {string|undefined} - Safe origin or undefined
 */
function getAllowedOrigin(origin) {
  if (!origin) return '*';
  // If ALLOWED_ORIGINS is configured, restrict to that list; otherwise allow all
  if (ALLOWED_ORIGINS.length === 0) return '*';
  return ALLOWED_ORIGINS.includes(origin) ? origin : undefined;
}

/**
 * Parse sensor data from JSON or CSV format
 * @param {string} textData - Raw data from Google Apps Script
 * @returns {Array<Object>} - Parsed sensor data array
 */
function parseSensorData(textData) {
  const trimmed = textData.trim();
  let sensorData = [];

  // Try JSON format first
  if (trimmed.startsWith('[')) {
    try {
      let jsonData = JSON.parse(trimmed);
      if (Array.isArray(jsonData)) {
        if (jsonData.length > 0 && Array.isArray(jsonData[0])) {
          // Case 1: JSON is array of arrays (CSV-like), convert to objects
          sensorData = jsonData.map((row, idx) => {
            if (!Array.isArray(row) || row.length < 16) return null;
            
            return {
              id: `node-${idx + 1}`,
              name: 'Node A',
              location: 'Main Campus',
              latitude: parseFloat(row[7]?.toString().trim()) || 0,
              longitude: parseFloat(row[8]?.toString().trim()) || 0,
              temperature: parseFloat(row[2]?.toString().trim()) || 0,
              pressure: parseFloat(row[1]?.toString().trim()) || 0,
              humidity: parseFloat(row[3]?.toString().trim()) || 0,
              aqi25val: parseFloat(row[6]?.toString().trim()) || 0,
              aqi10val: parseFloat(row[5]?.toString().trim()) || 0,
              uvIndex: parseFloat(row[14]?.toString().trim()) || 0,
              uvRisk: row[15]?.toString().trim() || getUVRisk(parseFloat(row[14]) || 0),
              rain: row[13]?.toString().trim() === 'Yes' ? 'Yes' : 'No',
              mq_co: parseFloat(row[10]?.toString().trim()) || 0,
              lastUpdated: row[0]?.toString().trim() || new Date().toISOString(),
            };
          }).filter(item => item !== null);
        } else {
          // Case 2: JSON is already array of objects, use as-is
          sensorData = jsonData;
        }
      }
    } catch (e) {
      console.warn('JSON parsing failed, attempting CSV fallback');
      sensorData = [];
    }
  }

  // Fallback to CSV parsing (if JSON failed or wasn't JSON)
  if (sensorData.length === 0) {
    const rows = trimmed.split('\n').filter(r => r.trim() !== '');
    sensorData = rows
      .map((row, index) => {
        try {
          const columns = row.split(',');
          if (columns.length < 16) return null;
          
          return {
            id: `node-${index + 1}`,
            name: 'Node A',
            location: 'Main Campus',
            latitude: parseFloat(columns[7]?.trim()) || 0,
            longitude: parseFloat(columns[8]?.trim()) || 0,
            temperature: parseFloat(columns[2]?.trim()) || 0,
            pressure: parseFloat(columns[1]?.trim()) || 0,
            humidity: parseFloat(columns[3]?.trim()) || 0,
            aqi25val: parseFloat(columns[6]?.trim()) || 0,
            aqi10val: parseFloat(columns[5]?.trim()) || 0,
            uvIndex: parseFloat(columns[14]?.trim()) || 0,
            uvRisk: columns[15]?.trim() || getUVRisk(parseFloat(columns[14]?.trim()) || 0),
            rain: columns[13]?.trim() === 'Yes' ? 'Yes' : 'No',
            mq_co: parseFloat(columns[10]?.trim()) || 0,
            lastUpdated: columns[0]?.trim() || new Date().toISOString(),
          };
        } catch (e) {
          return null;
        }
      })
      .filter(item => item !== null);
  }

  return sensorData;
}

// Main handler function
exports.handler = async (event, context) => {
  // Set response headers with CORS
  const origin = getAllowedOrigin(event.headers.origin);
  const responseHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };
  if (origin) {
    responseHeaders['Access-Control-Allow-Origin'] = origin;
  }

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: responseHeaders,
      body: '',
    };
  }

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: responseHeaders,
      body: JSON.stringify({ error: 'Method Not Allowed', method: event.httpMethod }),
    };
  }

  try {
    // Validate API URL is configured
    if (!GOOGLE_SCRIPT_URL) {
      console.error('Missing GOOGLE_SCRIPT_URL configuration');
      return {
        statusCode: 500,
        headers: responseHeaders,
        body: JSON.stringify({
          error: 'API not configured',
          details: 'Google Apps Script URL is not configured',
        }),
      };
    }

    // Get the 'sts' parameter from the query string
    const { sts } = event.queryStringParameters || {};

    // Build the URL with query parameters
    const params = new URLSearchParams();
    if (sts) {
      params.append('sts', sts);
    }

    const url = `${GOOGLE_SCRIPT_URL}?${params.toString()}`;
    
    // Fetch data from Google Apps Script
    console.log('Fetching sensor data from Google Apps Script');
    const response = await axios.get(url, {
      responseType: 'text',
      timeout: 30000, // 30 second timeout
      headers: {
        Accept: 'application/json, text/plain',
        'Cache-Control': 'no-cache',
      },
    });

    const textData = response.data;
    if (!textData) {
      throw new Error('No data received from Google Apps Script');
    }

    console.log(`Received ${textData.length} characters from datasource`);

    // Parse sensor data
    const sensorData = parseSensorData(textData);

    if (sensorData.length === 0) {
      console.warn('No valid sensor data could be parsed from response');
      return {
        statusCode: 200,
        headers: responseHeaders,
        body: JSON.stringify([]),
      };
    }

    console.log(`Successfully parsed ${sensorData.length} sensor records`);

    return {
      statusCode: 200,
      headers: responseHeaders,
      body: JSON.stringify(sensorData),
    };
  } catch (error) {
    console.error('Error in sensorData handler:', error.message);

    // Don't expose sensitive error details in production
    const details = process.env.NODE_ENV === 'development' ? error.message : 'Data fetch failed';

    return {
      statusCode: 500,
      headers: responseHeaders,
      body: JSON.stringify({
        error: 'Failed to fetch sensor data',
        details,
      }),
    };
  }
};
