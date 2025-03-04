import React from 'react';
import { useUser } from '../contexts/UserContext';
import { Sun, Moon } from 'lucide-react';

export const Header: React.FC = () => {
  const { user } = useUser();

  const toggleTheme = () => {
    const html = document.documentElement;
    const currentTheme = html.classList.contains('dark') ? 'dark' : 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    html.classList.remove(currentTheme);
    html.classList.add(newTheme);
    localStorage.setItem('theme', newTheme);
    
    const event = new CustomEvent('themeChange', { detail: { theme: newTheme } });
    window.dispatchEvent(event);
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <img
              src="/cct-logo.png"
              alt="PBI Data Accuracy"
              className="h-8 w-auto"
            />
            <span className="ml-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
              PBI Data Accuracy
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Sun className="hidden dark:block h-5 w-5" />
              <Moon className="block dark:hidden h-5 w-5" />
            </button>
            
            {user && (
              <div className="flex items-center space-x-3">
                {user.picture && (
                  <img
                    src={user.picture}
                    alt={user.firstName}
                    className="h-8 w-8 rounded-full"
                  />
                )}
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user.firstName}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}; 