"use client";

import React from 'react';
import { Home } from 'lucide-react';
import PostCard from '@/features/post_connexion/Accueils/components/PostCard';
import type { Post } from '@lib/types/api.types';

interface HomeeProps {
  posts: Post[];
  likePost?: (postId: string) => Promise<void>;
}

export default function Homee({ posts, likePost }: HomeeProps) {
  const safeLikePost = likePost || (async () => {});

  if (posts.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Home className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Bienvenue sur LogisLink !
        </h3>
        <p className="text-gray-500 mb-6">
          Commencez par créer votre première publication ou créer une page pour votre entreprise
        </p>
        <div className="text-sm text-gray-400">
          Utilisez les boutons ci-dessus pour commencer
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map(post => (
        <PostCard key={post.id} post={post} onLike={safeLikePost} />
      ))}
    </div>
  );
}