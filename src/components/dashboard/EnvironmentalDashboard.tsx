import React from 'react';
import { useNodes } from '../../context/NodesContext';
import { Thermometer, Droplets, Sun, CloudRain, Gauge } from 'lucide-react';
import { useDarkMode } from '../../context/DarkModeContext';
import { Meteors } from "../heroui/meteors";
import { WavyBackground } from "../heroui/wavy-background";
import { 
  formatTemperatureWithBounds, 
  formatHumidityWithBounds, 
  formatAQIWithBounds, 
  formatUVIndexWithBounds 
} from '../../utils/sensorFormatting';

const EnvironmentalDashboard: React.FC = () => {
  const { nodes, loading } = useNodes();
  const { darkMode } = useDarkMode();
  const nodeData = nodes.length > 0 ? nodes[0] : null;

  // Helper function to calculate overall AQI from PM2.5 and PM10
  const calculateOverallAQI = () => {
    const pm25 = nodeData?.aqi25val || 0;
    const pm10 = nodeData?.aqi10val || 0;
    return Math.max(pm25, pm10);
  };

  // Helper function to get AQI color and status
  const getAqiInfo = (aqi: number) => {
    if (darkMode) {
      if (aqi <= 50) return { color: 'text-green-400', bgColor: 'bg-green-900/30 border-green-800/50', status: 'Good', description: 'Air quality is excellent' };
      if (aqi <= 100) return { color: 'text-yellow-400', bgColor: 'bg-yellow-900/30 border-yellow-800/50', status: 'Moderate', description: 'Air quality is acceptable' };
      if (aqi <= 150) return { color: 'text-orange-400', bgColor: 'bg-orange-900/30 border-orange-800/50', status: 'Unhealthy for Sensitive Groups', description: 'Sensitive people may experience symptoms' };
      if (aqi <= 200) return { color: 'text-red-400', bgColor: 'bg-red-900/30 border-red-800/50', status: 'Unhealthy', description: 'Everyone may experience health effects' };
      if (aqi <= 300) return { color: 'text-purple-400', bgColor: 'bg-purple-900/30 border-purple-800/50', status: 'Very Unhealthy', description: 'Health alert for everyone' };
      return { color: 'text-red-500', bgColor: 'bg-red-900/40 border-red-800/60', status: 'Hazardous', description: 'Emergency conditions' };
    } else {
      if (aqi <= 50) return { color: 'text-green-600', bgColor: 'bg-green-100 border-green-200', status: 'Good', description: 'Air quality is excellent' };
      if (aqi <= 100) return { color: 'text-yellow-600', bgColor: 'bg-yellow-100 border-yellow-200', status: 'Moderate', description: 'Air quality is acceptable' };
      if (aqi <= 150) return { color: 'text-orange-600', bgColor: 'bg-orange-100 border-orange-200', status: 'Unhealthy for Sensitive Groups', description: 'Sensitive people may experience symptoms' };
      if (aqi <= 200) return { color: 'text-red-600', bgColor: 'bg-red-100 border-red-200', status: 'Unhealthy', description: 'Everyone may experience health effects' };
      if (aqi <= 300) return { color: 'text-purple-600', bgColor: 'bg-purple-100 border-purple-200', status: 'Very Unhealthy', description: 'Health alert for everyone' };
      return { color: 'text-red-800', bgColor: 'bg-red-200 border-red-300', status: 'Hazardous', description: 'Emergency conditions' };
    }
  };

  const overallAQI = calculateOverallAQI();
  const aqiInfo = getAqiInfo(overallAQI);

  // Main dashboard data - 5 boxes
  const dashboardData = [
    {
      name: 'Air Quality Index',
      value: overallAQI > 0 ? formatAQIWithBounds(overallAQI) : 'N/A',
      description: aqiInfo.status,
      unit: 'AQI',
      icon: Gauge,
      color: aqiInfo.color,
      bgColor: aqiInfo.bgColor,
      range: '0-500'
    },
    {
      name: 'Temperature',
      value: nodeData?.temperature !== undefined && nodeData !== null ? formatTemperatureWithBounds(nodeData.temperature) : 'N/A',
      description: 'Current ambient temperature',
      unit: '°C',
      icon: Thermometer,
      color: darkMode ? 'text-red-400' : 'text-red-500',
      bgColor: darkMode ? 'bg-red-900/30 border-red-800/50' : 'bg-red-50 border-red-200',
      range: '-10 to 50'
    },
    {
      name: 'Humidity',
      value: nodeData?.humidity !== undefined && nodeData !== null ? formatHumidityWithBounds(nodeData.humidity) : 'N/A',
      description: 'Relative humidity level',
      unit: '%',
      icon: Droplets,
      color: darkMode ? 'text-blue-400' : 'text-blue-500',
      bgColor: darkMode ? 'bg-blue-900/30 border-blue-800/50' : 'bg-blue-50 border-blue-200',
      range: '0-100'
    },
    {
      name: 'UV Index',
      value: nodeData?.uvIndex !== undefined && nodeData !== null ? formatUVIndexWithBounds(nodeData.uvIndex) : 'N/A',
      description: 'UV radiation level',
      unit: 'mW/cm²',
      icon: Sun,
      color: darkMode ? 'text-yellow-400' : 'text-yellow-500',
      bgColor: darkMode ? 'bg-yellow-900/30 border-yellow-800/50' : 'bg-yellow-50 border-yellow-200',
      range: '0-100'
    },
    {
      name: 'Rain Status',
      value: nodeData?.rain === 'Yes' ? 'Detected' : 'Clear',
      description: 'Precipitation detection',
      unit: '',
      icon: CloudRain,
      color: nodeData?.rain === 'Yes' ? (darkMode ? 'text-blue-400' : 'text-blue-600') : (darkMode ? 'text-gray-400' : 'text-gray-500'),
      bgColor: nodeData?.rain === 'Yes' ? (darkMode ? 'bg-blue-900/30 border-blue-800/50' : 'bg-blue-50 border-blue-200') : (darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'),
      range: 'Yes/No'
     }
  ];

  if (loading) {
    return (
      <section 
        className="py-20 bg-gradient-to-br from-primary-900 via-primary-800 to-signodes-900"
        role="region"
        aria-label="Loading environmental dashboard"
      >
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <div 
              className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"
              role="status"
              aria-label="Loading"
            ></div>
            <p className="mt-4 text-white">Loading environmental data...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      className={`relative min-h-screen w-full overflow-hidden`}
      role="region"
      aria-labelledby="environmental-dashboard-title"
    >
      <div className="absolute inset-0 -z-10">
        <WavyBackground
          className="h-full w-full"
          colors={darkMode ? ["#1e3a8a40", "#1e40af30", "#1e3a8a40"] : ["#bfdbfe80", "#93c5fd80", "#bfdbfe80"]}
          waveWidth={60}
          backgroundFill={darkMode ? "#0f172a" : "#f8fafc"}
          blur={10}
          speed="slow"
          waveOpacity={0.15}
        />
      </div>
      <Meteors className="absolute" />
      <div className="container mx-auto px-4 py-16 relative">
        <div className="max-w-6xl mx-auto space-y-10 animate-fade-in">
          <div className="text-center mb-10">
            <h2 id="environmental-dashboard-title" className={`text-4xl font-bold ${darkMode ? 'text-primary-50' : 'text-primary-900'} mb-4 animate-slide-up`}>Environmental Dashboard</h2>
            <p className={`${darkMode ? 'text-primary-300' : 'text-primary-600'} max-w-3xl mx-auto text-lg animate-slide-up`} style={{ animationDelay: '100ms' }}>
              Real-time environmental metrics from our sensor network, providing insights into campus air quality and conditions.
            </p>
            <div className={`flex items-center justify-center mt-4 ${darkMode ? 'text-primary-300' : 'text-primary-600'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">
                Last Updated: {nodes[0]?.lastUpdated ? (() => {
                  try {
                    let dateString = nodes[0].lastUpdated;
                    if (dateString.includes('_')) {
                      dateString = dateString.replace('_', 'T');
                    }
                    const date = new Date(dateString);
                    if (isNaN(date.getTime())) {
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
                })() : 'N/A'}
              </span>
            </div>
          </div>
          {/* Environmental Dashboard Cards - Only 5 Parameters */}
          <div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8"
            role="group"
            aria-label="Environmental metrics"
          >
            {dashboardData.map((item, index) => (
              <div 
                key={index} 
                className={`${item.bgColor} p-6 rounded-3xl ${darkMode ? 'shadow-glow border border-primary-700' : 'shadow-card border border-primary-100'} hover:shadow-glow transition-all duration-300 transform hover:-translate-y-2 focus-within:ring-2 focus-within:ring-signodes-400 animate-scale`}
                style={{ animationDelay: `${index * 150}ms` }}
                role="group"
                aria-label={`${item.name} reading`}
                tabIndex={0}
              >
                <div className="text-center">
                  <div className="flex justify-center mb-5">
                    <div className={`p-4 ${darkMode ? 'bg-primary-800 shadow-inner-light' : 'bg-white shadow-soft'} rounded-full animate-float`}>
                      <item.icon className={`h-9 w-9 ${item.color}`} aria-hidden="true" />
                    </div>
                  </div>
                  
                  <h3 className={`text-xl font-semibold ${darkMode ? 'text-primary-50' : 'text-primary-900'} mb-3`}>{item.name}</h3>
                  
                  <div 
                    className={`text-4xl font-bold ${item.color} mb-2 animate-pulse-slow`}
                    role={item.name === 'Air Quality Index' ? 'meter' : undefined}
                    aria-valuetext={`${item.value}${item.unit}`}
                    aria-label={`${item.name}: ${item.value}${item.unit}`}
                  >
                    {item.value}
                    {item.unit && <span className="text-lg ml-1">{item.unit}</span>}
                  </div>
                  
                  <p className={`text-sm ${darkMode ? 'text-primary-300' : 'text-primary-600'} mb-4`}>{item.description}</p>
                  
                  <div className={`text-xs ${darkMode ? 'text-primary-400' : 'text-primary-500'} font-medium`}>
                    Range: {item.range}
                  </div>
                  
                  {/* Status indicator */}
                  <div className="mt-5 flex items-center justify-center">
                    <div 
                      className={`w-3 h-3 rounded-full ${item.value !== 'N/A' ? (darkMode ? 'bg-success-500' : 'bg-success-400') : (darkMode ? 'bg-gray-600' : 'bg-gray-400')} animate-pulse`}
                      role="status"
                      aria-label={item.value !== 'N/A' ? 'Live data' : 'Offline'}
                    ></div>
                    <span className={`ml-2 text-xs font-medium ${darkMode ? 'text-primary-400' : 'text-primary-500'}`}>
                      {item.value !== 'N/A' ? 'Live' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EnvironmentalDashboard;
