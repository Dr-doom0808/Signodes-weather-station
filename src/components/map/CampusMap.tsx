import React, { useState, useMemo } from 'react';
import { useNodes } from '../../context/NodesContext';
import { MapPin, Thermometer, Droplets, Wind, Gauge, CloudRain, Sun, Zap } from 'lucide-react';
import { calibrateAQI, getAQICategory } from '../../utils/sensorCalibration';
import { useDarkMode } from '../../context/DarkModeContext';

interface NodeData {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  position: { top: string; left: string };
  temperature: string;
  humidity: string;
  rain: string;
  aqi25val: string;
  aqi10val: string;
  uvIndex: string;
  uvRisk: string;
  windSpeed?: string;
  lastUpdated: string;
  mq_co?: string;
}

const CampusMap: React.FC = () => {
  const { nodes: sensorNodes, loading, error } = useNodes();
  const { darkMode } = useDarkMode();
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);

  // Map sensor nodes to the component's expected format
  const nodes: NodeData[] = useMemo(() => {
    if (!sensorNodes || sensorNodes.length === 0) return [];
    
    // Node positions on the map matching red circles
    const nodePositions = [
      { id: 'A', top: '28%', left: '40%', location: 'A Block - Academic Building' },
      { id: 'B', top: '55%', left: '47%', location: 'B Block - Academic Building' },
      { id: 'C', top: '63%', left: '74%', location: 'D Block - Academic Building' },
    ];

    return sensorNodes.map((node, index) => {
      const position = nodePositions[index % nodePositions.length] || { top: '28%', left: '40%', location: 'Unknown Location' };
      
      return {
        ...node,
        id: node.id || `node-${index}`,
        name: node.name || `Node ${String.fromCharCode(65 + index)}`,
        location: node.location || position.location,
        latitude: node.latitude || 28.6139,
        longitude: node.longitude || 77.2090,
        position: { top: position.top, left: position.left },
        temperature: String(node.temperature || 'N/A'),
        humidity: String(node.humidity || 'N/A'),
        rain: node.rain || 'No',
        aqi25val: String(node.aqi25val || 'N/A'),
        aqi10val: String(node.aqi10val || 'N/A'),
        // Calculate calibrated AQI
        aqi: String(calibrateAQI(Number(node.aqi25val || 0), Number(node.aqi10val || 0))),
        uvIndex: String(node.uvIndex || 'N/A'),
        uvRisk: node.uvRisk || 'N/A',
        // SensorData may not include windSpeed; access defensively
        windSpeed: (node as any).windSpeed || 'N/A',
        // Include CO value
        mq_co: String(node.mq_co || 'N/A'),
        lastUpdated: node.lastUpdated || new Date().toISOString()
      };
    });
  }, [sensorNodes]);

  // Helper function to get AQI color
  const getAqiColor = (aqi: string) => {
    const value = parseInt(aqi) || 0;
    const aqiInfo = getAQICategory(value);
    return `text-${aqiInfo.textColor.replace('text-', '')}`;
  };

  // Helper function to get UV color
  const getUvColor = (uvRisk: string | undefined) => {
    if (!uvRisk) return 'text-gray-500';
    switch(uvRisk.toLowerCase()) {
      case 'low': return 'text-green-600';
      case 'moderate': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'very high': return 'text-red-600';
      case 'extreme': return 'text-purple-600';
      default: return 'text-gray-500';
    }
  };

  // Helper function to calculate UV risk level based on 0-100 scale
  const calculateUvRisk = (uvIndex: number): string => {
    if (uvIndex <= 20) return 'Low';
    if (uvIndex <= 40) return 'Moderate';
    if (uvIndex <= 60) return 'High';
    if (uvIndex <= 80) return 'Very High';
    return 'Extreme';
  };

  if (loading) {
    return (
      <section 
        className={`py-16 ${darkMode ? 'bg-gradient-to-br from-blue-900 to-indigo-900' : 'bg-gradient-to-br from-blue-50 to-indigo-50'}`} 
        aria-labelledby="campus-map-heading"
        role="region"
      >
        <div className="container mx-auto px-4 text-center py-16">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${darkMode ? 'border-blue-400' : 'border-blue-600'} mx-auto`}></div>
          <p className={`mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading sensor data...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section 
        className={`py-16 ${darkMode ? 'bg-gradient-to-br from-blue-900 to-indigo-900' : 'bg-gradient-to-br from-blue-50 to-indigo-50'}`}
        role="region"
        aria-label="Error loading campus map"
      >
        <div className="container mx-auto px-4">
          <div className={`${darkMode ? 'bg-red-900/30 border-l-4 border-red-700' : 'bg-red-50 border-l-4 border-red-400'} p-4 rounded`}>
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className={`h-5 w-5 ${darkMode ? 'text-red-500' : 'text-red-400'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className={`text-sm ${darkMode ? 'text-red-400' : 'text-red-700'}`} role="alert">
                  Error loading sensor data: {error.message}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      className={`py-16 ${darkMode ? 'bg-gradient-to-br from-blue-900 to-indigo-900' : 'bg-gradient-to-br from-blue-50 to-indigo-50'}`}
      role="region"
      aria-labelledby="campus-map-heading"
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className={`inline-flex items-center justify-center w-16 h-16 ${darkMode ? 'bg-blue-800/50' : 'bg-blue-100'} rounded-full mb-4 shadow-glow`}>
            <MapPin className={`w-8 h-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} aria-hidden="true" />
          </div>
          <h2 id="campus-map-heading" className={`text-3xl md:text-4xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'} mb-4`}>
            Campus Map
          </h2>
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
            NIET campus overview with sensor node locations
          </p>
        </div>

        {/* Campus Map */}
        <div className={`${darkMode ? 'bg-primary-800/90 backdrop-blur-sm border border-primary-700' : 'bg-white'} rounded-2xl shadow-xl p-8 transition-all duration-300`} role="region" aria-label="Interactive campus map with sensor locations">
          <div className={`${darkMode ? 'bg-gradient-to-br from-green-900/30 to-blue-900/30' : 'bg-gradient-to-br from-green-100 to-blue-100'} rounded-xl h-96 flex items-center justify-center relative overflow-hidden border ${darkMode ? 'border-primary-700' : 'border-blue-100'}`}>
            {/* Campus Map Image */}
            <img 
              src="/mapimage.jpeg" 
              alt="NIET Campus Map showing buildings and grounds" 
              className="w-full h-full object-cover rounded-xl opacity-80"
            />
            
            {/* Node markers */}
            {nodes.map((node, index) => (
              <button
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-signodes-400 focus:ring-offset-2 rounded-full"
                style={{ top: node.position.top, left: node.position.left }}
                aria-label={`View ${node.name} details at ${node.location}`}
                aria-expanded={selectedNode?.id === node.id ? "true" : "false"}
              >
                <div className="relative">
                  <div className={`w-6 h-6 rounded-full border-2 border-white shadow-lg ${
                    index === 0 ? 'bg-green-500' : 'bg-gray-400 opacity-60'
                  }`}>
                  </div>
                  <div className="mt-2 bg-white px-3 py-1 rounded-lg shadow-md border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className={`text-xs font-semibold ${index === 0 ? 'text-green-700' : 'text-gray-600'}`}>
                      {node.name}
                    </span>
                    <div className="text-xs text-gray-600">
                      {index === 0 ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </div>
              </button>
            ))}

            {/* Connection Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
              {nodes.length >= 2 && (
                <line 
                  x1="30%" y1="38%" 
                  x2="43%" y2="50%" 
                  stroke="rgba(34, 197, 94, 0.3)" 
                  strokeWidth="2" 
                  strokeDasharray="5,5"
                  className="animate-pulse"
                />
              )}
              {nodes.length >= 3 && (
                <>
                  <line 
                    x1="30%" y1="38%" 
                    x2="74%" y2="54%" 
                    stroke="rgba(34, 197, 94, 0.3)" 
                    strokeWidth="2" 
                    strokeDasharray="5,5"
                    className="animate-pulse"
                  />
                  <line 
                    x1="43%" y1="50%" 
                    x2="74%" y2="54%" 
                    stroke="rgba(156, 163, 175, 0.3)" 
                    strokeWidth="2" 
                    strokeDasharray="5,5"
                  />
                </>
              )}
            </svg>
          </div>
        </div>

        {/* Node details modal */}
        {selectedNode && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="node-details-title">
            <div className={`${darkMode ? 'bg-primary-900 border border-primary-700' : 'bg-white'} rounded-2xl shadow-2xl max-w-md w-full`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 id="node-details-title" className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{selectedNode.name}</h3>
                  <button
                    onClick={() => setSelectedNode(null)}
                    className={`${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'} text-2xl focus:outline-none focus:ring-2 focus:ring-signodes-400 rounded-md p-1`}
                    aria-label="Close details"
                  >
                    ×
                  </button>
                </div>
                
                <div className="mb-6">
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{selectedNode.location}</p>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>Coordinates: {selectedNode.latitude}°N, {selectedNode.longitude}°E</p>
                </div>
                
                <div className="space-y-4">
                  <div className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-blue-900/30 border border-blue-700/30' : 'bg-blue-50'}`} role="group" aria-label="Temperature reading">
                    <div className="flex items-center space-x-3">
                      <Thermometer className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                      <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Temperature</span>
                    </div>
                    <span className={`text-lg font-bold ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                      {selectedNode.temperature === 'N/A' ? 'N/A' : `${selectedNode.temperature}°C`}
                    </span>
                  </div>
                  
                  <div className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-cyan-900/30 border border-cyan-700/30' : 'bg-cyan-50'}`} role="group" aria-label="Humidity reading">
                    <div className="flex items-center space-x-3">
                      <Droplets className={`w-5 h-5 ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />
                      <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Humidity</span>
                    </div>
                    <span className={`text-lg font-bold ${darkMode ? 'text-cyan-300' : 'text-cyan-600'}`}>
                      {selectedNode.humidity === 'N/A' ? 'N/A' : `${selectedNode.humidity}%`}
                    </span>
                  </div>
                  
                  <div className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-green-900/30 border border-green-700/30' : 'bg-green-50'}`} role="group" aria-label="Rain status">
                    <div className="flex items-center space-x-3">
                      <CloudRain className={`w-5 h-5 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                      <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Rain Status</span>
                    </div>
                    <span className={`text-lg font-bold ${darkMode ? 'text-green-300' : 'text-green-600'}`}>
                      {selectedNode.rain}
                    </span>
                  </div>
                  
                  <div className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-purple-900/30 border border-purple-700/30' : 'bg-purple-50'}`} role="group" aria-label="Wind speed reading">
                    <div className="flex items-center space-x-3">
                      <Wind className={`w-5 h-5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                      <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Wind Speed</span>
                    </div>
                    <span className={`text-lg font-bold ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>
                      {selectedNode.windSpeed === 'N/A' ? 'N/A' : `${selectedNode.windSpeed} km/h`}
                    </span>
                  </div>
                  
                  <div className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-orange-900/30 border border-orange-700/30' : 'bg-orange-50'}`} role="group" aria-label="PM2.5 air quality reading">
                    <div className="flex items-center space-x-3">
                      <Gauge className={`w-5 h-5 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                      <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>PM2.5</span>
                    </div>
                    <span className={`text-lg font-bold ${darkMode ? 'text-orange-300' : getAqiColor(selectedNode.aqi25val)}`}>
                      {selectedNode.aqi25val} µg/m³
                    </span>
                  </div>
                  
                  <div className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-red-900/30 border border-red-700/30' : 'bg-red-50'}`} role="group" aria-label="PM10 air quality reading">
                    <div className="flex items-center space-x-3">
                      <Gauge className={`w-5 h-5 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                      <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>PM10</span>
                    </div>
                    <span className={`text-lg font-bold ${darkMode ? 'text-red-300' : getAqiColor(selectedNode.aqi10val)}`}>
                      {selectedNode.aqi10val} µg/m³
                    </span>
                  </div>
                  
                  <div className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-yellow-900/30 border border-yellow-700/30' : 'bg-yellow-50'}`} role="group" aria-label="UV index reading">
                    <div className="flex items-center space-x-3">
                      <Sun className={`w-5 h-5 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                      <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>UV Index</span>
                    </div>
                    <span className={`text-lg font-bold ${darkMode ? 'text-yellow-300' : getUvColor(typeof selectedNode.uvIndex === 'number' ? calculateUvRisk(selectedNode.uvIndex) : selectedNode.uvRisk)}`}>
                      {selectedNode.uvIndex} {typeof selectedNode.uvIndex === 'number' ? `(${calculateUvRisk(selectedNode.uvIndex)})` : selectedNode.uvRisk && `(${selectedNode.uvRisk})`}
                    </span>
                  </div>
                  
                  <div className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-rose-900/30 border border-rose-700/30' : 'bg-rose-50'}`} role="group" aria-label="Carbon monoxide reading">
                    <div className="flex items-center space-x-3">
                      <Zap className={`w-5 h-5 ${darkMode ? 'text-rose-400' : 'text-rose-600'}`} />
                      <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Carbon Monoxide</span>
                    </div>
                    <span className={`text-lg font-bold ${darkMode ? 'text-rose-300' : 'text-rose-600'}`}>
                      {selectedNode.mq_co} ppm
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CampusMap;
