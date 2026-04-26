import React from 'react';
import PostCard from './PostCard';
import { usePosts } from '@lib/hooks/useAPI';

const NewsFeed = () => {
  const { posts, likePost } = usePosts();

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white my-4">News Feed</h2>
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard 
            key={post.id} 
            post={post} 
            onLike={likePost}
          />
        ))}
      </div>
    </div>
  );
};

export default NewsFeed;
