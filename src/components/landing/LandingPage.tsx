'use client';

/**
 * LandingPage.tsx
 * Landing page publique de Boost — visible avant connexion
 * Affiche le fil d'actualité public, les features, et les CTAs
 * Entièrement liée au backend via l'API
 */

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Rocket, Users, Globe, Shield, Heart, MessageCircle,
  Share2, ChevronDown, Zap, TrendingUp, Star, ArrowRight,
  Menu, X, Bell, Search, MoreHorizontal, Image as ImageIcon,
  Loader2, Check
} from 'lucide-react';
import { apiClient } from '@lib/api/client';
import { API_CONFIG } from '@lib/config/api.config';

// ─── Types ────────────────────────────────────────────────────────────────────
interface PublicPost {
  id: string;
  author: {
    id: string;
    username: string;
    profile_picture_url: string | null;
  };
  page?: {
    id: string;
    name: string;
    profile_picture_url: string | null;
  } | null;
  content: string;
  media: { type: string; url: string }[];
  likes_count: number;
  comments_count: number;
  created_at: string;
}

interface PaginatedResponse {
  count: number;
  next: string | null;
  results: PublicPost[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_CONFIG.baseURL}${url}`;
}

function timeAgo(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'à l\'instant';
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`;
  return `il y a ${Math.floor(diff / 86400)}j`;
}

// ─── Avatar Component ─────────────────────────────────────────────────────────
function Avatar({ src, name, size = 10 }: { src?: string | null; name?: string; size?: number }) {
  const [error, setError] = useState(false);
  const initials = name?.charAt(0)?.toUpperCase() ?? '?';
  const imgSrc = src ? getImageUrl(src) : null;

  if (!imgSrc || error) {
    return (
      <div
        className={`w-${size} h-${size} rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white font-bold flex-shrink-0`}
        style={{ width: size * 4, height: size * 4, fontSize: size * 1.5 }}
      >
        {initials}
      </div>
    );
  }
  return (
    <img
      src={imgSrc}
      alt={name ?? ''}
      onError={() => setError(true)}
      className="rounded-full object-cover flex-shrink-0"
      style={{ width: size * 4, height: size * 4 }}
    />
  );
}

// ─── Public Post Card ─────────────────────────────────────────────────────────
function PublicPostCard({ post }: { post: PublicPost }) {
  const author = post.page ?? post.author;
  const displayName = post.page ? post.page.name : post.author.username;
  const avatarUrl = post.page ? post.page.profile_picture_url : post.author.profile_picture_url;
  const hasImage = post.media?.some(m => m.type === 'IMAGE');
  const imageUrl = hasImage ? post.media.find(m => m.type === 'IMAGE')?.url : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Avatar src={avatarUrl} name={displayName} size={10} />
          <div>
            <p className="font-semibold text-gray-900 text-sm leading-tight">{displayName}</p>
            <p className="text-xs text-gray-400">{timeAgo(post.created_at)}</p>
          </div>
        </div>
        <MoreHorizontal className="text-gray-400 w-5 h-5" />
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-gray-800 text-sm leading-relaxed line-clamp-4">{post.content}</p>
      </div>

      {/* Image */}
      {imageUrl && (
        <div className="relative w-full aspect-video overflow-hidden bg-gray-100">
          <img
            src={getImageUrl(imageUrl)}
            alt="post media"
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
          />
        </div>
      )}

      {/* Footer stats */}
      <div className="px-4 py-3 border-t border-gray-50">
        <div className="flex items-center justify-between text-gray-500 text-sm">
          <div className="flex items-center gap-4">
            <Link href="/pre_connexion" className="flex items-center gap-1.5 hover:text-red-500 transition-colors group">
              <Heart className="w-4 h-4 group-hover:fill-red-400" />
              <span>{post.likes_count}</span>
            </Link>
            <Link href="/pre_connexion" className="flex items-center gap-1.5 hover:text-purple-600 transition-colors">
              <MessageCircle className="w-4 h-4" />
              <span>{post.comments_count}</span>
            </Link>
          </div>
          <Link href="/pre_connexion" className="flex items-center gap-1.5 hover:text-purple-600 transition-colors">
            <Share2 className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Login prompt overlay on interactions */}
      <div className="px-4 pb-4">
        <Link
          href="/pre_connexion"
          className="block w-full text-center py-2 rounded-xl bg-purple-50 text-purple-700 text-sm font-medium hover:bg-purple-100 transition-colors"
        >
          Connectez-vous pour interagir
        </Link>
      </div>
    </motion.div>
  );
}

// ─── Feature Card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon: Icon, title, desc, color }: { icon: React.ElementType; title: string; desc: string; color: string }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4"
    >
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-black text-white mb-1">{value}</div>
      <div className="text-purple-200 text-sm">{label}</div>
    </div>
  );
}

// ─── Main Landing Page ────────────────────────────────────────────────────────
export default function LandingPage() {
  const [posts, setPosts] = useState<PublicPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lang, setLang] = useState<'fr' | 'en'>('fr');

  // Fetch public posts (sans authentification — on utilise le feed ou posts publics)
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // On essaie de récupérer les posts publics via l'endpoint posts
        // (le backend renvoie les posts même sans auth selon la config)
        const res = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.posts}?page=1`, {
          headers: { 'Content-Type': 'application/json' },
        });
        if (res.ok) {
          const data: PaginatedResponse = await res.json();
          setPosts(data.results?.slice(0, 6) ?? []);
        }
      } catch {
        // Silencieux : les posts publics ne sont pas disponibles
      } finally {
        setLoadingPosts(false);
      }
    };
    fetchPosts();
  }, []);

  const t = {
    fr: {
      nav_login: 'Se connecter', nav_register: 'Créer un compte',
      badge: '🚀 Réseau social nouvelle génération',
      title: 'Connectez-vous,\npartagez,\nboostez votre présence',
      subtitle: 'Boost est la plateforme sociale qui vous permet de partager vos moments, de vous connecter avec vos proches et de propulser votre activité.',
      cta1: 'Commencer gratuitement', cta2: 'Se connecter',
      features_title: 'Tout ce dont vous avez besoin',
      features_subtitle: 'Une plateforme complète pour votre vie sociale et professionnelle',
      f1_t: 'Réseau social complet', f1_d: 'Partagez des posts, des photos, suivez vos amis et interagissez en temps réel avec votre communauté.',
      f2_t: 'Boostez votre contenu', f2_d: 'Mettez en avant vos publications et vos pages auprès d\'une audience ciblée selon l\'âge, la localisation et les intérêts.',
      f3_t: 'Créez des Pages', f3_d: 'Créez une page professionnelle pour votre entreprise ou votre communauté et développez votre audience.',
      f4_t: 'Sécurisé et privé', f4_d: 'Vos données sont protégées. Vous contrôlez ce que vous partagez et avec qui à tout moment.',
      feed_title: 'Fil d\'actualité public', feed_sub: 'Découvrez ce qui se passe sur Boost',
      feed_empty: 'Aucune publication pour le moment. Soyez le premier !',
      feed_cta: 'Connectez-vous pour voir plus et interagir',
      stat1_v: '10K+', stat1_l: 'Utilisateurs actifs',
      stat2_v: '500+', stat2_l: 'Publications par jour',
      stat3_v: '15+', stat3_l: 'Pays représentés',
      cta_title: 'Prêt à rejoindre la communauté ?', cta_sub: 'Des milliers de personnes partagent déjà leurs moments sur Boost. C\'est gratuit.',
      cta_btn: 'Créer mon compte gratuitement',
      footer_tag: 'Le réseau social qui booste votre vie.',
    },
    en: {
      nav_login: 'Log in', nav_register: 'Sign up',
      badge: '🚀 Next-generation social network',
      title: 'Connect,\nshare,\nboost your presence',
      subtitle: 'Boost is the social platform that lets you share your moments, connect with loved ones, and grow your business with built-in boost tools.',
      cta1: 'Get started for free', cta2: 'Log in',
      features_title: 'Everything you need',
      features_subtitle: 'A complete platform for your social and professional life',
      f1_t: 'Full social network', f1_d: 'Share posts and photos, follow friends, and interact in real time with your community.',
      f2_t: 'Boost your content', f2_d: 'Promote your posts and pages to a targeted audience by age, location, and interests.',
      f3_t: 'Create Pages', f3_d: 'Build a professional page for your business or community and grow your audience.',
      f4_t: 'Secure and private', f4_d: 'Your data is protected. You control what you share and with whom at any time.',
      feed_title: 'Public feed', feed_sub: 'Discover what\'s happening on Boost',
      feed_empty: 'No posts yet. Be the first!',
      feed_cta: 'Log in to see more and interact',
      stat1_v: '10K+', stat1_l: 'Active users',
      stat2_v: '500+', stat2_l: 'Posts per day',
      stat3_v: '15+', stat3_l: 'Countries',
      cta_title: 'Ready to join the community?', cta_sub: 'Thousands of people are already sharing their moments on Boost. It\'s free.',
      cta_btn: 'Create my account for free',
      footer_tag: 'The social network that boosts your life.',
    },
  }[lang];

  return (
    <div className="min-h-screen bg-[#f7f8fa] font-sans">

      {/* ── NAVBAR ──────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-violet-700 rounded-xl flex items-center justify-center shadow-md">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black text-gray-900">Boost</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-3">
              {/* Language switcher */}
              <button
                onClick={() => setLang(l => l === 'fr' ? 'en' : 'fr')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <Globe className="w-4 h-4" />
                {lang === 'fr' ? 'EN' : 'FR'}
              </button>
              <Link
                href="/pre_connexion"
                className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {t.nav_login}
              </Link>
              <Link
                href="/pre_connexion/Inscriptions"
                className="px-5 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-600 to-violet-600 text-white hover:opacity-90 transition-opacity shadow-md shadow-purple-200"
              >
                {t.nav_register}
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(v => !v)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-100 bg-white px-4 pb-4"
            >
              <div className="flex flex-col gap-2 pt-3">
                <button
                  onClick={() => setLang(l => l === 'fr' ? 'en' : 'fr')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Globe className="w-4 h-4" />
                  {lang === 'fr' ? 'Switch to English' : 'Passer en Français'}
                </button>
                <Link href="/pre_connexion" onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 text-center">
                  {t.nav_login}
                </Link>
                <Link href="/pre_connexion/Inscriptions" onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-600 to-violet-600 text-white text-center">
                  {t.nav_register}
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left: Text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 border border-purple-100 text-purple-700 text-sm font-semibold mb-6"
              >
                {t.badge}
              </motion.div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-tight mb-6">
                {t.title.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {i === 2 ? (
                      <span className="bg-gradient-to-r from-purple-600 to-violet-500 bg-clip-text text-transparent">{line}</span>
                    ) : line}
                    {i < 2 && <br />}
                  </React.Fragment>
                ))}
              </h1>

              <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
                {t.subtitle}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link
                  href="/pre_connexion/Inscriptions"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-violet-600 text-white font-bold text-lg hover:opacity-90 transition-all shadow-lg shadow-purple-200 hover:shadow-xl hover:-translate-y-0.5"
                >
                  {t.cta1}
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/pre_connexion/Connexion"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white border-2 border-gray-200 text-gray-700 font-bold text-lg hover:border-purple-300 transition-colors"
                >
                  {t.cta2}
                </Link>
              </div>

              {/* Trust badges */}
              <div className="flex items-center gap-4 mt-8 justify-center lg:justify-start flex-wrap">
                {['Gratuit', 'Sans publicité', 'Sécurisé'].map(badge => (
                  <div key={badge} className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Check className="w-4 h-4 text-green-500" />
                    {badge}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right: Mock social card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="relative">
                {/* Decorative blobs */}
                <div className="absolute -top-10 -right-10 w-64 h-64 bg-purple-200 rounded-full blur-3xl opacity-30" />
                <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-violet-300 rounded-full blur-3xl opacity-20" />

                {/* Mock post card */}
                <div className="relative bg-white rounded-3xl shadow-xl border border-gray-100 p-6 max-w-sm mx-auto">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white font-bold">B</div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Boost Network</p>
                      <p className="text-xs text-gray-400">il y a 5 min · 🌍</p>
                    </div>
                    <div className="ml-auto">
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">Boosté</span>
                    </div>
                  </div>
                  <p className="text-gray-800 text-sm mb-4">
                    Bienvenue sur Boost ! 🎉 La plateforme qui connecte les personnes et booste les entreprises. Rejoignez-nous dès aujourd'hui ! <span className="text-purple-500">#Boost #RéseauSocial</span>
                  </p>
                  <div className="w-full h-36 bg-gradient-to-br from-purple-100 to-violet-100 rounded-xl flex items-center justify-center mb-4">
                    <Rocket className="w-12 h-12 text-purple-400" />
                  </div>
                  <div className="flex items-center justify-between text-gray-400 text-sm pt-3 border-t border-gray-50">
                    <button className="flex items-center gap-1.5 hover:text-red-400 transition-colors">
                      <Heart className="w-4 h-4 fill-red-400 text-red-400" /> <span className="text-gray-700 font-medium">324</span>
                    </button>
                    <button className="flex items-center gap-1.5 hover:text-purple-500 transition-colors">
                      <MessageCircle className="w-4 h-4" /> 48
                    </button>
                    <button className="flex items-center gap-1.5 hover:text-purple-500 transition-colors">
                      <Share2 className="w-4 h-4" /> 12
                    </button>
                  </div>
                </div>

                {/* Floating notification */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg border border-gray-100 p-3 flex items-center gap-2"
                >
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <Users className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">+128 nouveaux membres</p>
                    <p className="text-xs text-gray-400">cette semaine</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────────────────── */}
      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-purple-600 to-violet-700 rounded-3xl px-8 py-10">
          <div className="grid grid-cols-3 gap-4 sm:gap-8">
            <StatCard value={t.stat1_v} label={t.stat1_l} />
            <StatCard value={t.stat2_v} label={t.stat2_l} />
            <StatCard value={t.stat3_v} label={t.stat3_l} />
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">{t.features_title}</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">{t.features_subtitle}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard icon={Users} title={t.f1_t} desc={t.f1_d} color="bg-blue-500" />
            <FeatureCard icon={Zap} title={t.f2_t} desc={t.f2_d} color="bg-purple-500" />
            <FeatureCard icon={TrendingUp} title={t.f3_t} desc={t.f3_d} color="bg-violet-500" />
            <FeatureCard icon={Shield} title={t.f4_t} desc={t.f4_d} color="bg-green-500" />
          </div>
        </div>
      </section>

      {/* ── PUBLIC FEED ──────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">{t.feed_title}</h2>
            <p className="text-gray-500 text-lg">{t.feed_sub}</p>
          </div>

          {loadingPosts ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin w-10 h-10 text-purple-500" />
            </div>
          ) : posts.length > 0 ? (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {posts.map(post => (
                  <PublicPostCard key={post.id} post={post} />
                ))}
              </div>
              {/* CTA to see more */}
              <div className="text-center">
                <Link
                  href="/pre_connexion"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-violet-600 text-white font-bold hover:opacity-90 transition shadow-lg shadow-purple-200"
                >
                  {t.feed_cta}
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="w-10 h-10 text-purple-300" />
              </div>
              <p className="text-gray-400 text-lg mb-6">{t.feed_empty}</p>
              <Link
                href="/pre_connexion/Inscriptions"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-violet-600 text-white font-bold hover:opacity-90 transition"
              >
                {t.cta1} <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-purple-600 via-violet-600 to-purple-800 rounded-3xl p-10 sm:p-16 shadow-2xl shadow-purple-200"
          >
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">{t.cta_title}</h2>
            <p className="text-purple-100 text-lg mb-8">{t.cta_sub}</p>
            <Link
              href="/pre_connexion/Inscriptions"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-white text-purple-700 font-black text-lg hover:bg-purple-50 transition shadow-lg"
            >
              {t.cta_btn}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-violet-700 rounded-xl flex items-center justify-center">
                <Rocket className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-black text-lg">Boost</span>
              <span className="text-sm ml-2">{t.footer_tag}</span>
            </div>
            <div className="flex items-center gap-6 text-sm flex-wrap justify-center">
              <Link href="#" className="hover:text-white transition-colors">À propos</Link>
              <Link href="#" className="hover:text-white transition-colors">Confidentialité</Link>
              <Link href="#" className="hover:text-white transition-colors">CGU</Link>
              <Link href="#" className="hover:text-white transition-colors">Contact</Link>
              <button
                onClick={() => setLang(l => l === 'fr' ? 'en' : 'fr')}
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                <Globe className="w-4 h-4" />
                {lang === 'fr' ? 'EN' : 'FR'}
              </button>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            © {new Date().getFullYear()} Boost Social Network. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}
