// src/app/post_connexion/search/page.tsx
'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useSearch } from '@lib/hooks/useAPI';
import { Loader2 } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { getEntityHref, getFullImageUrl } from '@/utils/utils';
import type { User, Page } from '@lib/types/api.types';

// --- Composants de carte de résultat ---
function UserSearchResultCard({ user }: { user: User }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4">
      <Avatar src={getFullImageUrl(user.profile_picture_url)} alt={user.first_name} size="lg" />
      <div className="flex-1">
        <Link href={getEntityHref('user', user.id)}>
          <span className="font-bold text-lg text-gray-900 hover:underline">{user.first_name} {user.last_name}</span>
        </Link>
        {/* On pourrait ajouter des infos comme les amis en commun ici */}
      </div>
      {/* On pourrait ajouter un bouton 'Ajouter' ici */}
    </div>
  );
}

function PageSearchResultCard({ page }: { page: Page }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4">
      <Avatar src={getFullImageUrl(page.profile_picture_url)} alt={page.name} size="lg" />
      <div className="flex-1">
        <Link href={getEntityHref('page', page.id)}>
          <span className="font-bold text-lg text-gray-900 hover:underline">{page.name}</span>
        </Link>
        <p className="text-sm text-gray-500">{page.category} • {page.subscribers_count} abonnés</p>
      </div>
      {/* On pourrait ajouter un bouton 'S'abonner' ici */}
    </div>
  );
}

// --- Composant principal de la page ---
function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const { results, isLoading, error } = useSearch(query);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin h-10 w-10 text-purple-600" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 py-20">{error}</div>;
  }

  if (!results || (results.users.length === 0 && results.pages.length === 0)) {
    return (
      <div className="text-center text-gray-500 py-20">
        <h2 className="text-xl font-bold">Aucun résultat</h2>
        <p>Nous n'avons trouvé aucun résultat pour "{query}".</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Résultats de recherche pour "{query}"</h1>
      
      <div className="space-y-8">
        {results.users.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Profils</h2>
            <div className="space-y-3">
              {results.users.map(user => (
                <UserSearchResultCard key={user.id} user={user} />
              ))}
            </div>
          </section>
        )}

        {results.pages.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Pages</h2>
            <div className="space-y-3">
              {results.pages.map(page => (
                <PageSearchResultCard key={page.id} page={page} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// --- Export de la page avec Suspense ---
export default function SearchPage() {
  return (
    <Suspense fallback={<Loader2 className="animate-spin h-10 w-10 text-purple-600 mx-auto mt-20" />}>
      <SearchResults />
    </Suspense>
  );
}
