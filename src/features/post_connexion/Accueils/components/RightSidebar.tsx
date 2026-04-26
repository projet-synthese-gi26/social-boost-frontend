"use client";

import React, { useMemo, useState } from "react";
import { UserPlus, Gift } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar"; 
import { useRouter } from 'next/navigation';
import { useFriends, useUser } from '@lib/hooks/useAPI';
import { getFullImageUrl } from '@/utils/utils';

export const RightSidebar = () => {
  const router = useRouter();
  const { user } = useUser();
  const {
    requests,
    suggestions,
    updateRequest,
    sendRequest,
    refresh,
    isLoading,
  } = useFriends();

  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const profileCompletion = useMemo(() => {
    const fields: Array<{ key: string; ok: boolean }> = [
      { key: 'first_name', ok: !!user?.first_name },
      { key: 'last_name', ok: !!user?.last_name },
      { key: 'username', ok: !!user?.username },
      { key: 'city', ok: !!user?.city },
      { key: 'gender', ok: !!user?.gender },
      { key: 'birth_date', ok: !!user?.birth_date },
      { key: 'interests', ok: Array.isArray(user?.interests) && (user?.interests?.length || 0) > 0 },
      { key: 'profile_picture_url', ok: !!user?.profile_picture_url },
      { key: 'cover_photo_url', ok: !!user?.cover_photo_url },
    ];
    const total = fields.length;
    const done = fields.filter(f => f.ok).length;
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;
    const missing = fields.find(f => !f.ok)?.key || null;
    return { percent, missing };
  }, [user]);

  const missingHint = profileCompletion.missing
    ? (
      profileCompletion.missing === 'profile_picture_url'
        ? 'Ajoutez une photo de profil pour améliorer votre visibilité.'
        : profileCompletion.missing === 'cover_photo_url'
          ? 'Ajoutez une photo de couverture pour un profil plus complet.'
          : profileCompletion.missing === 'interests'
            ? "Ajoutez vos centres d'intérêt pour de meilleures suggestions."
            : "Complétez votre profil pour atteindre 100%."
    )
    : 'Profil complet, bravo !';

  const safeSetProcessing = (id: string, on: boolean) => {
    setProcessingIds(prev => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleAccept = async (friendshipId: string) => {
    if (!friendshipId || processingIds.has(friendshipId)) return;
    safeSetProcessing(friendshipId, true);
    try {
      await updateRequest(friendshipId, 'ACCEPTED');
      await refresh();
    } finally {
      safeSetProcessing(friendshipId, false);
    }
  };

  const handleDecline = async (friendshipId: string) => {
    if (!friendshipId || processingIds.has(friendshipId)) return;
    safeSetProcessing(friendshipId, true);
    try {
      await updateRequest(friendshipId, 'DECLINED');
      await refresh();
    } finally {
      safeSetProcessing(friendshipId, false);
    }
  };

  const handleSendRequest = async (userId: string) => {
    if (!userId || processingIds.has(userId)) return;
    safeSetProcessing(userId, true);
    try {
      await sendRequest(userId);
      await refresh();
    } finally {
      safeSetProcessing(userId, false);
    }
  };

  return (
    <aside className="hidden xl:block w-[300px] fixed right-0 top-14 h-[calc(100vh-56px)] overflow-y-auto p-4 scrollbar-hide">
      <div className="space-y-6">
        
        {/* --- 1. WIDGET GAMIFICATION --- */}
        <div className="bg-gradient-to-br from-[#9333ea] to-indigo-600 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden group transition-all hover:shadow-purple-200 hover:shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-white/20 transition duration-500"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-10 -mb-10 blur-xl"></div>
            
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <Gift size={20} className="text-white" />
                    </div>
                    <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
                        Niveau 2
                    </span>
                </div>
                
                <h3 className="font-bold text-lg leading-tight mb-1">Profil complété à {profileCompletion.percent}%</h3>
                <p className="text-purple-100 text-xs mb-3 opacity-90">{missingHint}</p>
                
                <div className="w-full h-2 bg-black/20 rounded-full mb-4 overflow-hidden">
                    <div
                      className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)] relative"
                      style={{ width: `${profileCompletion.percent}%` }}
                    >
                        <div className="absolute inset-0 bg-white/50 w-full animate-[shimmer_2s_infinite]"></div>
                    </div>
                </div>
                
                <button
                  onClick={() => router.push('/post_inscription')}
                  className="w-full bg-white text-purple-700 font-bold py-2.5 rounded-xl text-sm hover:bg-purple-50 transition shadow-sm active:scale-95"
                >
                    Compléter mon profil
                </button>
            </div>
        </div>

        {/* --- 2. SUGGESTIONS D'AMIS --- */}
        <div>
            <div className="flex justify-between items-center mb-4 px-1">
                <h3 className="font-semibold text-gray-900 text-sm">Invitations</h3>
                <button
                  onClick={() => router.push('/post_connexion/Amis')}
                  className="text-purple-600 text-xs cursor-pointer hover:underline"
                >
                  Tout voir
                </button>
            </div>
            
            <div className="space-y-4">
                {!isLoading && (!requests || requests.length === 0) ? (
                  <div className="text-xs text-gray-800 px-1">Aucune invitation pour le moment.</div>
                ) : null}

                {(requests || []).slice(0, 3).map((req: any) => {
                  const from = req.requester;
                  const busy = processingIds.has(req.id);
                  return (
                    <div key={req.id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                          <Avatar src={getFullImageUrl(from?.profile_picture_url)} alt={from?.first_name || 'User'} />
                        </div>
                        <div className="min-w-0">
                          <button
                            onClick={() => from?.id && router.push(`/post_connexion/Profils/${from.id}`)}
                            className="font-semibold text-sm text-gray-900 truncate hover:underline text-left"
                          >
                            {from?.first_name} {from?.last_name}
                          </button>
                          {from?.mutual_friends_count ? (
                            <p className="text-xs text-gray-800">{from.mutual_friends_count} ami(s) en commun</p>
                          ) : (
                            <p className="text-xs text-gray-800">Invitation reçue</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          disabled={busy}
                          onClick={() => handleAccept(req.id)}
                          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-2 rounded-lg transition disabled:opacity-60"
                        >
                          Confirmer
                        </button>
                        <button
                          disabled={busy}
                          onClick={() => handleDecline(req.id)}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-2 rounded-lg transition disabled:opacity-60"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
        </div>

        {/* --- 2b. PERSONNES QUE VOUS POURRIEZ CONNAÎTRE --- */}
        <div>
          <div className="flex justify-between items-center mb-4 px-1">
            <h3 className="font-semibold text-gray-900 text-sm">Suggestions</h3>
            <button
              onClick={() => router.push('/post_connexion/Amis')}
              className="text-purple-600 text-xs cursor-pointer hover:underline"
            >
              Tout voir
            </button>
          </div>

          <div className="space-y-3">
            {!isLoading && (!suggestions || suggestions.length === 0) ? (
              <div className="text-xs text-gray-800 px-1">Aucune suggestion.</div>
            ) : null}

            {(suggestions || []).slice(0, 4).map((u: any) => {
              const busy = processingIds.has(u.id);
              return (
                <div key={u.id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    <Avatar src={getFullImageUrl(u.profile_picture_url)} alt={u.first_name || 'User'} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <button
                      onClick={() => router.push(`/post_connexion/Profils/${u.id}`)}
                      className="text-left font-semibold text-sm text-gray-900 truncate hover:underline w-full"
                    >
                      {u.first_name} {u.last_name}
                    </button>
                    <p className="text-xs text-gray-800 truncate">@{u.username || u.email}</p>
                  </div>
                  <button
                    disabled={busy}
                    onClick={() => handleSendRequest(u.id)}
                    className="px-3 py-2 bg-purple-50 text-purple-700 font-bold text-xs rounded-lg border border-purple-100 hover:bg-purple-100 transition disabled:opacity-60"
                    title="Ajouter"
                  >
                    <UserPlus size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </aside>
  );
};