export interface Post {
  id: string;
  authorId?: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  media: string[];
  timestamp: number;
  likes: number;
  comments: number;
  shares: number;
  pageId?: string;
}

export interface Page {
  id: string;
  name: string;
  category: string;
  bio: string;
  coverImage: string | null;
  avatarImage: string | null;
  followers: number;
  posts: Post[];
}

// Ajouter à la fin du fichier
export interface CommentUser {
  id: string;
  name: string;
  avatar: string;
}

export interface Comment {
  id: string;
  user: CommentUser;
  content: string;
  likes: number;
  replies?: Comment[];
}

export interface Friend {
  id: string;
  name: string;
  avatar: string;
}

export interface FriendRequest {
  id: string;
  name: string;
  avatar: string;
  mutual: number;
}

export type TabId = 'home' | 'friends' | 'services';

export type CategoryType = 'Creator' | 'Business' | 'Brand' | 'Community';