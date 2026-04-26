// src/features/post_connexion/Amis/components/RequestCard.tsx
import React from 'react';
import { Users } from 'lucide-react';
import type { User } from '@lib/types/api.types';
import { getFullImageUrl } from '@/utils/utils';
import { useMutualFriendsCached } from '@lib/hooks/useAPI';

interface RequestCardProps {
  user: User;
  onConfirm: () => void;
  onRemove: () => void;
}

const RequestCard: React.FC<RequestCardProps> = ({ user, onConfirm, onRemove }) => {
  const { mutualCount } = useMutualFriendsCached(user.mutual_friends_count === undefined ? user.id : undefined);
  const displayedMutualCount = user.mutual_friends_count ?? mutualCount;

  return (
    <div className="flex items-center p-3 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 w-full mb-3">

      {/* Photo de profil */}
      <div className="relative w-20 h-20 flex-shrink-0 mr-4">
        {/* Note: Utilisez <Image /> de next/image en prod si configuré, sinon img standard */}
        <img
          src={getFullImageUrl(user.profile_picture_url)}
          alt={user.username}
          className="w-full h-full object-cover rounded-full border-2 border-gray-100"
        />
      </div>

      {/* Infos et Actions */}
      <div className="flex-grow flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">{user.first_name} {user.last_name}</h3>
          {displayedMutualCount > 0 && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Users size={16} />
              <span>{displayedMutualCount} ami(s) en commun</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {/* Bouton violet */}
          <button onClick={onConfirm} className="flex-1 sm:flex-none px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-lg transition-colors text-sm">
            Confirmer
          </button>
          <button onClick={onRemove} className="flex-1 sm:flex-none px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors text-sm">
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestCard;