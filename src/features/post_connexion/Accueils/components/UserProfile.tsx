"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PostCard from './PostCard';
import { UserProfileProps } from '../types';
import FriendList from './FriendList';
import PhotoGallery from './PhotoGallery';
import { AnimatePresence, motion } from 'framer-motion';
import TabButton from './TabButton';
import { useUser, usePosts } from '@lib/hooks/useAPI'; // Utilisation de vos hooks réels
import { getFullImageUrl } from '@/utils/utils';

const UserProfile = ({ userId }: UserProfileProps) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'posts' | 'friends' | 'photos'>('posts');
  
  // Utilisation des hooks réels connectés au backend
  const { user: currentUser, isLoading: loadingUser } = useUser();
  const { posts: allPosts, isLoading: loadingPosts, likePost } = usePosts();

  // Filtrer les posts pour n'afficher que ceux de l'utilisateur concerné
  const userPosts = allPosts.filter(post => post.author.id === userId);

  if (loadingUser || loadingPosts) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#f0f2f5] dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-b-2xl">
          {/* Cover Photo */}
          <div className="relative h-48 sm:h-80 w-full bg-gray-200 overflow-hidden">
            <img
              src={getFullImageUrl(currentUser?.profile_picture_url) || 'https://picsum.photos/1200/400'}
              alt="Cover"
              className="w-full h-full object-cover rounded-t-lg"
            />
          </div>

          {/* Profile Info */}
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-20 sm:-mt-24">
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl flex-shrink-0 bg-white">
                <img
                  src={getFullImageUrl(currentUser?.profile_picture_url)}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-4 sm:mt-0 sm:ml-6 flex-grow text-center sm:text-left pb-2">
                <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
                  {currentUser?.first_name} {currentUser?.last_name}
                </h1>
                <div className="flex justify-center sm:justify-start space-x-6 mt-2 text-gray-600 dark:text-gray-300 font-medium">
                  <div><span className="font-bold text-gray-900">{userPosts.length}</span> publications</div>
                  <div><span className="font-bold text-gray-900">0</span> abonnés</div>
                </div>
              </div>
              <div className="mt-4 sm:mt-0 pb-2">
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-purple-100">
                  Modifier le profil
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Selection */}
        <div className="mt-4 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-1.5 flex space-x-1">
          <TabButton name="Publications" activeTab={activeTab} onClick={() => setActiveTab('posts')} />
          <TabButton name="Amis" activeTab={activeTab} onClick={() => setActiveTab('friends')} />
          <TabButton name="Photos" activeTab={activeTab} onClick={() => setActiveTab('photos')} />
        </div>

        {/* Tab Content */}
        <div className="mt-4 pb-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'posts' && (
                <div className="space-y-4">
                  {userPosts.length > 0 ? (
                    userPosts.map((post) => (
                      <PostCard key={post.id} post={post} onLike={likePost} />
                    ))
                  ) : (
                    <div className="bg-white p-12 rounded-2xl shadow-sm text-center border-2 border-dashed border-gray-100">
                      <p className="text-gray-400 font-medium">Aucune publication à afficher.</p>
                    </div>
                  )}
                </div>
              )}
              {/* Amis et Photos (à connecter plus tard à vos autres services) */}
              {activeTab === 'friends' && <div className="p-10 text-center">Liste d'amis en cours...</div>}
              {activeTab === 'photos' && <div className="p-10 text-center">Galerie en cours...</div>}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;