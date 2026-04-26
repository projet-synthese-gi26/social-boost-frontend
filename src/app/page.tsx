'use client';

/**
 * src/app/page.tsx — Page racine
 * Redirige vers la landing page si non connecté,
 * sinon vers le fil d'actualité.
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@lib/api/services';
import LandingPage from '@/components/landing/LandingPage';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Si l'utilisateur est déjà connecté, le rediriger directement vers l'accueil
    if (authService.isAuthenticated()) {
      router.replace('/post_connexion/Accueils');
    }
  }, [router]);

  // Afficher la landing page pour les visiteurs non connectés
  return <LandingPage />;
}
