"use client";

import React, { useState, ChangeEvent, useEffect } from 'react';
import { X, Layout, Info, Camera, Image as ImageIcon } from 'lucide-react';
import { Page } from '@/types/threadly';
import { storage } from '@/utils/storage';

interface EditPageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPageUpdate: (updatedPage: Page) => void;
  page: Page;
}

export default function EditPageModal({ isOpen, onClose, onPageUpdate, page }: EditPageModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
  });
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (page) {
      setFormData({ name: page.name, bio: page.bio || '' });
      setCoverPreview(page.coverImage);
      setAvatarPreview(page.avatarImage);
    }
  }, [page, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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

  const handleSaveChanges = async () => {
    if (!formData.name.trim()) return;
    
    setIsSaving(true);

    const updatedPageData: Page = {
      ...page,
      name: formData.name,
      bio: formData.bio,
      coverImage: coverPreview,
      avatarImage: avatarPreview,
    };

    try {
      const pagesData = await storage.get('user_pages');
      const pages: Page[] = pagesData ? JSON.parse(pagesData.value) : [];
      const pageIndex = pages.findIndex(p => p.id === page.id);

      if (pageIndex !== -1) {
        pages[pageIndex] = updatedPageData;
        await storage.set('user_pages', JSON.stringify(pages));
        onPageUpdate(updatedPageData);
      }
      onClose();
    } catch (error) {
      console.error('Error updating page:', error);
      alert('Erreur lors de la mise à jour de la page.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Modifier la Page</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Layout className="w-4 h-4 text-purple-600" /> Nom de la page
              </label>
              <input
                type="text"
                name="name"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Info className="w-4 h-4 text-purple-600" /> Description (Bio)
              </label>
              <textarea
                name="bio"
                rows={4}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all resize-none"
                value={formData.bio}
                onChange={handleInputChange}
              />
            </div>

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
        </div>

        <div className="p-6 mt-auto bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
            <button onClick={onClose} className="px-6 py-2.5 rounded-lg font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 transition">
                Annuler
            </button>
            <button 
              onClick={handleSaveChanges}
              disabled={isSaving}
              className={`px-6 py-2.5 rounded-lg font-semibold text-white transition ${
                isSaving ? 'bg-gray-400' : 'bg-purple-600 hover:bg-purple-700'
              }`}>
              {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
        </div>
      </div>
    </div>
  );
}
