// lib/types/api.types.ts

// Authentification
export interface LoginRequest {
  username: string;  // Contient l'email
  password: string;
}

export interface TokenResponse {
  refresh: string;
  access: string;
  user?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
}

export interface RefreshTokenRequest {
  refresh: string;
}

export interface RefreshTokenResponse {
  access: string;
}

// Utilisateurs
export interface User {
  id: string;
  email: string;
  username?: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  profile_picture_url?: string;
  cover_photo_url?: string;
  city?: string;
  gender?: string;
  birth_date?: string;
  interests?: string[];
  date_joined?: string;
  mutual_friends_count?: number;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  re_password?: string;
  first_name: string;
  last_name: string;
  username?: string;
  profile_picture_url?: string;
}

// Médias
export interface Media {
  type: 'IMAGE' | 'VIDEO';
  url: string;
}

export interface UploadedMedia {
  id?: number;
  url: string;
  file?: string;
  type: 'IMAGE' | 'VIDEO';
  file_type?: 'IMAGE' | 'VIDEO';
  uploaded_by?: number;
  created_at?: string;
}

// Publications
export interface Post {
  id: string;
  author: User;
  page?: Page;
  content: string;
  media?: Media[];
  media_url?: string;
  media_type?: 'IMAGE' | 'VIDEO';
  likes_count: number;
  is_liked_by_user?: boolean;
  comments_count: number;
  shares_count?: number;
  created_at: string;
  updated_at?: string;
}

export interface CreatePostRequest {
  content: string;
  media?: Media[];
  media_url?: string;
  media_type?: 'IMAGE' | 'VIDEO';
  page?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Pages
export interface Page {
  id: string;
  name: string;
  description: string;
  category: string;
  owner: string | User;
  subscribers_count: number;
  profile_picture_url?: string;
  avatar?: string;
  cover_photo_url?: string;
  cover?: string;
  created_at: string;
}

export interface CreatePageRequest {
  name: string;
  description: string;
  category: string;
  profile_picture_url?: string;
  avatar?: string;
  cover_photo_url?: string;
  cover?: string;
}

// Boosts
export interface Boost {
  id: string;
  user: number | User;
  target_type: 'POST' | 'PAGE';
  target_id: string;
  budget: string | number;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  start_date: string;
  end_date: string;
  ranking_weight?: number;
  audience_location?: string | null;
  audience_age_min?: number | null;
  audience_age_max?: number | null;
  audience_gender?: 'ALL' | 'MALE' | 'FEMALE' | string | null;
  audience_interests?: string[];
  created_at?: string;
}

export interface CreateBoostRequest {
  target_type: 'POST' | 'PAGE';
  target_id: string;
  budget: number;
  start_date: string;
  end_date: string;
  audience_location?: string | null;
  audience_age_min?: number | null;
  audience_age_max?: number | null;
  audience_gender?: 'ALL' | 'MALE' | 'FEMALE' | string | null;
  audience_interests?: string[];
}

export interface BoostPayResponse {
  status: 'success' | 'error' | string;
  message?: string;
  boost_status?: Boost['status'] | string;
}

// Commentaires
export interface Comment {
  id: string;
  user: User;
  post: string;
  content: string;
  parent_comment?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface CreateCommentRequest {
  post: string;
  content: string;
  parent_comment?: string | null;
}

// Recherche
export interface SearchResults {
  users: User[];
  pages: Page[];
}

// Amis
export interface Friend {
  id: string;
  user?: User;
  requester?: User;
  addressee?: User;
  friendship_status?: 'ACCEPTED' | 'PENDING' | 'DECLINED';
  status?: 'ACCEPTED' | 'PENDING' | 'DECLINED';
  created_at: string;
}

export interface FriendRequest {
  id: string;
  requester: User;
  addressee: User;
  from_user?: User;
  to_user?: User;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  created_at: string;
}

// Erreurs API
export interface APIError {
  detail?: string;
  non_field_errors?: string[];
  [key: string]: any;
}