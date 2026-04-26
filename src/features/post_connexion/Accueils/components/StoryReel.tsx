"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import CreatePostModal from "./CreatePostModal";

export const StoryReel = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* --- CORRECTION ICI --- */}
      {/* On utilise une div enveloppante pour gérer le clic et les dimensions externes.
          Cela contourne l'erreur TypeScript sur la Card qui n'accepte pas onClick. */}
      <div 
        onClick={() => setIsModalOpen(true)}
        className="mb-6 h-48 sm:h-64 cursor-pointer relative group"
      >
        {/* La Card gère maintenant uniquement le style visuel et l'agencement interne (flex) */}
        <Card className="flex w-full h-full overflow-hidden hover:shadow-md transition-all duration-300 border-gray-200">
          
          {/* Partie Gauche : Story Création (La carte avec le +) */}
          <div className="w-32 sm:w-40 flex-shrink-0 relative">
            <div className="h-3/4 bg-gray-200 relative overflow-hidden">
              {/* Simule l'image de profil en grand */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10 group-hover:scale-105 transition-transform duration-500"></div>
            </div>

            <div className="h-1/4 bg-white relative flex flex-col items-center justify-end pb-2 z-10 border-r border-gray-100">
              <div className="absolute -top-5 bg-purple-500 group-hover:bg-purple-600 transition-colors text-white p-1 rounded-full border-4 border-white shadow-sm">
                <Plus size={24} className="text-white" />
              </div>
              <span className="text-sm font-semibold text-purple-700">Créer</span>
            </div>
          </div>

          {/* Partie Droite : Texte d'invitation */}
          <div className="flex-1 p-4 flex items-center justify-center bg-white">
            <span className="text-gray-500 text-sm font-medium group-hover:text-purple-600 transition-colors">
              Partagez une photo ou un message.
            </span>
          </div>

        </Card>
      </div>

      {/* Affichage de la Modale */}
      <CreatePostModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onPostCreated={() => setIsModalOpen(false)}
      />
    </>
  );
};