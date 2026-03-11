import React, { useState } from 'react';
import { Menu, X, Activity, MapPin, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  darkMode?: boolean;
  toggleDarkMode?: () => void;
}

const Header: React.FC<HeaderProps> = ({ darkMode = false, toggleDarkMode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <header className={`shadow-soft border-b-2 border-signodes-500 sticky top-0 z-50 transition-all duration-300 backdrop-blur-sm ${
      darkMode ? 'bg-primary-900/95 text-gray-100' : 'bg-white/95 text-primary-900'
    }`}>
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between py-4">
          {/* Left Logo */}
          <div className="flex items-center space-x-4 animate-slide-in-left">
            <div className={`w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center ${darkMode ? 'bg-transparent' : ''} rounded-2xl shadow-soft p-2 transition-all duration-300 hover:shadow-glow`} style={!darkMode ? { backgroundColor: 'rgb(207, 20, 39)' } : {}}>
              <img 
                src={darkMode ? "/logo-niet.jpeg" : "/logo2.png"} 
                alt="NIET Logo" 
                className="max-w-full max-h-full object-contain"
                style={{ filter: !darkMode ? 'brightness(0) invert(1)' : 'none' }}
              />
            </div>
            <div className="hidden sm:block">
              <h1 className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-primary-800'} transition-colors duration-300`}>
                NIET Weather Window 
              </h1>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-primary-600'} transition-colors duration-300`}>
                Edge IOT Testbed
              </p>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 animate-slide-in-right">
            <button 
              onClick={() => scrollToSection('sensor-data')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                darkMode 
                  ? 'text-gray-200 hover:text-gray-100 hover:bg-primary-800/50 focus:bg-primary-800/70 focus:outline-none focus:ring-2 focus:ring-signodes-400' 
                  : 'text-primary-700 hover:text-signodes-600 hover:bg-primary-50 focus:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-signodes-500'
              }`}
              aria-label="View live sensor data"
            >
              <Activity className="w-5 h-5" />
              <span className="font-medium">Live Data</span>
            </button>
            <button 
              onClick={() => scrollToSection('campus-overview')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                darkMode 
                  ? 'text-gray-200 hover:text-gray-100 hover:bg-primary-800/50 focus:bg-primary-800/70 focus:outline-none focus:ring-2 focus:ring-signodes-400' 
                  : 'text-primary-700 hover:text-signodes-600 hover:bg-primary-50 focus:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-signodes-500'
              }`}
              aria-label="View campus map"
            >
              <MapPin className="w-5 h-5" />
              <span className="font-medium">Campus Map</span>
            </button>
            <button 
              onClick={() => scrollToSection('network-status')}
              className={`px-4 py-2 rounded-xl transition-all duration-300 font-medium ${
                darkMode 
                  ? 'text-gray-200 hover:text-gray-100 hover:bg-primary-800/50 focus:bg-primary-800/70 focus:outline-none focus:ring-2 focus:ring-signodes-400' 
                  : 'text-primary-700 hover:text-signodes-600 hover:bg-primary-50 focus:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-signodes-500'
              }`}
              aria-label="View network status"
            >
              Network Status
            </button>
            <button 
              onClick={() => scrollToSection('deployment')}
              className={`px-4 py-2 rounded-xl transition-all duration-300 font-medium ${
                darkMode 
                  ? 'text-gray-200 hover:text-gray-100 hover:bg-primary-800/50 focus:bg-primary-800/70 focus:outline-none focus:ring-2 focus:ring-signodes-400' 
                  : 'text-primary-700 hover:text-signodes-600 hover:bg-primary-50 focus:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-signodes-500'
              }`}
              aria-label="View deployment information"
            >
              Deployment
            </button>
          </nav>
          
          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {/* Dark Mode Toggle */}
            {toggleDarkMode && (
              <button
                onClick={toggleDarkMode}
                className={`p-3 rounded-xl shadow-soft transition-all duration-300 ${
                  darkMode 
                    ? 'bg-primary-800 text-yellow-400 hover:bg-primary-700 hover:shadow-glow-accent focus:outline-none focus:ring-2 focus:ring-yellow-400' 
                    : 'bg-primary-50 text-primary-700 hover:bg-primary-100 hover:shadow-glow focus:outline-none focus:ring-2 focus:ring-primary-700'
                }`}
                aria-label="Toggle dark mode"
                aria-pressed={darkMode ? "true" : "false"}
              >
                {darkMode ? 
                  <Sun className="w-5 h-5 animate-spin-slow" /> : 
                  <Moon className="w-5 h-5 animate-pulse-slow" />}
              </button>
            )}
            
            <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-white dark:bg-primary-800 rounded-2xl shadow-soft p-2 transition-all duration-300 hover:shadow-glow">
              <img 
                src="/logo1.png" 
                alt="Signodes Logo" 
                className="max-w-full max-h-full object-contain"
              />
            </div>
            
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`md:hidden p-3 rounded-xl shadow-soft transition-all duration-300 ${
                darkMode 
                  ? 'bg-primary-800 text-gray-200 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-signodes-400' 
                  : 'bg-primary-50 text-primary-700 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-700'
              }`}
              aria-label="Toggle mobile menu"
              aria-expanded={isMenuOpen ? "true" : "false"}
              aria-controls="mobile-menu"
            >
              {isMenuOpen ? <X className="w-6 h-6 animate-scale" /> : <Menu className="w-6 h-6 animate-pulse-slow" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div id="mobile-menu" className={`md:hidden border-t py-4 animate-slide-up ${darkMode ? 'border-primary-700' : 'border-primary-200'}`}>
            <nav className="flex flex-col space-y-3 px-2">
              <button 
                onClick={() => scrollToSection('sensor-data')}
                className={`flex items-center space-x-3 transition-all duration-300 py-3 px-4 rounded-xl ${
                  darkMode 
                    ? 'text-gray-200 hover:text-gray-100 hover:bg-primary-800/50 focus:bg-primary-800/70 focus:outline-none focus:ring-2 focus:ring-signodes-400' 
                    : 'text-primary-700 hover:text-signodes-600 hover:bg-primary-50 focus:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-signodes-500'
                }`}
                style={{ animationDelay: '50ms' }}
                aria-label="View live sensor data"
              >
                <Activity className="w-5 h-5" />
                <span className="font-medium">Live Data</span>
              </button>
              <button 
                onClick={() => scrollToSection('campus-overview')}
                className={`flex items-center space-x-3 transition-all duration-300 py-3 px-4 rounded-xl ${
                  darkMode 
                    ? 'text-gray-200 hover:text-gray-100 hover:bg-primary-800/50 focus:bg-primary-800/70 focus:outline-none focus:ring-2 focus:ring-signodes-400' 
                    : 'text-primary-700 hover:text-signodes-600 hover:bg-primary-50 focus:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-signodes-500'
                }`}
                style={{ animationDelay: '100ms' }}
                aria-label="View campus map"
              >
                <MapPin className="w-5 h-5" />
                <span className="font-medium">Campus Map</span>
              </button>
              <button 
                onClick={() => scrollToSection('network-status')}
                className={`transition-all duration-300 py-3 px-4 rounded-xl text-left font-medium ${
                  darkMode 
                    ? 'text-gray-200 hover:text-gray-100 hover:bg-primary-800/50 focus:bg-primary-800/70 focus:outline-none focus:ring-2 focus:ring-signodes-400' 
                    : 'text-primary-700 hover:text-signodes-600 hover:bg-primary-50 focus:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-signodes-500'
                }`}
                style={{ animationDelay: '150ms' }}
                aria-label="View network status"
              >
                Network Status
              </button>
              <button 
                onClick={() => scrollToSection('deployment')}
                className={`transition-all duration-300 py-3 px-4 rounded-xl text-left font-medium ${
                  darkMode 
                    ? 'text-gray-200 hover:text-gray-100 hover:bg-primary-800/50 focus:bg-primary-800/70 focus:outline-none focus:ring-2 focus:ring-signodes-400' 
                    : 'text-primary-700 hover:text-signodes-600 hover:bg-primary-50 focus:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-signodes-500'
                }`}
                style={{ animationDelay: '200ms' }}
                aria-label="View deployment information"
              >
                Deployment
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;