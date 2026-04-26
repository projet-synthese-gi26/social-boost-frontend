'use client';

/**
 * src/features/pre_connexion/Connexion/LoginPage.tsx
 * Ta page de connexion d'origine — déplacée ici pour libérer la route /
 * La route / est désormais la landing page.
 * Cette page est accessible à /pre_connexion
 *
 * Modifications apportées :
 *  - Lien "Rejoindre" mis à jour → /pre_connexion/Inscriptions (déjà correct)
 *  - Le logo/titre reste "Boost" (cohérent avec la landing)
 */

import React, { useState } from 'react';
import { useAuth } from '@lib/hooks/useAPI';
import Link from 'next/link';
import {
  Mail, Lock, Loader2, ArrowRight, Heart, MessageCircle,
  Share2, MoreHorizontal, ThumbsUp, Rocket, MapPin, Bus,
  Eye, EyeOff
} from 'lucide-react';

export default function LoginPage() {
  const { login, isLoading, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      await login({
        username: email,
        password,
      });
      // La redirection est gérée dans le hook useAuth
    } catch {
      // L'erreur est gérée et affichée par le hook
    }
  }

  return (
    <div className="flex min-h-screen w-full font-sans bg-[#0A0A0B] text-white selection:bg-violet-500/30">

      {/* ================================================================
          PARTIE GAUCHE : VISUEL "FEED SOCIAL" (identique à l'original)
         ================================================================ */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col items-center justify-center p-12">

        {/* Fond grille + aurores */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-violet-600/40 rounded-full blur-[120px] animate-blob mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-fuchsia-600/30 rounded-full blur-[120px] animate-blob animation-delay-2000 mix-blend-screen" />

        {/* Carte post en verre */}
        <div className="relative z-10 w-full max-w-md">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-5 shadow-2xl ring-1 ring-white/5 transform transition-all hover:scale-[1.01] duration-500">

            {/* Header du post */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 p-[2px]">
                  <div className="w-full h-full rounded-full bg-[#18181B] flex items-center justify-center">
                    <span className="font-bold text-[10px] text-white">FNX</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Finexs Voyages</div>
                  <div className="text-[10px] text-gray-400 flex items-center gap-1">
                    il y a 15 min · <span className="bg-white/20 w-3 h-3 rounded-full flex items-center justify-center text-[8px]">🌍</span>
                  </div>
                </div>
              </div>
              <MoreHorizontal className="text-gray-500 w-5 h-5" />
            </div>

            {/* Contenu du post */}
            <div className="mb-4 space-y-3">
              <p className="text-sm text-gray-200 leading-relaxed">
                Embarquement terminé à l'agence de Mvan ! Notre bus VIP de 14h00 en direction de Douala est prêt. Bon voyage à tous ! 🚌✨{' '}
                <span className="text-violet-400">#Transport #Yaoundé #Douala #VIP</span>
              </p>
              <div className="w-full h-56 rounded-xl border border-white/5 relative overflow-hidden group cursor-pointer shadow-lg shadow-black/30 bg-gradient-to-br from-violet-900/40 to-purple-900/40 flex items-center justify-center">
                <Rocket className="w-16 h-16 text-violet-400/60" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full text-xs text-white border border-white/10 flex items-center gap-2 z-10">
                  <MapPin className="w-3 h-3 text-violet-400" /> Agence de Mvan, Yaoundé
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="border-t border-white/10 pt-3 flex items-center justify-between text-gray-400">
              <button className="flex items-center gap-2 hover:text-red-400 transition-colors group">
                <Heart className="w-5 h-5 group-hover:fill-red-400 transition-all" />
                <span className="text-xs">342 J'aime</span>
              </button>
              <button className="flex items-center gap-2 hover:text-violet-400 transition-colors">
                <MessageCircle className="w-5 h-5" />
                <span className="text-xs">28 Commentaires</span>
              </button>
              <button className="flex items-center gap-2 hover:text-white transition-colors">
                <Share2 className="w-5 h-5" />
                <span className="text-xs">Partager</span>
              </button>
            </div>
          </div>

          {/* Carte flottante suggestion */}
          <div className="absolute -right-12 bottom-20 bg-[#18181B] border border-white/10 p-3 rounded-xl shadow-2xl flex items-center gap-3 animate-float max-w-[200px]">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center p-2">
                <Bus className="text-gray-300 w-full h-full" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-violet-600 rounded-full p-0.5 border-2 border-[#18181B]">
                <ThumbsUp className="w-3 h-3 text-white" />
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-white">Buca Voyages</div>
              <div className="text-[10px] text-gray-400">Suggestion de page</div>
            </div>
            <button className="bg-violet-600/20 text-violet-400 p-1.5 rounded-lg hover:bg-violet-600 hover:text-white transition-colors">
              <span className="text-xs font-bold">+</span>
            </button>
          </div>
        </div>

        <div className="absolute bottom-10 text-center z-10">
          <p className="text-white/40 text-sm font-light tracking-wide">Développez votre réseau d'affaires.</p>
        </div>
      </div>

      {/* ================================================================
          PARTIE DROITE : FORMULAIRE LOGIN
         ================================================================ */}
      <div className="flex flex-1 flex-col items-center justify-center p-6 bg-black lg:bg-[#0A0A0B]">
        <div className="w-full max-w-[400px]">

          {/* Logo mobile */}
          <div className="lg:hidden flex items-center gap-2 mb-12">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl flex items-center justify-center shadow-md">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">Boost</span>
          </div>

          {/* Lien retour landing — visible sur desktop aussi */}
          <div className="mb-6 hidden lg:flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm">
              <div className="w-7 h-7 bg-violet-600/20 rounded-lg flex items-center justify-center">
                <Rocket className="w-4 h-4 text-violet-400" />
              </div>
              <span>Boost</span>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Bon retour.</h1>
            <p className="text-gray-400">Heureux de vous revoir sur Boost.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">

            {/* Email */}
            <div className="group">
              <label className="block text-xs font-medium text-gray-500 mb-1.5 ml-1 uppercase tracking-wider">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-violet-400 transition-colors" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  className="block w-full pl-11 pr-4 py-3.5 bg-[#18181B] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all shadow-sm"
                  placeholder="nom@exemple.com"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div className="group">
              <div className="flex items-center justify-between mb-1.5 ml-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mot de passe
                </label>
                <a href="#" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                  Oublié ?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-violet-400 transition-colors" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  className="block w-full pl-11 pr-12 py-3.5 bg-[#18181B] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all shadow-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-violet-400 transition-colors"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Bouton submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="relative w-full py-3.5 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 overflow-hidden group shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(139,92,246,0.3)] mt-2"
            >
              {isLoading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <>
                  <span>Se connecter</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
              <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent z-10" />
            </button>
          </form>

          {/* Message d'erreur */}
          {error && (
            <p className="text-red-500 text-sm text-center mt-4">{error}</p>
          )}

          {/* Séparateur */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#0A0A0B] px-2 text-gray-500">Ou continuer avec</span>
            </div>
          </div>

          {/* Google */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-white/10 rounded-lg hover:bg-white/5 transition-colors text-sm text-gray-300 group"
          >
            <svg className="h-4 w-4 text-gray-300 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
            </svg>
            <span>Continuer avec Google</span>
          </button>

          {/* Lien inscription */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Pas encore de compte ?{' '}
              <Link
                href="/pre_connexion/Inscriptions"
                className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
              >
                Créer un compte
              </Link>
            </p>
          </div>

          {/* Retour à l'accueil */}
          <div className="mt-4 text-center">
            <Link href="/" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
              ← Retour à l'accueil
            </Link>
          </div>

        </div>
      </div>

      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        @keyframes shimmer { 100% { transform: translateX(100%); } }
        .animate-blob { animation: blob 7s infinite; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
      `}</style>
    </div>
  );
}