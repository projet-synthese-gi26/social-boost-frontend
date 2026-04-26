// src/features/navigation/Header.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Search, Bell, MessageSquare, Menu, X, Home, Users, Rocket } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { useUser, useFriends } from '@lib/hooks/useAPI';
import { searchService } from '@lib/api/services';
import type { SearchResults } from '@lib/types/api.types';
import { getEntityHref, getFullImageUrl } from '@/utils/utils';

export function Header() {
  const router = useRouter();
  const { user } = useUser();
  const { requests } = useFriends();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // États pour la recherche
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Effet pour la recherche avec debounce
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(null);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const searchResults = await searchService.search(query);
        setResults(searchResults);
      } catch (error) {
        console.error('Erreur de recherche:', error);
        setResults(null);
      } finally {
        setIsSearching(false);
      }
    }, 300); // Délai de 300ms

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Gérer le clic à l'extérieur pour fermer les suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchRef]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/post_connexion/search?q=${encodeURIComponent(query.trim())}`);
      setIsSearchFocused(false);
    }
  };

  const navLinks = [
    { href: '/post_connexion/Accueils', icon: Home, label: 'Accueil' },
    { href: '/post_connexion/Amis', icon: Users, label: 'Amis' },
    { href: '/post_connexion/Services', icon: Rocket, label: 'Services' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white shadow-sm flex items-center justify-between px-4 z-[60]">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-200 cursor-pointer">
          Log
        </div>
        <div ref={searchRef} className="relative hidden md:block">
          <form onSubmit={handleSearchSubmit}>
            <div className="flex items-center bg-gray-100 rounded-full px-3 py-1.5 border border-gray-200 focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-purple-500">
              <Search className="text-gray-700 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Rechercher sur Threadly" 
                className="bg-transparent border-none outline-none ml-2 text-sm w-48 text-gray-900 placeholder:text-gray-600"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
              />
            </div>
          </form>

          {/* --- PANNEAU DE SUGGESTIONS DE RECHERCHE --- */}
          {isSearchFocused && query.length > 1 && (
            <div className="absolute top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-10">
              <div className="p-2">
                {isSearching && (
                  <div className="p-4 text-center text-sm text-gray-800">Recherche en cours...</div>
                )}
                {!isSearching && results && (results.users.length > 0 || results.pages.length > 0) ? (
                  <ul className="max-h-96 overflow-y-auto">
                    {results.users.length > 0 && (
                      <li className="px-3 py-2 text-xs font-bold text-gray-700 uppercase">Profils</li>
                    )}
                    {results.users.map(user => (
                      <li key={`user-${user.id}`}>
                        <Link href={getEntityHref('user', user.id)}>
                          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                            <Avatar src={getFullImageUrl(user.profile_picture_url)} alt={user.first_name} size="sm" />
                            <span className="font-semibold text-sm text-gray-900">{user.first_name} {user.last_name}</span>
                          </div>
                        </Link>
                      </li>
                    ))}
                    {results.pages.length > 0 && (
                      <li className="px-3 py-2 mt-2 text-xs font-bold text-gray-700 uppercase border-t border-gray-100">Pages</li>
                    )}
                    {results.pages.map(page => (
                      <li key={`page-${page.id}`}>
                        <Link href={getEntityHref('page', page.id)}>
                          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                            <Avatar src={getFullImageUrl(page.profile_picture_url)} alt={page.name} size="sm" />
                            <span className="font-semibold text-sm text-gray-900">{page.name}</span>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : !isSearching && (
                  <div className="p-4 text-center text-sm text-gray-800">Aucun résultat pour "{query}"</div>
                )}
              </div>
              <div className="border-t border-gray-100">
                <button onClick={handleSearchSubmit} className="w-full text-left p-3 text-sm font-semibold text-purple-600 hover:bg-gray-50">
                  Voir tous les résultats pour "{query}"
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="md:hidden">
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-gray-100 rounded-full">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* --- NAVIGATION CENTRALE --- */}
      <div className="hidden md:flex flex-1 justify-center items-center gap-4">
        {navLinks.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link href={href} key={label}>
              <div className={`relative flex items-center justify-center w-24 h-12 rounded-lg cursor-pointer transition-colors duration-200 ${isActive ? 'bg-purple-50 text-purple-600' : 'hover:bg-gray-100'}`}>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                {isActive && (
                  <div className="absolute -bottom-1 left-0 right-0 h-1 bg-purple-600 rounded-t-full"></div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-4 mr-4">
          <div className="relative p-2 bg-gray-100 rounded-full cursor-pointer hover:bg-gray-200 transition">
            <Bell size={20} />
            {requests.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white font-bold">
                {requests.length}
              </span>
            )}
          </div>
          <div className="p-2 bg-gray-100 rounded-full cursor-pointer hover:bg-gray-200 transition">
            <MessageSquare size={20} />
          </div>
        </div>
        
        <div 
          className="flex items-center gap-2 pl-2 pr-1 py-1 bg-purple-50 hover:bg-purple-100 rounded-full cursor-pointer transition border border-purple-100"
          onClick={() => router.push('/post_connexion/Profils')}
        >
          <span className="hidden lg:block font-bold text-xs text-purple-700 px-1">
            {user?.first_name}
          </span>
          <Avatar src={getFullImageUrl(user?.profile_picture_url)} alt={user?.first_name || 'M'} size="sm" />
        </div>
      </div>
    </header>
  );
}

export default Header;
