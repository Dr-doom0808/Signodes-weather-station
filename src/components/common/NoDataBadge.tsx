import React from 'react';
import { useDarkMode } from '../../context/DarkModeContext';

const NoDataBadge: React.FC = () => {
  const { darkMode } = useDarkMode();
  return (
    <span className={`inline-flex px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded items-center justify-center ${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'}`}>
      No Data
    </span>
  );
};

export default NoDataBadge;
