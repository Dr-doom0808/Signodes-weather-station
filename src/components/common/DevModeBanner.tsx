/**
 * Development Mode Banner
 * Shows a notice when running in development with mock data
 */

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface DevModeBannerProps {
  useMockData: boolean;
}

export const DevModeBanner: React.FC<DevModeBannerProps> = ({ useMockData }) => {
  if (!useMockData || import.meta.env.MODE !== 'development') {
    return null;
  }

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 mb-4">
      <div className="flex items-start">
        <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0 mr-3" />
        <div>
          <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
            Development Mode
          </h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
            This application is running with mock sensor data. Real data will be displayed once connected to the backend.
          </p>
          <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
            💡 Tip: See DEVELOPMENT.md for setup instructions
          </p>
        </div>
      </div>
    </div>
  );
};

export default DevModeBanner;
