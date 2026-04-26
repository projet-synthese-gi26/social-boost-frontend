// middleware.ts — Gestion des langues (next-intl)
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed', // /fr/... ou / (pas de préfixe pour la langue par défaut)
});

export const config = {
  // Appliquer le middleware à toutes les routes sauf API, _next, fichiers statiques
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icon.svg|.*\\.svg).*)'],
};
