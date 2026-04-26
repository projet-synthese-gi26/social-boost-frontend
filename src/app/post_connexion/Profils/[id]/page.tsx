"use client";

import { useMemo, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PostCard from '@/features/post_connexion/Accueils/components/PostCard';
import { Avatar } from '@/components/ui/Avatar';
import { useUser, useFriends, useProfileSocial, useUserPosts } from '@lib/hooks/useAPI';
import { usersService, postService, friendService } from '@lib/api/services';
import type { User } from '@lib/types/api.types';
import { getFullImageUrl } from '@/utils/utils';
import { LeftSidebar, RightSidebar } from '@/features/navigation';
import { Users as UsersIcon, UserPlus } from 'lucide-react';

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string | undefined;
  const { user: currentUser } = useUser();
  const { posts: userPosts, isLoading: isLoadingPosts } = useUserPosts(userId);
  const { friends, requests, sentRequests, cancelRequest, refresh: refreshFriends } = useFriends();
  const { friends: profileFriends, mutualFriends, isLoading: isLoadingProfileSocial } = useProfileSocial(userId);
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [isFriendActionLoading, setIsFriendActionLoading] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      if (!userId) return;

      setLoadingUser(true);
      try {
        const data = await usersService.getById(userId);
        setProfileUser(data);
      } catch (error) {
        console.error('Error loading user data:', error);
        setProfileUser(null);
      } finally {
        setLoadingUser(false);
      }
    };

    loadUser();
  }, [userId]);

  const isOwner = !!(currentUser?.id && profileUser?.id && currentUser.id === profileUser.id);

  const friendship = useMemo(() => {
    if (!profileUser || !currentUser) return null;
    const all = [...friends, ...requests, ...sentRequests];
    return (
      all.find((f: any) =>
        (f.requester?.id === currentUser.id && f.addressee?.id === profileUser.id) ||
        (f.requester?.id === profileUser.id && f.addressee?.id === currentUser.id)
      ) || null
    );
  }, [friends, requests, sentRequests, profileUser, currentUser]);

  const isFriendAccepted = friendship?.status === 'ACCEPTED';
  const isFriendPendingSent = friendship?.status === 'PENDING' && friendship?.requester?.id === currentUser?.id;
  const isFriendPendingReceived = friendship?.status === 'PENDING' && friendship?.addressee?.id === currentUser?.id;

  const relationshipByUserId = useMemo(() => {
    const map = new Map<string, 'FRIEND' | 'PENDING_SENT' | 'PENDING_RECEIVED'>();
    for (const f of friends) {
      if (f.status !== 'ACCEPTED') continue;
      const otherId = f.requester?.id === currentUser?.id ? f.addressee?.id : f.requester?.id;
      if (otherId) map.set(otherId, 'FRIEND');
    }
    for (const r of requests) {
      if (r.status !== 'PENDING') continue;
      const otherId = r.requester?.id;
      if (otherId) map.set(otherId, 'PENDING_RECEIVED');
    }
    for (const s of sentRequests) {
      if (s.status !== 'PENDING') continue;
      const otherId = s.addressee?.id;
      if (otherId) map.set(otherId, 'PENDING_SENT');
    }
    return map;
  }, [friends, requests, sentRequests, currentUser?.id]);

  const handleInviteUser = async (targetUserId: string) => {
    if (!targetUserId || isFriendActionLoading) return;
    setIsFriendActionLoading(true);
    try {
      await friendService.sendRequest(targetUserId);
      await refreshFriends();
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.non_field_errors?.[0] ||
        (typeof err?.response?.data === 'string' ? err.response.data : null) ||
        "Impossible d'envoyer la demande d'ami.";
      alert(msg);
    } finally {
      setIsFriendActionLoading(false);
    }
  };

  const handleAddFriend = async () => {
    if (!profileUser || isFriendActionLoading) return;
    setIsFriendActionLoading(true);
    try {
      await friendService.sendRequest(profileUser.id);
      await refreshFriends();
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.non_field_errors?.[0] ||
        (typeof err?.response?.data === 'string' ? err.response.data : null) ||
        "Impossible d'envoyer la demande d'ami.";
      alert(msg);
    } finally {
      setIsFriendActionLoading(false);
    }
  };

  const handleAcceptFriend = async () => {
    if (!friendship?.id || isFriendActionLoading) return;
    setIsFriendActionLoading(true);
    try {
      await friendService.acceptRequest(friendship.id);
      await refreshFriends();
    } finally {
      setIsFriendActionLoading(false);
    }
  };

  const handleDeclineFriend = async () => {
    if (!friendship?.id || isFriendActionLoading) return;
    setIsFriendActionLoading(true);
    try {
      await friendService.declineRequest(friendship.id);
      await refreshFriends();
    } finally {
      setIsFriendActionLoading(false);
    }
  };

  const handleCancelFriend = async () => {
    if (!friendship?.id || isFriendActionLoading) return;
    setIsFriendActionLoading(true);
    try {
      await cancelRequest(friendship.id);
      await refreshFriends();
    } finally {
      setIsFriendActionLoading(false);
    }
  };
  if (loadingUser || isLoadingPosts || isLoadingProfileSocial) {
    return <div className="text-center p-10">Chargement du profil...</div>;
  }

  if (!profileUser) {
    return (
      <div className="text-center p-10">
        <h2 className="text-xl font-bold">Utilisateur non trouvé</h2>
        <button onClick={() => router.back()} className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg">
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="flex gap-6">
          <div className="hidden lg:block w-[280px] flex-shrink-0">
            <LeftSidebar />
          </div>

          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 flex items-center gap-4">
          <Avatar src={getFullImageUrl(profileUser.profile_picture_url)} alt={profileUser.first_name} className="w-24 h-24 text-4xl" />
          <div>
            <h1 className="text-3xl font-bold">{profileUser.first_name} {profileUser.last_name}</h1>
            <p className="text-gray-500">{isOwner ? 'Votre profil' : 'Profil utilisateur'}</p>
            <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
              <span>{profileFriends.length} ami(s)</span>
              {!isOwner && mutualFriends.length > 0 && (
                <span>{mutualFriends.length} ami(s) en commun</span>
              )}
            </div>
            {(profileUser.city || profileUser.gender || profileUser.birth_date || profileUser.date_joined) && (
              <div className="mt-2 text-sm text-gray-600">
                {profileUser.city ? <div>Ville: {profileUser.city}</div> : null}
                {profileUser.gender ? <div>Genre: {profileUser.gender}</div> : null}
                {profileUser.birth_date ? <div>Date de naissance: {profileUser.birth_date}</div> : null}
                {profileUser.date_joined ? (
                  <div className="text-xs text-gray-500 mt-1">Inscrit le {new Date(profileUser.date_joined).toLocaleDateString()}</div>
                ) : null}
              </div>
            )}
            {!isOwner && mutualFriends.length > 0 && (
              <div className="mt-2 flex items-center">
                {mutualFriends.slice(0, 4).map((u) => (
                  <img
                    key={u.id}
                    src={getFullImageUrl(u.profile_picture_url)}
                    alt={u.first_name || u.username}
                    className="w-7 h-7 rounded-full object-cover bg-gray-100 border-2 border-white -ml-2 first:ml-0"
                  />
                ))}
              </div>
            )}
          </div>
          <div className="ml-auto flex items-center gap-2">
            {!isOwner && (
              <>
                {isFriendAccepted && (
                  <button disabled className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg font-semibold">
                    Amis
                  </button>
                )}
                {isFriendPendingSent && (
                  <>
                    <button disabled className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold">
                      Invitation envoyée
                    </button>
                    <button onClick={handleCancelFriend} disabled={isFriendActionLoading} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold">
                      Annuler
                    </button>
                  </>
                )}
                {isFriendPendingReceived && (
                  <>
                    <button onClick={handleAcceptFriend} disabled={isFriendActionLoading} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold">
                      Accepter
                    </button>
                    <button onClick={handleDeclineFriend} disabled={isFriendActionLoading} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold">
                      Refuser
                    </button>
                  </>
                )}
                {!friendship && (
                  <button onClick={handleAddFriend} disabled={isFriendActionLoading} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold">
                    Ajouter en ami
                  </button>
                )}
              </>
            )}
            <button onClick={() => router.back()} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold">
              Retour
            </button>
          </div>
        </div>

        {!isOwner && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <UsersIcon size={18} /> Amis
              </h2>
              <div className="text-sm text-gray-500">
                {mutualFriends.length} en commun • {profileFriends.length} au total
              </div>
            </div>

            {mutualFriends.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Amis en commun</h3>
                  <span className="text-xs text-gray-500">{mutualFriends.length}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {mutualFriends.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => router.push(`/post_connexion/Profils/${u.id}`)}
                      className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl transition text-left"
                    >
                      <img src={getFullImageUrl(u.profile_picture_url)} alt={u.first_name || u.username} className="w-10 h-10 rounded-full object-cover bg-gray-100" />
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900 truncate">{u.first_name} {u.last_name}</div>
                        <div className="text-xs text-gray-500 truncate">@{u.username || u.email}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Tous ses amis</h3>
                <span className="text-xs text-gray-500">{profileFriends.length}</span>
              </div>

              {profileFriends.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {profileFriends.map((u) => {
                    const rel = relationshipByUserId.get(u.id);
                    const canInvite = !rel && u.id !== currentUser?.id;
                    return (
                      <div key={u.id} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl">
                        <button
                          onClick={() => router.push(`/post_connexion/Profils/${u.id}`)}
                          className="flex items-center gap-3 min-w-0 flex-1 text-left"
                        >
                          <img src={getFullImageUrl(u.profile_picture_url)} alt={u.first_name || u.username} className="w-10 h-10 rounded-full object-cover bg-gray-100" />
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900 truncate">{u.first_name} {u.last_name}</div>
                            <div className="text-xs text-gray-500 truncate">@{u.username || u.email}</div>
                          </div>
                        </button>

                        {canInvite ? (
                          <button
                            onClick={() => handleInviteUser(u.id)}
                            disabled={isFriendActionLoading}
                            className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold text-sm flex items-center gap-2 disabled:bg-gray-300"
                          >
                            <UserPlus size={16} />
                            Ajouter
                          </button>
                        ) : rel === 'FRIEND' ? (
                          <span className="text-xs text-gray-500 font-semibold">Ami</span>
                        ) : rel === 'PENDING_SENT' ? (
                          <span className="text-xs text-gray-500 font-semibold">Invitation envoyée</span>
                        ) : rel === 'PENDING_RECEIVED' ? (
                          <span className="text-xs text-gray-500 font-semibold">Invitation reçue</span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500">Aucun ami à afficher.</p>
              )}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-xl font-bold mb-4">Publications</h2>
          {userPosts.length > 0 ? (
            userPosts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onLike={async (postId) => {
                  await postService.like(postId);
                }}
              />
            ))
          ) : (
            <p>Cet utilisateur n'a aucune publication.</p>
          )}
        </div>

          </div>

          <div className="hidden xl:block w-[320px] flex-shrink-0">
            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
