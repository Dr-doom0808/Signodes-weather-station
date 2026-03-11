import React from 'react';
import { useNodes } from '../../context/NodesContext';
import { useDarkMode } from '../../context/DarkModeContext';
import SensorNodeInfo from './SensorNodeInfo';
import { AlertTriangle } from 'lucide-react';

const NodeInfoSection: React.FC = () => {
  const { nodes, loading, error } = useNodes();
  const { darkMode } = useDarkMode();

  if (loading) {
    return (
      <section className={`py-16 ${darkMode ? 'bg-primary-900' : 'bg-primary-50'}`}>
        <div className="container mx-auto px-4 text-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${darkMode ? 'border-signodes-400' : 'border-primary-600'} mx-auto`} />
          <p className={`mt-4 ${darkMode ? 'text-gray-200' : 'text-primary-700'}`}>Loading node information...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={`py-16 ${darkMode ? 'bg-primary-900' : 'bg-primary-50'}`}>
        <div className="container mx-auto px-4">
          <div className={`flex items-center justify-center gap-2 ${darkMode ? 'text-red-400' : 'text-primary-700'}`}>
            <AlertTriangle className="w-5 h-5" />
            <p>Error loading node information: {error.message}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-16 ${darkMode ? 'bg-gradient-to-br from-primary-950 to-primary-900' : 'bg-gradient-to-br from-gray-50 to-primary-50'}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className={`text-3xl md:text-4xl font-bold ${darkMode ? 'text-gray-100' : 'text-primary-900'} mb-4`}>Sensor Node Information</h2>
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-primary-600'} max-w-2xl mx-auto`}>
            Advanced sensor node details with comprehensive monitoring and technical specifications
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {nodes.slice(0, 3).map((node) => (
            <SensorNodeInfo key={node.id} node={node} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default NodeInfoSection;
