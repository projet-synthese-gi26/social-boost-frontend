// Déclaration des types pour window.storage (API Claude.ai)

interface StorageResult {
  key: string;
  value: string;
  shared: boolean;
}

interface StorageListResult {
  keys: string[];
  prefix?: string;
  shared: boolean;
}

interface StorageDeleteResult {
  key: string;
  deleted: boolean;
  shared: boolean;
}

interface ClaudeStorage {
  /**
   * Récupère une valeur du storage
   * @param key - La clé à récupérer
   * @param shared - Si true, récupère depuis le storage partagé
   * @returns La valeur stockée ou null si non trouvée
   */
  get(key: string, shared?: boolean): Promise<StorageResult | null>;
  
  /**
   * Enregistre une valeur dans le storage
   * @param key - La clé sous laquelle enregistrer
   * @param value - La valeur à enregistrer (string)
   * @param shared - Si true, enregistre dans le storage partagé
   * @returns Le résultat de l'opération
   */
  set(key: string, value: string, shared?: boolean): Promise<StorageResult | null>;
  
  /**
   * Supprime une valeur du storage
   * @param key - La clé à supprimer
   * @param shared - Si true, supprime du storage partagé
   * @returns Le résultat de l'opération
   */
  delete(key: string, shared?: boolean): Promise<StorageDeleteResult | null>;
  
  /**
   * Liste les clés disponibles dans le storage
   * @param prefix - Préfixe optionnel pour filtrer les clés
   * @param shared - Si true, liste depuis le storage partagé
   * @returns La liste des clés
   */
  list(prefix?: string, shared?: boolean): Promise<StorageListResult | null>;
}

interface Window {
  storage: ClaudeStorage;
  fs?: {
    readFile(path: string, options?: { encoding?: string }): Promise<Uint8Array | string>;
  };
}

// Déclaration pour permettre l'utilisation dans les modules
declare global {
  interface Window {
    storage: ClaudeStorage;
    fs?: {
      readFile(path: string, options?: { encoding?: string }): Promise<Uint8Array | string>;
    };
  }
}

export {};