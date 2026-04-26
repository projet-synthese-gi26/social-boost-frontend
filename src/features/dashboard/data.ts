// src/features/dashboard/data.ts
import { Campaign } from './types';

// Helper pour générer des stats journalières
const generateDailyStats = (days: number, base: {views: number, likes: number}) => {
  const stats = [];
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    stats.push({
      date: date.toISOString().split('T')[0],
      views: Math.floor(base.views * (Math.random() * 0.5 + 0.75)),
      likes: Math.floor(base.likes * (Math.random() * 0.6 + 0.7)),
      comments: Math.floor(base.likes * (Math.random() * 0.2 + 0.1)),
      shares: Math.floor(base.likes * (Math.random() * 0.1 + 0.05)),
    });
  }
  return stats;
};

export const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp1',
    name: 'Promotion de la page "Dev Life"',
    type: 'Page Promotion',
    status: 'active',
    startDate: '2025-12-25T10:00:00Z',
    endDate: '2026-01-04T10:00:00Z',
    budget: 100,
    audience: {
      location: 'Cameroun',
      ageRange: '18 - 35',
      gender: 'Tous',
      interests: ['Développement Web', 'React', 'Next.js'],
    },
    target: {
      id: 'page1',
      name: 'Dev Life',
      image: 'https://i.pravatar.cc/300?u=page1',
    },
    stats: {
      totalViews: 12500,
      totalLikes: 850,
      totalComments: 45,
      totalShares: 112,
      daily: generateDailyStats(10, {views: 1250, likes: 85}),
    },
  },
  {
    id: 'camp2',
    name: 'Boost du post "Nouveau Projet"',
    type: 'Post Boost',
    status: 'completed',
    startDate: '2025-12-15T18:00:00Z',
    endDate: '2025-12-20T18:00:00Z',
    budget: 50,
    audience: {
      location: 'Douala (+40km)',
      ageRange: '25 - 45',
      gender: 'Hommes',
      interests: ['Tech', 'Entrepreneuriat'],
    },
    target: {
      id: 'post1',
      name: 'Lancement de notre nouveau projet open-source...',
      image: 'https://picsum.photos/seed/project/200/200',
    },
    stats: {
      totalViews: 8200,
      totalLikes: 430,
      totalComments: 78,
      totalShares: 55,
      daily: generateDailyStats(5, {views: 1640, likes: 86}),
    },
  },
  {
    id: 'camp3',
    name: 'Campagne de fin d\'année',
    type: 'Page Promotion',
    status: 'paused',
    startDate: '2025-12-28T09:00:00Z',
    endDate: '2026-01-07T09:00:00Z',
    budget: 250,
    audience: {
      location: 'Yaoundé (+20km)',
      ageRange: '20 - 50',
      gender: 'Tous',
      interests: ['Shopping', 'Mode', 'Technologie'],
    },
    target: {
      id: 'page2',
      name: 'Tech & Style',
      image: 'https://i.pravatar.cc/300?u=page2',
    },
    stats: {
      totalViews: 4100,
      totalLikes: 150,
      totalComments: 12,
      totalShares: 20,
      daily: generateDailyStats(3, {views: 1360, likes: 50}),
    },
  },
];
