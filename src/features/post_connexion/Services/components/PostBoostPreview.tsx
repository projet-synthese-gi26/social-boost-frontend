// src/features/post_connexion/Publicite/components/PostBoostPreview.tsx
import React from 'react';
import { Globe, MoreHorizontal, ThumbsUp, MessageCircle, Share2 } from 'lucide-react';
import { PageData, PostData } from '../types';

interface PostBoostPreviewProps {
  page: PageData;
  post: PostData;
}

const PostBoostPreview: React.FC<PostBoostPreviewProps> = ({ page, post }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm animate-fade-in">
        {/* Header du post */}
        <div className="p-4 flex items-center gap-3">
            <img src={page.avatar} alt={page.name} className="w-10 h-10 rounded-full border border-gray-200" />
            <div className="flex-1">
                <h4 className="font-bold text-gray-900 text-sm">{page.name}</h4>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                    <span>Sponsorisé</span>
                    <span>•</span>
                    <Globe size={10} />
                </div>
            </div>
            <MoreHorizontal size={16} className="text-gray-400" />
        </div>

        {/* Contenu */}
        <div className="px-4 pb-2 text-sm text-gray-800">
            {post.content}
        </div>

        {/* Image du post (si existe) */}
        {post.image && (
            <div className="w-full h-64 bg-gray-100 mt-2">
                <img src={post.image} alt="Post Content" className="w-full h-full object-cover" />
            </div>
        )}

        {/* Footer actions (Fake) */}
        <div className="p-3 flex items-center justify-between border-t border-gray-100 mt-2 text-gray-500">
            <div className="flex items-center gap-1 text-sm"><ThumbsUp size={18} /> J'aime</div>
            <div className="flex items-center gap-1 text-sm"><MessageCircle size={18} /> Commenter</div>
            <div className="flex items-center gap-1 text-sm"><Share2 size={18} /> Partager</div>
        </div>
        
        {/* Call to Action Bar (Ajouté par le boost) */}
        <div className="bg-gray-50 p-3 flex items-center justify-between border-t border-gray-200">
            <span className="text-xs text-gray-500">tech-horizon.com</span>
            <button className="px-4 py-1.5 bg-gray-200 text-gray-800 text-xs font-bold rounded uppercase hover:bg-gray-300">
                En savoir plus
            </button>
        </div>
    </div>
  );
};

export default PostBoostPreview;