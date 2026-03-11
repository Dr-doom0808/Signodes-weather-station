import React from 'react';
import { X, Wifi, Clock, Thermometer, Droplets, Wind, Gauge, Sun, Zap } from 'lucide-react';

interface SensorDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sensorData: {
    id: string;
    name: string;
    location: string;
    isOnline: boolean;
    lastUpdated: string;
    temperature?: number | string;
    humidity?: number | string;
    pressure?: number | string;
    aqi?: number | string;
    uvIndex?: number | string;
    uvRisk?: string;
    mq_co?: number | string;
  } | null;
  darkMode?: boolean;
}

const SensorDetailsModal: React.FC<SensorDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  sensorData, 
  darkMode = false 
}) => {
  if (!isOpen || !sensorData) return null;

  // Format time since last update
  const formatTimeSince = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 min ago';
    if (diffMins < 60) return `${diffMins} mins ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  const lastReadingTime = sensorData.lastUpdated ? formatTimeSince(sensorData.lastUpdated) : 'Unknown';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sensor-details-title"
    >
      {/* Backdrop with blur effect */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal content with glassmorphism effect */}
      <div 
        className={`relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl animate-scale ${darkMode ? 'bg-primary-900/80 backdrop-blur-md border border-primary-800' : 'bg-white backdrop-blur-md border border-gray-200'}`}
      >
        {/* Header with status pill */}
        <div className="p-6 pb-0">
          <div className="flex items-center justify-between mb-2">
            <h2 
              id="sensor-details-title" 
              className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}
            >
              {sensorData.name}
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-full ${darkMode ? 'bg-primary-800 text-white/70 hover:text-white' : 'bg-gray-100 text-gray-500 hover:text-gray-700'} focus:outline-none focus:ring-2 focus:ring-signodes-500`}
              aria-label="Close details"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center space-x-3 mb-6">
            <span 
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${sensorData.isOnline ? (darkMode ? 'bg-green-900/50 text-white' : 'bg-green-100 text-green-800') : (darkMode ? 'bg-red-900/50 text-white' : 'bg-red-100 text-red-800')}`}
            >
              <Wifi className="w-4 h-4 mr-1" />
              {sensorData.isOnline ? 'Online' : 'Offline'}
            </span>
            <span className={`text-sm ${darkMode ? 'text-white/70' : 'text-gray-500'}`}>
              <Clock className="w-4 h-4 inline mr-1" />
              Last Reading: {lastReadingTime}
            </span>
          </div>
        </div>
        
        {/* Sensor data details */}
        <div className="p-6 pt-0">
          <div className={`grid grid-cols-2 gap-4 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
            {/* Location */}
            <div className="col-span-2">
              <div className="flex justify-between items-center p-3 rounded-lg mb-2 border border-gray-200 dark:border-primary-700 bg-white dark:bg-primary-800/50">
                <span className="font-medium">Location</span>
                <span>{sensorData.location}</span>
              </div>
            </div>
            
            {/* Temperature */}
            {sensorData.temperature && (
              <div className="flex justify-between items-center p-3 rounded-lg border border-gray-200 dark:border-primary-700 bg-white dark:bg-primary-800/50">
                <div className="flex items-center">
                  <Thermometer className={`w-5 h-5 mr-2 ${darkMode ? 'text-signodes-500' : 'text-signodes-500'}`} />
                  <span className="font-medium">Temperature</span>
                </div>
                <span className={`font-bold ${darkMode ? 'text-white' : 'text-signodes-500'}`}>{sensorData.temperature}°C</span>
              </div>
            )}
            
            {/* Humidity */}
            {sensorData.humidity && (
                <div className="flex justify-between items-center p-3 rounded-lg border border-gray-200 dark:border-primary-700 bg-white dark:bg-primary-800/50">
                <div className="flex items-center">
                  <Droplets className={`w-5 h-5 mr-2 ${darkMode ? 'text-signodes-500' : 'text-signodes-500'}`} />
                  <span className="font-medium">Humidity</span>
                </div>
                <span className={`font-bold ${darkMode ? 'text-white' : 'text-signodes-500'}`}>{sensorData.humidity}%</span>
              </div>
            )}
            
            {/* Pressure */}
            {sensorData.pressure && (
                <div className="flex justify-between items-center p-3 rounded-lg border border-gray-200 dark:border-primary-700 bg-white dark:bg-primary-800/50">
                <div className="flex items-center">
                  <Wind className={`w-5 h-5 mr-2 ${darkMode ? 'text-signodes-500' : 'text-signodes-500'}`} />
                  <span className="font-medium">Pressure</span>
                </div>
                <span className={`font-bold ${darkMode ? 'text-white' : 'text-signodes-500'}`}>{sensorData.pressure} hPa</span>
              </div>
            )}
            
            {/* AQI */}
            {sensorData.aqi && (
                <div className="flex justify-between items-center p-3 rounded-lg border border-gray-200 dark:border-primary-700 bg-white dark:bg-primary-800/50">
                <div className="flex items-center">
                  <Gauge className={`w-5 h-5 mr-2 ${darkMode ? 'text-signodes-500' : 'text-signodes-500'}`} />
                  <span className="font-medium">Air Quality</span>
                </div>
                <span className={`font-bold ${darkMode ? 'text-white' : 'text-signodes-500'}`}>{sensorData.aqi} AQI</span>
              </div>
            )}
            
            {/* UV Index */}
            {sensorData.uvIndex && (
                <div className="flex justify-between items-center p-3 rounded-lg border border-gray-200 dark:border-primary-700 bg-white dark:bg-primary-800/50">
                <div className="flex items-center">
                  <Sun className={`w-5 h-5 mr-2 ${darkMode ? 'text-signodes-500' : 'text-signodes-500'}`} />
                  <span className="font-medium">UV Index</span>
                </div>
                <span className={`font-bold ${darkMode ? 'text-white' : 'text-signodes-500'}`}>
                  {sensorData.uvIndex} {sensorData.uvRisk && `(${sensorData.uvRisk})`}
                </span>
              </div>
            )}
            
            {/* CO Level */}
            {sensorData.mq_co && (
                <div className="flex justify-between items-center p-3 rounded-lg border border-gray-200 dark:border-primary-700 bg-white dark:bg-primary-800/50">
                <div className="flex items-center">
                  <Zap className={`w-5 h-5 mr-2 ${darkMode ? 'text-signodes-500' : 'text-signodes-500'}`} />
                  <span className="font-medium">CO Level</span>
                </div>
                <span className={`font-bold ${darkMode ? 'text-white' : 'text-signodes-500'}`}>{sensorData.mq_co} ppm</span>
              </div>
            )}
          </div>
          
          {/* Footer with action buttons */}
          <div className="mt-6 flex justify-end space-x-3">
            <button 
              onClick={onClose}
              className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-primary-800 text-white/70 hover:bg-primary-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} transition-colors`}
            >
              Close
            </button>
            <button 
              className={`px-4 py-2 rounded-lg bg-signodes-500 text-white hover:bg-signodes-600 transition-colors`}
            >
              View History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SensorDetailsModal;