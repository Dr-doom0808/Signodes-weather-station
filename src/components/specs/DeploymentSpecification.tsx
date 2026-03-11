import React from 'react';
import { Cpu, Database, Users, Wifi, Cloud, HardDrive, Thermometer, Droplets, Gauge, Wind } from 'lucide-react';
import { useDarkMode } from '../../context/DarkModeContext';

const DeploymentSpecification: React.FC = () => {
  const { darkMode } = useDarkMode();
  const teamPhotos = [
    '/bed33.png',
    '/bed22.jpg',
    '/bed11.jpg',
    '/bed44.jpeg'
  ];

  const sensors = [
    { name: 'DHT11', description: 'Temperature & Humidity', icon: <Thermometer className="w-6 h-6" /> },
    { name: 'Rain Sensor', description: 'Precipitation', icon: <Droplets className="w-6 h-6" /> },
    { name: 'Air Quality', description: 'Gas & Particles', icon: <Wind className="w-6 h-6" /> },
    { name: 'Barometer', description: 'Atmospheric Pressure', icon: <Gauge className="w-6 h-6" /> }
  ];

  const features = [
    { title: 'Wireless Connectivity', description: 'WiFi enabled for remote monitoring', icon: <Wifi className="w-6 h-6" /> },
    { title: 'Cloud Integration', description: 'Real-time data to Google Sheets', icon: <Cloud className="w-6 h-6" /> },
    { title: 'Local Storage', description: 'On-board data logging', icon: <HardDrive className="w-6 h-6" /> }
  ];

  return (
    <section className={`py-16 ${darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-slate-50 to-gray-50'}`}>
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <span className={`inline-block px-4 py-2 ${darkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800'} rounded-full text-sm font-semibold mb-4`}>
              Our Technology Stack
            </span>
            <h2 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
              Smart Environmental Monitoring System
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-cyan-400 mx-auto mb-6 rounded-full"></div>
            <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto`}>
              A comprehensive IoT solution for real-time environmental data collection and analysis
            </p>
          </div>

          {/* Hardware Section */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl overflow-hidden mb-16 ${darkMode ? 'border border-gray-700' : ''}`}>
            <div className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-start md:items-center mb-10">
                <div className={`p-4 ${darkMode ? 'bg-blue-900/30' : 'bg-blue-100'} rounded-xl mr-6 mb-6 md:mb-0`}>
                  <Cpu className={`w-8 h-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <div>
                  <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>ESP32 Based Hardware</h2>
                  <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Powerful microcontroller with built-in WiFi for seamless connectivity</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {features.map((feature, index) => (
                  <div key={index} className={`p-6 rounded-xl transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-blue-50'}`}>
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${darkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-600'}`}>
                      {feature.icon}
                    </div>
                    <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{feature.title}</h3>
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{feature.description}</p>
                  </div>
                ))}
              </div>

              <div className="mt-12">
                <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-6`}>Sensor Suite</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {sensors.map((sensor, index) => (
                    <div key={index} className={`flex items-start p-4 ${darkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white border border-gray-100'} rounded-xl shadow-sm hover:shadow-md transition-shadow`}>
                      <div className={`p-2 ${darkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-50 text-blue-600'} rounded-lg mr-4`}>
                        {sensor.icon}
                      </div>
                      <div>
                        <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{sensor.name}</h4>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{sensor.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Team Section */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl overflow-hidden mb-16 ${darkMode ? 'border border-gray-700' : ''}`}>
            <div className="p-8 md:p-12">
              <div className="text-center mb-12">
                <span className={`inline-block px-4 py-2 ${darkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-800'} rounded-full text-sm font-semibold mb-4`}>
                  Project Photos
                </span>
                <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Project Gallery</h2>
                <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
                  Showcasing our weather station deployment and hardware setup
                </p>
              </div>

              <div className="max-w-6xl mx-auto">
                {/* Featured Image */}
                <div className="mb-8 group">
                  <div className={`rounded-2xl overflow-hidden shadow-2xl transform transition-all duration-300 group-hover:shadow-3xl ${darkMode ? 'border border-gray-700' : ''}`}>
                    <img 
                      src={teamPhotos[3]} /* Using bed44.jpeg as the featured image */
                      alt="Weather station deployment"
                      className="w-full h-auto max-h-[600px] object-cover"
                    />
                  </div>
                </div>
                
                {/* Image collage - 3 images in a row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {teamPhotos.slice(0, 3).map((photo, index) => (
                    <div key={index} className="group">
                      <div className={`aspect-w-16 aspect-h-9 rounded-2xl overflow-hidden shadow-lg transform transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-xl ${darkMode ? 'border border-gray-700' : ''}`}>
                        <img 
                          src={photo}
                          alt={`Project photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-12 text-white">
            <h3 className="text-3xl font-bold mb-4">Ready to explore our environmental data?</h3>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Check out our real-time dashboard to see the latest environmental readings from our sensor network
            </p>
            <a 
              href="/dashboard" 
              className="px-8 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-colors inline-block"
            >
              View Live Dashboard
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DeploymentSpecification;
