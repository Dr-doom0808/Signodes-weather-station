import React, { useState } from 'react';
import { Activity, MapPin, Moon, Sun, Server, Menu, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNodes } from '../../context/NodesContext';

interface HeaderProps {
  darkMode?: boolean;
  toggleDarkMode?: () => void;
}

const Header: React.FC<HeaderProps> = ({ darkMode = false, toggleDarkMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { nodes } = useNodes();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Determine global connection status and last update
  const nodeData = nodes.length > 0 ? nodes[0] : null;

  const isOnline = nodeData?.lastUpdated && nodeData.lastUpdated !== 'N/A' ? (() => {
    try {
      const lastUpdatedDate = new Date(nodeData.lastUpdated.replace('_', 'T'));
      const now = new Date();
      const OFFLINE_THRESHOLD_MS = 15 * 60 * 1000; // 15 minutes
      return (now.getTime() - lastUpdatedDate.getTime()) < OFFLINE_THRESHOLD_MS;
    } catch {
      return false;
    }
  })() : false;

  const formatDate = (dateString?: string) => {
    if (!dateString || dateString === 'N/A') return 'Connecting...';
    try {
      const date = new Date(dateString.replace('_', 'T'));
      if (isNaN(date.getTime())) return 'Connecting...';
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Connecting...';
    }
  };

  const handleNavigation = (path: string, sectionId?: string) => {
    if (location.pathname !== path) {
      navigate(path);
      if (sectionId) {
        setTimeout(() => {
          const element = document.getElementById(sectionId);
          if (element) element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else if (sectionId) {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header className={`border-b sticky top-0 z-50 transition-all duration-300 backdrop-blur-md ${
      darkMode ? 'bg-slate-900/80 border-slate-800/50 shadow-lg shadow-black/20' : 'bg-white/80 border-slate-200'
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
              <h1 className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-slate-100' : 'text-slate-800'} transition-colors duration-300`}>
                NIET Weather Window 
              </h1>
              <p className={`text-sm ${darkMode ? 'text-sky-400' : 'text-sky-600'} font-medium transition-colors duration-300`}>
                Edge IOT Testbed
              </p>
            </div>
          </div>

          {/* Status Indicator (Center) */}
          <div className="hidden lg:flex flex-1 items-center justify-center px-4">
            <div className={`flex items-center space-x-3 px-4 py-1.5 rounded-full border ${
              darkMode 
                ? 'bg-slate-800/50 border-slate-700/50 text-slate-300' 
                : 'bg-slate-100 border-slate-200 text-slate-600'
              }`}
            >
              <div className="flex items-center space-x-1.5">
                <span className="relative flex h-2.5 w-2.5">
                  {isOnline && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isOnline ? 'bg-green-500' : 'bg-slate-500'}`}></span>
                </span>
                <span className="text-xs font-medium uppercase tracking-wider">{isOnline ? 'System Live' : 'Offline'}</span>
              </div>
              <div className="w-px h-3 bg-slate-500/30"></div>
              <div className="flex items-center space-x-1.5 opacity-80">
                <Server className="w-3.5 h-3.5" />
                <span className="text-xs">{formatDate(nodeData?.lastUpdated || undefined)}</span>
              </div>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 animate-slide-in-right">
            <button 
              onClick={() => handleNavigation('/', 'sensor-data')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 text-sm font-medium ${
                darkMode 
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Live Data</span>
            </button>
            <button 
              onClick={() => handleNavigation('/', 'campus-overview')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 text-sm font-medium ${
                darkMode 
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Map</span>
            </button>
            <button 
              onClick={() => handleNavigation('/', 'network-status')}
              className={`px-3 py-2 rounded-lg transition-all duration-300 text-sm font-medium ${
                darkMode 
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Network
            </button>
            <button 
              onClick={() => handleNavigation('/', 'deployment')}
              className={`px-3 py-2 rounded-lg transition-all duration-300 text-sm font-medium ${
                darkMode 
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Specs
            </button>
          </nav>
          
          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {/* Dark Mode Toggle */}
            {toggleDarkMode && (
              <button
                onClick={toggleDarkMode}
                className={`p-2.5 rounded-lg shadow-sm transition-all duration-300 border ${
                  darkMode 
                    ? 'bg-slate-800 border-slate-700 text-sky-400 hover:bg-slate-700 hover:border-slate-600' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
                aria-label="Toggle dark mode"
                aria-pressed={darkMode ? "true" : "false"}
              >
                {darkMode ? 
                  <Sun className="w-5 h-5 animate-spin-slow" /> : 
                  <Moon className="w-5 h-5 animate-pulse-slow" />}
              </button>
            )}
            
            <div className={`hidden md:flex w-12 h-12 items-center justify-center rounded-xl p-1.5 transition-all duration-300 bg-white ${darkMode ? 'shadow-md shadow-black/40' : 'shadow-sm border border-slate-200'} `}>
              <img 
                src="/logo1.png" 
                alt="Signodes Logo" 
                className="max-w-full max-h-full object-contain"
              />
            </div>
            
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden p-2.5 rounded-lg shadow-sm transition-all duration-300 border ${
                darkMode 
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-slate-600' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className={`md:hidden mt-2 pb-4 ${darkMode ? 'border-t border-slate-800' : 'border-t border-slate-200'}`}>
            <nav className="flex flex-col space-y-2 mt-4">
              <button 
                onClick={() => handleNavigation('/', 'sensor-data')}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 text-sm font-medium ${
                  darkMode 
                    ? 'text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-800' 
                    : 'text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <Activity className="w-5 h-5" />
                <span>Live Data</span>
              </button>
              <button 
                onClick={() => handleNavigation('/', 'campus-overview')}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 text-sm font-medium ${
                  darkMode 
                    ? 'text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-800' 
                    : 'text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <MapPin className="w-5 h-5" />
                <span>Map</span>
              </button>
              <button 
                onClick={() => handleNavigation('/', 'network-status')}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 text-sm font-medium ${
                  darkMode 
                    ? 'text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-800' 
                    : 'text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <Server className="w-5 h-5" />
                <span>Network Status</span>
              </button>
               <button 
                onClick={() => handleNavigation('/', 'deployment')}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 text-sm font-medium ${
                  darkMode 
                    ? 'text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-800' 
                    : 'text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <Activity className="w-5 h-5" />
                <span>Specifications</span>
              </button>
            </nav>
            <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-slate-800' : 'border-slate-200'} flex justify-center`}>
               <div className={`w-16 h-16 flex items-center justify-center rounded-xl p-2 transition-all duration-300 bg-white shadow-sm border border-slate-200`}>
                <img 
                  src="/logo1.png" 
                  alt="Signodes Logo" 
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;