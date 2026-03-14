import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { useDarkMode } from '../../context/DarkModeContext';

const ScrollToTopButton: React.FC = () => {
    const { darkMode } = useDarkMode();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    if (!isVisible) {
        return null;
    }

    return (
        <button
            onClick={scrollToTop}
            className={`md:hidden fixed bottom-24 right-4 z-50 p-3 rounded-full shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 ${darkMode ? 'bg-primary-600 text-white hover:bg-primary-500 shadow-primary-900/50' : 'bg-signodes-500 text-white hover:bg-signodes-600 shadow-signodes-500/30'}`}
            aria-label="Scroll to top"
        >
            <ArrowUp className="w-5 h-5" />
        </button>
    );
};

export default ScrollToTopButton;
