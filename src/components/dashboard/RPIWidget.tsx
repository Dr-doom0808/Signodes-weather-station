import React from 'react';
import { motion } from 'framer-motion';
import { useDarkMode } from '../../context/DarkModeContext';
import { calculateRPI, CO_CLEAN_AIR_BASELINE } from '../../utils/sensorCalibration';

interface RPIWidgetProps {
  sensorValue: number | null | undefined;
}

const RPIWidget: React.FC<RPIWidgetProps> = ({ sensorValue }) => {
  const { darkMode } = useDarkMode();

  if (sensorValue === null || sensorValue === undefined || sensorValue === 0) {
    return null;
  }

  const result = calculateRPI(Number(sensorValue));
  const pct = Math.min(100, (result.rpi / 4) * 100); // bar fills at RPI=4

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`mt-3 rounded-xl border p-4 ${
        darkMode ? `${result.color} ${result.borderColor}` : 'bg-white border-gray-200 shadow-sm'
      }`}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {/* Animated status dot */}
          <span className={`relative flex h-2.5 w-2.5`}>
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${result.dotColor}`}
            />
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${result.dotColor}`} />
          </span>
          <span
            className={`text-xs font-semibold uppercase tracking-widest ${
              darkMode ? result.textColor : 'text-gray-500'
            }`}
          >
            Relative Pollution Index
          </span>
        </div>
        {/* RPI Value badge */}
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            darkMode ? `${result.color} ${result.textColor} border ${result.borderColor}` : 'bg-gray-100 text-gray-700'
          }`}
        >
          RPI {result.rpi.toFixed(2)}
        </span>
      </div>

      {/* Sensor value + status */}
      <div className="flex items-baseline gap-2 mb-3">
        <span
          className={`text-2xl font-bold tracking-tight ${
            darkMode ? result.textColor : 'text-gray-900'
          }`}
        >
          {result.rpi.toFixed(2)}
        </span>
        <span className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          / baseline {CO_CLEAN_AIR_BASELINE}
        </span>
      </div>

      {/* Category label */}
      <div
        className={`text-sm font-semibold mb-3 ${
          darkMode ? result.textColor : 'text-gray-800'
        }`}
      >
        {result.category}
      </div>

      {/* Progress bar */}
      <div
        className={`w-full h-2 rounded-full ${
          darkMode ? 'bg-gray-700' : 'bg-gray-200'
        } overflow-hidden`}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className={`h-2 rounded-full ${result.dotColor}`}
        />
      </div>

      {/* Scale labels */}
      <div
        className={`flex justify-between mt-1.5 text-[10px] ${
          darkMode ? 'text-gray-500' : 'text-gray-400'
        }`}
      >
        <span>Clean</span>
        <span>Normal</span>
        <span>Moderate</span>
        <span>High</span>
        <span>Danger</span>
      </div>

      {/* Raw sensor value */}
      <div
        className={`mt-3 pt-3 border-t text-xs ${
          darkMode ? 'border-gray-700 text-gray-400' : 'border-gray-100 text-gray-500'
        } flex justify-between`}
      >
        <span>CO Sensor Reading</span>
        <span className="font-semibold">{Number(sensorValue).toFixed(2)}</span>
      </div>
    </motion.div>
  );
};

export default RPIWidget;
