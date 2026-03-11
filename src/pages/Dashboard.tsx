import React, { useState } from 'react';
import { useNodes, NodeData } from '../context/NodesContext';
import { useDarkMode } from '../context/DarkModeContext';
import { Thermometer, Droplets, Wind, Sun, AlertTriangle, Wifi, Zap, Info } from 'lucide-react';
import { formatSensorDate } from '../utils/dateUtils';
import SensorDetailsModal from '../components/common/SensorDetailsModal';
import DevModeBanner from '../components/common/DevModeBanner';

const getAqiColor = (aqi: number) => {
  if (aqi <= 50) return 'bg-signodes-100 text-signodes-800';
  if (aqi <= 100) return 'bg-signodes-200 text-signodes-800';
  if (aqi <= 150) return 'bg-signodes-300 text-signodes-800';
  if (aqi <= 200) return 'bg-signodes-400 text-signodes-800';
  if (aqi <= 300) return 'bg-signodes-500 text-signodes-800';
  return 'bg-signodes-600 text-signodes-800';
};

const getUvColor = (uvRisk: string) => {
  switch (uvRisk.toLowerCase()) {
    case 'low': return 'bg-green-100 text-green-800';
    case 'moderate': return 'bg-yellow-100 text-yellow-800';
    case 'high': return 'bg-orange-100 text-orange-800';
    case 'very high': return 'bg-red-100 text-red-800';
    case 'extreme': return 'bg-purple-100 text-purple-800';
    case 'n/a': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const Dashboard: React.FC = () => {
  const { nodes, loading, error } = useNodes();
  const { darkMode } = useDarkMode();
  const [selectedSensor, setSelectedSensor] = useState<NodeData | null>(null);

  // Determine latest update across all nodes
  const latestUpdate = nodes
    ?.map(n => n.lastUpdated)
    ?.filter(Boolean)
    ?.sort()
    ?.reverse()[0];

  const isNodeOnline = (node: NodeData): boolean => {
    if (!node.lastUpdated || node.lastUpdated === 'N/A') return false;

    try {
      const lastUpdated = new Date(node.lastUpdated);
      const now = new Date();
      const OFFLINE_THRESHOLD_MS = 15 * 60 * 1000;

      return (now.getTime() - lastUpdated.getTime()) < OFFLINE_THRESHOLD_MS;
    } catch {
      return false;
    }
  };

  if (loading) {
    return (
      <div className={`text-center py-8 ${darkMode ? 'text-gray-100' : 'text-gray-700'}`}>
        Loading sensor data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        Error: {error.message}
      </div>
    );
  }

  if (!nodes || nodes.length === 0) {
    return (
      <div className="text-center py-12">
        <h1 className={`text-3xl font-bold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          No Sensor Data Available
        </h1>

        <p className={`${darkMode ? 'text-gray-200' : 'text-gray-600'}`}>
          The dashboard is ready, but no sensor data has been received yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 px-4 sm:px-6 py-6">

      <DevModeBanner useMockData={import.meta.env.VITE_USE_MOCK_DATA === 'true'} />

      {selectedSensor && (
       <SensorDetailsModal
       isOpen={!!selectedSensor}
       sensorData={{
        ...selectedSensor,
        isOnline: isNodeOnline(selectedSensor),
        aqi: selectedSensor.aqi25val
      }}
      onClose={() => setSelectedSensor(null)}
      darkMode={darkMode}
      />
      )}

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">

        <h1 className={`text-3xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          Campus Sensor Dashboard
        </h1>

        <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
          Last updated: {latestUpdate ? formatSensorDate(latestUpdate) : 'Unknown'}
        </div>

      </div>

      {/* SENSOR CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {nodes.map((node) => (

          <div
            key={node.id}
            className={`${darkMode ? 'bg-primary-900 border-primary-800' : 'bg-white border-gray-100'} p-6 rounded-xl shadow-card border`}
          >

            {/* CARD HEADER */}
            <div className="flex justify-between mb-5">

              <div>

                <h2 className={`text-xl font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  {node.name}
                </h2>

                <div className="flex items-center mt-1">

                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isNodeOnline(node) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    <Wifi className="w-3 h-3 mr-1 inline" />
                    {isNodeOnline(node) ? 'Online' : 'Offline'}
                  </span>

                  <button
                    onClick={() => setSelectedSensor(node)}
                    className="ml-2 px-2 py-0.5 rounded-full text-xs bg-signodes-100 text-signodes-800"
                  >
                    <Info className="w-3 h-3 mr-1 inline" />
                    Details
                  </button>

                </div>

                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {node.location} Building
                </p>

              </div>

            </div>

            {/* SENSOR DATA */}
            <div className="space-y-4">

              {/* TEMPERATURE */}
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Thermometer className="w-5 h-5 mr-2 text-signodes-500" />
                  <span>Temperature</span>
                </div>

                <span className="font-bold">
                  {node.name !== 'Node A' ? 'N/A' : `${node.temperature}°C`}
                </span>
              </div>

              {/* HUMIDITY */}
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Droplets className="w-5 h-5 mr-2 text-signodes-500" />
                  <span>Humidity</span>
                </div>

                <span className="font-bold">
                  {node.name !== 'Node A' ? 'N/A' : `${node.humidity}%`}
                </span>
              </div>

              {/* AIR QUALITY */}
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-signodes-500" />
                  <span>Air Quality</span>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-medium ${node.name !== 'Node A'
                  ? 'bg-gray-100 text-gray-800'
                  : getAqiColor(node.aqi25val)
                  }`}>
                  AQI: {node.name !== 'Node A' ? 'N/A' : node.aqi25val}
                </span>
              </div>

              {/* UV */}
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Sun className="w-5 h-5 mr-2 text-signodes-500" />
                  <span>UV Index</span>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs ${getUvColor(node.uvRisk || 'Low')}`}>
                  {node.name !== 'Node A' ? 'N/A' : `${node.uvIndex} (${node.uvRisk || 'Low'})`}
                </span>
              </div>

              {/* CO */}
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-signodes-500" />
                  <span>Carbon Monoxide</span>
                </div>

                <span className="font-bold">
                  {node.name !== 'Node A' ? 'N/A' : `${node.mq_co || 'N/A'} ppm`}
                </span>
              </div>

              {/* PRESSURE */}
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Wind className="w-5 h-5 mr-2 text-signodes-500" />
                  <span>Pressure</span>
                </div>

                <span className="font-bold">
                  {node.name !== 'Node A' ? 'N/A' : `${node.pressure} hPa`}
                </span>
              </div>

              {/* FOOTER */}
              <div className={`pt-3 text-xs flex justify-between border-t ${darkMode ? 'text-white/70 border-primary-700' : 'text-gray-500 border-gray-200'}`}>
                <span>
                  Last updated: {node.name !== 'Node A' ? 'N/A' : formatSensorDate(node.lastUpdated)}
                </span>

                <Wifi className="w-4 h-4 text-signodes-500" />
              </div>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
};

export default Dashboard;