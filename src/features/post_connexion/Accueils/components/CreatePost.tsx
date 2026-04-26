"use client";

import React, { useState } from "react";
// Changement ici : On importe 'Flag' au lieu de 'Video'
import { Flag, Image as ImageIcon, Smile } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import CreatePage from "./CreatePage";

export const CreatePost = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Card className="p-4 mb-4">
        <div className="flex gap-3 mb-4 border-b pb-4">
          <Avatar alt="Me" />
          <input
            type="text"
            placeholder="Quoi de neuf, Antoine ?"
            className="flex-1 bg-gray-100 rounded-full px-4 hover:bg-gray-200 transition outline-none cursor-pointer"
          />
        </div>

        <div className="flex justify-center px-4">
          <button
            onClick={() => setIsModalOpen(true)}
            aria-label="Créer une page"
            className="flex items-center gap-2 justify-center w-full max-w-xs mx-auto bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium px-4 py-2 rounded-lg shadow-md hover:from-purple-600 hover:to-purple-700 transition active:scale-95"
          >
            {/* Changement ici : Icône Flag */}
            <Flag size={20} className="text-white fill-current" /> 
            <span className="text-sm">Créer une page</span>
          </button>
        </div>
      </Card>

      <CreatePage 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};