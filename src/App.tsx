import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import { NodesProvider } from './context/NodesContext';
import { DarkModeProvider, useDarkMode } from './context/DarkModeContext';
import ErrorBoundary from './components/common/ErrorBoundary';

const AppContent: React.FC = () => {
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      darkMode 
        ? 'bg-primary-950 text-gray-100' 
        : 'bg-primary-50 text-gray-900'
    }`}>
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <main className="flex-grow">
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: darkMode ? '#1e293b' : '#ffffff',
              color: darkMode ? '#f1f5f9' : '#000000',
              border: darkMode ? '1px solid #334155' : '1px solid #e5e7eb',
            },
          }}
        />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
      <Footer darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <DarkModeProvider>
        <NodesProvider>
            <AppContent />
        </NodesProvider>
      </DarkModeProvider>
    </ErrorBoundary>
  );
}

export default App;
