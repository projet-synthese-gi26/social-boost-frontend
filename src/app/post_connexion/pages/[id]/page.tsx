"use client";

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PageManagement from '@/features/post_connexion/pages/PageManagements';
import { usePage, useUser } from '@lib/hooks/useAPI';

export default function PageView() {
  const params = useParams();
  const router = useRouter();
  const pageId = params.id as string | undefined;
  const { user: currentUser } = useUser();
  const { page, pagePosts, isLoading, error, refresh } = usePage(pageId || '');

  const isOwner = useMemo(() => {
    if (!currentUser?.id || !page?.owner) return false;
    const ownerId = typeof page.owner === 'string' ? page.owner : page.owner.id;
    return ownerId === currentUser.id;
  }, [currentUser?.id, page?.owner]);

  const handleBack = () => {
    router.push('/post_connexion');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la page...</p>
        </div>
      </div>
    );
  }

  if (!page || error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Page introuvable</h2>
          <p className="text-gray-600 mb-6">Cette page n'existe pas ou a été supprimée.</p>
          <button 
            onClick={handleBack}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <PageManagement
        initialPage={page}
        initialPosts={pagePosts}
        onBack={handleBack}
        refresh={refresh}
        isOwner={isOwner}
      />
    </div>
  );
}
