// src/features/post_connexion/Publicite/Publicite.tsx
'use client';

import React, { useState } from 'react';

import { 
  Megaphone, 
  ThumbsUp, 
  CreditCard, 
  MapPin, 
  Target, 
  CheckCircle2,
  MessageCircle,
  LayoutGrid
} from 'lucide-react';
import Link from 'next/link';

import { usePages } from '@lib/hooks/useAPI';
import { useBoostablePosts } from '@lib/hooks/useAPI';
import { useBoosts } from '@lib/hooks/useAPI';
import { useUser } from '@lib/hooks/useAPI';
import { BoostType } from './types';
import PagePromoPreview from './components/PagePromoPreview';
import PostBoostPreview from './components/PostBoostPreview';
import type { Boost, BoostPayResponse, CreateBoostRequest, Page, Post } from '@lib/types/api.types';
import { getFullImageUrl } from '@/utils/utils';

export default function Publicite() {

  // --- HOOKS ---
  const { user } = useUser();
  const { pages, isLoading: isLoadingPages } = usePages();
  const { posts, isLoading: isLoadingPosts } = useBoostablePosts();
  const { createBoost, isLoading: isCreatingBoost } = useBoosts();

  const [successOpen, setSuccessOpen] = useState(false);
  const [lastBoost, setLastBoost] = useState<Boost | null>(null);
  const [lastPay, setLastPay] = useState<BoostPayResponse | null>(null);
  const [lastSummary, setLastSummary] = useState<{
    targetLabel: string;
    audience: string;
    budgetHT: number;
    totalTTC: number;
    location: string;
    ageRange: string;
    gender: string;
    durationDays: number;
    startDateISO: string;
    endDateISO: string;
    interests: string[];
  } | null>(null);

  // --- STATES ---
  const [boostType, setBoostType] = useState<BoostType>('PAGE_GROWTH');
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  
  // Paramètres de campagne
  const [dailySpend, setDailySpend] = useState<number>(1000); // XAF / jour
  const [duration, setDuration] = useState<number>(5); // Jours
  const [location, setLocation] = useState<string>('Douala (+40km)');
  const [ageRange, setAgeRange] = useState<string>('18 - 45');
  const [gender, setGender] = useState<'ALL' | 'MALE' | 'FEMALE'>('ALL');
  const [interestsText, setInterestsText] = useState<string>('');

  // Calculs dynamiques
  const boostTypeMultiplier = boostType === 'PAGE_GROWTH' ? 1.2 : 1;
  const totalBudget = Math.round(dailySpend * duration * boostTypeMultiplier);
  const estimatedReachMin = Math.floor((totalBudget / 1000) * 800);
  const estimatedReachMax = Math.floor((totalBudget / 1000) * 2500);

  const formatXaf = (value: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(value);

  // Taxes & frais (Cameroun)
  const VAT_RATE_CM = 0.1925;
  const PLATFORM_FEE_RATE = 0.025;
  const PAYMENT_FEE_RATE = 0.015;
  const PAYMENT_FEE_FIXED = 100;

  const platformFee = Math.round(totalBudget * PLATFORM_FEE_RATE);
  const paymentFee = Math.round(totalBudget * PAYMENT_FEE_RATE + PAYMENT_FEE_FIXED);
  const taxableBase = totalBudget + platformFee + paymentFee;
  const vatAmount = Math.round(taxableBase * VAT_RATE_CM);
  const totalToPay = taxableBase + vatAmount;

  const userPages = (pages || []) as Page[];
  const feedPosts = (posts || []) as Post[];

  const allowedPageIds = new Set(userPages.map((p) => p.id));
  const currentUserId = (user as any)?.id ? String((user as any).id) : null;

  const userPosts = feedPosts.filter((p) => {
    const authorId = (p as any)?.author?.id ? String((p as any).author.id) : null;
    if (currentUserId && authorId === currentUserId) return true;

    const page = (p as any)?.page;
    if (!page) return false;

    const pageId = typeof page === 'string' ? page : (page as any)?.id;
    if (!pageId) return false;
    return allowedPageIds.has(String(pageId));
  });

  const sortedPages = [...userPages].sort((a, b) => {
    const at = new Date(a.created_at).getTime();
    const bt = new Date(b.created_at).getTime();
    return bt - at;
  });

  const sortedPosts = [...userPosts].sort((a, b) => {
    const at = new Date(a.created_at).getTime();
    const bt = new Date(b.created_at).getTime();
    return bt - at;
  });

  const selectedPage = sortedPages.find(p => p.id === selectedPageId) || (sortedPages.length > 0 ? sortedPages[0] : null);
  const selectedPost = sortedPosts.find(p => p.id === selectedPostId) || (sortedPosts.length > 0 ? sortedPosts[0] : null);

  const resolvePreviewPageForSelectedPost = (): Page | null => {
    if (!selectedPost) return null;
    const rawPage = (selectedPost as any).page;
    if (rawPage) {
      const pageId = typeof rawPage === 'string' ? rawPage : (rawPage as any)?.id;
      if (pageId) {
        const match = userPages.find((p) => p.id === pageId);
        if (match) return match;
      }
      if (typeof rawPage === 'object' && (rawPage as any)?.name) {
        return rawPage as Page;
      }
    }

    if (user) {
      return {
        id: String((user as any).id || 'me'),
        name: `${(user as any).first_name || ''} ${(user as any).last_name || ''}`.trim() || 'Vous',
        description: '',
        category: 'Profil',
        owner: String((user as any).id || ''),
        subscribers_count: 0,
        profile_picture_url: (user as any).profile_picture_url,
        cover_photo_url: (user as any).cover_photo_url,
        created_at: new Date().toISOString(),
      } as Page;
    }

    return null;
  };

  const toPreviewPage = (p: Page) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    avatar: p.profile_picture_url || 'https://placehold.co/64x64',
    cover: p.cover_photo_url || 'https://placehold.co/800x400',
    followers: p.subscribers_count || 0,
  });

  const toPreviewPost = (p: Post) => ({
    id: p.id,
    content: p.content,
    image: p.media?.[0]?.url,
    date: p.created_at,
    likes: p.likes_count || 0,
    comments: p.comments_count || 0,
  });

  const parseAgeRange = (value: string): { min: number | null; max: number | null } => {
    const trimmed = value.trim();
    if (!trimmed) return { min: null, max: null };

    const parts = trimmed.split('-').map(s => s.trim());
    if (parts.length !== 2) return { min: null, max: null };

    const min = Number(parts[0]);
    const rawMax = parts[1].replace('+', '').trim();
    const max = rawMax === '65' && parts[1].includes('+') ? null : Number(rawMax);

    return {
      min: Number.isFinite(min) ? min : null,
      max: Number.isFinite(max) ? max : null,
    };
  };

  const cleanedInterests = interestsText
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const handleCreateBoost = async () => {
    if (boostType === 'PAGE_GROWTH' && !selectedPage) return;
    if (boostType === 'POST_ENGAGEMENT' && !selectedPost) return;

    const target_id = boostType === 'PAGE_GROWTH' ? selectedPage!.id : selectedPost!.id;
    const target_type: CreateBoostRequest['target_type'] = boostType === 'PAGE_GROWTH' ? 'PAGE' : 'POST';

    const { min: audience_age_min, max: audience_age_max } = parseAgeRange(ageRange);

    const boostData: CreateBoostRequest = {
      target_id,
      target_type,
      budget: totalBudget,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString(),
      audience_location: location,
      audience_age_min,
      audience_age_max,
      audience_gender: gender,
      audience_interests: cleanedInterests,
    };

    const targetLabel =
      boostType === 'PAGE_GROWTH'
        ? `Page : ${selectedPage!.name}`
        : `Post : ${selectedPost!.content?.slice(0, 40) || 'Publication'}...`;

    const audience = `${estimatedReachMin.toLocaleString()} - ${estimatedReachMax.toLocaleString()} personnes`;

    const { boost, payment } = await createBoost(boostData);
    setLastBoost(boost);
    setLastPay(payment);
    setLastSummary({
      targetLabel,
      audience,
      budgetHT: totalBudget,
      totalTTC: totalToPay,
      location,
      ageRange,
      gender,
      durationDays: duration,
      startDateISO: boostData.start_date,
      endDateISO: boostData.end_date,
      interests: cleanedInterests,
    });
    setSuccessOpen(true);
  };

  return (
    <>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Megaphone className="text-blue-600" /> Centre de Publicité
            </h1>
            <p className="text-gray-500 mt-1">Créez une nouvelle promotion ou analysez vos performances.</p>
          </div>
          <Link href="/dashboard" className="mt-4 sm:mt-0 inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg font-semibold text-sm text-gray-800 hover:bg-gray-50 transition-colors">
            <LayoutGrid size={16} />
            Gérer mes campagnes
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* COLONNE GAUCHE : CONFIGURATION (8 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* 1. Choix de l'objectif */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Quel est votre objectif ?</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button 
                        onClick={() => setBoostType('PAGE_GROWTH')}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${boostType === 'PAGE_GROWTH' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-lg ${boostType === 'PAGE_GROWTH' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                                <ThumbsUp size={20} />
                            </div>
                            <span className="font-bold text-gray-900">Promouvoir la Page</span>
                        </div>
                        <p className="text-sm text-gray-500">Obtenez plus de mentions "J'aime" et d'abonnés pour construire votre crédibilité.</p>
                    </button>

                    <button 
                        onClick={() => setBoostType('POST_ENGAGEMENT')}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${boostType === 'POST_ENGAGEMENT' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-lg ${boostType === 'POST_ENGAGEMENT' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                                <MessageCircle size={20} />
                            </div>
                            <span className="font-bold text-gray-900">Booster un Post</span>
                        </div>
                        <p className="text-sm text-gray-500">Obtenez plus de vues, de likes et de commentaires sur une publication précise.</p>
                    </button>
                </div>

                {/* Sélecteur de Post (Affiché seulement si POST_ENGAGEMENT) */}
                {boostType === 'POST_ENGAGEMENT' && (
                    <div className="mt-6 pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-top-2">
                        <h3 className="text-sm font-bold text-gray-700 mb-3">Sélectionnez la publication à booster</h3>
                        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                            {isLoadingPosts ? (
                              <p>Chargement des posts...</p>
                            ) : sortedPosts.length === 0 ? (
                              <p className="text-sm text-gray-600">Aucune publication boostable. Seuls vos posts (profil) et les posts de vos pages sont affichés ici.</p>
                            ) : sortedPosts.map(post => (
                                <div 
                                    key={post.id}
                                    onClick={() => setSelectedPostId(post.id)}
                                    className={`flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-colors ${selectedPostId === post.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
                                >
                                    <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                                        {post.media && post.media.length > 0 ? <img src={getFullImageUrl(post.media[0]?.url)} alt="" className="w-full h-full object-cover"/> : <div className="flex items-center justify-center h-full text-xs text-gray-400">Txt</div>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-800 truncate">{post.content}</p>
                                        <p className="text-xs text-gray-400">{new Date(post.created_at).toLocaleDateString()}</p>
                                    </div>
                                    {selectedPostId === post.id && <CheckCircle2 className="text-blue-600" size={20} />}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Sélecteur de Page (Affiché seulement si PAGE_GROWTH) */}
                {boostType === 'PAGE_GROWTH' && (
                    <div className="mt-6 pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-top-2">
                        <h3 className="text-sm font-bold text-gray-700 mb-3">Sélectionnez la page à promouvoir</h3>
                        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                            {isLoadingPages ? <p>Chargement des pages...</p> : sortedPages.map(page => (
                                <div
                                    key={page.id}
                                    onClick={() => setSelectedPageId(page.id)}
                                    className={`flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-colors ${selectedPageId === page.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
                                >
                                    <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                                        {page.profile_picture_url ? <img src={getFullImageUrl(page.profile_picture_url)} alt="" className="w-full h-full object-cover"/> : <div className="flex items-center justify-center h-full text-xs text-gray-400">Img</div>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-800 truncate">{page.name}</p>
                                        <p className="text-xs text-gray-400">{new Date(page.created_at).toLocaleDateString()}</p>
                                    </div>
                                    {selectedPageId === page.id && <CheckCircle2 className="text-blue-600" size={20} />}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* 2. Ciblage (Audience) */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Target size={20} className="text-gray-500"/> Audience
                </h2>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Lieu</label>
                        <div className="flex items-center px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                            <MapPin size={18} className="text-gray-400 mr-2" />
                            <select 
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="bg-transparent flex-1 outline-none text-gray-800"
                            >
                                <option>Douala (+40km)</option>
                                <option>Yaoundé (+40km)</option>
                                <option>Tout le Cameroun</option>
                            </select>
                        </div>
                    </div>

                    <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Âge & Genre</label>
                         <div className="grid grid-cols-2 gap-4">
                            <select 
                                value={ageRange}
                                onChange={(e) => setAgeRange(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
                            >
                                <option>18 - 65+</option>
                                <option>18 - 35</option>
                                <option>25 - 45</option>
                            </select>
                            <select value={gender} onChange={(e) => setGender(e.target.value as any)} className="px-3 py-2 border border-gray-300 rounded-lg bg-white">
                                <option value="ALL">Tous</option>
                                <option value="MALE">Hommes</option>
                                <option value="FEMALE">Femmes</option>
                            </select>
                         </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Centres d'intérêt</label>
                        <input value={interestsText} onChange={(e) => setInterestsText(e.target.value)} type="text" placeholder="Ex: Technologie, Startup, Business" className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white" />
                    </div>
                </div>
            </div>

            {/* 3. Budget & Durée */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <CreditCard size={20} className="text-gray-500"/> Budget et calendrier
                </h2>

                <div className="space-y-6">
                    {/* Slider Durée */}
                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-sm font-medium text-gray-700">Durée</label>
                            <span className="font-bold text-gray-900">{duration} jours</span>
                        </div>
                        <input 
                            type="range" min="1" max="30" value={duration} 
                            onChange={(e) => setDuration(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>1 jour</span>
                            <span>30 jours</span>
                        </div>
                    </div>

                    {/* Slider Budget */}
                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-sm font-medium text-gray-700">Budget / jour</label>
                            <span className="font-bold text-gray-900">{formatXaf(dailySpend)}</span>
                        </div>
                        <input 
                            type="range" min="1000" max="500000" step="1000" value={dailySpend} 
                            onChange={(e) => setDailySpend(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <p className="text-xs text-gray-500 mt-2 text-right">Soit {formatXaf(totalBudget)} pour {duration} jours</p>
                    </div>
                </div>
            </div>

          </div>

          {/* COLONNE DROITE : PREVIEW & RECAP (4 cols) - Sticky */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* 1. Zone de Prévisualisation */}
            <div className="sticky top-6">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Aperçu de la publicité</h3>
                
                {/* Rendu conditionnel selon le type de boost */}
                <div className="mb-6">
                    {isLoadingPages || isLoadingPosts ? <p>Chargement de l'aperçu...</p> : boostType === 'PAGE_GROWTH' && selectedPage 
                        ? <PagePromoPreview page={toPreviewPage(selectedPage)} />
                        : selectedPost ? (() => {
                            const previewPage = resolvePreviewPageForSelectedPost();
                            if (!previewPage) return <p>Impossible de charger l'aperçu.</p>;
                            return <PostBoostPreview page={toPreviewPage(previewPage)} post={toPreviewPost(selectedPost)} />;
                          })()
                        : null
                    }
                </div>

                {/* 2. Récapitulatif et Paiement */}
                <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-4">Récapitulatif de paiement</h3>
                    
                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Audience estimée</span>
                            <span className="font-medium text-gray-900">{estimatedReachMin.toLocaleString()} - {estimatedReachMax.toLocaleString()} personnes</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Budget / jour</span>
                          <span className="font-medium text-gray-900">{formatXaf(dailySpend)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Lieu</span>
                          <span className="font-medium text-gray-900">{location}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Âge</span>
                          <span className="font-medium text-gray-900">{ageRange}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Durée</span>
                          <span className="font-medium text-gray-900">{duration} jours</span>
                        </div>

                        <div className="h-px bg-gray-100 my-2"></div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Budget publicitaire (HT)</span>
                            <span className="font-medium text-gray-900">{formatXaf(totalBudget)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Frais de service</span>
                            <span className="font-medium text-gray-900">{formatXaf(platformFee)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Frais de paiement</span>
                            <span className="font-medium text-gray-900">{formatXaf(paymentFee)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">TVA Cameroun (19,25%)</span>
                            <span className="font-medium text-gray-900">{formatXaf(vatAmount)}</span>
                          </div>
                        </div>

                        <div className="h-px bg-gray-100 my-2"></div>

                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-700">Total à payer</span>
                          <span className="text-2xl font-bold text-blue-600">{formatXaf(totalToPay)}</span>
                        </div>
                    </div>

                    <button onClick={handleCreateBoost} disabled={isCreatingBoost} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:bg-gray-400">
                        Booster maintenant
                    </button>
                    
                    <p className="text-xs text-center text-gray-400 mt-3">
                        En cliquant, vous acceptez les conditions générales. Les montants incluent la TVA applicable au Cameroun.
                    </p>
                </div>
            </div>

          </div>
        </div>
      </div>

      {successOpen && lastSummary ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-gray-900">Boost effectué</h2>
                <p className="text-sm text-gray-800">{lastPay?.message || 'Votre boost a été activé avec succès.'}</p>
              </div>
              <button
                onClick={() => setSuccessOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="text-sm text-gray-800">
                  <div className="flex justify-between gap-4">
                    <span className="font-semibold text-gray-900">Cible</span>
                    <span className="text-right">{lastSummary.targetLabel}</span>
                  </div>
                  <div className="flex justify-between gap-4 mt-2">
                    <span className="font-semibold text-gray-900">Audience estimée</span>
                    <span className="text-right">{lastSummary.audience}</span>
                  </div>
                  <div className="flex justify-between gap-4 mt-2">
                    <span className="font-semibold text-gray-900">Lieu</span>
                    <span className="text-right">{lastSummary.location}</span>
                  </div>
                  <div className="flex justify-between gap-4 mt-2">
                    <span className="font-semibold text-gray-900">Âge</span>
                    <span className="text-right">{lastSummary.ageRange}</span>
                  </div>
                  <div className="flex justify-between gap-4 mt-2">
                    <span className="font-semibold text-gray-900">Genre</span>
                    <span className="text-right">{lastSummary.gender}</span>
                  </div>
                  <div className="flex justify-between gap-4 mt-2">
                    <span className="font-semibold text-gray-900">Durée</span>
                    <span className="text-right">{lastSummary.durationDays} jours</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900">Budget (HT)</span>
                  <span className="font-bold text-gray-900">{formatXaf(lastSummary.budgetHT)}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="font-semibold text-gray-900">Total payé (TTC)</span>
                  <span className="font-bold text-blue-600">{formatXaf(lastSummary.totalTTC)}</span>
                </div>
                <div className="text-xs text-gray-700 mt-3">
                  Statut boost : <span className="font-bold">{String(lastPay?.boost_status || lastBoost?.status || 'ACTIVE')}</span>
                </div>
              </div>

              {Array.isArray(lastSummary.interests) && lastSummary.interests.length > 0 ? (
                <div className="text-sm text-gray-900">
                  <div className="font-semibold mb-2">Centres d’intérêt</div>
                  <div className="flex flex-wrap gap-2">
                    {lastSummary.interests.map((i) => (
                      <span key={i} className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                        {i}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="p-5 border-t flex gap-3">
              <button
                onClick={() => setSuccessOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold"
              >
                Fermer
              </button>
              <Link
                href="/dashboard"
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-center"
              >
                Voir mes campagnes
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}