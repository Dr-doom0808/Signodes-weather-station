import React, { useState } from 'react';
import { useNodes, NodeData } from '../../context/NodesContext';
import { Server, AlertCircle, ChevronDown, ChevronUp, Navigation, Activity } from 'lucide-react';
import { Thermometer, Droplets, Gauge, CloudRain, Sun, MapPin, Calendar, AlertTriangle } from 'lucide-react'; 
import { useDarkMode } from '../../context/DarkModeContext';
import { 
  formatTemperatureWithBounds, 
  formatHumidityWithBounds, 
  formatPressureWithBounds, 
  formatAQIWithBounds, 
  formatUVIndexWithBounds, 
  formatCOLevelWithBounds,
  formatCoordinateCompact
} from '../../utils/sensorFormatting';

interface NodeCardProps {
  node: NodeData;
  isActive: boolean;
  onToggle: () => void;
}

const NodeCard: React.FC<NodeCardProps> = ({ node, isActive, onToggle }) => {
  const { darkMode } = useDarkMode();
  
  // Determine if node is online based on lastUpdated
  const isOnline = node.lastUpdated && node.lastUpdated !== 'N/A' ? (() => {
    try {
      const lastUpdated = new Date(node.lastUpdated);
      const now = new Date();
      const OFFLINE_THRESHOLD_MS = 15 * 60 * 1000; // 15 minutes
      return (now.getTime() - lastUpdated.getTime()) < OFFLINE_THRESHOLD_MS;
    } catch {
      return false;
    }
  })() : false;
  
  const getStatusColor = () => {
    return isOnline ? 'text-green-500' : 'text-gray-400';
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === 'N/A') return 'Unknown';
    
    try {
      // Handle different date formats
      let formattedDate = dateString;
      
      // Convert format from "2025-09-01_16:21:38" to "2025-09-01T16:21:38"
      if (dateString.includes('_')) {
        formattedDate = dateString.replace('_', 'T');
      }
      
      const date = new Date(formattedDate);
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        // Try alternative parsing for different formats
        const parts = dateString.split(/[_\s\-:]/g).filter(Boolean);
        if (parts.length >= 6) {
          const [year, month, day, hour, minute, second] = parts;
          const altDate = new Date(
            parseInt(year), 
            parseInt(month) - 1, // Month is 0-indexed
            parseInt(day),
            parseInt(hour),
            parseInt(minute),
            parseInt(second)
          );
          if (!isNaN(altDate.getTime())) {
            return altDate.toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            });
          }
        }
        return 'Unknown';
      }
      
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return 'Unknown';
    }
  };

  return (
    <div 
      className={`${darkMode ? 'bg-primary-800 border-primary-700' : 'bg-white border-gray-100'} rounded-xl shadow-md overflow-hidden transition-all duration-300 border ${isActive ? 'ring-2 ring-blue-500' : 'hover:shadow-lg'}`}
      role="article"
      aria-labelledby={`node-title-${node.nodeId}`}
    >
      {/* Header */}
      <div 
        className="p-4 cursor-pointer flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
        onClick={onToggle}
        onKeyDown={(e) => e.key === 'Enter' && onToggle()}
        tabIndex={0}
        role="button"
        aria-expanded={isActive}
        aria-controls={`node-content-${node.nodeId}`}
      >
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${node.isOnline ? 'bg-green-100' : 'bg-gray-100'}`}>
            <Server className={`w-5 h-5 ${getStatusColor()}`} />
          </div>
          <div>
            <h3 id={`node-title-${node.nodeId}`} className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{node.nodeName || 'Unnamed Node'}</h3>
            <p className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-500'}`}>{node.nodeLocation || 'Location not specified'}</p>
          </div>
        </div>
        <div className="flex items-center">
          <span className={`text-xs px-2 py-1 rounded-full ${node.isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
            {node.isOnline ? 'Online' : 'Offline'}
          </span>
          {isActive ? 
            <ChevronUp className="ml-2 w-5 h-5 text-gray-400" /> : 
            <ChevronDown className="ml-2 w-5 h-5 text-gray-400" />
          }
        </div>
      </div>

      {/* Expanded Content */}
      {isActive && (
        <div id={`node-content-${node.nodeId}`} className="px-4 pb-4 space-y-4">

          {/* Node Information */}
          <div 
            className={`${darkMode ? 'bg-primary-700 border-primary-600' : 'bg-gray-50 border-gray-200'} rounded-lg p-3 space-y-2 border`}
            role="group"
            aria-label="Node information"
          >
            <div className={`flex items-center text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              <MapPin className={`w-4 h-4 mr-2 ${darkMode ? 'text-gray-300' : 'text-gray-500'} flex-shrink-0`} />
              <span className="truncate">Location: {node.nodeLocation || 'N/A'}</span>
            </div>
            {(node.latitude && node.longitude) && (
              <div className={`flex items-center text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                <Navigation className={`w-4 h-4 mr-2 ${darkMode ? 'text-gray-300' : 'text-gray-500'} flex-shrink-0`} />
                <span>Coordinates: {formatCoordinateCompact(node.latitude)}, {formatCoordinateCompact(node.longitude)}</span>
              </div>
            )}
            <div className={`flex items-center text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              <Calendar className={`w-4 h-4 mr-2 ${darkMode ? 'text-gray-300' : 'text-gray-500'} flex-shrink-0`} />
              <span>Last Updated: {node.lastUpdated ? formatDate(node.lastUpdated) : 'N/A'}</span>
            </div>
          </div>

          {/* Environmental Data Grid */}
          <div 
            className="grid grid-cols-2 gap-3" 
            role="group" 
            aria-label="Environmental data readings"
          >
            {/* Temperature */}
            <div 
              className={`${darkMode ? 'bg-blue-900/30 border-blue-800/50' : 'bg-blue-50 border-blue-100'} rounded-lg p-3 border transition-colors duration-300 focus-within:ring-2 focus-within:ring-blue-500`}
              role="group"
              aria-label="Temperature reading"
              tabIndex={0}
            >
              <div className={`flex items-center space-x-2 ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                <Thermometer className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium truncate">Temperature</span>
              </div>
              <div className={`text-xl font-bold mt-1 ${darkMode ? 'text-white' : ''}`}>
                {node.temperature !== undefined && node.temperature !== null ? `${formatTemperatureWithBounds(node.temperature)}°C` : 'N/A'}
              </div>
            </div>

            {/* Humidity */}
            <div 
              className={`${darkMode ? 'bg-cyan-900/30 border-cyan-800/50' : 'bg-cyan-50 border-cyan-100'} rounded-lg p-3 border transition-colors duration-300 focus-within:ring-2 focus-within:ring-cyan-500`}
              role="group"
              aria-label="Humidity reading"
              tabIndex={0}
            >
              <div className={`flex items-center space-x-2 ${darkMode ? 'text-cyan-400' : 'text-cyan-700'}`}>
                <Droplets className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium">Humidity</span>
              </div>
              <div className={`text-xl font-bold mt-1 ${darkMode ? 'text-white' : ''}`}>
                {node.humidity !== undefined && node.humidity !== null ? `${formatHumidityWithBounds(node.humidity)}%` : 'N/A'}
              </div>
            </div>

            {/* Air Pressure */}
            <div 
              className={`${darkMode ? 'bg-indigo-900/30 border-indigo-800/50' : 'bg-indigo-50 border-indigo-100'} rounded-lg p-3 border transition-colors duration-300 focus-within:ring-2 focus-within:ring-indigo-500`}
              role="group"
              aria-label="Air pressure reading"
              tabIndex={0}
            >
              <div className={`flex items-center space-x-2 ${darkMode ? 'text-indigo-400' : 'text-indigo-700'}`}>
                <Gauge className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium">Air Pressure</span>
              </div>
              <div className={`text-xl font-bold mt-1 ${darkMode ? 'text-white' : ''}`}>
                {node.pressure !== undefined && node.pressure !== null ? `${formatPressureWithBounds(node.pressure)} hPa` : 'N/A'}
              </div>
            </div>

            {/* Rain Status */}
            <div 
              className={`${darkMode ? 'bg-purple-900/30 border-purple-800/50' : 'bg-purple-50 border-purple-100'} rounded-lg p-3 border transition-colors duration-300 focus-within:ring-2 focus-within:ring-purple-500`}
              role="group"
              aria-label="Rain status reading"
              tabIndex={0}
            >
              <div className={`flex items-center space-x-2 ${darkMode ? 'text-purple-400' : 'text-purple-700'}`}>
                <CloudRain className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium">Rain Status</span>
              </div>
              <div className={`text-xl font-bold mt-1 capitalize ${darkMode ? 'text-white' : ''}`}>
                {node.rain?.toLowerCase() || 'N/A'}
              </div>
            </div>

            {/* AQI 2.5 */}
            <div 
              className={`${darkMode ? 'bg-amber-900/30 border-amber-800/50' : 'bg-amber-50 border-amber-100'} rounded-lg p-3 border transition-colors duration-300 focus-within:ring-2 focus-within:ring-amber-500`}
              role="group"
              aria-label="PM2.5 air quality reading"
              tabIndex={0}
            >
              <div className={`flex items-center space-x-2 ${darkMode ? 'text-amber-400' : 'text-amber-700'}`}>
                <Activity className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium">PM2.5 (AQI)</span>
              </div>
              <div className={`text-xl font-bold mt-1 ${darkMode ? 'text-white' : ''}`}>
                {node.aqi25val !== undefined && node.aqi25val !== null ? formatAQIWithBounds(node.aqi25val) : 'N/A'}
              </div>
            </div>

            {/* AQI 10 */}
            <div 
              className={`${darkMode ? 'bg-red-900/30 border-red-800/50' : 'bg-red-50 border-red-100'} rounded-lg p-3 border transition-colors duration-300 focus-within:ring-2 focus-within:ring-red-500`}
              role="group"
              aria-label="PM10 air quality reading"
              tabIndex={0}
            >
              <div className={`flex items-center space-x-2 ${darkMode ? 'text-red-400' : 'text-red-700'}`}>
                <Activity className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium">PM10 (AQI)</span>
              </div>
              <div className={`text-xl font-bold mt-1 ${darkMode ? 'text-white' : ''}`}>
                {node.aqi10val !== undefined && node.aqi10val !== null ? formatAQIWithBounds(node.aqi10val) : 'N/A'}
              </div>
            </div>

            {/* UV Index */}
            <div 
              className={`${darkMode ? 'bg-yellow-900/30 border-yellow-800/50' : 'bg-yellow-50 border-yellow-100'} rounded-lg p-3 border transition-colors duration-300 focus-within:ring-2 focus-within:ring-yellow-500`}
              role="group"
              aria-label="UV index reading"
              tabIndex={0}
            >
              <div className={`flex items-center space-x-2 ${darkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                <Sun className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium">UV Index</span>
              </div>
              <div className={`text-xl font-bold mt-1 ${darkMode ? 'text-white' : ''}`}>
                {node.uvIndex !== undefined && node.uvIndex !== null ? formatUVIndexWithBounds(node.uvIndex) : 'N/A'} {node.uvRisk && `(${node.uvRisk})`}
              </div>
            </div>

            {/* Carbon Monoxide */}
            <div 
              className={`${darkMode ? 'bg-purple-900/30 border-purple-800/50' : 'bg-purple-50 border-purple-100'} rounded-lg p-3 border transition-colors duration-300 focus-within:ring-2 focus-within:ring-purple-500`}
              role="group"
              aria-label="Carbon monoxide reading"
              tabIndex={0}
            >
              <div className={`flex items-center space-x-2 ${darkMode ? 'text-purple-400' : 'text-purple-700'}`}>
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium">CO Level</span>
              </div>
              <div className={`text-xl font-bold mt-1 ${darkMode ? 'text-white' : ''}`}>
                {node.mq_co !== undefined && node.mq_co !== null ? `${formatCOLevelWithBounds(node.mq_co)} ppm` : 'N/A'}
              </div>
            </div>
            

          </div>
        </div>
      )}
    </div>
  );
};

const NodeGrid: React.FC = () => {
  // Call all hooks at the top (before any conditional returns)
  const { nodes: sensorNodes, loading, error } = useNodes();
  const [expandedNode, setExpandedNode] = useState<string | null>(null);
  const { darkMode } = useDarkMode();

  // Map sensor nodes to our format
  const networkNodes = [
    {
      nodeId: 'node-a',
      nodeName: 'Node A',
      nodeLocation: 'Block A - Main Building',
      isOnline: true,
      ...(sensorNodes[0] || {}),
      lastUpdated: sensorNodes[0]?.lastUpdated || new Date().toISOString()
    },
    {
      nodeId: 'node-b',
      nodeName: 'Node B',
      nodeLocation: 'Block B - Library',
      isOnline: false,
      ...(sensorNodes[1] || {}),
      lastUpdated: sensorNodes[1]?.lastUpdated || new Date().toISOString()
    },
    {
      nodeId: 'node-c',
      nodeName: 'Node C',
      nodeLocation: 'Block D - Cafeteria',
      isOnline: false,
      ...(sensorNodes[2] || {}),
      lastUpdated: sensorNodes[2]?.lastUpdated || new Date().toISOString()
    }
  ];

  const toggleNode = (nodeId: string) => {
    setExpandedNode(expandedNode === nodeId ? null : nodeId);
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-3 text-gray-600">Loading node information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 my-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              Error loading node data: {error.message}
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <section 
      className={`py-12 ${darkMode ? 'bg-gradient-to-br from-primary-950 to-primary-900 text-gray-100' : 'bg-gradient-to-br from-slate-50 to-blue-50'}`}
      role="region"
      aria-labelledby="sensor-network-title"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 id="sensor-network-title" className={`text-3xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>Campus Sensor Network</h2>
          <p className={`text-lg ${darkMode ? 'text-gray-200' : 'text-gray-600'} max-w-2xl mx-auto`}>
            Interactive overview of all sensor nodes across the NIET campus
          </p>
        </div>

        <div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          role="list"
          aria-label="Sensor nodes"
        >
          {networkNodes.map((node) => (
            <NodeCard
              key={node.nodeId}
              node={node}
              isActive={expandedNode === node.nodeId}
              onToggle={() => toggleNode(node.nodeId)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default NodeGrid;
