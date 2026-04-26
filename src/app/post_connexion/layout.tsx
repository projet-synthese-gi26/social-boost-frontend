'use client';

/**
 * src/app/post_connexion/layout.tsx
 * Layout principal après connexion — Responsive mobile/tablet/desktop
 */

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Header, LeftSidebar, RightSidebar } from '@/features/navigation';
import { useFriends } from '@lib/hooks/useAPI';
import { Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function PostConnexionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { friends } = useFriends();
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const isProfilePage = pathname.includes('/Profils');
  const isFullWidthPage =
    pathname.includes('/pages/') ||
    pathname.includes('/search');

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      <Header />

      {/* Mobile Sidebar Toggle — visible uniquement sur mobile */}
      {!isProfilePage && (
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="fixed bottom-6 right-6 z-40 xl:hidden w-12 h-12 bg-purple-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-purple-700 transition-colors"
          aria-label="Ouvrir le menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 xl:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-72 bg-white shadow-2xl xl:hidden overflow-y-auto"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <span className="font-bold text-gray-900">Menu</span>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="pt-2">
                <LeftSidebar friends={friends} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main layout grid */}
      <div className="pt-14 flex justify-between min-h-screen max-w-[1400px] mx-auto">

        {/* Left Sidebar — Desktop only */}
        {!isProfilePage && (
          <aside className="hidden xl:block w-[280px] flex-shrink-0 sticky top-14 h-[calc(100vh-56px)] overflow-y-auto">
            <LeftSidebar friends={friends} />
          </aside>
        )}

        {/* Main content */}
        <main
          className={`
            flex-1 min-w-0 px-4 py-4 md:px-6 md:py-6
            ${!isProfilePage && !isFullWidthPage
              ? 'xl:max-w-[680px] 2xl:max-w-[720px]'
              : 'max-w-full'}
          `}
        >
          {children}
        </main>

        {/* Right Sidebar — Tablets & Desktop */}
        {!isProfilePage && !isFullWidthPage && (
          <aside className="hidden lg:block w-[300px] xl:w-[320px] flex-shrink-0 sticky top-14 h-[calc(100vh-56px)] overflow-y-auto">
            <RightSidebar />
          </aside>
        )}
      </div>
    </div>
  );
}
