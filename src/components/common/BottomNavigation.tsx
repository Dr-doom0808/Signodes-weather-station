import React from 'react';
import { Activity, MapPin, Radio, Cpu } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

interface BottomNavigationProps {
  darkMode?: boolean;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ darkMode = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

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
  };

  return (
    <div className={`md:hidden fixed bottom-0 left-0 right-0 z-50 border-t pb-safe pt-2 px-4 shadow-lg backdrop-blur-xl saturate-150 transition-colors duration-300 ${darkMode ? 'bg-primary-900/80 border-primary-800 text-gray-400' : 'bg-white/80 border-gray-200 text-gray-500'
      }`}>
      <div className="flex justify-between items-center h-16 max-w-md mx-auto">
        <button
          onClick={() => handleNavigation('/', 'sensor-data')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${darkMode ? 'hover:text-signodes-400' : 'hover:text-signodes-600'}`}
        >
          <Activity className="w-6 h-6" />
          <span className="text-[10px] font-medium">Data</span>
        </button>

        <button
          onClick={() => handleNavigation('/', 'campus-overview')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${darkMode ? 'hover:text-signodes-400' : 'hover:text-signodes-600'}`}
        >
          <MapPin className="w-6 h-6" />
          <span className="text-[10px] font-medium">Map</span>
        </button>

        <button
          onClick={() => handleNavigation('/', 'network-status')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${darkMode ? 'hover:text-signodes-400' : 'hover:text-signodes-600'}`}
        >
          <Radio className="w-6 h-6" />
          <span className="text-[10px] font-medium">Network</span>
        </button>

        <button
          onClick={() => handleNavigation('/', 'deployment')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${darkMode ? 'hover:text-signodes-400' : 'hover:text-signodes-600'}`}
        >
          <Cpu className="w-6 h-6" />
          <span className="text-[10px] font-medium">Specs</span>
        </button>
      </div>
    </div>
  );
};

export default BottomNavigation;
