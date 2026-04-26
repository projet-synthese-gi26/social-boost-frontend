import { Post } from '@/types/threadly';

export const samplePosts: Post[] = [
  {
    id: 'post_1',
    authorName: 'Tech Innovators',
    authorAvatar: 'https://i.pravatar.cc/150?u=techinnovators',
    content: 'Nous sommes ravis de dévoiler notre dernier projet qui va révolutionner le machine learning. Restez à l\'écoute pour plus de détails ! 🚀',
    media: ['https://picsum.photos/seed/tech1/800/600'],
    timestamp: Date.now() - 1000 * 60 * 5, // 5 minutes ago
    likes: 120,
    comments: 15,
    shares: 8,
    pageId: 'page_tech'
  },
  {
    id: 'post_2',
    authorName: 'Gourmet Cuisine',
    authorAvatar: 'https://i.pravatar.cc/150?u=gourmetcuisine',
    content: 'Découvrez notre nouveau plat signature : le risotto aux truffes noires. Une expérience culinaire inoubliable vous attend dans nos restaurants.',
    media: ['https://picsum.photos/seed/cuisine1/800/600'],
    timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
    likes: 350,
    comments: 45,
    shares: 22,
    pageId: 'page_cuisine'
  },
  {
    id: 'post_3',
    authorId: 'user_antoine',
    authorName: 'Antoine Emmanuel',
    authorAvatar: 'https://i.pravatar.cc/150?u=antoine',
    content: 'Je viens de terminer une séance de sport incroyable ! Rien de tel pour bien commencer la journée. #motivation #fitness',
    media: [],
    timestamp: Date.now() - 1000 * 60 * 60 * 5, // 5 hours ago
    likes: 58,
    comments: 12,
    shares: 3,
  },
  {
    id: 'post_4',
    authorName: 'Art & Design Weekly',
    authorAvatar: 'https://i.pravatar.cc/150?u=artdesign',
    content: 'L\'exposition de cette semaine met en lumière des artistes émergents qui repoussent les limites de la créativité. À ne pas manquer !',
    media: ['https://picsum.photos/seed/art1/800/600', 'https://picsum.photos/seed/art2/800/600'],
    timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
    likes: 890,
    comments: 120,
    shares: 75,
    pageId: 'page_art'
  },
];
