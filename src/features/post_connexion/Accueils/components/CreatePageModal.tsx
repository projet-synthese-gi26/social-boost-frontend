"use client";

import React, { useState, ChangeEvent } from 'react';
import { X, Layout, Info, Rocket, Flag ,  Camera, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { pageService, uploadService } from '@lib/api/services';

interface CreatePageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPageCreated?: (page: any) => void;
}

export default function CreatePageModal({ isOpen, onClose, onPageCreated }: CreatePageModalProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', category: '', bio: '' });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previews, setPreviews] = useState({ cover: '', avatar: '' });
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, type: 'cover' | 'avatar') => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      if (type === 'cover') {
        setCoverFile(file);
        setPreviews(p => ({ ...p, cover: url }));
      } else {
        setAvatarFile(file);
        setPreviews(p => ({ ...p, avatar: url }));
      }
    }
  };

  const handleCreatePage = async () => {
    if (!formData.name.trim() || !formData.category) return;
    setIsCreating(true);

    try {
      // 1. Préparer le payload avec les bons noms de champs Django
      const payload: any = {
        name: formData.name.trim(),
        category: formData.category,
        description: formData.bio.trim() || "Page créée via BoostAPP", // Description par défaut si vide
        profile_picture_url: null, // Par défaut null
        cover_photo_url: null     // Par défaut null
      };

      // 2. Upload des images vers Django si sélectionnées
      if (coverFile) {
        console.log("📤 Upload cover file...");
        const res = await uploadService.file(coverFile);
        payload.cover_photo_url = res.url;
        console.log("✅ Cover uploaded:", res.url);
      }
      if (avatarFile) {
        console.log("📤 Upload avatar file...");
        const res = await uploadService.file(avatarFile);
        payload.profile_picture_url = res.url;
        console.log("✅ Avatar uploaded:", res.url);
      }

      // 3. Appel API vers le Backend
      console.log("📡 Envoi à l'API pages:", payload);
      console.log("📋 Payload détaillé:", JSON.stringify(payload, null, 2));
      const newPage = await pageService.create(payload);
      console.log("✅ Page créée avec succès:", newPage);

      // 4. Succès
      if (onPageCreated) onPageCreated(newPage);
      onClose();
      
      // Navigation vers la nouvelle page via son ID réel (UUID)
      router.push(`/post_connexion/pages/${newPage.id}`);

    } catch (error: any) {
      console.error('❌ Erreur complète:', error);
      console.error('❌ Erreur response:', error.response?.data);
      console.error('❌ Erreur status:', error.response?.status);
      console.error('❌ Erreur headers:', error.response?.headers);
      
      // Message d'erreur plus précis
      if (error.response?.status === 401) {
        alert("Session expirée. Veuillez vous reconnecter.");
        // Redirection vers login
        window.location.href = '/';
      } else {
        alert(`Erreur de création: ${error.response?.data?.detail || 'Erreur inconnue'}`);
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row border">
        
        <div className="w-full md:w-5/12 p-8 flex flex-col border-r overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black">Créer une Page</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X /></button>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Nom de la page</label>
              <input name="name" type="text" className="w-full mt-1 p-3 bg-gray-50 border rounded-xl outline-none focus:border-purple-600 transition text-black placeholder:text-gray-400" placeholder="Ex: Ma Super Entreprise" onChange={handleInputChange} />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Catégorie</label>
              <select name="category" className="w-full mt-1 p-3 bg-gray-50 border rounded-xl outline-none cursor-pointer text-black" onChange={handleInputChange}>
                <option value="">Sélectionner...</option>
                <option value="Creator">Créateur</option>
                <option value="Business">Entreprise</option>
                <option value="Brand">Marque</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
              <textarea name="bio" rows={3} className="w-full mt-1 p-3 bg-gray-50 border rounded-xl outline-none resize-none focus:border-purple-600 text-black placeholder:text-gray-400" placeholder="Décrivez votre activité..." onChange={handleInputChange}></textarea>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label className="cursor-pointer border-2 border-dashed rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-purple-50 transition group">
                <ImageIcon className="text-gray-400 group-hover:text-purple-600" />
                <span className="text-[10px] font-bold text-gray-500">PHOTO COUVERTURE</span>
                <input type="file" hidden accept="image/*" onChange={(e) => handleFileChange(e, 'cover')} />
              </label>
              <label className="cursor-pointer border-2 border-dashed rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-purple-50 transition group">
                <Camera className="text-gray-400 group-hover:text-purple-600" />
                <span className="text-[10px] font-bold text-gray-500">PHOTO PROFIL</span>
                <input type="file" hidden accept="image/*" onChange={(e) => handleFileChange(e, 'avatar')} />
              </label>
            </div>
          </div>

          <button 
            onClick={handleCreatePage}
            disabled={isCreating || !formData.name || !formData.category}
            className="w-full mt-auto bg-purple-600 hover:bg-purple-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-purple-100 transition flex items-center justify-center gap-2 disabled:bg-gray-300"
          >
            {isCreating ? <Loader2 className="animate-spin" /> : "Créer la Page"}
          </button>
        </div>

        <div className="hidden md:flex flex-col w-7/12 bg-gray-50 items-center justify-center p-10">
            <div className="w-full max-w-[400px] bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
               <div className="h-32 bg-purple-100">
                 {previews.cover && <img src={previews.cover} className="w-full h-full object-cover" />}
               </div>
               <div className="p-6 relative">
                 <div className="-mt-16 w-24 h-24 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-white">
                    {previews.avatar ? <img src={previews.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-purple-200"><Flag size={40}/></div>}
                 </div>
                 <h3 className="text-2xl font-black mt-3">{formData.name || "Nom de la Page"}</h3>
                 <p className="text-purple-600 font-bold text-sm">{formData.category || "Catégorie"}</p>
                 <p className="text-gray-400 text-xs mt-4 leading-relaxed line-clamp-3">{formData.bio || "Votre description apparaîtra ici..."}</p>
               </div>
            </div>
        </div>

      </div>
    </div>
  );
}