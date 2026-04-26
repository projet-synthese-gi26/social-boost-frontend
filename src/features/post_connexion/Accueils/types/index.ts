// Types de base
export interface User {
  id: string;
  name: string;
  avatar: string;
  coverPhoto?: string;
  followers?: number;
  following?: number;
  friends?: string[]; // Array of user IDs
  photos?: string[];
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
  liked: boolean;
  comments: Comment[];
  commentsCount: number;
  shares: number;
  shared: boolean;
  showComments: boolean;
  newComment: string;
  createdAt: string;
}

// Données de test
export const users: User[] = [
  {
    id: 'u1',
    name: 'John Doe',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    coverPhoto: 'https://picsum.photos/seed/u1-cover/1200/400',
    followers: 1243,
    following: 542,
    friends: ['u2', 'u3', 'u4'],
    photos: [
      'https://picsum.photos/seed/u1-p1/500/500',
      'https://picsum.photos/seed/u1-p2/500/500',
      'https://picsum.photos/seed/u1-p3/500/500',
      'https://picsum.photos/seed/u1-p4/500/500',
      'https://picsum.photos/seed/u1-p5/500/500',
      'https://picsum.photos/seed/u1-p6/500/500',
    ],
  },
  {
    id: 'u2',
    name: 'Jane Smith',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    coverPhoto: 'https://picsum.photos/seed/u2-cover/1200/400',
    followers: 876,
    following: 321,
    friends: ['u1', 'u5'],
    photos: [
      'https://picsum.photos/seed/u2-p1/500/500',
      'https://picsum.photos/seed/u2-p2/500/500',
    ],
  },
  {
    id: 'u3',
    name: 'Peter Jones',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    coverPhoto: 'https://picsum.photos/seed/u3-cover/1200/400',
    followers: 502,
    following: 123,
    friends: ['u1'],
    photos: [],
  },
  {
    id: 'u4',
    name: 'Sarah Lee',
    avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
    coverPhoto: 'https://picsum.photos/seed/u4-cover/1200/400',
    followers: 1890,
    following: 740,
    friends: ['u1', 'u5'],
    photos: ['https://picsum.photos/seed/u4-p1/500/500'],
  },
  {
    id: 'u5',
    name: 'David Chen',
    avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
    coverPhoto: 'https://picsum.photos/seed/u5-cover/1200/400',
    followers: 340,
    following: 88,
    friends: ['u2', 'u4'],
    photos: [
      'https://picsum.photos/seed/u5-p1/500/500',
      'https://picsum.photos/seed/u5-p2/500/500',
      'https://picsum.photos/seed/u5-p3/500/500',
    ],
  },
];

// Props des composants
export interface UserProfileProps {
  userId: string;
}

export interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onComment: (postId: string, comment: string) => void;
  onShare: (postId: string) => void;
  onToggleComments: (postId: string) => void;
}

export interface CommentItemProps {
  comment: Comment;
  onReply?: (commentId: string, content: string) => void;
}

// Types utilitaires
export type CommentReply = Omit<Comment, 'replies'> & {
  parentId?: string;
  replies?: CommentReply[];
};

export type PostWithComments = Post & {
  showAllComments?: boolean;
};
