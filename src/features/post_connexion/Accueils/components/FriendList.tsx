// src/features/post_connexion/Accueils/components/FriendList.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { User, users as allUsers } from '../types';
import Link from 'next/link';

interface FriendListProps {
  user: User;
}

const FriendCard = ({ friend }: { friend: User }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
    <Link href={`/profile/${friend.id}`} className="block group">
      <Image
        src={friend.avatar}
        alt={friend.name}
        width={200}
        height={200}
        className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="p-3">
        <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate group-hover:text-blue-500">{friend.name}</h4>
      </div>
    </Link>
  </div>
);

const FriendList: React.FC<FriendListProps> = ({ user }) => {
  const friends = allUsers.filter(u => user.friends?.includes(u.id));
  const suggestions = allUsers.filter(u => u.id !== user.id && !user.friends?.includes(u.id)).slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Friends Section */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Amis ({friends.length})</h3>
        {friends.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {friends.map(friend => (
              <FriendCard key={friend.id} friend={friend} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">Aucun ami à afficher.</p>
        )}
      </div>

      {/* Suggestions Section */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Suggestions d'amis</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {suggestions.map(suggestion => (
            <FriendCard key={suggestion.id} friend={suggestion} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FriendList;
