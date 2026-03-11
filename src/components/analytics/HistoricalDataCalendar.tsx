import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDarkMode } from '../../context/DarkModeContext';
import { fetchSensorData, fetchRecentSensorData, SensorData } from '../../services/googleSheetsService';

const HistoricalDataCalendar: React.FC = () => {
  const { darkMode } = useDarkMode();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  const [dailyData, setDailyData] = useState<Record<string, { aqi: number; temperature: number; humidity: number; count: number }>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const normalizeDateKey = (s: string | undefined): string | null => {
          if (!s) return null;
          const t = s.replace('T', ' ').replace('_', ' ').trim();
          const m1 = t.match(/(\d{4})[-\\/](\d{2})[-\\/](\d{2})/);
          if (m1) return `${m1[1]}-${m1[2]}-${m1[3]}`;
          const m2 = t.match(/(\d{2})[-\\/](\d{2})[-\\/](\d{4})/);
          if (m2) return `${m2[3]}-${m2[2]}-${m2[1]}`;
          const d = new Date(t);
          if (isNaN(d.getTime())) return null;
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${y}-${m}-${day}`;
        };

        let rows: SensorData[] = [];
        const uniq = new Map<string, SensorData>();
        
        // Try to fetch all historical data from the sheet
        try {
          console.log('[HistoricalDataCalendar] Attempting to fetch all historical data from Google Sheet...');
          const all = await fetchSensorData();
          console.log(`[HistoricalDataCalendar] Successfully received ${all.length} records from fetchSensorData()`);
          
          if (all.length > 0) {
            // Get date range of received data
            const dates = all.map(r => r.lastUpdated).filter(Boolean);
            if (dates.length > 0) {
              dates.sort();
              console.log(`[HistoricalDataCalendar] Date range: ${dates[0]} to ${dates[dates.length - 1]}`);
            }
            
            for (const r of all) {
              if (r?.lastUpdated) uniq.set(r.lastUpdated, r);
            }
          }
        } catch (e1) {
          console.warn('[HistoricalDataCalendar] Could not fetch all data, trying with larger range...');
          // Fallback: try to get very large recent window to capture all historical data
          try {
            const recent = await fetchRecentSensorData(50000);
            console.log(`[HistoricalDataCalendar] Loaded ${recent.length} records from fallback (readrange50000)`);
            for (const r of recent) {
              if (r?.lastUpdated) uniq.set(r.lastUpdated, r);
            }
          } catch (e2) {
            console.error('[HistoricalDataCalendar] Failed to fetch any data:', e2);
            throw e1; // Throw original error if both fail
          }
        }
        
        rows = Array.from(uniq.values());
        console.log(`[HistoricalDataCalendar] After deduplication: ${rows.length} unique records`);

        const agg: Record<string, { aqi: number; temperature: number; humidity: number; count: number }> = {};
        for (const r of rows) {
          const dateKey = normalizeDateKey(r.lastUpdated);
          if (!dateKey) continue;
          const aqi = Math.max(Number(r.aqi25val || 0), Number(r.aqi10val || 0));
          const temp = Number(r.temperature || 0);
          const hum = Number(r.humidity || 0);
          const cur = agg[dateKey] || { aqi: 0, temperature: 0, humidity: 0, count: 0 };
          agg[dateKey] = { aqi: cur.aqi + aqi, temperature: cur.temperature + temp, humidity: cur.humidity + hum, count: cur.count + 1 };
        }
        
        const averaged: Record<string, { aqi: number; temperature: number; humidity: number; count: number }> = {};
        Object.entries(agg).forEach(([k, v]) => {
          averaged[k] = {
            aqi: Math.round(v.aqi / v.count),
            temperature: Math.round((v.temperature / v.count) * 10) / 10,
            humidity: Math.round(v.humidity / v.count),
            count: v.count,
          };
        });
        
        const dateKeys = Object.keys(averaged).sort();
        console.log(`[HistoricalDataCalendar] Aggregated into ${dateKeys.length} days`);
        if (dateKeys.length > 0) {
          console.log(`[HistoricalDataCalendar] Calendar date range: ${dateKeys[0]} to ${dateKeys[dateKeys.length - 1]}`);
        }
        
        setDailyData(averaged);
      } catch (e: any) {
        setError(e?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getDataForDate = (date: string) => {
    return dailyData[date];
  };

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return 'bg-green-500';
    if (aqi <= 100) return 'bg-yellow-500';
    if (aqi <= 150) return 'bg-orange-500';
    if (aqi <= 200) return 'bg-red-500';
    if (aqi <= 300) return 'bg-purple-600';
    return 'bg-red-900';
  };
  
  const getAQITextColor = (aqi: number) => {
    if (darkMode) {
      if (aqi <= 50) return 'text-green-400';
      if (aqi <= 100) return 'text-yellow-400';
      if (aqi <= 150) return 'text-orange-400';
      if (aqi <= 200) return 'text-red-400';
      if (aqi <= 300) return 'text-purple-400';
      return 'text-red-300';
    } else {
      if (aqi <= 50) return 'text-green-700';
      if (aqi <= 100) return 'text-yellow-700';
      if (aqi <= 150) return 'text-orange-700';
      if (aqi <= 200) return 'text-red-700';
      if (aqi <= 300) return 'text-purple-800';
      return 'text-red-900';
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const renderCalendarDays = () => {
    const days: JSX.Element[] = [];

    if (viewMode === 'week') {
      const start = new Date(selectedDate);
      start.setDate(start.getDate() - start.getDay());
      for (let i = 0; i < 7; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        const dateString = date.toISOString().split('T')[0];
        const dayData = getDataForDate(dateString);
        const isSelected = selectedDate.toDateString() === date.toDateString();
        const isToday = new Date().toDateString() === date.toDateString();

        days.push(
          <div
            key={`w-${i}`}
            className={`h-20 border ${darkMode ? 'border-gray-700' : 'border-indigo-200'} rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
              isSelected ? `ring-2 ring-indigo-500 ${darkMode ? 'bg-blue-900/30' : 'bg-gradient-to-br from-indigo-100 to-blue-100'}` : `${darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gradient-to-br hover:from-indigo-50 hover:to-blue-50'}`
            } ${isToday ? `${darkMode ? 'bg-blue-900/50' : 'bg-gradient-to-br from-blue-100 to-indigo-100 border-indigo-300'}` : `${darkMode ? 'bg-gray-800/50' : 'bg-gradient-to-br from-white to-gray-50'}`}`}
            onClick={() => setSelectedDate(date)}
          >
            <div className="p-2 h-full flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-medium ${isToday ? `${darkMode ? 'text-blue-400' : 'text-indigo-700'}` : `${darkMode ? 'text-gray-200' : 'text-gray-800'}`}`}>
                  {date.getDate()}
                </span>
                {dayData && (
                  <div className={`w-3 h-3 rounded-full ${getAQIColor(dayData.aqi)}`}></div>
                )}
              </div>
              {dayData && (
                <div className={`flex-1 text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <div className={`font-medium ${getAQITextColor(dayData.aqi)}`}>AQI: {dayData.aqi}</div>
                  <div className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{dayData.temperature}°C</div>
                  <div className={`text-xs ${(dayData.aqi <= 100) ? (darkMode ? 'text-green-400' : 'text-green-600') : (darkMode ? 'text-red-400' : 'text-red-600')}`}>
                    {dayData.count} pts
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      }
      return days;
    }

    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-20"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayData = getDataForDate(dateString);
      const isSelected = selectedDate.toDateString() === new Date(dateString).toDateString();
      const isToday = new Date().toDateString() === new Date(dateString).toDateString();

      days.push(
        <div
          key={day}
          className={`h-20 border ${darkMode ? 'border-gray-700' : 'border-indigo-200'} rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
            isSelected ? `ring-2 ring-indigo-500 ${darkMode ? 'bg-blue-900/30' : 'bg-gradient-to-br from-indigo-100 to-blue-100'}` : `${darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gradient-to-br hover:from-indigo-50 hover:to-blue-50'}`
          } ${isToday ? `${darkMode ? 'bg-blue-900/50' : 'bg-gradient-to-br from-blue-100 to-indigo-100 border-indigo-300'}` : `${darkMode ? 'bg-gray-800/50' : 'bg-gradient-to-br from-white to-gray-50'}`}`}
          onClick={() => setSelectedDate(new Date(dateString))}
        >
          <div className="p-2 h-full flex flex-col">
            <div className="flex items-center justify-between mb-1">
              <span className={`text-sm font-medium ${isToday ? `${darkMode ? 'text-blue-400' : 'text-indigo-700'}` : `${darkMode ? 'text-gray-200' : 'text-gray-800'}`}`}>
                {day}
              </span>
              {dayData && (
                <div className={`w-3 h-3 rounded-full ${getAQIColor(dayData.aqi)}`}></div>
              )}
            </div>
            {dayData && (
              <div className={`flex-1 text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <div className={`font-medium ${getAQITextColor(dayData.aqi)}`}>AQI: {dayData.aqi}</div>
                <div className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{dayData.temperature}°C</div>
                <div className={`text-xs ${(dayData.aqi <= 100) ? (darkMode ? 'text-green-400' : 'text-green-600') : (darkMode ? 'text-red-400' : 'text-red-600')}`}>
                  {dayData.count} pts
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const selectedDayData = getDataForDate(selectedDate.toISOString().split('T')[0]);
  if (loading) {
    return (
      <section className={`py-16 ${darkMode ? 'bg-gray-900 text-white' : 'bg-indigo-50 text-gray-900'}`}>
        <div className="container mx-auto px-4 text-center">Loading historical data…</div>
      </section>
    );
  }
  if (error) {
    return (
      <section className={`py-16 ${darkMode ? 'bg-gray-900 text-white' : 'bg-indigo-50 text-gray-900'}`}>
        <div className="container mx-auto px-4 text-center">Error: {error}</div>
      </section>
    );
  }

  return (
    <section className={`py-16 ${darkMode ? 'bg-gradient-to-br from-gray-900 to-blue-900 text-white' : 'bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 text-gray-900'}`}>
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className={`inline-flex items-center justify-center w-16 h-16 ${darkMode ? 'bg-blue-800/50' : 'bg-gradient-to-br from-blue-500 to-indigo-600'} rounded-full mb-4 shadow-glow`}>
              <Calendar className={`w-8 h-8 ${darkMode ? 'text-blue-400' : 'text-white'}`} />
            </div>
            <h2 className={`text-3xl md:text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
              Air Quality Calendar
            </h2>
            <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
              Explore historical air quality data with our enhanced interactive calendar interface
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Calendar Section */}
            <div className="lg:col-span-2">
              <div className={`${darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/90 border-indigo-200'} backdrop-blur-sm border rounded-2xl shadow-xl p-6`}>
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setViewMode('month')}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          viewMode === 'month' ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md' : `${darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-700 hover:from-indigo-200 hover:to-blue-200'}`
                        }`}
                      >
                        Month
                      </button>
                      <button
                        onClick={() => setViewMode('week')}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          viewMode === 'week' ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md' : `${darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-700 hover:from-indigo-200 hover:to-blue-200'}`
                        }`}
                      >
                        Week
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => navigateMonth('prev')}
                      className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-indigo-100'}`}
                    >
                      <ChevronLeft className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                    </button>
                    <button
                      onClick={() => navigateMonth('next')}
                      className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-indigo-100'}`}
                    >
                      <ChevronRight className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                    </button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="mb-6">
                  {/* Day Headers */}
                  <div className="grid grid-cols-7 gap-2 mb-2">
                    {dayNames.map(day => (
                      <div key={day} className={`text-center text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} py-2`}>
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  {/* Calendar Days */}
                  <div className="grid grid-cols-7 gap-2">
                    {renderCalendarDays()}
                  </div>
                </div>

                {/* Legend */}
                <div className={`flex items-center justify-between pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-indigo-200'}`}>
                  <div className="flex flex-wrap gap-3 text-sm">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Good (0-50)</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                      <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Moderate (51-100)</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                      <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Unhealthy (101-150)</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                      <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Very Unhealthy (151-200)</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-purple-600 rounded-full mr-2"></div>
                      <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Severe (201-300)</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-900 rounded-full mr-2"></div>
                      <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Hazardous (300+)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Panel */}
            <div className="space-y-6">
              {/* Selected Date Info */}
              <div className={`${darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/90 border-indigo-200'} backdrop-blur-sm border rounded-2xl shadow-xl p-6`}>
                <h4 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h4>
                
                {selectedDayData ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className={`${darkMode ? 'bg-gradient-to-r from-blue-900/50 to-blue-800/50 border-blue-700' : 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-300'} p-4 rounded-lg border`}>
                        <div className={`text-sm mb-1 ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>AQI</div>
                        <div className={`text-2xl font-bold ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>{selectedDayData.aqi}</div>
                      </div>
                      <div className={`${darkMode ? 'bg-gradient-to-r from-red-900/50 to-red-800/50 border-red-700' : 'bg-gradient-to-r from-red-50 to-red-100 border-red-300'} p-4 rounded-lg border`}>
                        <div className={`text-sm mb-1 ${darkMode ? 'text-red-400' : 'text-red-700'}`}>Temperature</div>
                        <div className={`text-2xl font-bold ${darkMode ? 'text-red-300' : 'text-red-800'}`}>{selectedDayData.temperature}°C</div>
                      </div>
                    </div>
                    
                    <div className={`${darkMode ? 'bg-gradient-to-r from-green-900/50 to-green-800/50 border-green-700' : 'bg-gradient-to-r from-green-50 to-green-100 border-green-300'} p-4 rounded-lg border`}>
                      <div className={`text-sm mb-1 ${darkMode ? 'text-green-400' : 'text-green-700'}`}>Humidity</div>
                      <div className={`text-2xl font-bold ${darkMode ? 'text-green-300' : 'text-green-800'}`}>{selectedDayData.humidity}%</div>
                    </div>
                    
                    <div className={`pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-indigo-200'}`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Data Points</span>
                        <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{selectedDayData.count}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Data Quality</span>
                        <span className={`font-medium ${(selectedDayData.aqi <= 100) ? (darkMode ? 'text-green-400' : 'text-green-600') : (darkMode ? 'text-red-400' : 'text-red-600')}`}>
                          {(selectedDayData.aqi <= 100) ? 'Good' : 'Poor'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className={`mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>No data available</div>
                    <div className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Select a date with data to view details</div>
                  </div>
                )}
              </div>

              {/* Empty space as per redesign */}

              {/* Monthly Summary */}
              <div className={`${darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/90 border-indigo-200'} backdrop-blur-sm border rounded-2xl shadow-xl p-6`}>
                <h4 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Monthly Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Avg AQI</span>
                    <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>67</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Avg Temperature</span>
                    <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>28°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Data Coverage</span>
                    <span className={`font-medium ${darkMode ? 'text-green-400' : 'text-green-600'}`}>94%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Records</span>
                    <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>2,847</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HistoricalDataCalendar;