// src/features/dashboard/components/CampaignList.tsx
'use client';

import React from 'react';
import type { Boost } from '@lib/types/api.types';
import { motion } from 'framer-motion';

interface CampaignListProps {
  boosts: Boost[];
  selectedBoostId: string | null;
  onSelectBoost: (id: string) => void;
  isLoading?: boolean;
}

const CampaignListItem = ({ boost, isSelected, onSelect }: { boost: Boost, isSelected: boolean, onSelect: () => void }) => {
  const statusClasses = {
    ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    COMPLETED: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    PAUSED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  };

  const budgetNumber = typeof boost.budget === 'string' ? Number(boost.budget) : Number(boost.budget);
  const title = boost.target_type === 'PAGE' ? 'Boost de page' : 'Boost de post';
  const subtitle = `Cible: ${String(boost.target_id).slice(0, 10)}...`;

  return (
    <motion.button
      onClick={onSelect}
      className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/50' : 'border-transparent hover:bg-gray-100 dark:hover:bg-gray-800'}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-gray-900 dark:text-white">{title}</h3>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${(statusClasses as any)[boost.status] || statusClasses.PAUSED}`}>
          {boost.status}
        </span>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
      <div className="flex justify-between items-end mt-3">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {boost.start_date ? new Date(boost.start_date).toLocaleDateString('fr-FR') : '—'}
          {' → '}
          {boost.end_date ? new Date(boost.end_date).toLocaleDateString('fr-FR') : '—'}
        </div>
        <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
          {(Number.isFinite(budgetNumber) ? budgetNumber : 0).toLocaleString('fr-FR')} <span className="font-normal text-gray-500">budget</span>
        </div>
      </div>
    </motion.button>
  );
};

const CampaignList: React.FC<CampaignListProps> = ({ boosts, selectedBoostId, onSelectBoost, isLoading }) => {
  return (
    <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 px-2">Toutes les campagnes</h2>
      <div className="space-y-2">
        {isLoading ? (
          <div className="px-2 py-6 text-sm text-gray-500 dark:text-gray-400">Chargement...</div>
        ) : boosts.length ? (
          boosts.map(boost => (
            <CampaignListItem 
              key={boost.id}
              boost={boost}
              isSelected={selectedBoostId === boost.id}
              onSelect={() => onSelectBoost(boost.id)}
            />
          ))
        ) : (
          <div className="px-2 py-6 text-sm text-gray-500 dark:text-gray-400">Aucune campagne.</div>
        )}
      </div>
    </div>
  );
};

export default CampaignList;
