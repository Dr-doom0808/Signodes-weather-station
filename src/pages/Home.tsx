import React, { Suspense, lazy } from 'react';
import EnvironmentalDashboard from '../components/dashboard/EnvironmentalDashboard';
import AirQualityBar from '../components/dashboard/AirQualityBar';
import CampusMap from '../components/map/CampusMap';
const DataTrendsAnalytics = lazy(() => import('../components/analytics/DataTrendsAnalytics'));
const HistoricalDataCalendar = lazy(() => import('../components/analytics/HistoricalDataCalendar'));
import DeploymentSpecification from '../components/specs/DeploymentSpecification';
import NodeGrid from '../components/dashboard/NodeGrid';
import { useDarkMode } from '../context/DarkModeContext';
import ScrollReveal from '../components/common/ScrollReveal';

const Home: React.FC = () => {
    const { darkMode } = useDarkMode();
    
    return (
        <div className={`flex flex-col ${darkMode ? 'bg-primary-950 text-gray-100' : 'bg-primary-50 text-gray-900'} transition-colors duration-300`}>
            {/* 1. Air Quality Colored Bar with Temperature Conditions (Moved to top for Mobile) */}
            <ScrollReveal delay={0.1} className="order-1 md:order-2">
                <AirQualityBar />
            </ScrollReveal>
            
            {/* 2. Environmental Dashboard - Only 5 Parameters */}
            <ScrollReveal className="order-2 md:order-1">
                <EnvironmentalDashboard />
            </ScrollReveal>

            {/* 3. Campus Map - Node A Active, B&C Inactive */}
            <ScrollReveal delay={0.1} className="order-3">
                <CampusMap />
            </ScrollReveal>

            {/* 4. Interactive Node Grid */}
            <ScrollReveal delay={0.1} className="order-4">
                <NodeGrid />
            </ScrollReveal>

            {/* 5. Data Trends & Analytics - 4 Maps: AQI, Temperature, Humidity, Pressure */}
            <ScrollReveal delay={0.1} className="order-5">
                <Suspense fallback={<div className="h-96 flex items-center justify-center text-slate-500">Loading analytics...</div>}>
                    <DataTrendsAnalytics />
                </Suspense>
            </ScrollReveal>

            {/* 6. Historical Data Calendar - Enhanced UI */}
            <ScrollReveal delay={0.1} className="order-6 hidden md:block">
                <Suspense fallback={<div className="h-96 flex items-center justify-center text-slate-500">Loading calendar...</div>}>
                    <HistoricalDataCalendar />
                </Suspense>
            </ScrollReveal>

            {/* 7. Deployment Specification - ESP32, Sensors Info */}
            <ScrollReveal delay={0.1} className="order-7 hidden md:block">
                <DeploymentSpecification />
            </ScrollReveal>
        </div>
    );
};

export default Home;
