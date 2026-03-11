import React from 'react';
import EnvironmentalDashboard from '../components/dashboard/EnvironmentalDashboard';
import AirQualityBar from '../components/dashboard/AirQualityBar';
import CampusMap from '../components/map/CampusMap';
import DataTrendsAnalytics from '../components/analytics/DataTrendsAnalytics';
import HistoricalDataCalendar from '../components/analytics/HistoricalDataCalendar';
import DeploymentSpecification from '../components/specs/DeploymentSpecification';
import NodeGrid from '../components/dashboard/NodeGrid';
import { useDarkMode } from '../context/DarkModeContext';

const Home: React.FC = () => {
    const { darkMode } = useDarkMode();
    
    return (
        <div className={`${darkMode ? 'bg-primary-950 text-gray-100' : 'bg-primary-50 text-gray-900'} transition-colors duration-300`}>
            {/* 1. Environmental Dashboard - Only 5 Parameters */}
            <EnvironmentalDashboard />

            {/* 2. Air Quality Colored Bar with Temperature Conditions */}
            <AirQualityBar />

            {/* 3. Campus Map - Node A Active, B&C Inactive */}
            <CampusMap />

            {/* 4. Interactive Node Grid */}
            <NodeGrid />

            {/* 5. Data Trends & Analytics - 4 Maps: AQI, Temperature, Humidity, Pressure */}
            <DataTrendsAnalytics />

            {/* 6. Historical Data Calendar - Enhanced UI */}
            <HistoricalDataCalendar />

            {/* 7. Deployment Specification - ESP32, Sensors Info */}
            <DeploymentSpecification />
        </div>
    );
};

export default Home;
