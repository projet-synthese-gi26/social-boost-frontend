import { CategoryType } from '@/types/threadly';

export function getTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return "À l'instant";
  if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)} h`;
  if (seconds < 604800) return `Il y a ${Math.floor(seconds / 86400)} j`;
  
  return new Date(timestamp).toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'short' 
  });
}

export function getCategoryLabel(category: string): string {
  const labels: Record<CategoryType, string> = {
    'Creator': 'Créateur de contenu',
    'Business': 'Entreprise locale',
    'Brand': 'Marque',
    'Community': 'Communauté'
  };
  return labels[category as CategoryType] || category;
}