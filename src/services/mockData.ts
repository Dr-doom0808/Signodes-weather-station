/**
 * Mock sensor data for development
 * Used when backend API is unavailable
 */

import { SensorData } from '../services/googleSheetsService';

export const MOCK_SENSOR_DATA: SensorData[] = [
  {
    id: 'node-1',
    name: 'Node A',
    location: 'Block A',
    latitude: 28.7041,
    longitude: 77.1025,
    temperature: 28.5,
    pressure: 1013.25,
    humidity: 62,
    aqi25val: 45,
    aqi10val: 38,
    uvIndex: 6,
    uvRisk: 'High',
    rain: 'No',
    mq_co: 0.8,
    lastUpdated: new Date(Date.now() - 2 * 60000).toISOString(), // 2 minutes ago
  },
  {
    id: 'node-2',
    name: 'Node A',
    location: 'Block B',
    latitude: 28.7050,
    longitude: 77.1035,
    temperature: 29.1,
    pressure: 1013.18,
    humidity: 58,
    aqi25val: 52,
    aqi10val: 44,
    uvIndex: 7,
    uvRisk: 'High',
    rain: 'Yes',
    mq_co: 1.2,
    lastUpdated: new Date(Date.now() - 3 * 60000).toISOString(), // 3 minutes ago
  },
  {
    id: 'node-3',
    name: 'Node A',
    location: 'Block C',
    latitude: 28.7032,
    longitude: 77.1015,
    temperature: 27.8,
    pressure: 1013.35,
    humidity: 65,
    aqi25val: 42,
    aqi10val: 35,
    uvIndex: 5,
    uvRisk: 'Moderate',
    rain: 'No',
    mq_co: 0.5,
    lastUpdated: new Date(Date.now() - 1 * 60000).toISOString(), // 1 minute ago
  },
];

/**
 * Helper function to clamp value between min and max
 */
function clampValue(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Generate realistic mock data with slight variations
 * Values are properly bounded and formatted for consistent display
 */
export function generateMockSensorData(): SensorData[] {
  return MOCK_SENSOR_DATA.map((sensor) => {
    // Generate temperature variation (±1°C) and round to 1 decimal
    const tempVariation = (Math.random() - 0.5) * 2;
    const temperature = Number((sensor.temperature + tempVariation).toFixed(1));

    // Generate humidity variation (±2.5%) and clamp 0-100, round to integer
    const humidityVariation = (Math.random() - 0.5) * 5;
    const humidity = Math.round(clampValue(sensor.humidity + humidityVariation, 0, 100));

    // Generate pressure variation and round to 2 decimals, clamp 900-1100 hPa
    const pressureVariation = (Math.random() - 0.5) * 0.5;
    const pressure = Number((clampValue(sensor.pressure + pressureVariation, 900, 1100)).toFixed(2));

    // Generate AQI 2.5 variation (±5) and clamp 0-500, round to integer
    const aqi25Variation = Math.floor((Math.random() - 0.5) * 10);
    const aqi25val = Math.round(clampValue(sensor.aqi25val + aqi25Variation, 0, 500));

    // Generate AQI 10 variation (±4) and clamp 0-500, round to integer
    const aqi10Variation = Math.floor((Math.random() - 0.5) * 8);
    const aqi10val = Math.round(clampValue(sensor.aqi10val + aqi10Variation, 0, 500));

    // Generate UV Index variation and clamp 0-11, round to 1 decimal
    const uvVariation = (Math.random() - 0.5) * 0.8;
    const uvIndex = Number((clampValue(sensor.uvIndex + uvVariation, 0, 11)).toFixed(1));

    // Generate CO variation and clamp 0-10 ppm, round to 2 decimals
    const coVariation = (Math.random() - 0.5) * 0.3;
    const mq_co = Number((Math.max(0, clampValue(sensor.mq_co + coVariation, 0, 10))).toFixed(2));

    return {
      ...sensor,
      temperature,
      humidity,
      pressure,
      aqi25val,
      aqi10val,
      uvIndex,
      mq_co,
      lastUpdated: new Date().toISOString(),
    };
  });
}

/**
 * Generate historical mock data spanning multiple days for calendar/analytics
 * Creates realistic variations across past days
 * @param days - Number of days of historical data to generate (default: 90)
 * @returns Array of sensor data spanning the past N days
 */
export function generateHistoricalMockData(days: number = 90): SensorData[] {
  const historicalData: SensorData[] = [];
  const now = new Date();
  
  // Generate data for each day
  for (let dayOffset = days; dayOffset >= 0; dayOffset--) {
    const dayDate = new Date(now);
    dayDate.setDate(dayDate.getDate() - dayOffset);
    
    // Generate 4-8 readings per day at random times
    const readingsPerDay = Math.floor(Math.random() * 5) + 4; // 4-8 readings
    
    for (let reading = 0; reading < readingsPerDay; reading++) {
      const readingDate = new Date(dayDate);
      const randomHour = Math.floor(Math.random() * 24);
      const randomMin = Math.floor(Math.random() * 60);
      const randomSec = Math.floor(Math.random() * 60);
      readingDate.setHours(randomHour, randomMin, randomSec);
      
      // Generate variations that drift slowly over time (seasonal/weather changes)
      const dayFraction = dayOffset / days;
      const seasonalTempVariation = Math.sin(dayFraction * Math.PI * 4) * 3; // ±3°C seasonal drift
      const seasonalAQIVariation = Math.cos(dayFraction * Math.PI * 2) * 20; // ±20 AQI drift
      
      // Generate data for each sensor node
      for (const sensor of MOCK_SENSOR_DATA) {
        const tempVariation = (Math.random() - 0.5) * 2 + seasonalTempVariation;
        const temperature = Number((clampValue(sensor.temperature + tempVariation, -50, 50)).toFixed(1));

        const humidityVariation = (Math.random() - 0.5) * 5;
        const humidity = Math.round(clampValue(sensor.humidity + humidityVariation, 0, 100));

        const pressureVariation = (Math.random() - 0.5) * 0.5;
        const pressure = Number((clampValue(sensor.pressure + pressureVariation, 900, 1100)).toFixed(2));

        const aqi25Variation = Math.floor((Math.random() - 0.5) * 10) + seasonalAQIVariation;
        const aqi25val = Math.round(clampValue(sensor.aqi25val + aqi25Variation, 0, 500));

        const aqi10Variation = Math.floor((Math.random() - 0.5) * 8) + seasonalAQIVariation * 0.8;
        const aqi10val = Math.round(clampValue(sensor.aqi10val + aqi10Variation, 0, 500));

        const uvVariation = (Math.random() - 0.5) * 0.8;
        const uvIndex = Number((clampValue(sensor.uvIndex + uvVariation, 0, 11)).toFixed(1));

        const coVariation = (Math.random() - 0.5) * 0.3;
        const mq_co = Number((Math.max(0, clampValue(sensor.mq_co + coVariation, 0, 10))).toFixed(2));

        historicalData.push({
          ...sensor,
          temperature,
          humidity,
          pressure,
          aqi25val,
          aqi10val,
          uvIndex,
          mq_co,
          lastUpdated: readingDate.toISOString(),
        });
      }
    }
  }
  
  return historicalData;
}
