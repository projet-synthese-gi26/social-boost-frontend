import { useState, useEffect, useCallback } from 'react';
import { boostService } from '@lib/api/services';
import type { Boost } from '@lib/types/api.types';

export const useBoosts = () => {
  const [boosts, setBoosts] = useState<Boost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBoostId, setSelectedBoostId] = useState<string | null>(null);

  // Charger les boosts de l'utilisateur
  const fetchBoosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await boostService.getMyBoosts();
      setBoosts(response);
      
      // Sélectionner le premier boost si aucun n'est sélectionné
      if (response.length > 0 && !selectedBoostId) {
        setSelectedBoostId(response[0].id);
      }
      
      return response;
    } catch (err) {
      console.error('Erreur lors du chargement des boosts:', err);
      setError('Impossible de charger les campagnes de boost');
      return [];
    } finally {
      setLoading(false);
    }
  }, [selectedBoostId]);

  // Mettre à jour le statut d'un boost (pause/relance/arrêt)
  const updateBoostStatus = async (boostId: string, status: Boost['status']) => {
    try {
      // Note: Vous devrez peut-être implémenter cette méthode dans votre service
      // const updatedBoost = await boostService.updateStatus(boostId, status);
      // setBoosts(prev => prev.map(b => b.id === boostId ? updatedBoost : b));
      // return updatedBoost;
      
      // Solution temporaire en attendant l'implémentation backend
      setBoosts(prev => 
        prev.map(b => b.id === boostId ? { ...b, status } : b)
      );
      return { success: true };
    } catch (err) {
      console.error('Erreur lors de la mise à jour du statut:', err);
      throw new Error('Impossible de mettre à jour le statut de la campagne');
    }
  };

  // Charger les boosts au montage du composant
  useEffect(() => {
    fetchBoosts();
  }, [fetchBoosts]);

  // Trouver le boost sélectionné
  const selectedBoost = boosts.find(boost => boost.id === selectedBoostId) || null;

  return {
    boosts,
    selectedBoost,
    loading,
    error,
    selectBoost: setSelectedBoostId,
    refreshBoosts: fetchBoosts,
    updateBoostStatus,
  };
};

export default useBoosts;
