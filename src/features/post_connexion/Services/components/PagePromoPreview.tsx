// src/features/post_connexion/Publicite/components/PagePromoPreview.tsx
import React from 'react';
import { MoreHorizontal, ThumbsUp } from 'lucide-react';
import { PageData } from '../types';

interface PagePromoPreviewProps {
  page: PageData;
}

const PagePromoPreview: React.FC<PagePromoPreviewProps> = ({ page }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm animate-fade-in">
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Sponsorisé • Suggestion</span>
        <MoreHorizontal size={16} className="text-gray-400" />
      </div>
      
      {/* Cover Image */}
      <div className="h-40 bg-gray-200 relative">
        <img src={page.cover} alt="Cover" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      {/* Content */}
      <div className="p-4 relative">
        <div className="flex justify-between items-start">
            <div className="flex gap-3">
                {/* Avatar overlap */}
                <div className="-mt-10 p-1 bg-white rounded-full inline-block relative z-10">
                    <img src={page.avatar} alt="Logo" className="w-16 h-16 rounded-full object-cover border border-gray-200" />
                </div>
                <div className="mt-1">
                    <h3 className="font-bold text-gray-900 text-lg leading-tight">{page.name}</h3>
                    <p className="text-xs text-gray-500">{page.category}</p>
                    <p className="text-xs text-gray-400 mt-1">{page.followers.toLocaleString()} abonnés</p>
                </div>
            </div>
        </div>
        
        <div className="mt-4">
            <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors">
                <ThumbsUp size={18} />
                Aimer la Page
            </button>
        </div>
      </div>
    </div>
  );
};

export default PagePromoPreview;