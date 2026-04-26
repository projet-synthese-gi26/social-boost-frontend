"use client";

import React, { useState, useRef } from 'react';
import { X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { postService, uploadService } from '@lib/api/services';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: (post: any) => void;
  pageContext?: any;
}

export default function CreatePostModal({ isOpen, onClose, onPostCreated, pageContext }: CreatePostModalProps) {
  const [text, setText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
      const newPreviews = files.map(f => URL.createObjectURL(f));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const handlePublish = async () => {
    if (!text.trim() && selectedFiles.length === 0) return;
    setIsPublishing(true);

    try {
      const mediaList = [];

      // 1. Upload des médias vers Django
      for (const file of selectedFiles) {
        const uploadRes = await uploadService.file(file);
        mediaList.push({ type: "IMAGE", url: uploadRes.url });
      }

      // 2. Création du post
      // On envoie 'page' (ID) et 'content'
      const payload: any = {
        content: text.trim() ? text : (mediaList.length > 0 ? '\u200B' : text),
        ...(mediaList.length > 0 ? { media: mediaList } : {}),
        ...(pageContext?.id ? { page: pageContext.id } : {}),
      };

      const newPost = await postService.create(payload);

      // 3. IMPORTANT : On passe le post retourné par le serveur (qui a 0 likes/comments)
      onPostCreated(newPost);
      
      // Réinitialisation
      setText("");
      setSelectedFiles([]);
      setPreviews([]);
      onClose();
    } catch (error: any) {
      console.error('Erreur publication:', error?.response?.data || error);
      alert('Échec de l\'enregistrement. Vérifiez votre connexion au backend.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-bold text-lg">{pageContext ? `Publier sur ${pageContext.name}` : 'Créer un post'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition"><X size={20}/></button>
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto">
          <textarea
            placeholder="Quoi de neuf ?"
            className="w-full min-h-[120px] text-lg text-black bg-white outline-none resize-none placeholder:text-gray-400"
            value={text}
            onChange={(e) => setText(e.target.value)}
            autoFocus
          />
          
          {previews.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-4">
              {previews.map((src, i) => (
                <div key={i} className="relative aspect-video rounded-lg overflow-hidden border">
                  <img src={src} className="w-full h-full object-cover" alt="preview" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t flex items-center justify-between bg-gray-50">
          <label className="cursor-pointer p-2 hover:bg-gray-200 rounded-full transition text-green-600 flex items-center gap-2">
            <ImageIcon size={24} />
            <span className="text-sm font-bold text-gray-600">Photo/Vidéo</span>
            <input type="file" hidden multiple accept="image/*" onChange={handleFileChange} />
          </label>
          
          <button 
            onClick={handlePublish}
            disabled={isPublishing || (!text.trim() && selectedFiles.length === 0)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 disabled:bg-gray-300 transition shadow-lg shadow-purple-100"
          >
            {isPublishing ? <Loader2 className="animate-spin" size={18} /> : null}
            {isPublishing ? 'Envoi...' : 'Publier'}
          </button>
        </div>
      </div>
    </div>
  );
}