// boostFrontend/lib/api/services.ts

import { apiClient } from './client';
import { API_CONFIG } from '../config/api.config';
import * as T from '../types/api.types';

const { endpoints } = API_CONFIG;

/**
 * SERVICE AUTHENTIFICATION
 */
export const authService = {
  login: (data: T.LoginRequest) => 
    apiClient.post<T.TokenResponse>(endpoints.auth.login, data),
  
  register: (data: T.CreateUserRequest) => 
    apiClient.post(endpoints.auth.register, data),
  
  getMe: () => 
    apiClient.get<T.User>(endpoints.auth.me),

  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false; 
    return !!localStorage.getItem('access_token');
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      window.location.href = '/';
    }
  }
};

/**
 * SERVICE UTILISATEURS (PROFIL)
 * Ajouté pour corriger l'erreur de build
 */
export const usersService = {
  // Mettre à jour les infos (nom, bio, photos)
  updateProfile: (userData: Partial<T.User>) => 
    apiClient.patch<T.User>(endpoints.auth.me, userData),
    
  // Récupérer un utilisateur spécifique par son ID
  getById: (id: string) => 
    apiClient.get<T.User>(`${endpoints.coreUsers}${id}/`),

  // Récupérer les posts d'un utilisateur (profil)
  getPosts: (id: string) =>
    apiClient.get<T.Post[]>(`${endpoints.coreUsers}${id}/posts/`),

  // Récupérer les amis d'un utilisateur (core)
  getFriends: (userId: string) =>
    apiClient.get<T.User[]>(`${endpoints.coreUsers}${userId}/friends/`),

  // Récupérer les amis communs avec l'utilisateur connecté (core)
  getMutualFriends: (userId: string) =>
    apiClient.get<T.User[]>(`${endpoints.coreUsers}${userId}/mutual_friends/`),
};

/**
 * SERVICE PUBLICATIONS & FEED
 */
export const postService = {
  getFeed: (page: number = 1) => {
    return apiClient.get<T.PaginatedResponse<T.Post>>(
      `${endpoints.feed}?page=${page}`
    );
  },
  
  getMine: () =>
    apiClient.get<T.Post[]>(`${endpoints.posts}mine/`),
  
  create: (data: T.CreatePostRequest) => 
    apiClient.post<T.Post>(endpoints.posts, data),
  
  like: (id: string) => 
    apiClient.post(`${endpoints.posts}${id}/like/`),
  
  unlike: (id: string) => 
    apiClient.delete(`${endpoints.posts}${id}/unlike/`),
  
  share: (id: string) => 
    apiClient.post(`${endpoints.posts}${id}/share/`),

  getById: (id: string) => 
    apiClient.get<T.Post>(`${endpoints.posts}${id}/`),
};

/**
 * SERVICE PAGES
 */
export const pageService = {
  list: () => 
    apiClient.get<any>(endpoints.pages),
  
  getById: (id: string) => 
    apiClient.get<T.Page>(`${endpoints.pages}${id}/`),
  
  create: (data: T.CreatePageRequest) => 
    apiClient.post<T.Page>(endpoints.pages, data),
  
  update: (id: string, data: Partial<T.Page>) =>
    apiClient.patch<T.Page>(`${endpoints.pages}${id}/`, data),
  
  subscribe: (id: string) => 
    apiClient.post(`${endpoints.pages}${id}/subscribe/`),

  unsubscribe: (id: string) => 
    apiClient.delete(`${endpoints.pages}${id}/unsubscribe/`),

  getPostsByPage: (id: string) => 
    apiClient.get<T.Post[]>(`${endpoints.pages}${id}/posts/`),
};

/**
 * SERVICE BOOST
 */
export const boostService = {
  create: (data: T.CreateBoostRequest) => 
    apiClient.post<T.Boost>(endpoints.boosts, data),
  
  pay: (id: string, amount: number) => 
    apiClient.post<T.BoostPayResponse>(`${endpoints.boosts}${id}/pay/`, {
      payment_token: "simulated_token_nextjs",
      amount: amount
    }),

  pause: (id: string) =>
    apiClient.post<{ status: string; boost_status: T.Boost['status'] | string }>(`${endpoints.boosts}${id}/pause/`, {}),

  resume: (id: string) =>
    apiClient.post<{ status: string; boost_status: T.Boost['status'] | string }>(`${endpoints.boosts}${id}/resume/`, {}),

  stop: (id: string) =>
    apiClient.post<{ status: string; boost_status: T.Boost['status'] | string }>(`${endpoints.boosts}${id}/stop/`, {}),
  
  getMyBoosts: async () => {
    const data = await apiClient.get<any>(endpoints.boosts);
    if (Array.isArray(data)) return data as T.Boost[];
    if (data && typeof data === 'object' && Array.isArray((data as any).results)) return (data as any).results as T.Boost[];
    return [] as T.Boost[];
  },
};

/**
 * SERVICE COMMENTAIRES
 */
export const commentService = {
  getByPost: (postId: string) => 
    apiClient.get<T.Comment[]>(`${endpoints.comments}?post=${postId}`),
  
  create: (data: T.CreateCommentRequest) => 
    apiClient.post<T.Comment>(endpoints.comments, data),
  
  delete: (id: string) => 
    apiClient.delete(`${endpoints.comments}${id}/`),
};

/**
 * SERVICE SOCIAL (AMIS)
 */
export const friendService = {
  list: () => 
    apiClient.get<T.PaginatedResponse<T.Friend>>(endpoints.friendships),
  
  sendRequest: (addresseeId: string) => 
    apiClient.post(endpoints.friendships, { addressee_id: addresseeId }),
  
  acceptRequest: (id: string) => 
    apiClient.post(`${endpoints.friendships}${id}/accept/`),
  
  declineRequest: (id: string) => 
    apiClient.post(`${endpoints.friendships}${id}/decline/`),

  delete: (id: string) => 
    apiClient.delete(`${endpoints.friendships}${id}/`),

  getSuggestions: () => 
    apiClient.get<T.User[]>(`${endpoints.friendships}suggestions/`),
};

/**
 * SERVICE RECHERCHE
 */
export const searchService = {
  search: (query: string) => 
    apiClient.get<T.SearchResults>(`${endpoints.search}?q=${query}`),
};

/**
 * SERVICE MÉDIA
 */
export const uploadService = {
  file: async (file: File, type: 'IMAGE' | 'VIDEO' = 'IMAGE') => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post<{url: string, type: string}>(endpoints.upload, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};