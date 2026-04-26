"use client";

import React, { useEffect, useRef, useState } from 'react';

import { Settings, Plus, Rocket, Camera, ImageIcon } from 'lucide-react';

import { Avatar } from "@/components/ui/Avatar";
import PostCard from '@/features/post_connexion/Accueils/components/PostCard';
import CreatePostModal from '@/features/post_connexion/Accueils/components/CreatePostModal';
import type { Page, Post } from '@lib/types/api.types';
import { pageService, postService, uploadService } from '@lib/api/services';
import { getFullImageUrl } from '@/utils/utils';

interface PageManagementProps {
  initialPage: Page;
  initialPosts: Post[];
  onBack: () => void;
  refresh: () => void;
  isOwner?: boolean;
}

export default function PageManagement({ initialPage, initialPosts, onBack, refresh, isOwner = true }: PageManagementProps) {
  const [page, setPage] = useState<Page>(initialPage);
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'posts' | 'about' | 'subscribers'>('home');

  // Fonction pour rafraîchir les publications de la page
  const refreshPosts = async () => {
    try {
      const postsResponse = await pageService.getPostsByPage(initialPage.id);
      const newPosts = Array.isArray(postsResponse) 
        ? postsResponse 
        : (postsResponse as any).results || [];
      setPosts(newPosts);
    } catch (error: any) {
      console.error('Erreur lors du rafraîchissement des publications:', error);
      // En cas d'erreur 500, on ne vide pas les publications existantes
      if (error.response?.status !== 500) {
        // On ne vide les posts qu'en cas d'erreur différente de 500
        setPosts([]);
      }
    }
  };

  const coverInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);

  const [isSubscribed, setIsSubscribed] = useState<boolean>(() => {
    const raw = (initialPage as any)?.is_subscribed;
    return typeof raw === 'boolean' ? raw : false;
  });
  const [subscribers, setSubscribers] = useState<number>(initialPage.subscribers_count || 0);
  const [subscriberUsers, setSubscriberUsers] = useState<any[] | null>(null);
  const [subscriberUsersLoading, setSubscriberUsersLoading] = useState(false);

  const pageName = page?.name || '';
  const pageCategory = page?.category || '';
  const coverImg = (page as any)?.cover_photo_url;
  const profileImg = (page as any)?.profile_picture_url;

  const totalLikes = posts.reduce((acc, p) => acc + (p.likes_count || 0), 0);
  const totalComments = posts.reduce((acc, p) => acc + (p.comments_count || 0), 0);

  useEffect(() => {
    const loadSubscriptionState = async () => {
      if (isOwner) return;
      try {
        const pageRes = await pageService.getById(initialPage.id);
        const raw = (pageRes as any)?.is_subscribed;
        if (typeof raw === 'boolean') {
          setIsSubscribed(raw);
        }
      } catch {
        // ignore
      }
    };

    loadSubscriptionState();
  }, [initialPage.id, isOwner]);

  useEffect(() => {
    setPage(initialPage);
  }, [initialPage]);

  useEffect(() => {
    const loadSubscribers = async () => {
      if (!isOwner) return;
      if (activeTab !== 'subscribers') return;
      if (subscriberUsersLoading) return;
      if (subscriberUsers !== null) return;

      setSubscriberUsersLoading(true);
      try {
        const res = await (pageService as any).getSubscribers?.(initialPage.id);
        const data = (res as any)?.results ?? res;
        setSubscriberUsers(Array.isArray(data) ? data : []);
      } catch {
        setSubscriberUsers([]);
      } finally {
        setSubscriberUsersLoading(false);
      }
    };

    loadSubscribers();
  }, [activeTab, initialPage.id, isOwner, subscriberUsers, subscriberUsersLoading]);

  const handleToggleSubscribe = async () => {
    if (isSubscribing) return;
    setIsSubscribing(true);
    try {
      if (isSubscribed) {
        await pageService.unsubscribe(initialPage.id);
        setIsSubscribed(false);
        setSubscribers((s) => Math.max(0, s - 1));
      } else {
        await pageService.subscribe(initialPage.id);
        setIsSubscribed(true);
        setSubscribers((s) => s + 1);
      }
    } catch (e) {
      const status = (e as any)?.response?.status;
      if (status === 401) {
        alert("Session expirée. Veuillez vous reconnecter.");
      } else if (status === 403) {
        alert("Action non autorisée (403). Vérifiez que vous êtes bien connecté.");
      } else {
        alert("Erreur lors de l'action. Veuillez réessayer.");
      }
      console.error(e);
    } finally {
      setIsSubscribing(false);
    }
  };

  const handlePagePhotoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'profile_picture_url' | 'cover_photo_url'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (field === 'cover_photo_url') setIsUploadingCover(true);
    if (field === 'profile_picture_url') setIsUploadingProfile(true);

    try {
      const res = await uploadService.file(file, 'IMAGE');
      const updated = await pageService.update(page.id, { [field]: res.url } as any);
      setPage(updated);
      refresh();
    } catch (err) {
      console.error(err);
      alert("Erreur d'upload");
    } finally {
      if (field === 'cover_photo_url') setIsUploadingCover(false);
      if (field === 'profile_picture_url') setIsUploadingProfile(false);
      e.target.value = '';
    }
  };

  return (
    <div className="w-full space-y-4 md:space-y-6">
      {/* Header Section avec Cover et Profil */}
      <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Cover Photo */}
        <div className="h-32 xs:h-40 sm:h-48 md:h-56 lg:h-64 bg-gray-200 relative overflow-hidden">
          {coverImg ? (
            <img src={getFullImageUrl(coverImg)} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
              <ImageIcon size={48} className="text-purple-200" />
            </div>
          )}

          {isOwner && (
            <>
              <button
                onClick={() => coverInputRef.current?.click()}
                disabled={isUploadingCover}
                className={`absolute bottom-3 right-3 bg-white hover:bg-gray-100 px-3 py-2 rounded-lg shadow-md flex items-center gap-2 text-sm font-bold transition ${
                  isUploadingCover ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              >
                <Camera size={18} /> {isUploadingCover ? '...' : 'Changer la couverture'}
              </button>
              <input
                type="file"
                ref={coverInputRef}
                hidden
                accept="image/*"
                onChange={(e) => handlePagePhotoUpload(e, 'cover_photo_url')}
              />
            </>
          )}
        </div>

        {/* Profile Info Section */}
        <div className="px-3 sm:px-4 md:px-6 pb-4 md:pb-6">
          <div className="flex flex-col space-y-4">
            {/* Avatar et Info de base */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 -mt-10 xs:-mt-12 sm:-mt-14 md:-mt-16 lg:-mt-20">
              {/* Avatar */}
              <div className="relative w-20 h-20 xs:w-24 xs:h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-2xl md:rounded-3xl border-3 md:border-4 border-white bg-white shadow-xl overflow-hidden flex-shrink-0">
                {profileImg ? (
                  <img src={getFullImageUrl(profileImg)} alt={pageName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-purple-600 text-white text-3xl xs:text-4xl md:text-5xl font-black">
                    {(pageName || 'P').charAt(0)}
                  </div>
                )}

                {isOwner && (
                  <>
                    <button
                      onClick={() => profileInputRef.current?.click()}
                      disabled={isUploadingProfile}
                      className={`absolute bottom-2 right-2 bg-gray-100 p-2 rounded-full border border-white shadow-sm hover:bg-gray-200 transition ${
                        isUploadingProfile ? 'opacity-60 cursor-not-allowed' : ''
                      }`}
                      aria-label="Changer la photo de profil"
                    >
                      <Camera size={18} />
                    </button>
                    <input
                      type="file"
                      ref={profileInputRef}
                      hidden
                      accept="image/*"
                      onChange={(e) => handlePagePhotoUpload(e, 'profile_picture_url')}
                    />
                  </>
                )}
              </div>

              {/* Nom et Stats */}
              <div className="flex-1 min-w-0 pt-2 sm:pt-0">
                <h1 className="text-xl xs:text-2xl md:text-3xl font-bold text-gray-900 truncate">{pageName}</h1>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 md:gap-x-3 gap-y-1 text-xs md:text-sm text-gray-500">
                  <span className="font-semibold text-purple-600">{pageCategory}</span>
                  <span className="hidden xs:inline">•</span>
                  <span className="font-semibold">{subscribers} abonnés</span>
                  <span className="hidden xs:inline">•</span>
                  <span className="font-semibold">{posts.length} publications</span>
                </div>
                {initialPage.description ? (
                  <p className="mt-2 md:mt-3 text-sm md:text-base text-gray-600 font-medium max-w-2xl leading-relaxed line-clamp-2 md:line-clamp-none">
                    {initialPage.description}
                  </p>
                ) : null}
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 pt-2">
              <div className="flex items-center gap-2 flex-1">
                {isOwner ? (
                  <>
                    <button
                      onClick={() => setShowCreatePost(true)}
                      className="flex-1 xs:flex-initial px-4 py-2.5 bg-purple-600 text-white rounded-lg md:rounded-xl hover:bg-purple-700 active:bg-purple-800 transition font-semibold flex items-center justify-center gap-2 text-sm md:text-base shadow-sm"
                    >
                      <Plus size={18} /> 
                      <span className="hidden xs:inline">Publier</span>
                      <span className="xs:hidden">Nouvelle publication</span>
                    </button>
                    <button
                      className="px-3 md:px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg md:rounded-xl hover:bg-gray-200 active:bg-gray-300 transition font-semibold shadow-sm"
                      aria-label="Paramètres"
                    >
                      <Settings size={18} />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleToggleSubscribe}
                    disabled={isSubscribing}
                    className={`flex-1 xs:flex-initial px-4 md:px-6 py-2.5 rounded-lg md:rounded-xl transition font-semibold text-sm md:text-base shadow-sm ${
                      isSubscribed 
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300' 
                        : 'bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800'
                    } ${isSubscribing ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    {isSubscribed ? 'Se désabonner' : "S'abonner"}
                  </button>
                )}
              </div>

              <button
                onClick={onBack}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg md:rounded-xl hover:bg-gray-200 active:bg-gray-300 transition font-semibold text-sm md:text-base shadow-sm"
              >
                Retour
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-2 md:p-3 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-1.5 md:gap-2 min-w-max">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl font-semibold text-sm md:text-base whitespace-nowrap transition-all ${
                activeTab === 'home' 
                  ? 'bg-purple-50 text-purple-700 shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50 active:bg-gray-100'
              }`}
            >
              Accueil
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl font-semibold text-sm md:text-base whitespace-nowrap transition-all ${
                activeTab === 'posts' 
                  ? 'bg-purple-50 text-purple-700 shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50 active:bg-gray-100'
              }`}
            >
              Publications
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl font-semibold text-sm md:text-base whitespace-nowrap transition-all ${
                activeTab === 'about' 
                  ? 'bg-purple-50 text-purple-700 shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50 active:bg-gray-100'
              }`}
            >
              À propos
            </button>
            {isOwner && (
              <button
                onClick={() => setActiveTab('subscribers')}
                className={`px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl font-semibold text-sm md:text-base whitespace-nowrap transition-all ${
                  activeTab === 'subscribers' 
                    ? 'bg-purple-50 text-purple-700 shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-50 active:bg-gray-100'
                }`}
              >
                Abonnés
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        {/* Sidebar - Infos et Stats */}
        <div className="lg:col-span-4 space-y-3 md:space-y-4 lg:sticky lg:top-4 lg:self-start">
          {/* Infos Card */}
          <div className="bg-white rounded-xl md:rounded-2xl border border-gray-100 p-3 md:p-4 shadow-sm">
            <h2 className="font-black text-gray-900 text-base md:text-lg">Infos</h2>
            <div className="mt-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm font-semibold text-gray-500">Catégorie</span>
                <span className="text-xs md:text-sm font-bold text-gray-800 truncate ml-2">{pageCategory}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm font-semibold text-gray-500">Abonnés</span>
                <span className="text-xs md:text-sm font-bold text-gray-800">{subscribers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm font-semibold text-gray-500">Publications</span>
                <span className="text-xs md:text-sm font-bold text-gray-800">{posts.length}</span>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-white rounded-xl md:rounded-2xl border border-gray-100 p-3 md:p-4 shadow-sm">
            <h2 className="font-black text-gray-900 text-base md:text-lg">Statistiques</h2>
            <div className="mt-3 grid grid-cols-2 gap-2 md:gap-3">
              <div className="rounded-lg md:rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 p-3 md:p-4">
                <div className="text-xs font-bold text-purple-600 uppercase tracking-wide">Likes</div>
                <div className="text-xl md:text-2xl font-black text-purple-900 mt-1">{totalLikes}</div>
              </div>
              <div className="rounded-lg md:rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-3 md:p-4">
                <div className="text-xs font-bold text-blue-600 uppercase tracking-wide">Commentaires</div>
                <div className="text-xl md:text-2xl font-black text-blue-900 mt-1">{totalComments}</div>
              </div>
            </div>
            <div className="mt-3 text-xs font-semibold text-gray-400">
              Basé sur les publications affichées
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-8">
          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="bg-white rounded-xl md:rounded-2xl border border-gray-100 p-4 md:p-6 shadow-sm">
              <h2 className="text-lg md:text-xl font-black text-gray-900">À propos</h2>
              <div className="mt-4 space-y-4">
                <div>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">Description</div>
                  <div className="mt-2 text-sm md:text-base font-medium text-gray-700 leading-relaxed">
                    {initialPage.description || 'Aucune description.'}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div className="rounded-lg md:rounded-xl bg-gray-50 p-3 md:p-4 border border-gray-100">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">Catégorie</div>
                    <div className="mt-1.5 font-bold text-gray-900 text-sm md:text-base">{pageCategory}</div>
                  </div>
                  <div className="rounded-lg md:rounded-xl bg-gray-50 p-3 md:p-4 border border-gray-100">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">Créée le</div>
                    <div className="mt-1.5 font-bold text-gray-900 text-sm md:text-base">
                      {initialPage.created_at ? new Date(initialPage.created_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : '—'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subscribers Tab */}
          {activeTab === 'subscribers' && isOwner && (
            <div className="bg-white rounded-xl md:rounded-2xl border border-gray-100 p-4 md:p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg md:text-xl font-black text-gray-900">Abonnés</h2>
                <div className="text-sm md:text-base font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{subscribers}</div>
              </div>
              {subscriberUsersLoading ? (
                <div className="mt-6 text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
                  <div className="mt-3 text-sm font-semibold text-gray-500">Chargement des abonnés…</div>
                </div>
              ) : subscriberUsers && subscriberUsers.length > 0 ? (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {subscriberUsers.map((u: any) => (
                    <div key={u.id} className="flex items-center gap-3 border border-gray-200 rounded-lg md:rounded-xl p-3 hover:bg-gray-50 transition">
                      <Avatar size="sm" alt={u.first_name || 'Utilisateur'} src={u.avatar || u.profile_picture_url} />
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-gray-900 truncate text-sm md:text-base">
                          {u.first_name ? `${u.first_name} ${u.last_name || ''}`.trim() : (u.email || 'Utilisateur')}
                        </div>
                        {u.email && (
                          <div className="text-xs font-semibold text-gray-500 truncate">{u.email}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-8 text-center py-8">
                  <div className="text-gray-300 mb-3">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="text-sm md:text-base font-semibold text-gray-500">
                    Aucun abonné pour le moment
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Home & Posts Tabs */}
          {(activeTab === 'home' || activeTab === 'posts') && (
            <div className="space-y-3 md:space-y-4">
              {/* Quick Post Card - Only on Home Tab for Owner */}
              {isOwner && activeTab === 'home' && (
                <div className="bg-white rounded-xl md:rounded-2xl border border-gray-100 p-3 md:p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden bg-purple-600 flex items-center justify-center text-white font-black text-lg md:text-xl flex-shrink-0">
                      {pageName.charAt(0)}
                    </div>
                    <button
                      onClick={() => setShowCreatePost(true)}
                      className="flex-1 text-left px-3 md:px-4 py-2.5 md:py-3 bg-gray-50 hover:bg-gray-100 active:bg-gray-200 rounded-lg md:rounded-xl transition text-sm md:text-base text-gray-500 font-medium"
                    >
                      Que voulez-vous partager ?
                    </button>
                    <button
                      onClick={() => setShowCreatePost(true)}
                      className="bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white p-2.5 md:p-3 rounded-lg md:rounded-xl font-bold transition shadow-sm flex-shrink-0"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              )}

              {/* Posts List */}
              {posts.length === 0 ? (
                <div className="bg-white p-8 md:p-16 text-center border-2 border-dashed border-gray-200 rounded-xl md:rounded-2xl">
                  <Rocket className="mx-auto text-gray-300 mb-4" size={40} />
                  <h3 className="font-bold text-lg md:text-xl text-gray-900">Aucune publication</h3>
                  <p className="text-gray-500 text-sm md:text-base mt-2">
                    {isOwner ? "Commencez à publier pour partager du contenu avec vos abonnés." : "Cette page n'a pas encore publié de contenu."}
                  </p>
                  {isOwner && (
                    <button
                      onClick={() => setShowCreatePost(true)}
                      className="mt-6 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold inline-flex items-center gap-2 transition shadow-sm"
                    >
                      <Plus size={18} /> Créer une publication
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3 md:space-y-4">
                  {posts.map(post => (
                    <PostCard 
                      key={post.id} 
                      post={post} 
                      onLike={async (postId) => { 
                        await postService.like(postId); 
                      }} 
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Post Modal */}
      {isOwner && (
        <CreatePostModal 
          isOpen={showCreatePost} 
          onClose={() => setShowCreatePost(false)} 
          onPostCreated={async (newPost) => { 
            setShowCreatePost(false); 
            if (newPost) {
              setPosts(prev => [newPost, ...prev]);
            }
            try {
              await refreshPosts();
            } catch (error) {
              console.warn('Refresh posts failed, but keeping local state:', error);
            }
            refresh(); 
          }}
          pageContext={initialPage}
        />
      )}
    </div>
  );
}