"use client";
import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import PageManagement from '@/features/post_connexion/pages/PageManagements';
import { Loader2, Flag } from 'lucide-react';
import { usePage, useUser } from '@lib/hooks/useAPI';

// --- Composant interne pour gérer la logique après avoir obtenu l'ID ---
function PageContent({ pageId }: { pageId: string }) {
    const router = useRouter();
    const { page, pagePosts, isLoading, error, refresh } = usePage(pageId);
    const { user } = useUser();

    const ownerId = page ? (typeof page.owner === 'string' ? page.owner : (page.owner as any)?.id) : null;
    const isOwner = !!(user?.id && ownerId && user.id === ownerId);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center">
                <Loader2 className="animate-spin h-10 w-10 text-purple-600 mb-4" />
                <p className="text-gray-500 font-bold">Chargement de la page...</p>
            </div>
        );
    }

    if (error || !page) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
                <Flag size={48} className="text-red-400 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900">Page introuvable</h2>
                <p className="text-gray-500 mt-2">Cette page n'existe pas ou a été supprimée.</p>
                <button onClick={() => router.push('/post_connexion/Accueils')} className="mt-6 px-8 py-2 bg-purple-600 text-white rounded-lg font-bold shadow-lg">
                    Retour à l'accueil
                </button>
            </div>
        );
    }

    return (
        <PageManagement
            initialPage={page}
            initialPosts={pagePosts}
            onBack={() => router.push('/post_connexion/Accueils')}
            refresh={refresh}
            isOwner={isOwner}
        />
    );
}


// --- Composant principal qui extrait l'ID ---
export default function PageView() {
    const params = useParams();
    const pageId = params.id as string;

    // Affiche un chargement tant que l'ID n'est pas disponible
    if (!pageId) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center">
                <Loader2 className="animate-spin h-10 w-10 text-purple-600 mb-4" />
                <p className="text-gray-500 font-bold">Vérification de la page...</p>
            </div>
        );
    }

    return <PageContent pageId={pageId} />;
}