"use client";

import React from "react";
import { Users, User, Bookmark, MonitorPlay, Store, Clock, ChevronDown } from "lucide-react";
import Link from "next/link"; 
import { Avatar } from "@/components/ui/Avatar";
import { Friend } from "@lib/types/api.types";
import { useUser } from "@lib/hooks/useAPI";

interface LeftSidebarProps {
  friends?: Friend[];
}

// Configuration des éléments du menu
const MENU_ITEMS = [
  { 
    icon: User, 
    label: "Profil", 
    href: "/post_connexion/Profils", // Chemin vers ta page Profil
    color: "text-purple-500" 
  },
  { 
    icon: Users, 
    label: "Ami(e)s", 
    href: "/post_connexion/Amis", // Chemin vers ta page Amis
    color: "text-blue-500" 
  },
  
];

export const LeftSidebar = ({ friends = [] }: LeftSidebarProps) => {
  const { user } = useUser();
  return (
    <aside className="fixed left-0 top-14 h-[calc(100vh-56px)] w-[300px] p-4 overflow-y-auto hidden xl:block hover:overflow-y-scroll scrollbar-hide">
      <div className="space-y-2">
        
        {/* Profil courant (Rendu cliquable aussi via Link) */}
        <Link href="/post_connexion/Profils">
          <div className="flex items-center gap-3 p-2 hover:bg-purple-50 rounded-lg cursor-pointer transition group">
            <Avatar size="sm" alt={user?.first_name || 'Utilisateur'} src={user?.avatar} />
            <span className="font-semibold text-sm text-gray-700 group-hover:text-purple-700 transition-colors">
              {user ? `${user.first_name} ${user.last_name}` : 'Chargement...'}
            </span>
          </div>
        </Link>

        {/* Liste Menu */}
        {MENU_ITEMS.map((item, index) => (
          /* --- CORRECTION ICI --- */
          /* On remplace la div par Link et on lui passe le href */
          <Link 
            key={index} 
            href={item.href || "#"} 
            className="flex items-center justify-between p-2 hover:bg-purple-50 rounded-lg cursor-pointer transition group"
          >
            <div className="flex items-center gap-3">
              <item.icon className={`w-6 h-6 ${item.color} group-hover:scale-110 transition-transform`} />
              <span className="font-medium text-sm text-gray-700 group-hover:text-purple-700 transition-colors">
                {item.label}
              </span>
            </div>
            {item.label === "Ami(e)s" && (
              <span className="text-xs font-bold text-gray-500 bg-gray-100 group-hover:bg-purple-100 px-2 py-0.5 rounded-full transition-colors">
                {friends.length}
              </span>
            )}
          </Link>
          /* ---------------------- */
        ))}

        {/* Bouton Voir plus (souvent un dropdown, on le garde en div pour l'instant) */}
        <div className="flex items-center gap-3 p-2 hover:bg-purple-50 rounded-lg cursor-pointer transition group">
          <div className="w-8 h-8 bg-gray-100 group-hover:bg-purple-100 rounded-full flex items-center justify-center transition-colors">
            <ChevronDown size={20} className="text-gray-600 group-hover:text-purple-600" />
          </div>
          <span className="font-medium text-sm text-gray-700">Voir plus</span>
        </div>
      </div>

      <div className="mt-4 border-t pt-4 text-xs text-gray-500">
        <p>Confidentialité · Conditions · Publicité · Cookies </p>
        <p className="mt-2">LogisLink © 2026</p>
      </div>
    </aside>
  );
};