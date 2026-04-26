// src/features/post_connexion/Amis/Ami.tsx
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import RequestCard from './components/RequestCard';
import SuggestionCard from './components/SuggestionCard';
import { useFriends } from '@lib/hooks/useAPI';
import { LeftSidebar, RightSidebar } from '@/features/navigation';
import type { FriendRequest } from '@lib/types/api.types';

const SUGGESTIONS_PER_PAGE = 5;
const REQUESTS_INITIAL_LIMIT = 3;

export default function Amis() {
  const { requests, sentRequests, friends, suggestions, isLoading, error, updateRequest, cancelRequest, sendRequest, removeFriend, refresh } = useFriends();
  const [displayedSuggestions, setDisplayedSuggestions] = useState<any[]>([]);
  const [optimisticSentRequests, setOptimisticSentRequests] = useState<any[]>([]);
  const [showAllRequests, setShowAllRequests] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setDisplayedSuggestions(suggestions);
  }, [suggestions]);

  // Gérer l'envoi d'une demande d'ami
  const handleAddFriend = async (userToAdd: any) => {
    // Mise à jour optimiste : on ajoute immédiatement l'utilisateur à une liste locale
    setOptimisticSentRequests(prev => [...prev, userToAdd]);
    setDisplayedSuggestions(prev => prev.filter(s => s.id !== userToAdd.id));

    try {
      await sendRequest(userToAdd.id.toString());
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.non_field_errors?.[0] ||
        (typeof err?.response?.data === 'string' ? err.response.data : null) ||
        "Impossible d'envoyer la demande d'ami.";
      alert(msg);
      // En cas d'erreur, on annule la mise à jour optimiste
      setOptimisticSentRequests(prev => prev.filter(u => u.id !== userToAdd.id));
      setDisplayedSuggestions(prev => [userToAdd, ...prev]);
    }
  };

  const handleCancelSentRequest = async (request: any) => {
    if (!request?.id) return;

    try {
      await cancelRequest(request.id);
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.non_field_errors?.[0] ||
        (typeof err?.response?.data === 'string' ? err.response.data : null) ||
        "Impossible d'annuler l'invitation.";
      alert(msg);
      await refresh();
    }
  };

  // Gérer le retrait d'une suggestion de l'UI
  const handleRemoveSuggestion = (userId: string) => {
    // Conversion en nombre pour la comparaison, car l'ID de l'utilisateur est un nombre
    setDisplayedSuggestions(prev => prev.filter(s => s.id.toString() !== userId));
  };

  // Logique de tri et de pagination pour les suggestions
  // Créer un ensemble d'ID d'utilisateurs déjà impliqués dans une invitation (reçue ou envoyée)
  const combinedSentRequests = useMemo(() => {
    const optimisticUsers = optimisticSentRequests.map(user => ({ addressee: user, id: `optimistic-${user.id}` }));
    const existingIds = new Set(sentRequests.map(req => req.addressee?.id));
    const uniqueOptimistic = optimisticUsers.filter(opt => !existingIds.has(opt.addressee.id));
    return [...sentRequests, ...uniqueOptimistic];
  }, [sentRequests, optimisticSentRequests]);

  const pendingUserIds = useMemo(() => {
    const receivedIds = requests.map(req => req.requester?.id).filter(id => id !== undefined);
    const sentIds = combinedSentRequests.map(req => req.addressee?.id).filter(id => id !== undefined);
    return new Set([...receivedIds, ...sentIds]);
  }, [requests, combinedSentRequests]);

  // Logique de tri et de pagination pour les suggestions
  const sortedSuggestions = useMemo(() => 
    [...displayedSuggestions].sort((a, b) => (b.mutual_friends_count || 0) - (a.mutual_friends_count || 0)), 
    [displayedSuggestions]
  );

  const totalPages = Math.ceil(sortedSuggestions.length / SUGGESTIONS_PER_PAGE);
  const paginatedSuggestions = sortedSuggestions.slice(
    (currentPage - 1) * SUGGESTIONS_PER_PAGE,
    currentPage * SUGGESTIONS_PER_PAGE
  );

  const displayedRequests = showAllRequests ? requests : requests.slice(0, REQUESTS_INITIAL_LIMIT);

  const handleAcceptRequest = async (request: FriendRequest) => {
    await updateRequest(request.id, 'ACCEPTED');
  };

  const handleDeclineRequest = async (request: FriendRequest) => {
    await updateRequest(request.id, 'DECLINED');
  };

  const handleSuggestionAction = (id: number) => {
    setDisplayedSuggestions(prev => prev.filter(sug => sug.id !== id));
  };

  const cardVariants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: { duration: 0.2, ease: [0.7, 0, 0.84, 0] as [number, number, number, number] },
    },
  };

  return (
    <>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Amis</h1>
          <p className="text-gray-900">Gérez vos invitations et découvrez de nouvelles personnes.</p>
        </div>

        {/* SECTION 1 : INVITATIONS */}
        {isLoading ? (
          <p>Chargement des invitations...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : requests.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                Invitations reçues
                <span className="bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                  {requests.length}
                </span>
              </h2>
              {requests.length > REQUESTS_INITIAL_LIMIT && (
                <button 
                  onClick={() => setShowAllRequests(!showAllRequests)}
                  className="text-purple-600 dark:text-purple-400 text-sm font-semibold hover:underline"
                >
                  {showAllRequests ? 'Voir moins' : 'Voir tout'}
                </button>
              )}
            </div>

            <motion.div layout className="flex flex-col gap-2">
              <AnimatePresence>
                {displayedRequests.map((request) => (
                  request.requester && (
                    <motion.div key={request.id} layout variants={cardVariants} initial="initial" animate="animate" exit="exit">
                      <RequestCard 
                        user={request.requester} 
                        onConfirm={() => updateRequest(request.id, 'ACCEPTED')} 
                        onRemove={() => updateRequest(request.id, 'DECLINED')} 
                      />
                    </motion.div>
                  )
                ))}
              </AnimatePresence>
            </motion.div>
          </section>
        )}

        {/* SECTION 2 : INVITATIONS ENVOYÉES */}
        {combinedSentRequests.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-bold mb-4">Invitations envoyées</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {combinedSentRequests.map(request => (
                request.addressee && (
                  <motion.div key={request.id} layout variants={cardVariants} initial="initial" animate="animate" exit="exit">
                    <SuggestionCard 
                      user={request.addressee} 
                      onAdd={() => {}} 
                      onRemove={() => {}} 
                      onCancel={typeof request.id === 'string' && request.id.startsWith('optimistic-') ? undefined : () => handleCancelSentRequest(request)}
                      isRequestSent={true}
                    />
                  </motion.div>
                )
              ))}
            </div>
          </section>
        )}

        {/* SECTION 3 : SUGGESTIONS DYNAMIQUES */}
        {displayedSuggestions.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-6">Connaissez-vous ces personnes ?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedSuggestions
                .filter(suggestion => !pendingUserIds.has(suggestion.id))
                .map((suggestion) => (
                <motion.div key={suggestion.id} layout variants={cardVariants} initial="initial" animate="animate" exit="exit">
                  <SuggestionCard 
                    user={suggestion} 
                    onAdd={() => handleAddFriend(suggestion)} 
                    onRemove={() => handleRemoveSuggestion(suggestion.id.toString())} 
                  />
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}