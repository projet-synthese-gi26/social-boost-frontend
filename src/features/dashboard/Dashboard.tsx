'use client';

import React, { useMemo, useState } from 'react';
import CampaignList from './components/CampaignList';
import CampaignDetails from './components/CampaignDetails';
import { AnimatePresence, motion } from 'framer-motion';
import { useBoosts } from '@lib/hooks/useAPI';
import type { Boost } from '@lib/types/api.types';

const Dashboard = () => {
  const { boosts, isLoading, error, refresh } = useBoosts();
  const [selectedBoostId, setSelectedBoostId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | Boost['status']>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | Boost['target_type']>('ALL');
  const [sortKey, setSortKey] = useState<'created_at' | 'start_date' | 'end_date' | 'budget'>('created_at');
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');

  const summary = useMemo(() => {
    const list = boosts || [];
    const active = list.filter((b) => b.status === 'ACTIVE').length;
    const paused = list.filter((b) => b.status === 'PAUSED').length;
    const completed = list.filter((b) => b.status === 'COMPLETED').length;
    return {
      total: list.length,
      active,
      paused,
      completed,
    };
  }, [boosts]);

  const filteredBoosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = (boosts || []).filter((b) => {
      if (statusFilter !== 'ALL' && b.status !== statusFilter) return false;
      if (typeFilter !== 'ALL' && b.target_type !== typeFilter) return false;
      if (!q) return true;
      return (
        String(b.target_id || '').toLowerCase().includes(q) ||
        String(b.target_type || '').toLowerCase().includes(q) ||
        String(b.status || '').toLowerCase().includes(q)
      );
    });

    const toNumber = (v: unknown) => {
      if (typeof v === 'number') return v;
      if (typeof v === 'string') {
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
      }
      return 0;
    };

    const toDateMs = (v: unknown) => {
      if (!v) return 0;
      const d = new Date(String(v));
      const t = d.getTime();
      return Number.isFinite(t) ? t : 0;
    };

    const dir = sortDir === 'asc' ? 1 : -1;
    const sorted = [...filtered].sort((a, b) => {
      if (sortKey === 'budget') return (toNumber(a.budget) - toNumber(b.budget)) * dir;
      if (sortKey === 'created_at') return (toDateMs((a as any).created_at) - toDateMs((b as any).created_at)) * dir;
      if (sortKey === 'start_date') return (toDateMs(a.start_date) - toDateMs(b.start_date)) * dir;
      if (sortKey === 'end_date') return (toDateMs(a.end_date) - toDateMs(b.end_date)) * dir;
      return 0;
    });

    return sorted;
  }, [boosts, query, sortDir, sortKey, statusFilter, typeFilter]);

  const selectedBoost = useMemo(() => {
    const firstId = filteredBoosts[0]?.id || null;
    const effectiveId = selectedBoostId || firstId;
    if (!effectiveId) return null;
    return filteredBoosts.find((b) => b.id === effectiveId) || null;
  }, [filteredBoosts, selectedBoostId]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-screen-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tableau de bord des campagnes</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Analysez les performances de vos boosts.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-xs font-bold text-gray-500 dark:text-gray-400">Total</div>
            <div className="text-2xl font-extrabold text-gray-900 dark:text-white">{summary.total}</div>
          </div>
          <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-xs font-bold text-gray-500 dark:text-gray-400">Actives</div>
            <div className="text-2xl font-extrabold text-gray-900 dark:text-white">{summary.active}</div>
          </div>
          <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-xs font-bold text-gray-500 dark:text-gray-400">En pause</div>
            <div className="text-2xl font-extrabold text-gray-900 dark:text-white">{summary.paused}</div>
          </div>
          <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-xs font-bold text-gray-500 dark:text-gray-400">Terminées</div>
            <div className="text-2xl font-extrabold text-gray-900 dark:text-white">{summary.completed}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher (id cible, type, statut...)"
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-purple-600"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-purple-600"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="ACTIVE">Actifs</option>
              <option value="PAUSED">En pause</option>
              <option value="COMPLETED">Terminés</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-purple-600"
            >
              <option value="ALL">Tous les types</option>
              <option value="PAGE">Pages</option>
              <option value="POST">Posts</option>
            </select>

            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as any)}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-purple-600"
            >
              <option value="created_at">Tri: création</option>
              <option value="start_date">Tri: début</option>
              <option value="end_date">Tri: fin</option>
              <option value="budget">Tri: budget</option>
            </select>

            <select
              value={sortDir}
              onChange={(e) => setSortDir(e.target.value as any)}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-purple-600"
            >
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>

            <button
              onClick={() => refresh()}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg px-3 py-2 text-sm transition"
            >
              Actualiser
            </button>
          </div>

          {error ? (
            <div className="mt-3 text-sm text-red-600 font-semibold">{error}</div>
          ) : null}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 xl:col-span-3">
            <CampaignList 
              boosts={filteredBoosts}
              selectedBoostId={selectedBoost?.id || null}
              onSelectBoost={setSelectedBoostId}
              isLoading={isLoading}
            />
          </div>
          <div className="lg:col-span-8 xl:col-span-9">
            <AnimatePresence mode="wait">
              {selectedBoost ? (
                <motion.div
                  key={selectedBoost.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
                >
                  <CampaignDetails boost={selectedBoost} onRefresh={refresh} />
                </motion.div>
              ) : (
                <div className="flex items-center justify-center h-full bg-white dark:bg-gray-800/50 p-8 rounded-xl shadow-sm text-center border border-gray-200 dark:border-gray-700">
                  <p className="text-gray-600 dark:text-gray-300">
                    {isLoading ? 'Chargement des campagnes...' : 'Aucune campagne à afficher.'}
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
