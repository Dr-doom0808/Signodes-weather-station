import React from 'react';
import { useNodes } from '../../context/NodesContext';
import { Wifi, WifiOff, Activity, Server, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

const NetworkStatus: React.FC = () => {
  const { nodes } = useNodes();
  
  // Network configuration - 3 total nodes, only 1 active (Node A)
  const networkNodes = [
    {
      id: 'node-a',
      name: 'Node A',
      location: 'Block A - Main Building',
      status: 'active',
      isOnline: true,
      lastSeen: 'Just now',
      signalStrength: 95,
      dataPoints: nodes.length > 0 ? 1247 : 0,
      uptime: '99.8%'
    },
    {
      id: 'node-b',
      name: 'Node B',
      location: 'Block B - Library',
      status: 'inactive',
      isOnline: false,
      lastSeen: '2 days ago',
      signalStrength: 0,
      dataPoints: 0,
      uptime: '0%'
    },
    {
      id: 'node-c',
      name: 'Node C',
      location: 'Block D - Cafeteria',
      status: 'inactive',
      isOnline: false,
      lastSeen: '5 days ago',
      signalStrength: 0,
      dataPoints: 0,
      uptime: '0%'
    }
  ];

  const activeNodes = networkNodes.filter(node => node.isOnline).length;
  const totalNodes = networkNodes.length;

  return (
    <section 
      className="py-12 sm:py-16 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950"
      role="region"
      aria-labelledby="network-status-heading"
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4 shadow-soft transition-all duration-300 hover:shadow-glow">
              <Server className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 
              id="network-status-heading"
              className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors"
            >
              Network Status
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto transition-colors">
              Real-time monitoring of sensor network connectivity and performance
            </p>
          </div>

          {/* Network Overview Cards */}
          <div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12"
            role="group"
            aria-label="Network overview statistics"
          >
            {/* Active Nodes */}
            <div 
              className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-5 sm:p-6 rounded-xl border border-green-200 dark:border-green-800 shadow-soft hover:shadow-glow transition-all duration-300 animate-fade-in"
              role="status"
              aria-label="Active nodes status"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-700">{activeNodes}</div>
                  <div className="text-green-600 text-sm font-medium">Active Nodes</div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <span className="text-green-700 text-sm">Online & Transmitting</span>
              </div>
            </div>

            {/* Total Nodes */}
            <div 
              className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-5 sm:p-6 rounded-xl border border-blue-200 dark:border-blue-800 shadow-soft hover:shadow-glow transition-all duration-300 animate-fade-in animation-delay-100"
              role="status"
              aria-label="Total nodes status"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500 rounded-lg">
                  <Server className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-700">{totalNodes}</div>
                  <div className="text-blue-600 text-sm font-medium">Total Nodes</div>
                </div>
              </div>
              <div className="text-blue-700 text-sm">Deployed Across Campus</div>
            </div>

            {/* Network Health */}
            <div 
              className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-5 sm:p-6 rounded-xl border border-purple-200 dark:border-purple-800 shadow-soft hover:shadow-glow transition-all duration-300 animate-fade-in animation-delay-200"
              role="status"
              aria-label="Network health status"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500 rounded-lg">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-purple-700">33%</div>
                  <div className="text-purple-600 text-sm font-medium">Network Health</div>
                </div>
              </div>
              <div className="text-purple-700 text-sm">Partial Coverage Active</div>
            </div>

            {/* Data Throughput */}
            <div 
              className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 p-5 sm:p-6 rounded-xl border border-orange-200 dark:border-orange-800 shadow-soft hover:shadow-glow transition-all duration-300 animate-fade-in animation-delay-300"
              role="status"
              aria-label="Data throughput status"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-500 rounded-lg">
                  <Wifi className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-orange-700">1.2k</div>
                  <div className="text-orange-600 text-sm font-medium">Data Points/Day</div>
                </div>
              </div>
              <div className="text-orange-700 text-sm">From Active Node</div>
            </div>
          </div>

          {/* Individual Node Status */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft hover:shadow-glow transition-all duration-300 p-6 sm:p-8 animate-slide-up animation-delay-200">
            <h3 
              id="node-status-details-heading" 
              className="text-2xl font-bold text-gray-900 dark:text-white mb-6 transition-colors"
            >
              Node Status Details
            </h3>
            
            <div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
              role="list"
              aria-labelledby="node-status-details-heading"
            >
              {networkNodes.map((node) => (
                <div 
                  key={node.id}
                  className={`p-5 sm:p-6 rounded-xl border-2 shadow-soft hover:shadow-glow transition-all duration-300 ${
                    node.isOnline 
                      ? 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700' 
                      : 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700'
                  }`}
                  role="listitem"
                  aria-label={`${node.name} status`}
                  tabIndex={0}
                >
                  {/* Node Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div 
                        className={`p-2 rounded-lg ${node.isOnline ? 'bg-green-500 dark:bg-green-600' : 'bg-red-500 dark:bg-red-600'}`}
                        aria-hidden="true"
                      >
                        {node.isOnline ? (
                          <Wifi className="w-5 h-5 text-white" />
                        ) : (
                          <WifiOff className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div className="ml-3">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors">{node.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors">{node.location}</p>
                      </div>
                    </div>
                    <div 
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        node.isOnline 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                      }`}
                      aria-live="polite"
                    >
                      {node.status.toUpperCase()}
                    </div>
                  </div>

                  {/* Node Metrics */}
                  <div className="space-y-4" role="group" aria-label={`${node.name} metrics`}>
                    {/* Signal Strength */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-300 transition-colors">Signal Strength</span>
                        <span className={`font-medium ${node.isOnline ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} transition-colors`}>
                          {node.signalStrength}%
                        </span>
                      </div>
                      <div 
                        className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 transition-colors"
                        role="progressbar"
                        aria-valuenow={node.signalStrength}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label="Signal strength percentage"
                      >
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            node.isOnline ? 'bg-green-500 dark:bg-green-600' : 'bg-red-500 dark:bg-red-600'
                          }`}
                          style={{ width: `${node.signalStrength}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Data Points */}
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300 transition-colors">Data Points Today</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white transition-colors">{node.dataPoints.toLocaleString()}</span>
                    </div>

                    {/* Uptime */}
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300 transition-colors">Uptime (30d)</span>
                      <span className={`text-sm font-medium ${node.isOnline ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} transition-colors`}>
                        {node.uptime}
                      </span>
                    </div>

                    {/* Last Seen */}
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300 transition-colors">Last Seen</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white transition-colors">{node.lastSeen}</span>
                    </div>

                    {/* Status Indicator */}
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700 transition-colors">
                      <div className="flex items-center">
                        <div 
                          className={`w-2 h-2 rounded-full mr-2 ${
                            node.isOnline ? 'bg-green-500 dark:bg-green-400 animate-pulse' : 'bg-red-500 dark:bg-red-400'
                          }`}
                          aria-hidden="true"
                        ></div>
                        <span 
                          className="text-xs text-gray-600 dark:text-gray-300 transition-colors"
                          aria-live="polite"
                        >
                          {node.isOnline ? 'Transmitting live data' : 'Connection lost'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Network Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 transition-colors">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div 
                  className="flex items-center text-sm text-gray-600 dark:text-gray-300 transition-colors"
                  role="status"
                  aria-live="polite"
                >
                  <AlertCircle className="w-4 h-4 mr-2 text-yellow-500 dark:text-yellow-400" />
                  <span>2 nodes offline - Network coverage reduced to 33%</span>
                </div>
                <div className="flex gap-3">
                  <button 
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition-all duration-300 text-sm font-medium shadow-soft hover:shadow-glow"
                    aria-label="Refresh network status"
                  >
                    <span className="flex items-center">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh Status
                    </span>
                  </button>
                  <button 
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition-all duration-300 text-sm font-medium shadow-soft hover:shadow-glow"
                    aria-label="Run network diagnostics"
                  >
                    Network Diagnostics
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NetworkStatus;
