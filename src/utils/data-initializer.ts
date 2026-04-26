import { storage } from './storage';
import { Friend, FriendRequest } from '@/types/threadly';

const MOCK_FRIENDS: Friend[] = [
    { id: 'friend_1', name: 'Léa Dubois', avatar: 'https://i.pravatar.cc/150?u=friend_1' },
    { id: 'friend_2', name: 'Lucas Martin', avatar: 'https://i.pravatar.cc/150?u=friend_2' },
    { id: 'friend_3', name: 'Chloé Bernard', avatar: 'https://i.pravatar.cc/150?u=friend_3' }
];

const MOCK_REQUESTS: FriendRequest[] = [
    { id: 'request_1', name: 'Emma Petit', avatar: 'https://i.pravatar.cc/150?u=request_1', mutual: 12 },
    { id: 'request_2', name: 'Gabriel Robert', avatar: 'https://i.pravatar.cc/150?u=request_2', mutual: 5 }
];

export const initializeAppData = async () => {
    const friendsData = await storage.get('user_friends');
    if (!friendsData || !friendsData.value) {
        await storage.set('user_friends', JSON.stringify(MOCK_FRIENDS));
    }

    const requestsData = await storage.get('friend_requests');
    if (!requestsData || !requestsData.value) {
        await storage.set('friend_requests', JSON.stringify(MOCK_REQUESTS));
    }
};
