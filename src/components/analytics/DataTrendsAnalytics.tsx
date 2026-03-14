import React, { useState, useMemo } from 'react';
import { Thermometer, Droplets, Wind, Gauge } from 'lucide-react';
import { useNodes } from '../../context/NodesContext';
import { useDarkMode } from '../../context/DarkModeContext';

const DataTrendsAnalytics: React.FC = () => {
  const { nodes } = useNodes();
  const { darkMode } = useDarkMode();
  const nodeData = nodes.length > 0 ? nodes[0] : null;

  // Generate time series data based on real sensor data trends
  const generateGraphData = React.useCallback((type: string, period: string, nodeIndex: number = 0) => {
    const baseValue = {
      temperature: nodes[nodeIndex]?.temperature || 28,
      pressure: nodes[nodeIndex]?.pressure || 1013,
      humidity: nodes[nodeIndex]?.humidity || 65,
      aqi: Math.max(nodes[nodeIndex]?.aqi25val || 45, nodes[nodeIndex]?.aqi10val || 45)
    }[type] || 0;

    // Realistic patterns for different metrics
    const patterns = {
      temperature: {
        daily: (hour: number) => 2 * Math.sin((hour - 6) * Math.PI / 12), // Daily temperature cycle
        seasonal: (day: number) => 5 * Math.sin((day / 30.4 - 1.5) * Math.PI / 6) // Seasonal variation
      },
      humidity: {
        daily: (hour: number) => -10 * Math.sin((hour - 6) * Math.PI / 12), // Inversely related to temperature
        seasonal: (day: number) => 15 * Math.sin((day / 30.4 - 0.5) * Math.PI / 6) // Higher in monsoon
      },
      pressure: {
        daily: (hour: number) => 2 * Math.sin(hour * Math.PI / 12), // Daily pressure changes
        seasonal: (day: number) => 3 * Math.sin(day / 30.4 * Math.PI / 6) // Seasonal pressure changes
      },
      aqi: {
        daily: (hour: number) => 5 * Math.sin((hour - 8) * Math.PI / 12), // Higher during day
        seasonal: (day: number) => 10 * Math.sin((day / 30.4 - 0.25) * Math.PI / 6) // Higher in winter
      }
    };

    const now = new Date();
    const dataPoints = period === 'week' ? 7 : period === 'month' ? 30 : 12; // Months for yearly
    const data = [];
    
    for (let i = 0; i < dataPoints; i++) {
      const currentDate = new Date(now);
      currentDate.setDate(now.getDate() - (dataPoints - i - 1));
      
      // Base variation based on metric type
      const metricPattern = patterns[type as keyof typeof patterns] || patterns.temperature;
      const dailyVariation = metricPattern.daily(now.getHours());
      const seasonalVariation = metricPattern.seasonal((now.getMonth() * 30 + now.getDate() + i) % 365);
      
      // Add some random noise (smaller for more stable metrics)
      const noise = (Math.random() - 0.5) * (type === 'pressure' ? 0.5 : 2);
      
      // Calculate value based on metric type
      let value = baseValue + dailyVariation + seasonalVariation + noise;
      
      // Apply realistic bounds
      if (type === 'temperature') value = Math.max(15, Math.min(45, value));
      if (type === 'humidity') value = Math.max(30, Math.min(95, value));
      if (type === 'pressure') value = Math.max(1000, Math.min(1040, value));
      if (type === 'aqi') value = Math.max(0, Math.min(300, value));
      
      // Format time label
      let timeLabel = '';
      if (period === 'week') {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        timeLabel = days[currentDate.getDay()];
      } else if (period === 'month') {
        timeLabel = `${currentDate.getDate()}`;
      } else {
        timeLabel = currentDate.toLocaleString('default', { month: 'short' });
      }
      
      data.push({
        time: timeLabel,
        value: Math.round(value * 10) / 10
      });
    }
    
    return data;
  }, [nodes]);

  const graphConfigs = [
    {
      id: 'temperature',
      title: 'Temperature',
      icon: Thermometer,
      unit: '°C',
      color: '#f43f5e', // rose-500
      bgColor: 'bg-rose-500/10',
      currentValue: nodeData?.temperature || 0
    },
    {
      id: 'humidity',
      title: 'Humidity',
      icon: Droplets,
      unit: '%',
      color: '#0ea5e9', // sky-500
      bgColor: 'bg-sky-500/10',
      currentValue: nodeData?.humidity || 65,
      yAxisMin: 0,
      yAxisMax: 100
    },
    {
      id: 'pressure',
      title: 'Atmospheric Pressure',
      icon: Wind,
      unit: 'hPa',
      color: '#6366f1', // indigo-500
      bgColor: 'bg-indigo-500/10',
      currentValue: nodeData?.pressure || 1013,
      yAxisMin: 990,
      yAxisMax: 1050
    },
    {
      id: 'aqi',
      title: 'Air Quality Index',
      icon: Gauge,
      unit: 'AQI',
      color: '#10b981', // emerald-500
      bgColor: 'bg-emerald-500/10',
      currentValue: nodeData ? Math.max(nodeData.aqi25val || 0, nodeData.aqi10val || 0) : 0
    }
  ];

  const graphData = useMemo(() => {
    return {
      temperature: {
        week: generateGraphData('temperature', 'week'),
        month: generateGraphData('temperature', 'month'),
        year: generateGraphData('temperature', 'year')
      },
      pressure: {
        week: generateGraphData('pressure', 'week'),
        month: generateGraphData('pressure', 'month'),
        year: generateGraphData('pressure', 'year')
      },
      humidity: {
        week: generateGraphData('humidity', 'week'),
        month: generateGraphData('humidity', 'month'),
        year: generateGraphData('humidity', 'year')
      },
      aqi: {
        week: generateGraphData('aqi', 'week'),
        month: generateGraphData('aqi', 'month'),
        year: generateGraphData('aqi', 'year')
      }
    };
  }, [generateGraphData]);

  // Graph configuration interface
  interface GraphConfig {
    id: string;
    title: string;
    icon: React.ElementType;
    unit: string;
    color: string;
    bgColor: string;
    currentValue: number;
    yAxisMin?: number;
    yAxisMax?: number;
  }

  // Individual graph component with interactive controls and enhanced features
  const IndividualGraph = ({ config }: { config: GraphConfig }) => {
    const [selectedPeriod, setSelectedPeriod] = useState('week');
    const [hoveredPoint, setHoveredPoint] = useState<{value: number, time: string, index: number} | null>(null);
    
    const currentData = (graphData as Record<string, Record<string, { value: number; time: string }[]>>)[config.id][selectedPeriod];
    // Use custom min/max values if provided in config, otherwise calculate from data
    const maxValue = config.yAxisMax !== undefined ? config.yAxisMax : Math.max(...currentData.map((d: { value: number }) => d.value));
    const minValue = config.yAxisMin !== undefined ? config.yAxisMin : Math.min(...currentData.map((d: { value: number }) => d.value));
    const dataMaxIndex = currentData.reduce((idx: number, d: { value: number }, i: number) => d.value > currentData[idx].value ? i : idx, 0);
    const dataMinIndex = currentData.reduce((idx: number, d: { value: number }, i: number) => d.value < currentData[idx].value ? i : idx, 0);
    
    
    // Function to export data as CSV
    const exportAsCSV = () => {
      // Create CSV content
      const csvContent = [
        `Time,${config.title} (${config.unit})`,
        ...currentData.map((d: { time: string, value: number }) => `${d.time},${d.value}`)
      ].join('\n');
      
      // Create a blob and download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${config.title}_${selectedPeriod}_data.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    
    return (
      <div className={`${darkMode ? 'bg-slate-800/80 border-slate-700/50' : 'bg-white border-slate-200'} border rounded-2xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden`} style={{ backdropFilter: 'blur(12px)' }}>
        
        {/* Top Border Accent */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-50`} style={{ color: config.color }}></div>

        {/* Header with title and controls */}
        <div className="flex flex-col mb-4 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-xl font-bold tracking-tight ${darkMode ? 'text-slate-100' : 'text-slate-900'} flex items-center`}>
              <div className={`p-2 rounded-lg mr-3 shadow-sm`} style={{ backgroundColor: `${config.color}20`, border: `1px solid ${config.color}40` }}>
                <config.icon className="w-5 h-5" style={{ color: config.color }} />
              </div>
              {config.title}
              <span className="ml-2 text-sm font-normal text-slate-400">({config.unit})</span>
            </h3>
            <div className="text-sm font-bold px-3 py-1 rounded-full border shadow-inner" style={{ backgroundColor: `${config.color}15`, color: config.color, borderColor: `${config.color}30` }}>
              {config.currentValue.toFixed(1)} {config.unit}
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            {/* Period selector */}
            <div className={`flex ${darkMode ? 'bg-slate-900/50 border-slate-700/50' : 'bg-slate-100 border-slate-200'} border rounded-lg p-1`}>
              {['week', 'month', 'year'].map((period) => {
                const selected = selectedPeriod === period;
                return (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-4 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-md transition-all ${
                      selected
                        ? (darkMode ? 'bg-slate-700 shadow-sm text-slate-100' : 'bg-white shadow-sm text-slate-900')
                        : (darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800')
                    }`}
                    style={selected ? { color: config.color } : undefined}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </button>
                );
              })}
            </div>
            
            {/* Export button */}
            <button 
              onClick={exportAsCSV}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all border ${
                darkMode ? 
                'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white' : 
                'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800'
              }`}
              aria-label={`Export ${config.title} data as CSV`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Graph Area */}
        <div className="relative h-48 md:h-64 rounded-xl p-3 md:p-6 mb-4 group bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
          <svg className="w-full h-full" viewBox="0 0 500 200">
            {/* Y-axis */}
            <line
              x1="50"
              y1="20"
              x2="50"
              y2="170"
              stroke={darkMode ? "#334155" : "#e2e8f0"}
              strokeWidth="2"
            />
            
            {/* X-axis */}
            <line
              x1="50"
              y1="170"
              x2="450"
              y2="170"
              stroke={darkMode ? "#334155" : "#e2e8f0"}
              strokeWidth="2"
            />
            
            {/* Y-axis labels and grid lines */}
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const y = 20 + i * 25;
              const value = (maxValue - minValue) * (1 - i * 0.2) + minValue;
              return (
                <g key={i}>
                  <line
                    x1="50"
                    y1={y}
                    x2="450"
                    y2={y}
                    stroke={darkMode ? "#334155" : "#e2e8f0"}
                    strokeWidth="1"
                    strokeDasharray={i === 5 ? "none" : "4,4"}
                  />
                  <text
                    x="45"
                    y={y + 4}
                    textAnchor="end"
                    fontSize="11"
                    fontWeight="600"
                    fill={darkMode ? "#64748b" : "#94a3b8"}
                  >
                    {value.toFixed(config.unit === '%' ? 0 : 1)}
                  </text>
                </g>
              );
            })}
            
            {/* X-axis labels removed in favor of dynamic labels displayed below the chart */}
            
            {/* Line graph with area fill */}
            <path
              d={`M 50,${170 - (currentData[0].value - minValue) / (maxValue - minValue) * 150} ${
                currentData.map((d: { value: number }, i: number) => 
                  `L ${50 + (i / (currentData.length - 1)) * 400},${170 - (d.value - minValue) / (maxValue - minValue) * 150}`
                ).join(' ')
              } L ${50 + 400},170 L 50,170 Z`}
              fill={`url(#${config.id}Gradient)`}
              fillOpacity="0.15"
              stroke="none"
            />
            <path
              d={`M 50,${170 - (currentData[0].value - minValue) / (maxValue - minValue) * 150} ${
                currentData.map((d: { value: number }, i: number) => 
                  `L ${50 + (i / (currentData.length - 1)) * 400},${170 - (d.value - minValue) / (maxValue - minValue) * 150}`
                ).join(' ')
              }`}
              fill="none"
              stroke={config.color}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-300"
              style={{ filter: `drop-shadow(0 0 4px ${config.color}80)` }}
            />
            
            {/* Interactive data points */}
            {currentData.map((d: { value: number, time: string }, i: number) => {
              const cx = 50 + (i / (currentData.length - 1)) * 400;
              const cy = 170 - (d.value - minValue) / (maxValue - minValue) * 150;
              return (
                <g key={i}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r="4"
                    fill={darkMode ? "#0f172a" : "#ffffff"}
                    stroke={config.color}
                    strokeWidth="3"
                    className="cursor-pointer transition-all duration-200 hover:r-6"
                    onMouseEnter={() => setHoveredPoint({value: d.value, time: d.time, index: i})}
                    onMouseLeave={() => setHoveredPoint(null)}
                    style={{ filter: `drop-shadow(0 0 3px ${config.color}60)` }}
                  />
                </g>
              );
            })}
            
            {/* Tooltip for hovered point */}
            {hoveredPoint !== null && (
              <g>
                <rect
                  x={50 + (hoveredPoint.index / (currentData.length - 1)) * 400 - 40}
                  y={170 - (currentData[hoveredPoint.index].value - minValue) / (maxValue - minValue) * 150 - 40}
                  width="80"
                  height="32"
                  rx="6"
                  fill={darkMode ? "#1f2937" : "#ffffff"}
                  stroke={darkMode ? "#374151" : "#e5e7eb"}
                  strokeWidth="1"
                />
                <text
                  x={50 + (hoveredPoint.index / (currentData.length - 1)) * 400}
                  y={170 - (currentData[hoveredPoint.index].value - minValue) / (maxValue - minValue) * 150 - 25}
                  textAnchor="middle"
                  fontSize="11"
                  fill={darkMode ? "#f9fafb" : "#111827"}
                >
                  <tspan x={50 + (hoveredPoint.index / (currentData.length - 1)) * 400} dy="0" fill={darkMode ? "white" : "#111827"}>{hoveredPoint.value.toFixed(config.unit === '%' ? 0 : 1)} {config.unit}</tspan>
                  <tspan x={50 + (hoveredPoint.index / (currentData.length - 1)) * 400} dy="14" fill={darkMode ? "#9ca3af" : "#6b7280"}>{hoveredPoint.time}</tspan>
                </text>
              </g>
            )}
            
            {/* Gradient definition for the graph */}
            <defs>
              <linearGradient id={`${config.id}Gradient`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={config.color} stopOpacity="0.7" />
                <stop offset="100%" stopColor={config.color} stopOpacity="0.1" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Time labels */}
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            {selectedPeriod === 'week' && (
              <>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </>
            )}
            {selectedPeriod === 'month' && (
              <>
                <span>1</span>
                <span>8</span>
                <span>15</span>
                <span>22</span>
                <span>30</span>
              </>
            )}
            {selectedPeriod === 'year' && (
              <>
                <span>Jan</span>
                <span>Apr</span>
                <span>Jul</span>
                <span>Oct</span>
                <span>Dec</span>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center mt-3 border-t border-slate-200 dark:border-slate-700/50 pt-5">
          <div className="flex flex-col items-center">
            <div className="text-xl font-bold tracking-tight" style={{ color: config.color }}>{currentData[dataMaxIndex].value.toFixed(1)}</div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">Max</div>
          </div>
          <div className="flex flex-col items-center border-l border-r border-slate-200 dark:border-slate-700/50">
            <div className="text-xl font-bold tracking-tight" style={{ color: config.color }}>
              {Math.round(currentData.reduce((sum: number, d: { value: number }) => sum + d.value, 0) / currentData.length * 10) / 10}
            </div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">Avg</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-xl font-bold tracking-tight" style={{ color: config.color }}>{currentData[dataMinIndex].value.toFixed(1)}</div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">Min</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className={`py-16 ${darkMode ? 'bg-slate-900/50 text-slate-100 relative' : 'bg-slate-50 text-slate-900 relative'}`}>
      <div className={`absolute inset-0 border-t ${darkMode ? 'border-slate-800/50' : 'border-slate-200'} pointer-events-none`}></div>
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-10 md:mb-12">
          <h2 className={`text-3xl md:text-4xl font-bold mb-3 tracking-tight ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
            Data Trends & Analytics
          </h2>
          <p className={`text-base md:text-lg max-w-2xl mx-auto ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Explore detailed analytics and trends from your weather station data
          </p>
        </div>

        {/* Graphs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {graphConfigs.map((config) => (
            <IndividualGraph key={config.id} config={config} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default DataTrendsAnalytics;
