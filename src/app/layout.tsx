import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Boost — Le réseau social qui booste votre vie',
    template: '%s | Boost',
  },
  description:
    'Boost est la plateforme sociale nouvelle génération. Partagez vos moments, connectez-vous avec vos proches et propulsez votre activité.',
  keywords: ['réseau social', 'boost', 'social network', 'partage', 'amis', 'communauté'],
  authors: [{ name: 'Boost Team' }],
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    alternateLocale: ['en_US'],
    siteName: 'Boost',
    title: 'Boost — Le réseau social qui booste votre vie',
    description: 'Partagez, connectez-vous et boostez votre présence sur Boost.',
  },
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      translate="no"
      suppressHydrationWarning
    >
      <head>
        <meta name="google" content="notranslate" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
