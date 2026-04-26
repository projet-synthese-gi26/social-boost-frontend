'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

import { 
  Camera, MapPin, Briefcase, Calendar, Edit3, Flag ,
  Plus, Settings, BarChart3, ExternalLink, 
  Check, X, Lock, User as UserIcon, Loader2 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- IMPORT UI & NAVIGATION ---
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { LeftSidebar } from "@/features/navigation/index";
import { RightSidebar } from "@/features/navigation/index";
import PostCard from '@/features/post_connexion/Accueils/components/PostCard';
import CreatePostModal from '@/features/post_connexion/Accueils/components/CreatePostModal';
import CreatePageModal from '@/features/post_connexion/Accueils/components/CreatePageModal';
import { Header } from '@/features/navigation';

// --- IMPORT API SERVICES & HOOKS ---
import { useUser, usePosts, usePages, useFriends, useUpload, useUserPosts } from '@lib/hooks/useAPI';
import { usersService } from '@lib/api/services';
import type { User } from '@lib/types/api.types';
import { getFullImageUrl } from '@/utils/utils';

type TabType = "posts" | "about" | "pages" | "friends" | "photos";

export default function ProfilePage() {
  const router = useRouter();
  
  // Hooks de données
  const { user, isLoading: isLoadingUser, refresh: refreshUser } = useUser();
  const { likePost } = usePosts();
  const { posts: myPosts, refresh: refreshMyPosts, isLoading: isLoadingMyPosts } = useUserPosts(user?.id);
  const { pages, refresh: refreshPages } = usePages();
  const { friends, requests } = useFriends();
  const { uploadFile, isUploading } = useUpload();

  // États UI
  const [activeTab, setActiveTab] = useState<TabType>("posts");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreatePage, setShowCreatePage] = useState(false);
  
  // États de formulaire
  const [editedUser, setEditedUser] = useState({ first_name: '', last_name: '', city: '', gender: 'ALL', birth_date: '', interests: '' });
  const [passwords, setPasswords] = useState({ current: '', new: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);

  const friendUsers: User[] = useMemo(() => {
    if (!user?.id) return [];
    return friends
      .filter((f) => f.status === 'ACCEPTED')
      .map((f) => {
        const requesterId = f.requester?.id;
        const addresseeId = f.addressee?.id;
        if (!requesterId || !addresseeId) return null;
        return requesterId === user.id ? f.addressee : f.requester;
      })
      .filter((u): u is User => !!u);
  }, [friends, user?.id]);

  useEffect(() => {
    if (user) {
      setEditedUser({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        city: user.city || '',
        gender: (user.gender || 'ALL') as any,
        birth_date: user.birth_date || '',
        interests: (user.interests || []).join(', '),
      });
    }
  }, [user]);

  // --- ACTIONS ---

  const handleUpdateInfo = async () => {
    try {
      const cleanedInterests = editedUser.interests
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      await usersService.updateProfile({
        first_name: editedUser.first_name,
        last_name: editedUser.last_name,
        city: editedUser.city || undefined,
        gender: editedUser.gender || undefined,
        birth_date: editedUser.birth_date || undefined,
        interests: cleanedInterests,
      });
      setIsEditingProfile(false);
      refreshUser();
      alert("Profil mis à jour !");
    } catch (err) {
      alert("Erreur lors de la mise à jour");
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'profile_picture_url' | 'cover_photo_url') => {
    if (e.target.files && e.target.files[0]) {
      try {
        const res = await uploadFile(e.target.files[0], 'IMAGE');
        await usersService.updateProfile({ [field]: res.url });
        refreshUser();
      } catch (err) {
        alert("Erreur d'upload");
      }
    }
  };

  if (isLoadingUser || isLoadingMyPosts) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-purple-600" /></div>;

  return (
    <div className="min-h-screen bg-[#f0f2f5]">

      <Header />

      <div className="pt-14 flex justify-between">
        
        {/* SIDEBAR GAUCHE */}
        <div className="w-[300px] hidden xl:block fixed left-0">
          <LeftSidebar friends={friends} />
        </div>

        {/* CONTENU CENTRAL (PROFIL) */}
        <main className="flex-1 xl:ml-[300px] xl:mr-[320px] max-w-4xl mx-auto p-0 md:p-4">
          
          {/* 1. SECTION COVER & AVATAR */}
          <div className="bg-white rounded-b-2xl shadow-sm overflow-hidden mb-4">
             <div className="relative h-48 md:h-80 bg-gray-200 group">
                <img 
                  src={user?.cover_photo_url ? getFullImageUrl(user.cover_photo_url) : "https://images.unsplash.com/photo-1557683316-973673baf926"} 
                  className="w-full h-full object-cover" 
                  alt="Couverture"
                />
                <button onClick={() => coverInputRef.current?.click()} className="absolute bottom-4 right-4 bg-white hover:bg-gray-100 p-2 rounded-lg shadow-md flex items-center gap-2 text-sm font-bold transition">
                   <Camera size={18} /> {isUploading ? "..." : "Changer la couverture"}
                </button>
                <input type="file" ref={coverInputRef} hidden onChange={(e) => handlePhotoUpload(e, 'cover_photo_url')} />
             </div>

             <div className="px-8 pb-6">
                <div className="flex flex-col md:flex-row items-center md:items-end -mt-12 md:-mt-16 gap-6">
                   <div className="relative group">
                      <Avatar src={user?.profile_picture_url} alt={user?.first_name} size="2xl" className="border-4 border-white shadow-xl" />
                      <button onClick={() => profileInputRef.current?.click()} className="absolute bottom-2 right-2 bg-gray-100 p-2 rounded-full border border-white shadow-sm hover:bg-gray-200 transition">
                         <Camera size={20} />
                      </button>
                      <input type="file" ref={profileInputRef} hidden onChange={(e) => handlePhotoUpload(e, 'profile_picture_url')} />
                   </div>
                   
                   <div className="flex-1 text-center md:text-left mb-2">
                      <h1 className="text-3xl font-extrabold text-gray-900">
                        {user?.first_name} {user?.last_name}
                      </h1>
                      <p className="text-gray-900 font-bold">{friendUsers.length} amis</p>
                   </div>

                   <div className="flex gap-2 pb-2">
                      <button onClick={() => setIsEditingProfile(true)} className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition">
                         <Edit3 size={18} /> Modifier
                      </button>
                      <button onClick={() => setShowCreatePage(true)} className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition">
                         <Plus size={18} /> Page
                      </button>
                   </div>
                </div>
             </div>

             {/* TABS MENU */}
             <div className="border-t px-4 flex gap-2">
                {["posts", "about", "friends", "pages"].map((t) => (
                  <button 
                    key={t}
                    onClick={() => setActiveTab(t as TabType)}
                    className={`px-4 py-4 font-bold text-sm capitalize relative ${activeTab === t ? "text-purple-600" : "text-gray-900"}`}
                  >
                    {t === 'posts' ? 'Publications' : t === 'about' ? 'À propos' : t === 'friends' ? 'Amis' : 'Pages'}
                    {activeTab === t && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-purple-600 rounded-t-full" />}
                  </button>
                ))}
             </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
             {/* COLONNE GAUCHE (INTRO) */}
             <div className="w-full md:w-2/5 space-y-4">
                <Card className="p-4">
                   <h2 className="font-extrabold text-xl mb-4">Intro</h2>
                   <div className="space-y-4 text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-3"><Briefcase size={20} className="text-gray-700" /> Travaille chez <strong>Threadly</strong></div>
                      <div className="flex items-center gap-3"><MapPin size={20} className="text-gray-700" /> Habite à <strong>{user?.city || '—'}</strong></div>
                      <div className="flex items-center gap-3"><Calendar size={20} className="text-gray-700" /> Membre depuis <strong>{new Date(user?.date_joined || '').getFullYear()}</strong></div>
                   </div>
                   <button onClick={() => setIsEditingProfile(true)} className="w-full mt-6 bg-gray-100 hover:bg-gray-200 py-2 rounded-lg font-bold transition">Modifier les infos</button>
                </Card>

                <Card className="p-4">
                   <div className="flex justify-between items-center mb-4">
                      <h2 className="font-extrabold text-xl">Amis</h2>
                      <span className="text-purple-600 text-sm font-bold cursor-pointer">Voir tout</span>
                   </div>
                   <div className="grid grid-cols-3 gap-2">
                      {friendUsers.slice(0, 6).map((fu) => (
                        <div key={fu.id} className="text-center cursor-pointer" onClick={() => router.push(`/post_connexion/Profils/${fu.id}`)}>
                           <Avatar src={getFullImageUrl(fu.profile_picture_url)} alt={fu.first_name} size="lg" className="mx-auto" />
                           <p className="text-[10px] font-bold mt-1 truncate">{fu.first_name}</p>
                        </div>
                      ))}
                   </div>
                </Card>
             </div>

             {/* COLONNE DROITE (CONTENU DYNAMIQUE) */}
             <div className="flex-1 space-y-4">
                
                {activeTab === 'posts' && (
                  <>
                    <Card className="p-4 flex gap-3 items-center">
                       <Avatar src={user?.profile_picture_url} size="sm" />
                       <button onClick={() => setShowCreatePost(true)} className="flex-1 text-left bg-gray-100 hover:bg-gray-200 py-2 px-4 rounded-full text-gray-900 font-medium transition">
                          Exprimez-vous, {user?.first_name}...
                       </button>
                    </Card>
                    
                    {myPosts.length > 0 ? (
                       myPosts.map(post => <PostCard key={post.id} post={post} onLike={likePost} />)
                    ) : (
                       <Card className="p-10 text-center text-gray-900">Aucun post pour le moment.</Card>
                    )}
                  </>
                )}

                {activeTab === 'pages' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {pages.map(page => (
                       <Card key={page.id} className="p-4 flex flex-col items-center text-center">
                          <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mb-3"><Flag size={40} /></div>
                          <h3 className="font-bold text-lg">{page.name}</h3>
                          <p className="text-xs text-gray-800 mb-4">{page.category}</p>
                          <button onClick={() => router.push(`/post_connexion/pages/${page.id}`)} className="w-full bg-purple-50 text-purple-700 font-bold py-2 rounded-lg text-sm border border-purple-100 hover:bg-purple-100 transition">Gérer la page</button>
                       </Card>
                    ))}
                    <button onClick={() => setShowCreatePage(true)} className="border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center hover:bg-gray-50 transition group">
                       <Plus size={32} className="text-gray-700 group-hover:text-purple-600" />
                       <span className="font-bold text-gray-900 mt-2">Créer une Page</span>
                    </button>
                  </div>
                )}

                {activeTab === 'about' && (
                  <Card className="p-6 space-y-8">
                     <div>
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><UserIcon size={20}/> Identité</h3>
                        <div className="grid grid-cols-2 gap-4">
                           <div><label className="text-[10px] font-bold text-gray-700 uppercase">Prénom</label><p className="font-bold">{user?.first_name}</p></div>
                           <div><label className="text-[10px] font-bold text-gray-700 uppercase">Nom</label><p className="font-bold">{user?.last_name}</p></div>
                           <div><label className="text-[10px] font-bold text-gray-700 uppercase">Email</label><p className="font-bold">{user?.email}</p></div>
                           <div><label className="text-[10px] font-bold text-gray-700 uppercase">Ville</label><p className="font-bold">{user?.city}</p></div>
                           <div><label className="text-[10px] font-bold text-gray-700 uppercase">Genre</label><p className="font-bold">{user?.gender}</p></div>
                           <div><label className="text-[10px] font-bold text-gray-700 uppercase">Date de naissance</label><p className="font-bold">{user?.birth_date}</p></div>
                        </div>
                     </div>
                     <div className="border-t pt-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Lock size={20}/> Sécurité</h3>
                        <button onClick={() => setIsChangingPassword(true)} className="text-purple-600 font-bold text-sm hover:underline">Modifier le mot de passe</button>
                     </div>
                  </Card>
                )}
             </div>
          </div>
        </main>

        {/* SIDEBAR DROITE */}
        <div className="w-[320px] hidden lg:block fixed right-0">
          <RightSidebar />
        </div>
      </div>

      {/* --- MODALES --- */}

      {/* 1. Modal Édition Profil */}
      <AnimatePresence>
        {isEditingProfile && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                   <h2 className="text-xl font-extrabold">Modifier le profil</h2>
                   <button onClick={() => setIsEditingProfile(false)}><X /></button>
                </div>
                <div className="space-y-4">
                   <div><label className="text-xs font-bold text-gray-900">PRÉNOM</label><input type="text" className="w-full bg-gray-50 border p-3 rounded-xl outline-none focus:border-purple-600 transition" value={editedUser.first_name} onChange={(e) => setEditedUser({...editedUser, first_name: e.target.value})} /></div>
                   <div><label className="text-xs font-bold text-gray-900">NOM</label><input type="text" className="w-full bg-gray-50 border p-3 rounded-xl outline-none focus:border-purple-600 transition" value={editedUser.last_name} onChange={(e) => setEditedUser({...editedUser, last_name: e.target.value})} /></div>
                   <div><label className="text-xs font-bold text-gray-900">VILLE</label><input type="text" className="w-full bg-gray-50 border p-3 rounded-xl outline-none focus:border-purple-600 transition" value={editedUser.city} onChange={(e) => setEditedUser({...editedUser, city: e.target.value})} /></div>
                   <div>
                     <label className="text-xs font-bold text-gray-900">GENRE</label>
                     <select className="w-full bg-gray-50 border p-3 rounded-xl outline-none focus:border-purple-600 transition" value={editedUser.gender} onChange={(e) => setEditedUser({...editedUser, gender: e.target.value})}>
                       <option value="ALL">Tous</option>
                       <option value="MALE">Homme</option>
                       <option value="FEMALE">Femme</option>
                     </select>
                   </div>
                   <div>
                     <label className="text-xs font-bold text-gray-900">DATE DE NAISSANCE</label>
                     <input type="date" className="w-full bg-gray-50 border p-3 rounded-xl outline-none focus:border-purple-600 transition" value={editedUser.birth_date} onChange={(e) => setEditedUser({...editedUser, birth_date: e.target.value})} />
                   </div>
                   <div>
                     <label className="text-xs font-bold text-gray-900">CENTRES D'INTÉRÊT (séparés par des virgules)</label>
                     <input type="text" className="w-full bg-gray-50 border p-3 rounded-xl outline-none focus:border-purple-600 transition" value={editedUser.interests} onChange={(e) => setEditedUser({...editedUser, interests: e.target.value})} />
                   </div>
                   <button onClick={handleUpdateInfo} className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-200 mt-4">Enregistrer les modifications</button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modales de création */}
      <CreatePostModal isOpen={showCreatePost} onClose={() => setShowCreatePost(false)} onPostCreated={() => { setShowCreatePost(false); refreshMyPosts(); }} />
      <CreatePageModal isOpen={showCreatePage} onClose={() => setShowCreatePage(false)} onPageCreated={() => { setShowCreatePage(false); refreshPages(); }} />

    </div>
  );
}