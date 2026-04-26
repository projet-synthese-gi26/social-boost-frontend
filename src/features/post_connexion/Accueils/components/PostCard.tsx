"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { 
  ThumbsUp, MessageCircle, Share2, MoreHorizontal, Heart, 
  Send, X, ChevronDown, ChevronUp, Loader2, Users 
} from 'lucide-react';
import type { Post } from '@lib/types/api.types';
import { getEntityHref, getFullImageUrl } from '@/utils/utils';
import { getTimeAgo } from '@/utils/threadly';
import { useComments, useMutualFriendsCached, useUser } from '@lib/hooks/useAPI';
import { pageService } from '@lib/api/services';

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => Promise<void>;
}

const pageCache = new Map<string, any>();

// --- ÉLÉMENT DE COMMENTAIRE ---
const CommentItem: React.FC<{ comment: any }> = ({ comment }) => {
  const userName = comment.user?.first_name 
    ? `${comment.user.first_name} ${comment.user.last_name}` 
    : "Utilisateur";
  const userAvatar = getFullImageUrl(comment.user?.profile_picture_url);

  return (
    <div className="mt-3 animate-in fade-in slide-in-from-left-2 duration-200">
      <div className="flex items-start gap-2">
        <div className="flex-shrink-0 mt-1">
          <img src={userAvatar} alt={userName} className="w-8 h-8 rounded-full object-cover bg-gray-100" />
        </div>
        <div className="flex-1">
          <div className="bg-white border border-gray-200 rounded-2xl px-3 py-2 inline-block max-w-full">
            <p className="font-bold text-xs text-black">{userName}</p>
            <p className="text-sm text-black">{comment.content}</p>
          </div>
          <div className="flex items-center text-[10px] text-gray-500 font-bold mt-1 ml-2 gap-3">
            <button className="hover:underline">J'aime</button>
            <button className="hover:underline">Répondre</button>
            <span className="font-normal text-gray-400">{getTimeAgo(new Date(comment.created_at).getTime())}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- COMPOSANT PRINCIPAL ---
export default function PostCard({ post, onLike }: PostCardProps) {
  const router = useRouter();
  const { user } = useUser();
  const { comments, addComment, isLoading: isLoadingComments } = useComments(post.id);

  const pageId = post.page
    ? (typeof (post as any).page === 'string' ? ((post as any).page as string) : ((post as any).page?.id as string))
    : undefined;
  const [pageDetails, setPageDetails] = useState<any>(() => (pageId ? pageCache.get(pageId) : undefined));

  const [liked, setLiked] = useState(!!post.is_liked_by_user);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showAllComments, setShowAllComments] = useState(false);

  useEffect(() => {
    setLiked(!!post.is_liked_by_user);
    setLikesCount(post.likes_count);
  }, [post.is_liked_by_user, post.likes_count]);

  useEffect(() => {
    const loadPage = async () => {
      if (!pageId) return;
      if (typeof (post as any).page === 'object' && (post as any).page?.name) {
        pageCache.set(pageId, (post as any).page);
        setPageDetails((post as any).page);
        return;
      }
      const cached = pageCache.get(pageId);
      if (cached) {
        setPageDetails(cached);
        return;
      }
      try {
        const data = await pageService.getById(pageId);
        pageCache.set(pageId, data);
        setPageDetails(data);
      } catch {
        // ignore
      }
    };

    loadPage();
  }, [pageId]);

  const entityKind = pageId ? 'page' : 'user';
  const entityId = pageId || post.author?.id;
  const entityName = pageId
    ? (pageDetails?.name || (typeof (post as any).page === 'object' ? (post as any).page?.name : undefined) || 'Page')
    : (post.author?.first_name ? `${post.author.first_name} ${post.author.last_name}` : 'Utilisateur');
  const entityAvatar = getFullImageUrl(
    pageId
      ? (pageDetails?.profile_picture_url || (typeof (post as any).page === 'object' ? (post as any).page?.profile_picture_url : undefined))
      : post.author?.profile_picture_url
  );
  const postDate = getTimeAgo(new Date(post.created_at).getTime());

  const { mutualCount } = useMutualFriendsCached(entityKind === 'user' ? (entityId as string | undefined) : undefined);

  const handleLikeClick = async () => {
    const newLikedStatus = !liked;
    setLiked(newLikedStatus);
    setLikesCount(prev => newLikedStatus ? prev + 1 : prev - 1);
    try {
      await onLike(post.id);
    } catch (error) {
      setLiked(!newLikedStatus);
      setLikesCount(prev => !newLikedStatus ? prev + 1 : prev - 1);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await addComment(commentText);
      setCommentText('');
      if (!showComments) setShowComments(true);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-4">
      {/* En-tête */}
      <div className="p-4 flex items-center">
        <div className="cursor-pointer" onClick={() => entityId && router.push(getEntityHref(entityKind, entityId))}>
          <img src={entityAvatar} alt={entityName} className="w-10 h-10 rounded-full object-cover bg-gray-100" />
        </div>
        <div className="ml-3">
          <h3 className="font-bold text-sm text-black hover:underline cursor-pointer" onClick={() => entityId && router.push(getEntityHref(entityKind, entityId))}>
            {entityName}
          </h3>
          <p className="text-[11px] text-gray-500 font-medium">{postDate}</p>
          {entityKind === 'user' && mutualCount > 0 && (
            <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium">
              <Users size={14} />
              <span>{mutualCount} ami(s) en commun</span>
            </div>
          )}
        </div>
        <button className="ml-auto p-2 hover:bg-gray-100 rounded-full transition text-gray-400"><MoreHorizontal size={18} /></button>
      </div>

      {/* Contenu Texte */}
      <div className="px-4 pb-3">
        <p className="text-sm text-black leading-relaxed whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Médias */}
      {post.media && post.media.length > 0 && (
        <div className="bg-gray-50 border-y border-gray-50">
          <div className={`grid gap-0.5 ${post.media.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {post.media.map((item: any, idx: number) => (
              <img key={idx} src={getFullImageUrl(item.url)} alt="Post" className="w-full h-auto max-h-[500px] object-cover" />
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="px-4 py-3">
        <div className="flex justify-between text-xs text-black mb-3 font-medium">
          <div className="flex items-center gap-1">
            {likesCount > 0 && (
              <span className="flex items-center gap-1 text-black">
                <Heart size={14} className="fill-current" /> {likesCount}
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowComments(!showComments)} className="hover:underline">
              {comments.length} commentaires
            </button>
            <span>{post.shares_count || 0} partages</span>
          </div>
        </div>

        <div className="h-px bg-gray-200 w-full mb-1"></div>

        {/* Actions */}
        <div className="flex justify-between">
          <button onClick={handleLikeClick} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl hover:bg-gray-100 transition ${liked ? 'text-red-500 font-bold' : 'text-black'}`}>
            <Heart size={20} className={liked ? "fill-current" : ""} />
            <span className="text-xs">J'adore</span>
          </button>
          <button onClick={() => setShowComments(!showComments)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl hover:bg-gray-100 transition text-black">
            <MessageCircle size={20} />
            <span className="text-xs">Commenter</span>
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl hover:bg-gray-100 transition text-black">
            <Share2 size={20} />
            <span className="text-xs">Partager</span>
          </button>
        </div>

        {/* Section Commentaires */}
        {(showComments || commentText) && (
          <div className="mt-3 pt-3 border-t border-gray-200 bg-gray-50 rounded-xl px-3 pb-3">
            {user && (
              <form onSubmit={handleCommentSubmit} className="flex gap-2 mb-4">
                <img src={getFullImageUrl(user.profile_picture_url)} alt="Me" className="w-8 h-8 rounded-full object-cover bg-gray-100" />
                <div className="flex-1 flex items-center bg-white border border-gray-200 rounded-2xl px-4 py-2">
                  <input 
                    type="text" 
                    value={commentText} 
                    onChange={(e) => setCommentText(e.target.value)} 
                    placeholder="Écrivez un commentaire..." 
                    className="flex-1 bg-transparent border-none outline-none text-xs text-black placeholder:text-gray-400"
                  />
                  <button type="submit" disabled={!commentText.trim()}>
                    <Send size={16} className={commentText.trim() ? "text-purple-600" : "text-gray-300"} />
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-1">
              {isLoadingComments ? (
                <div className="flex justify-center py-2"><Loader2 className="animate-spin text-gray-300" size={16} /></div>
              ) : comments.length > 0 ? (
                <>
                  {(showAllComments ? comments : comments.slice(0, 2)).map((comment: any) => (
                    <CommentItem key={comment.id} comment={comment} />
                  ))}
                  {comments.length > 2 && !showAllComments && (
                    <button onClick={() => setShowAllComments(true)} className="text-[11px] font-bold text-gray-500 hover:underline mt-2 ml-10">
                      Voir les {comments.length - 2} autres commentaires
                    </button>
                  )}
                </>
              ) : (
                <p className="text-center py-2 text-[10px] text-gray-400 font-medium italic">Soyez le premier à commenter...</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}