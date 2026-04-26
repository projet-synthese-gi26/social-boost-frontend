"use client";

import React, { useState, ChangeEvent } from 'react';
import { X, Layout, Info, Rocket, Camera, Image as ImageIcon } from 'lucide-react';

interface CreatePageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPageCreated?: (page: any) => void; // Ajout de la fonction de rappel onPageCreated
}

export default function CreatePageModal({ isOpen, onClose, onPageCreated }: CreatePageModalProps) {
  // --- ÉTATS ---
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    bio: '',
  });

  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  if (!isOpen) return null;

  // --- LOGIQUE (Correction ici : ajout de HTMLSelectElement au type) ---
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>, type: 'cover' | 'avatar') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const localUrl = URL.createObjectURL(file);
      if (type === 'cover') setCoverPreview(localUrl);
      else setAvatarPreview(localUrl);
    }
  };

  // --- RENDU ---
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      
      {/* Conteneur Principal */}
      <div className="bg-white w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in duration-300">
        
        {/* === COLONNE GAUCHE : Formulaire === */}
        <div className="w-full md:w-5/12 p-8 flex flex-col border-r border-gray-100 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
          
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Créer une Page</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <p className="text-gray-500 mb-8 text-sm leading-relaxed">
            Votre page est l endroit où les gens en apprennent plus sur votre organisation. 
            C est aussi la première étape pour utiliser le <span className="text-purple-600 font-semibold">système de Boost</span>.
          </p>

          <form className="space-y-6 flex-1">
            {/* Nom de la page */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Layout className="w-4 h-4 text-purple-600" /> Nom de la page
              </label>
              <input
                type="text"
                name="name"
                placeholder="Ex: Threadly Officiel"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all placeholder:text-gray-400"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>

            {/* Catégorie (Correction appliquée ici) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Rocket className="w-4 h-4 text-purple-600" /> Catégorie
              </label>
              <div className="relative">
                <select
                  name="category"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all appearance-none cursor-pointer text-gray-700"
                  value={formData.category}
                  onChange={handleInputChange} 
                >
                  <option value="" disabled>Choisir une catégorie...</option>
                  <option value="Creator">Créateur de contenu</option>
                  <option value="Business">Entreprise locale</option>
                  <option value="Brand">Marque</option>
                  <option value="Community">Communauté</option>
                </select>
                {/* Petite flèche personnalisée pour le select */}
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Info className="w-4 h-4 text-purple-600" /> Description (Bio)
              </label>
              <textarea
                name="bio"
                rows={4}
                placeholder="Dites-en un peu plus sur ce que vous faites..."
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all resize-none placeholder:text-gray-400"
                value={formData.bio}
                onChange={handleInputChange}
              />
            </div>

            {/* Upload Images */}
            <div className="grid grid-cols-2 gap-4 pt-2">
                <label className="cursor-pointer flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition group">
                    <ImageIcon className="w-6 h-6 text-gray-400 group-hover:text-purple-500 mb-2 transition-colors"/>
                    <span className="text-xs text-gray-500 text-center font-medium">Couverture</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'cover')} />
                </label>
                <label className="cursor-pointer flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition group">
                    <Camera className="w-6 h-6 text-gray-400 group-hover:text-purple-500 mb-2 transition-colors"/>
                    <span className="text-xs text-gray-500 text-center font-medium">Photo de profil</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'avatar')} />
                </label>
            </div>
          </form>

          <div className="mt-8 pt-4 border-t border-gray-50">
            <button className="w-full bg-[#9333ea] hover:bg-[#7e22ce] text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-purple-200 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2">
              Créer la Page
            </button>
          </div>
        </div>

        {/* === COLONNE DROITE : Live Preview === */}
        <div className="hidden md:flex flex-col w-7/12 bg-gray-50 p-8 items-center justify-center relative border-l border-gray-100">
            <div className="absolute top-6 right-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-200 px-3 py-1 rounded-full">
                Aperçu Bureau
            </div>

            {/* Mockup Carte */}
            <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] overflow-hidden border border-gray-200/60 ring-1 ring-black/5">
                
                {/* Header Image */}
                <div className="h-36 w-full bg-gray-100 relative group overflow-hidden">
                    {coverPreview ? (
                        <img src={coverPreview} alt="Cover" className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                             <ImageIcon className="w-8 h-8 text-gray-300 mb-1" />
                             <span className="text-gray-400 text-xs font-medium">Couverture</span>
                        </div>
                    )}
                </div>

                {/* Body */}
                <div className="px-6 pb-6 relative">
                    {/* Avatar */}
                    <div className="-mt-14 mb-3 relative inline-block">
                        <div className="w-28 h-28 rounded-full border-[4px] border-white bg-white overflow-hidden shadow-sm ring-1 ring-gray-100">
                             {avatarPreview ? (
                                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                                    <Camera className="w-10 h-10 opacity-60"/>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Contenu */}
                    <div className="flex flex-col items-start">
                        <h3 className="text-2xl font-bold text-gray-900 break-words leading-tight">
                            {formData.name || "Nom de la Page"}
                        </h3>
                        <p className="text-sm text-purple-600 font-semibold mt-1">
                            {formData.category ? 
                                (formData.category === 'Creator' ? 'Créateur de contenu' :
                                 formData.category === 'Business' ? 'Entreprise locale' :
                                 formData.category === 'Brand' ? 'Marque' : 'Communauté')
                                : "Catégorie"
                            }
                        </p>
                        
                        <div className="w-full h-px bg-gray-100 my-4"></div>

                        <p className="text-sm text-gray-600 leading-relaxed min-h-[60px]">
                            {formData.bio || "La description de votre page apparaîtra ici. Décrivez votre activité pour attirer des abonnés."}
                        </p>
                    </div>

                    {/* Action Bar Mockup */}
                    <div className="mt-6 flex items-center gap-3">
                        <button className="flex-1 bg-purple-600 text-white text-sm font-semibold py-2 rounded-lg opacity-90 cursor-default">
                            S abonner
                        </button>
                        <button className="flex-1 bg-gray-100 text-gray-700 text-sm font-semibold py-2 rounded-lg cursor-default">
                            Contacter
                        </button>
                    </div>
                </div>
            </div>

            {/* Note Boost */}
            <div className="mt-8 flex items-center gap-3 px-5 py-3 bg-white text-gray-600 rounded-xl text-xs font-medium border border-gray-200 shadow-sm opacity-80">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                    <Rocket className="w-4 h-4" />
                </div>
                <span>Le tableau de bord <strong className="text-purple-700">Boost</strong> sera débloqué après création.</span>
            </div>
        </div>

      </div>
    </div>
  );
}