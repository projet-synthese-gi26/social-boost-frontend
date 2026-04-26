"use client";

import React from "react";
import { getFullImageUrl } from "@/utils/utils";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
}

export const Avatar = ({ 
  src, 
  alt = "Utilisateur", 
  size = "md",
  className = "" 
}: AvatarProps) => {
  
  // Définition des tailles en Tailwind
  const sizeClasses = {
    xs: "w-6 h-6",
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
    "2xl": "w-32 h-32", // Pour le profil
  };

  // Logique de l'URL de l'image
  // 1. Si src existe, on l'utilise.
  // 2. Sinon, on génère un avatar Dicebear basé sur le nom (alt).
  const finalSrc = src 
    ? getFullImageUrl(src)
    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(alt)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

  return (
    <div className={`flex-shrink-0 ${sizeClasses[size]} ${className}`}>
      <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 border border-gray-100 shadow-sm">
        <img
          src={finalSrc}
          alt={alt}
          className="w-full h-full object-cover"
          // Gestion du cas où l'image src renvoie une erreur (ex: lien mort vers le backend)
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(alt)}`;
          }}
        />
      </div>
    </div>
  );
};