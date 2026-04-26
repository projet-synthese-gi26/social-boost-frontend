// src/features/post_connexion/Amis/components/SuggestionCard.tsx
import React from 'react';
import { UserPlus, Users } from 'lucide-react';
import type { User } from '@lib/types/api.types';
import { getFullImageUrl } from '@/utils/utils';
import { useMutualFriendsCached } from '@lib/hooks/useAPI';

interface SuggestionCardProps {
  user: User;
  onAdd: () => void;
  onRemove: () => void;
  isRequestSent?: boolean;
  onCancel?: () => void;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({ user, onAdd, onRemove, isRequestSent = false, onCancel }) => {
  const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
  const { mutualCount } = useMutualFriendsCached(user.mutual_friends_count === undefined ? user.id : undefined);
  const displayedMutualCount = user.mutual_friends_count ?? mutualCount;

  return (
    <div className="flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
      <div className="relative w-full aspect-square bg-gray-100">
        <img
          src={getFullImageUrl(user.profile_picture_url)}
          alt={fullName}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1 truncate">{fullName}</h3>
        {displayedMutualCount > 0 && (
          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-2">
            <Users size={16} />
            <span>{displayedMutualCount} ami(s) en commun</span>
          </div>
        )}

        <div className="mt-auto flex flex-col gap-2">
          {isRequestSent ? (
            <>
              <button disabled className="w-full py-2 bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-bold rounded-lg cursor-not-allowed">
                Invitation envoyée
              </button>
              {onCancel ? (
                <button onClick={onCancel} className="w-full py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-medium rounded-lg transition-colors text-sm">
                  Annuler
                </button>
              ) : null}
            </>
          ) : (
            <>
              <button onClick={onAdd} className="w-full py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
                <UserPlus size={18} />
                Ajouter
              </button>
              <button onClick={onRemove} className="w-full py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-medium rounded-lg transition-colors text-sm">
                Retirer
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuggestionCard;