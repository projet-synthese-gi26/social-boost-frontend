// i18n.ts
import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const locales = ['fr', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'fr';

export default getRequestConfig(async ({ locale }) => {
  // 1. On s'assure que la locale est valide
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // 2. On force le type ici pour satisfaire TypeScript
  const safeLocale = locale as Locale;

  return {
    locale: safeLocale, // Ici, TypeScript est maintenant certain que c'est une string
    messages: (await import(`./messages/${safeLocale}.json`)).default,
  };
});