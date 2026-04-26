/**
 * Helper pour gérer le storage avec fallback en développement local
 */

// Vérifier si window.storage est disponible (environnement Claude.ai)
const isClaudeEnvironment = typeof window !== 'undefined' && 'storage' in window;

/**
 * Stockage local de fallback pour le développement
 */
const localStorageFallback = {
  async get(key: string): Promise<{ key: string; value: string; shared: boolean } | null> {
    try {
      const value = localStorage.getItem(key);
      if (value === null) {
        throw new Error('Key not found');
      }
      return { key, value, shared: false };
    } catch {
      return null;
    }
  },

  async set(key: string, value: string): Promise<{ key: string; value: string; shared: boolean } | null> {
    try {
      localStorage.setItem(key, value);
      return { key, value, shared: false };
    } catch (error) {
      console.error('localStorage error:', error);
      return null;
    }
  },

  async delete(key: string): Promise<{ key: string; deleted: boolean; shared: boolean } | null> {
    try {
      localStorage.removeItem(key);
      return { key, deleted: true, shared: false };
    } catch (error) {
      console.error('localStorage error:', error);
      return null;
    }
  },

  async list(prefix?: string): Promise<{ keys: string[]; prefix?: string; shared: boolean } | null> {
    try {
      const keys = Object.keys(localStorage);
      const filteredKeys = prefix 
        ? keys.filter(key => key.startsWith(prefix))
        : keys;
      return { keys: filteredKeys, prefix, shared: false };
    } catch (error) {
      console.error('localStorage error:', error);
      return null;
    }
  }
};

/**
 * API de storage unifiée qui fonctionne dans Claude.ai et en local
 */
export const storage = {
  async get(key: string, shared?: boolean) {
    if (isClaudeEnvironment) {
      try {
        return await window.storage.get(key, shared);
      } catch (error) {
        console.error('Storage get error:', error);
        return null;
      }
    }
    return localStorageFallback.get(key);
  },

  async set(key: string, value: string, shared?: boolean) {
    if (isClaudeEnvironment) {
      try {
        return await window.storage.set(key, value, shared);
      } catch (error) {
        console.error('Storage set error:', error);
        return null;
      }
    }
    return localStorageFallback.set(key, value);
  },

  async delete(key: string, shared?: boolean) {
    if (isClaudeEnvironment) {
      try {
        return await window.storage.delete(key, shared);
      } catch (error) {
        console.error('Storage delete error:', error);
        return null;
      }
    }
    return localStorageFallback.delete(key);
  },

  async list(prefix?: string, shared?: boolean) {
    if (isClaudeEnvironment) {
      try {
        return await window.storage.list(prefix, shared);
      } catch (error) {
        console.error('Storage list error:', error);
        return null;
      }
    }
    return localStorageFallback.list(prefix);
  }
};

/**
 * Vérifier si on est dans l'environnement Claude.ai
 */
export const isClaudeEnv = () => isClaudeEnvironment;

/**
 * Helper pour gérer les erreurs de storage
 */
export const withStorageErrorHandling = async <T>(
  operation: () => Promise<T>,
  errorMessage: string = 'Storage operation failed'
): Promise<T | null> => {
  try {
    return await operation();
  } catch (error) {
    console.error(errorMessage, error);
    return null;
  }
};