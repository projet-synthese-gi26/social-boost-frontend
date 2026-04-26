// src/features/post_connexion/Accueils/components/TabButton.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface TabButtonProps {
  name: string;
  activeTab: string;
  onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ name, activeTab, onClick }) => {
  const isActive = activeTab.toLowerCase() === name.toLowerCase();

  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-2 text-sm font-medium rounded-md transition-colors w-full ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
    >
      {isActive && (
        <motion.div
          layoutId="active-tab-indicator"
          className="absolute inset-0 bg-blue-500 rounded-md z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
      <span className="relative z-10">{name}</span>
    </button>
  );
};

export default TabButton;
