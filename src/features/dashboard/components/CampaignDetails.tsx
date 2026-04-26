// src/features/dashboard/components/CampaignDetails.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { Boost, Page, Post } from '@lib/types/api.types';
import PerformanceChart from './PerformanceChart';
import { BarChart, Calendar, DollarSign, Info, Target } from 'lucide-react';
import { boostService, pageService, postService } from '@lib/api/services';

interface CampaignDetailsProps {
  boost: Boost;
  onRefresh: () => void;
}

const StatCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) => (
  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg flex items-center gap-4">
    <div className="bg-gray-200 dark:bg-gray-600 p-2 rounded-md">{icon}</div>
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-xl font-bold text-gray-900 dark:text-white">{typeof value === 'number' ? value.toLocaleString() : value}</p>
    </div>
  </div>
);

const CampaignDetails: React.FC<CampaignDetailsProps> = ({ boost, onRefresh }) => {
  const [target, setTarget] = useState<Page | Post | null>(null);
  const [targetLoading, setTargetLoading] = useState(false);
  const [isManaging, setIsManaging] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadTarget = async () => {
      if (!boost?.target_id) return;
      setTargetLoading(true);
      try {
        if (boost.target_type === 'PAGE') {
          const page = await pageService.getById(boost.target_id);
          if (mounted) setTarget(page);
          return;
        }
        if (boost.target_type === 'POST') {
          const post = await postService.getById(boost.target_id);
          if (mounted) setTarget(post);
          return;
        }
      } catch {
        if (mounted) setTarget(null);
      } finally {
        if (mounted) setTargetLoading(false);
      }
    };

    loadTarget();
    return () => {
      mounted = false;
    };
  }, [boost?.target_id, boost?.target_type]);

  const budgetNumber = typeof boost.budget === 'string' ? Number(boost.budget) : Number(boost.budget);
  const boostTitle = boost.target_type === 'PAGE' ? 'Campagne : Boost de page' : 'Campagne : Boost de post';
  const statusLabel = boost.status;

  const dailyPlaceholder = useMemo(() => {
    const start = boost.start_date ? new Date(boost.start_date) : null;
    const end = boost.end_date ? new Date(boost.end_date) : null;
    if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return [];

    const days = Math.max(1, Math.min(30, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1));
    const stats: any[] = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      stats.push({
        date: d.toISOString().split('T')[0],
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
      });
    }
    return stats;
  }, [boost.end_date, boost.start_date]);

  const audienceLocation = boost.audience_location || '—';
  const ageMin = typeof boost.audience_age_min === 'number' ? boost.audience_age_min : null;
  const ageMax = typeof boost.audience_age_max === 'number' ? boost.audience_age_max : null;
  const audienceAge = ageMin !== null || ageMax !== null ? `${ageMin ?? '—'} - ${ageMax ?? '—'}` : '—';
  const genderRaw = boost.audience_gender || 'ALL';
  const audienceGender = genderRaw === 'MALE' ? 'Hommes' : genderRaw === 'FEMALE' ? 'Femmes' : 'Tous';
  const interests = Array.isArray(boost.audience_interests) ? boost.audience_interests : [];

  const canPause = boost.status === 'ACTIVE';
  const canResume = boost.status === 'PAUSED';
  const canStop = boost.status !== 'COMPLETED';

  const handlePause = async () => {
    if (isManaging || !canPause) return;
    setIsManaging(true);
    try {
      await boostService.pause(boost.id);
      onRefresh();
    } catch (e: any) {
      alert(e?.response?.data?.error || 'Impossible de mettre en pause.');
    } finally {
      setIsManaging(false);
    }
  };

  const handleResume = async () => {
    if (isManaging || !canResume) return;
    setIsManaging(true);
    try {
      await boostService.resume(boost.id);
      onRefresh();
    } catch (e: any) {
      alert(e?.response?.data?.error || 'Impossible de reprendre.');
    } finally {
      setIsManaging(false);
    }
  };

  const handleStop = async () => {
    if (isManaging || !canStop) return;
    const ok = confirm('Arrêter cette campagne ? Elle sera marquée comme terminée.');
    if (!ok) return;
    setIsManaging(true);
    try {
      await boostService.stop(boost.id);
      onRefresh();
    } catch (e: any) {
      alert(e?.response?.data?.error || 'Impossible d’arrêter la campagne.');
    } finally {
      setIsManaging(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{boostTitle}</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Statut : <span className="font-semibold">{statusLabel}</span>
            {' • '}
            ID campagne : <span className="font-mono text-xs">{boost.id}</span>
          </p>
        </div>

        <div className="flex gap-2 flex-wrap justify-end">
          <button
            onClick={() => onRefresh()}
            className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-3 py-2 rounded-lg text-sm font-bold transition"
          >
            Rafraîchir
          </button>
          <button
            onClick={handlePause}
            disabled={!canPause || isManaging}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg text-sm font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Pause
          </button>
          <button
            onClick={handleResume}
            disabled={!canResume || isManaging}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reprendre
          </button>
          <button
            onClick={handleStop}
            disabled={!canStop || isManaging}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Arrêter
          </button>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-4 rounded-lg mb-6">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 text-gray-600 dark:text-gray-300">
            <Info size={18} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Cible de la campagne</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {targetLoading ? (
                'Chargement de la cible...'
              ) : target ? (
                boost.target_type === 'PAGE'
                  ? `Page : ${(target as any).name || boost.target_id}`
                  : `Post : ${((target as any).content || '').slice(0, 120) || boost.target_id}`
              ) : (
                `Cible introuvable (type ${boost.target_type}, id ${boost.target_id})`
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<DollarSign size={20} className="text-green-600" />} label="Budget" value={(Number.isFinite(budgetNumber) ? budgetNumber : 0)} />
        <StatCard icon={<Calendar size={20} className="text-blue-600" />} label="Début" value={boost.start_date ? new Date(boost.start_date).toLocaleDateString('fr-FR') : '—'} />
        <StatCard icon={<Calendar size={20} className="text-blue-600" />} label="Fin" value={boost.end_date ? new Date(boost.end_date).toLocaleDateString('fr-FR') : '—'} />
        <StatCard icon={<Target size={20} className="text-purple-600" />} label="Type" value={boost.target_type} />
      </div>

      {/* Section du graphique */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2"><BarChart size={20} /> Performance quotidienne</h3>
        <div className="h-80 w-full bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
            <PerformanceChart data={dailyPlaceholder as any} />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Les statistiques (vues/likes/commentaires/partages) ne sont pas encore exposées par l’API. Graphique affiché à 0 en attendant.
        </p>
      </div>

      {/* Section Audience & Budget */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2"><Target size={20} /> Audience</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Lieu:</span> <span className="font-medium">{audienceLocation}</span></div>
            <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Âge:</span> <span className="font-medium">{audienceAge}</span></div>
            <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Genre:</span> <span className="font-medium">{audienceGender}</span></div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 mb-2">Intérêts:</p>
              <div className="flex flex-wrap gap-2">
                {interests.length ? (
                  interests.map((interest) => (
                    <span key={interest} className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-xs font-medium px-2.5 py-0.5 rounded-full">{interest}</span>
                  ))
                ) : (
                  <span className="text-xs text-gray-500 dark:text-gray-400">—</span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2"><DollarSign size={20} /> Budget & Durée</h3>
          <div className="space-y-3 text-sm">
             <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Budget total:</span> <span className="font-medium text-lg text-green-600">{(Number.isFinite(budgetNumber) ? budgetNumber : 0).toLocaleString('fr-FR')}</span></div>
             <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Date de début:</span> <span className="font-medium">{boost.start_date ? new Date(boost.start_date).toLocaleDateString('fr-FR') : '—'}</span></div>
             <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Date de fin:</span> <span className="font-medium">{boost.end_date ? new Date(boost.end_date).toLocaleDateString('fr-FR') : '—'}</span></div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default CampaignDetails;
