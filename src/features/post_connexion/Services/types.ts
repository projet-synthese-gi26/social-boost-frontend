// src/features/post_connexion/Publicite/types.ts

export type BoostType = 'PAGE_GROWTH' | 'POST_ENGAGEMENT';

export interface PageData {
  id: string;
  name: string;
  category: string;
  avatar: string;
  cover: string;
  followers: number;
}

export interface PostData {
  id: string;
  content: string;
  image?: string;
  date: string;
  likes: number;
  comments: number;
}