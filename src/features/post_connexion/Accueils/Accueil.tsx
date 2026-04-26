'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, Bell, ImageIcon, Rocket, 
  MessageSquare, Menu, X, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- IMPORT DES COMPOSANTS ---
import { Avatar } from "@/components/ui/Avatar";
import { Header, LeftSidebar, RightSidebar } from "@/features/navigation/index";
import { StoryReel } from "@/features/post_connexion/Accueils/components/StoryReel";
import { SuggestionList } from "@/features/post_connexion/Accueils/components/SuggestionList";
import PostCard from '@/features/post_connexion/Accueils/components/PostCard';
import CreatePostModal from '@/features/post_connexion/Accueils/components/CreatePostModal';
import CreatePageModal from '@/features/post_connexion/Accueils/components/CreatePageModal';

// --- IMPORT DES HOOKS API ---
import { useUser, usePosts, usePages, useFriends } from '@lib/hooks/useAPI';
import { authService } from '@lib/api/services';
import { getFullImageUrl } from '@/utils/utils';
import type { Post } from '@lib/types/api.types';

export default function HomePage() {
  const router = useRouter();
  
  // États pour les modales
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreatePage, setShowCreatePage] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // RÉCUPÉRATION DES DONNÉES RÉELLES DU BACKEND
  const { user, isLoading: userLoading } = useUser();
  const { 
    posts, 
    isLoading: postsLoading, 
    error: postsError, 
    likePost, 
    prependPost,
    refresh: refreshFeed,
    loadMore,
    hasMore 
  } = usePosts();
  
  const { pages, refresh: refreshPages } = usePages();
  const { friends, requests } = useFriends();

  // RÉFÉRENCE POUR LE SCROLL INFINI
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Sécurité : Redirection si non connecté
  useEffect(() => {
    if (!userLoading && !authService.isAuthenticated()) {
      router.push('/');
    }
  }, [userLoading, router]);

  // LOGIQUE INTERSECTION OBSERVER (SCROLL INFINI)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !postsLoading) {
          loadMore();
        }
      },
      { threshold: 0.5 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, postsLoading, loadMore]);

  // Handlers pour les créations
  const handlePostCreated = (post: Post) => {
    setShowCreatePost(false);
    if (post) prependPost(post);
    setTimeout(() => {
      refreshFeed();
    }, 250);
  };

  const handlePageCreated = () => {
    setShowCreatePage(false);
    refreshPages(); // Recharge la liste des pages
  };

  if (userLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <Loader2 className="animate-spin h-12 w-12 text-purple-600" />
      </div>
    );
  }

  return (
    <>
      <div className="max-w-[580px] mx-auto">
            
            {/* 1. Stories */}
            <StoryReel />

            {/* 2. Create Post Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-5">
              <div className="flex items-center gap-3 mb-4">
                <Avatar src={getFullImageUrl(user?.profile_picture_url)} />
                <button 
                  onClick={() => setShowCreatePost(true)}
                  className="flex-1 text-left px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-900 transition-colors text-sm font-medium"
                >
                  À quoi pensez-vous, {user?.first_name} ?
                </button>
              </div>
              <div className="flex items-center justify-around pt-3 border-t border-gray-50">
                <button 
                  onClick={() => setShowCreatePost(true)}
                  className="flex items-center gap-2 px-6 py-2 hover:bg-gray-50 rounded-lg transition text-red-500 font-semibold text-sm"
                >
                  <ImageIcon size={20} /> Photo/Vidéo
                </button>
                <button 
                  onClick={() => setShowCreatePage(true)}
                  className="flex items-center gap-2 px-6 py-2 hover:bg-gray-50 rounded-lg transition text-purple-600 font-semibold text-sm"
                >
                  <Rocket size={20} /> Créer une Page
                </button>
              </div>
            </div>

            {/* 3. Feed d'actualité (Données Backend) */}
            <div className="space-y-4">
              {posts.length > 0 ? (
                posts.map((post, index) => (
                  <React.Fragment key={post.id}>
                    <PostCard post={post} onLike={likePost} />
                    {/* Insertion des suggestions d'amis tous les quelques posts */}
                    {index === 2 && <SuggestionList />}
                  </React.Fragment>
                ))
              ) : !postsLoading && (
                <div className="bg-white p-12 rounded-xl text-center border-2 border-dashed border-gray-200">
                  <p className="text-gray-900 font-medium">Aucune publication pour le moment.</p>
                </div>
              )}

              {/* Loader de pagination (Scroll Infini) */}
              <div ref={loadMoreRef} className="py-8 flex justify-center">
                {postsLoading ? (
                  <Loader2 className="animate-spin h-8 w-8 text-purple-600" />
                ) : !hasMore && posts.length > 0 ? (
                  <p className="text-gray-800 text-sm font-medium">Vous avez rattrapé tout le contenu !</p>
                ) : null}
              </div>
            </div>

            {postsError && (
              <div className="bg-white p-6 rounded-xl border border-red-100 text-center mb-10">
                <p className="text-red-500 font-medium">{postsError}</p>
                <button onClick={() => refreshFeed()} className="mt-2 text-purple-600 text-sm underline font-bold">Réessayer</button>
              </div>
            )}
          </div>
      {/* --- MODALES --- */}
      <AnimatePresence>
        {showCreatePost && (
          <CreatePostModal 
            isOpen={showCreatePost} 
            onClose={() => setShowCreatePost(false)} 
            onPostCreated={handlePostCreated} 
          />
        )}
        
        {showCreatePage && (
          <CreatePageModal 
            isOpen={showCreatePage} 
            onClose={() => setShowCreatePage(false)} 
            onPageCreated={handlePageCreated}
          />
        )}
      </AnimatePresence>
    </>
  );
}