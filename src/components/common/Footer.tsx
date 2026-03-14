import React from 'react';
import { Phone, MapPin, Github, Linkedin, Mail, Moon, Sun, Users, Home, Map, Clock, BarChart2, Cpu, Wifi, Database, Activity } from 'lucide-react';

interface FooterProps {
  darkMode?: boolean;
  toggleDarkMode?: () => void;
}

const Footer: React.FC<FooterProps> = ({ darkMode = false, toggleDarkMode }) => {
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    if (id === '#') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const element = document.querySelector(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className={`${
      darkMode 
        ? 'bg-gradient-to-br from-primary-950 to-primary-900 text-gray-100' 
        : 'bg-gradient-to-br from-primary-900 to-primary-800 text-white'
    } pt-12 pb-8 relative overflow-hidden text-sm`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent transform -skew-y-12"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative z-10">
        {/* Main Footer Content - 4 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Development Team */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-signodes-400" />
              Development Team
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className={`text-sm font-medium ${darkMode ? 'text-signodes-400' : 'text-signodes-300'} mb-3`}>Project Supervisors</h4>
                <ul className={`space-y-2 text-sm ${darkMode ? 'text-gray-200' : 'text-primary-200'}`}>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-signodes-400 mr-2"></span>
                    <span>Mr. Mayank Deep Khare</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-signodes-400 mr-2"></span>
                    <span>Ms. Aditee Mattoo</span>
                  </li>
                </ul>
              </div>
              
              <div className="pt-2">
                <h4 className={`text-sm font-medium ${darkMode ? 'text-signodes-400' : 'text-signodes-300'} mb-3`}>Team Members</h4>
                <ul className={`space-y-2 text-sm ${darkMode ? 'text-gray-200' : 'text-primary-200'}`}>
                  {['Sumesh Sarkar', 'Shlok Singh', 'Shashank Kumar', 'Aditya Shekhar'].map((name, i) => (
                    <li key={i} className="flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-signodes-400 mr-2"></span>
                      <span>{name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { name: 'Dashboard', icon: <Home className="w-4 h-4 mr-3 text-signodes-400" />, href: '#' },
                { name: 'Campus Map', icon: <Map className="w-4 h-4 mr-3 text-signodes-400" />, href: '#campus-overview' },
                { name: 'Live Data', icon: <Activity className="w-4 h-4 mr-3 text-signodes-400" />, href: '#sensor-data' },
                { name: 'Historical Data', icon: <BarChart2 className="w-4 h-4 mr-3 text-signodes-400" />, href: '#historical-data' },
                { name: 'Network Status', icon: <Wifi className="w-4 h-4 mr-3 text-signodes-400" />, href: '#network-status' },
                { name: 'Specifications', icon: <Cpu className="w-4 h-4 mr-3 text-signodes-400" />, href: '#deployment' }
              ].map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    onClick={(e) => scrollToSection(e, link.href)}
                    className={`flex items-center ${darkMode ? 'text-gray-300 hover:text-gray-100' : 'text-primary-300 hover:text-white'} text-sm transition-colors group`}
                  >
                    {link.icon}
                    <span className="group-hover:translate-x-1 transition-transform">{link.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Social */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-4">Contact Us</h3>
            <div className="space-y-4">
              <div className="flex">
                <div className="flex-shrink-0 mr-3">
                  <MapPin className="w-5 h-5 text-signodes-400 mt-0.5" />
                </div>
                <div>
                  <h4 className="font-medium">Location</h4>
                  <p className="text-sm text-primary-100 -ml-8 mt-4">
                    NIET, Knowledge Park-II,<br />Greater Noida, UP 201306
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-signodes-400 flex-shrink-0" />
                <a href="mailto:signodes@niet.co.in" className={`${darkMode ? 'text-gray-300 hover:text-gray-100' : 'text-primary-300 hover:text-white'} text-sm`}>
                  signodes@niet.co.in
                </a>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-signodes-400 flex-shrink-0" />
                <a href="tel:+919876543210" className={`${darkMode ? 'text-gray-300 hover:text-gray-100' : 'text-primary-300 hover:text-white'} text-sm`}>
                  +91 98765 43210
                </a>
              </div>
              
              <div className="pt-2">
                <h4 className={`text-sm font-medium ${darkMode ? 'text-signodes-400' : 'text-signodes-300'} mb-2`}>Follow Us</h4>
                <div className="flex space-x-4">
                  <a 
                    href="#" 
                    className={`${darkMode ? 'text-gray-300 hover:text-gray-100' : 'text-primary-300 hover:text-white'} transition-colors`}
                    aria-label="GitHub Profile"
                  >
                    <Github className="w-5 h-5" />
                  </a>
                  <a 
                    href="https://www.linkedin.com/company/85641246/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={`${darkMode ? 'text-gray-300 hover:text-gray-100' : 'text-primary-300 hover:text-white'} transition-colors`}
                    aria-label="LinkedIn Profile"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                </div>
              </div>
              
              {toggleDarkMode && (
                <button
                  onClick={toggleDarkMode}
                  className={`flex items-center space-x-2 ${darkMode ? 'text-gray-300 hover:text-gray-100' : 'text-primary-300 hover:text-white'} text-sm mt-4 transition-colors group`}
                  aria-label={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                  aria-pressed={darkMode ? "true" : "false"}
                >
                  {darkMode ? (
                    <Sun className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  ) : (
                    <Moon className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  )}
                  <span>{darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
                </button>
              )}
            </div>
          </div>

          {/* System Stats */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-4">System Status</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { 
                  icon: <Cpu className="w-6 h-6 text-green-400" />, 
                  value: '1', 
                  label: 'Active Node',
                  color: 'text-green-400'
                },
                { 
                  icon: <Clock className="w-6 h-6 text-blue-400" />, 
                  value: '24/7', 
                  label: 'Monitoring',
                  color: 'text-blue-400'
                },
                { 
                  icon: <Wifi className="w-6 h-6 text-purple-400" />, 
                  value: '5', 
                  label: 'Sensors',
                  color: 'text-purple-400'
                },
                { 
                  icon: <Database className="w-6 h-6 text-yellow-400" />, 
                  value: '99.8%', 
                  label: 'Uptime',
                  color: 'text-yellow-400'
                }
              ].map((stat, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-4 text-center hover:bg-white/10 transition-colors">
                  <div className="flex justify-center mb-2">{stat.icon}</div>
                  <div className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                  <div className="text-xs text-primary-300">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-6 border-t border-primary-700/30 text-center">
          <p className="text-primary-400 text-xs">
            © {new Date().getFullYear()} SIGNODES Weather Monitoring System | Department of CSE-IOT, NIET
          </p>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-signodes-500 rounded-full opacity-5 transform -translate-x-16 translate-y-16"></div>
      <div className="absolute top-0 right-0 w-24 h-24 bg-accent-500 rounded-full opacity-5 transform translate-x-12 -translate-y-12"></div>
    </footer>
  );
};

export default Footer;