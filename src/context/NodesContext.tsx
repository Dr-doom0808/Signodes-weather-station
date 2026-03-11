import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { fetchRecentSensorData } from '../services/googleSheetsService';

// Import the SensorData type from the service
import { SensorData } from '../services/googleSheetsService';

// Alias SensorData as NodeData for backward compatibility
export type NodeData = SensorData;

interface NodesContextType {
  nodes: NodeData[];
  loading: boolean;
  error: Error | null;
}

const NodesContext = createContext<NodesContextType>({
  nodes: [],
  loading: true,
  error: null
});

export const NodesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Memoize fetchData to prevent unnecessary interval recreations
  const fetchData = useCallback(async () => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout | null = null;

    try {
      setLoading(true);

      // Create abort signal for the fetch request (15 second timeout)
      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), 15000);

      // Fetch the last 5 rows from Google Sheets via Apps Script (readrange5)
      const sensorData = await fetchRecentSensorData(5);

      // Clear timeout on successful fetch
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      if (!mounted) return;

      if (sensorData && sensorData.length > 0) {
        // Use the most recent reading for Node A
        const latest = sensorData[sensorData.length - 1];

        // Create Node A with actual data
        const nodeA: NodeData = {
          ...latest,
          id: 'node-A',
          name: 'Node A',
          location: latest.location || 'Block A',
        };

        // Create Nodes B and C with current data (empty placeholders)
        // These can be updated when more sensors are available
        const createEmptyNode = (letter: string): NodeData => ({
          id: `node-${letter}`,
          name: `Node ${letter}`,
          location: `Block ${letter}`,
          latitude: 0,
          longitude: 0,
          temperature: 0,
          pressure: 0,
          humidity: 0,
          aqi25val: 0,
          aqi10val: 0,
          uvIndex: 0,
          uvRisk: 'N/A',
          rain: 'N/A',
          mq_co: 0,
          lastUpdated: 'N/A',
        });

        const nodeB = createEmptyNode('B');
        const nodeC = createEmptyNode('C');

        setNodes([nodeA, nodeB, nodeC]);
        setError(null);
      } else {
        setError(new Error('No recent data found in Google Sheets'));
        setNodes([]);
      }
    } catch (error) {
      if (!mounted) return;

      // Only log app-safe error messages
      if (error instanceof Error) {
        console.error('Error fetching sensor data:', error.message);
      }

      setError(
        error instanceof Error
          ? error
          : new Error('Failed to fetch sensor data')
      );
      setNodes([]);
    } finally {
      // Clean up timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      if (mounted) {
        setLoading(false);
      }
    }

    // Return cleanup function to prevent state updates on unmounted component
    return () => {
      mounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  // Set up initial data fetch and polling
  useEffect(() => {
    // Perform initial fetch
    fetchData();

    // Set up polling every 5 minutes (300000 ms)
    const intervalId = setInterval(() => {
      fetchData().catch((err) => {
        console.error('Polling error:', err);
      });
    }, 300000);

    // Cleanup on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [fetchData]);

  return (
    <NodesContext.Provider value={{ nodes, loading, error }}>
      {children}
    </NodesContext.Provider>
  );
};

export const useNodes = (): NodesContextType => {
  const context = useContext(NodesContext);
  return context;
};
