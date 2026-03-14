/**
 * Backend Server for NIET Weather Station
 * Proxy server for Google Apps Script API integration
 * 
 * This server handles:
 * - CORS-enabled requests to Google Apps Script
 * - Sensor data preprocessing
 * - Error handling and logging
 */

import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import fs from 'fs';

// Load environment variables
if (fs.existsSync('.env')) {
  dotenv.config();
} else if (fs.existsSync('.env.development')) {
  dotenv.config({ path: '.env.development' });
  console.log('[server] Loaded environment from .env.development');
}

const app = express();
const PORT = process.env.PORT || 3002;

// Validation: ensure GOOGLE_SCRIPT_URL is configured
const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;
if (!GOOGLE_SCRIPT_URL) {
  console.error(
    'CRITICAL: GOOGLE_SCRIPT_URL environment variable is not set. ' +
    'Please configure it before starting the server.'
  );
  process.exit(1);
}

// Get allowed origins from environment (comma-separated for multiple origins)
const getAllowedOrigins = () => {
  const origins = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim().replace(/\/$/, '')).filter(Boolean) || [];
  return origins;
};

// Configure CORS with dynamic origin validation
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS policy`));
    }
  },
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

/**
 * Main sensor data API endpoint
 * Proxies requests to Google Apps Script with proper error handling
 */
app.get('/api/sensor-data', async (req, res) => {
  console.log(`[${new Date().toISOString()}] 🚀 API REQUEST RECEIVED: ${req.method} ${req.url}`);
  console.log(`[${new Date().toISOString()}] Query params:`, req.query);

  try {
    // Get query parameters
    const { sts } = req.query;

    // Log request (without exposing full URL for security)
    console.log(`[${new Date().toISOString()}] Fetching sensor data from Google Apps Script`);

    // Build request to Google Apps Script
    const params = new URLSearchParams();
    if (sts) {
      params.append('sts', String(sts));
    }

    const url = `${GOOGLE_SCRIPT_URL}?${params.toString()}`;
    console.log(`[${new Date().toISOString()}] Requesting URL: ${url}`);

    // Fetch data with timeout
    const response = await axios.get(url, {
      responseType: 'text',
      timeout: 30000, // 30 second timeout
      headers: {
        Accept: 'application/json, text/plain',
        'Cache-Control': 'no-cache',
      },
    });

    if (!response.data) {
      console.warn('Empty response from Google Apps Script');
      return res.json([]);
    }

    console.log(
      `[${new Date().toISOString()}] Received ${response.data.length} characters from datasource`
    );
    console.log(
      `[${new Date().toISOString()}] Response preview: ${response.data.toString().substring(0, 200)}`
    );

    // Parse data (JSON or CSV)
    let sensorData = [];
    const trimmed = response.data.toString().trim();
    console.log(`[${new Date().toISOString()}] Trimmed response starts with: "${trimmed.substring(0, 50)}"`);

    // Try JSON format first
    if (trimmed.startsWith('[')) {
      try {
        sensorData = JSON.parse(trimmed);
        console.log(`[${new Date().toISOString()}] Successfully parsed JSON. Type: ${typeof sensorData}, IsArray: ${Array.isArray(sensorData)}`);
        if (sensorData.length > 0) {
          console.log(`[${new Date().toISOString()}] First item type: ${Array.isArray(sensorData[0]) ? 'Array' : typeof sensorData[0]}`);
          if (Array.isArray(sensorData[0])) {
            console.log(`[${new Date().toISOString()}] First row has ${sensorData[0].length} columns`);
          }
        }
        
        if (!Array.isArray(sensorData)) {
          sensorData = [];
        } else if (sensorData.length > 0 && Array.isArray(sensorData[0])) {
          // JSON response is array of arrays (CSV-like), convert to objects
          console.log(`[${new Date().toISOString()}] Converting array of arrays to objects...`);
          sensorData = sensorData.map((row, idx) => {
            if (!Array.isArray(row) || row.length < 16) {
              console.log(`[${new Date().toISOString()}] Skipping invalid row ${idx}:`, row);
              return null;
            }
            
            const obj = {
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
              uvRisk: row[15]?.toString().trim() || 'Low',
              rain: row[13]?.toString().trim() === 'Yes' ? 'Yes' : 'No',
              mq_co: parseFloat(row[10]?.toString().trim()) || 0,
              lastUpdated: row[0]?.toString().trim() || new Date().toISOString(),
            };
            return obj;
          }).filter(Boolean);
          console.log(`[${new Date().toISOString()}] Converted to ${sensorData.length} objects`);
        } else {
          console.log(`[${new Date().toISOString()}] JSON is array of objects, using as-is`);
        }
      } catch (e) {
        console.warn(`[${new Date().toISOString()}] JSON parsing failed:`, e.message);
        sensorData = [];
      }
    }

    // Fallback to CSV parsing (only if JSON didn't work)
    if (sensorData.length === 0) {
      const rows = trimmed.split('\n').filter((row) => row.trim() !== '');
      sensorData = rows
        .map((row, idx) => {
          try {
            const cols = row.split(',');
            if (cols.length < 16) return null;

            return {
              id: `node-${idx + 1}`,
              name: 'Node A',
              location: 'Main Campus',
              latitude: parseFloat(cols[7]?.trim()) || 0,
              longitude: parseFloat(cols[8]?.trim()) || 0,
              temperature: parseFloat(cols[2]?.trim()) || 0,
              pressure: parseFloat(cols[1]?.trim()) || 0,
              humidity: parseFloat(cols[3]?.trim()) || 0,
              aqi25val: parseFloat(cols[6]?.trim()) || 0,
              aqi10val: parseFloat(cols[5]?.trim()) || 0,
              uvIndex: parseFloat(cols[14]?.trim()) || 0,
              uvRisk: cols[15]?.trim() || 'Low',
              rain: cols[13]?.trim() === 'Yes' ? 'Yes' : 'No',
              mq_co: parseFloat(cols[10]?.trim()) || 0,
              lastUpdated: cols[0]?.trim() || new Date().toISOString(),
            };
          } catch (error) {
            console.warn(`Error parsing row ${idx}:`, error);
            return null;
          }
        })
        .filter(Boolean);
    }

    console.log(`[${new Date().toISOString()}] Parsed ${sensorData.length} sensor records`);

    res.json(sensorData);
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] Error fetching sensor data:`,
      error instanceof Error ? error.message : String(error)
    );
    if (error instanceof Error && error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data?.substring(0, 500));
    }

    // Don't expose sensitive error details in production
    const details =
      process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : 'Data fetch failed';

    res.status(500).json({
      error: 'Failed to fetch sensor data',
      details,
    });
  }
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    googleScriptUrl: GOOGLE_SCRIPT_URL ? 'configured' : 'missing'
  });
});

/**
 * Error handling for 404 routes
 */
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    method: req.method,
  });
});

/**
 * Start the server
 */
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('Health check: GET /health');
  console.log('Sensor API: GET /api/sensor-data');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use!`);
    console.error(`   Another server instance may be running.`);
    console.error(`   Run: kill $(lsof -ti :${PORT}) to free the port, then restart.\n`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => { server.close(() => process.exit(0)); });
process.on('SIGINT',  () => { server.close(() => process.exit(0)); });
