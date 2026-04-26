export interface User {
  id: string;
  name: string;
  avatar: string;
}

export interface Comment {
  id: string;
  user: User;
  content: string;
  likes: number;
  createdAt: string;
  replies?: Comment[];
}

export interface Post {
  id: string;
  user: User;
  content: string;
  image?: string;
  likes: number;
  liked: boolean; // Pour suivre si l'utilisateur actuel a aimé le post
  comments: Comment[];
  commentsCount: number;
  shares: number;
  shared: boolean; // Pour suivre si l'utilisateur actuel a partagé le post
  createdAt: string;
  showComments: boolean; // Pour afficher/masquer les commentaires
  newComment: string; // Pour stocker le nouveau commentaire en cours de rédaction
}

// Données utilisateur fictives pour les commentaires
export const users: User[] = [
  { id: 'u1', name: 'John Doe', avatar: 'https://randomuser.me/api/portraits/men/1.jpg' },
  { id: 'u2', name: 'Jane Smith', avatar: 'https://randomuser.me/api/portraits/women/2.jpg' },
  { id: 'u3', name: 'Peter Jones', avatar: 'https://randomuser.me/api/portraits/men/3.jpg' },
  { id: 'u4', name: 'Sarah Lee', avatar: 'https://randomuser.me/api/portraits/women/4.jpg' },
];

// Fonction utilitaire pour générer une date aléatoire
const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Générer des commentaires de démonstration
const generateComments = (count: number, postId: string): Comment[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `c${postId}-${i + 1}`,
    user: users[Math.floor(Math.random() * users.length)],
    content: [
      'Super post !',
      'Très intéressant !',
      'Je suis totalement d\'accord avec toi !',
      'Merci pour le partage',
      'Incroyable !',
      'Je ne savais pas ça !',
      'Très instructif',
      'Je partage ton avis',
      'À méditer...',
      'Bonne continuation !'
    ][Math.floor(Math.random() * 10)],
    likes: Math.floor(Math.random() * 50),
    createdAt: randomDate(new Date(2025, 0, 1), new Date()).toISOString(),
    replies: Math.random() > 0.7 ? generateReplies(1, `c${postId}-${i + 1}`) : []
  }));
};

const generateReplies = (count: number, parentId: string): Comment[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `${parentId}-r${i + 1}`,
    user: users[Math.floor(Math.random() * users.length)],
    content: [
      'Exactement !',
      'Tout à fait !',
      'Je suis d\'accord avec toi',
      'Bien vu !',
      'C\'est clair !',
      'Tout à fait d\'accord',
      'Je partage ton avis',
      'Tout à fait exact',
      'Carrément !',
      'Je plussoie'
    ][Math.floor(Math.random() * 10)],
    likes: Math.floor(Math.random() * 20),
    createdAt: randomDate(new Date(2025, 0, 1), new Date()).toISOString()
  }));
};

export const posts: Post[] = [
  {
    id: '1',
    user: users[0],
    content: 'Just enjoying a beautiful day at the beach! ☀️',
    image: 'https://picsum.photos/seed/picsum/800/600',
    likes: 152,
    liked: false,
    comments: generateComments(5, '1'),
    commentsCount: 12,
    shares: 5,
    shared: false,
    createdAt: '2h ago',
    showComments: false,
    newComment: ''
  },
  {
    id: '2',
    user: users[1],
    content: 'Trying out this new recipe for dinner tonight. Wish me luck!',
    likes: 48,
    liked: false,
    comments: generateComments(3, '2'),
    commentsCount: 7,
    shares: 2,
    shared: false,
    createdAt: '3h ago',
    showComments: false,
    newComment: ''
  },
  {
    id: '3',
    user: users[2],
    content: 'Just finished a great workout at the gym. Feeling energized!',
    image: 'https://picsum.photos/seed/gym/800/600',
    likes: 98,
    liked: false,
    comments: generateComments(8, '3'),
    commentsCount: 23,
    shares: 11,
    shared: false,
    showComments: false,
    newComment: '',
    createdAt: '5h ago',
  },
    {
    id: '4',
    user: users[3],
    content: 'Exploring the city and found this hidden gem of a coffee shop. ☕️',
    image: 'https://picsum.photos/seed/coffee/800/600',
    likes: 210,
    liked: false,
    comments: generateComments(10, '4'),
    commentsCount: 34,
    shares: 15,
    shared: false,
    showComments: false,
    newComment: '',
    createdAt: '1d ago',
  },
  {
    id: '5',
    user: {
      id: 'u5',
      name: 'Mike Brown',
      avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
    },
    content: 'Movie night with the family. What should we watch?',
    likes: 76,
    liked: false,
    comments: generateComments(5, '5'),
    commentsCount: 19,
    shares: 3,
    shared: false,
    showComments: false,
    newComment: '',
    createdAt: '1d ago',
  },
  {
    id: '6',
    user: {
      id: 'u6',
      name: 'Emily White',
      avatar: 'https://randomuser.me/api/portraits/women/6.jpg',
    },
    content: 'Just booked my next vacation! Can\'t wait to explore a new country. ✈️',
    image: 'https://picsum.photos/seed/travel/800/600',
    likes: 320,
    liked: false,
    comments: generateComments(15, '6'),
    commentsCount: 56,
    shares: 28,
    shared: false,
    showComments: false,
    newComment: '',
    createdAt: '2d ago',
  },
  {
    id: '7',
    user: {
      id: 'u7',
      name: 'David Green',
      avatar: 'https://randomuser.me/api/portraits/men/7.jpg',
    },
    content: 'Working on a new side project. It\'s challenging but also very rewarding.',
    likes: 112,
    liked: false,
    comments: generateComments(5, '7'),
    commentsCount: 15,
    shares: 8,
    shared: false,
    showComments: false,
    newComment: '',
    createdAt: '2d ago',
  },
  {
    id: '8',
    user: {
      id: 'u8',
      name: 'Jessica Black',
      avatar: 'https://randomuser.me/api/portraits/women/8.jpg',
    },
    content: 'Sunday mornings are for pancakes and coffee. 🥞',
    image: 'https://picsum.photos/seed/pancakes/800/600',
    likes: 180,
    liked: false,
    comments: generateComments(10, '8'),
    commentsCount: 28,
    shares: 12,
    shared: false,
    createdAt: '3d ago',
    showComments: false,
    newComment: ''
  },
];
