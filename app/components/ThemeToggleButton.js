import React from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';

export default function ThemeToggleButton({ theme, toggleTheme }) {
  return (
    <button
      onClick={toggleTheme}
      className={`relative inline-flex items-center h-6 rounded-full w-14 focus:outline-none transition-colors duration-300 ${
        theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
      }`}
    >
      {theme === 'dark' ? (
        <MoonIcon className="absolute left-1 w-4 h-4 text-yellow-500" />
      ) : (
        <SunIcon className="absolute right-1 w-4 h-4 text-yellow-500" />
      )}
      <span
        className={`absolute w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${
          theme === 'dark' ? 'right-1' : 'left-1'
        }`}
      />
    </button>
  );
}