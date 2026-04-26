// src/features/dashboard/types.ts

export type CampaignStatus = 'active' | 'completed' | 'paused';
export type CampaignType = 'Page Promotion' | 'Post Boost';

export interface Audience {
  location: string;
  ageRange: string;
  gender: 'Tous' | 'Hommes' | 'Femmes';
  interests: string[];
}

export interface DailyStat {
  date: string; // Format 'YYYY-MM-DD'
  views: number;
  likes: number;
  comments: number;
  shares: number;
}

export interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  startDate: string; // ISO 8601 format
  endDate: string;   // ISO 8601 format
  budget: number;    // en USD
  audience: Audience;
  target: {
    id: string;
    name: string; // Nom de la page ou contenu du post
    image?: string;
  };
  stats: {
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    daily: DailyStat[];
  };
}
