// lib/api/client.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { API_CONFIG } from '../config/api.config';

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // --- INTERCEPTEUR DE REQUÊTE ---
    this.client.interceptors.request.use((config) => {
      // Protection SSR : localStorage n'existe pas sur le serveur
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers = (config.headers ?? {}) as any;
          (config.headers as any).Authorization = `Bearer ${token}`;
        }
      }
      return config;
    });

    // --- INTERCEPTEUR DE RÉPONSE ---
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // Si erreur 401 (Non autorisé)
        if (error.response?.status === 401 && !originalRequest._retry) {
          
          // Si on est déjà en train d'essayer de rafraîchir le token, on arrête tout
          if (originalRequest.url?.includes(API_CONFIG.endpoints.auth.refresh)) {
            this.logout();
            return Promise.reject(error);
          }

          originalRequest._retry = true;

          try {
            const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
            
            if (!refreshToken) {
              this.logout();
              return Promise.reject(error);
            }

            // Tentative de rafraîchissement (on utilise axios direct pour éviter l'intercepteur de boucle)
            const res = await axios.post(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.auth.refresh}`, { 
              refresh: refreshToken 
            });

            const newAccess = res.data.access;
            
            if (typeof window !== 'undefined') {
              localStorage.setItem('access_token', newAccess);
            }

            // On rejoue la requête originale avec le nouveau token
            originalRequest.headers.Authorization = `Bearer ${newAccess}`;
            return this.client(originalRequest);

          } catch (refreshError) {
            // Si le refresh échoue (expire lui aussi), on déconnecte
            this.logout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // --- MÉTHODE DE DÉCONNEXION ---
  public logout() {
    if (typeof window !== 'undefined') {
      console.warn("🔐 Session expirée. Nettoyage et redirection...");
      localStorage.clear();
      // On redirige vers la racine '/' car c'est là que se trouve ton formulaire de login
      window.location.replace('/'); 
    }
  }

  // --- WRAPPERS HTTP ---
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

// Instance unique (Singleton)
export const apiClient = new APIClient();