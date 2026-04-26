"use client";

import React, { useMemo, useState } from "react";
import { X, UserPlus, MoreHorizontal } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { useFriends } from "@lib/hooks/useAPI";
import { getFullImageUrl } from "@/utils/utils";

export const SuggestionList = () => {
  const { suggestions, isLoading, error, sendRequest } = useFriends();
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const items = useMemo(() => {
    const list = Array.isArray(suggestions) ? suggestions : [];
    return list.filter((u: any) => u?.id && !dismissedIds.has(String(u.id)));
  }, [dismissedIds, suggestions]);

  const safeSetProcessing = (id: string, on: boolean) => {
    setProcessingIds(prev => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const dismiss = (id: string) => {
    setDismissedIds(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const handleAdd = async (id: string) => {
    if (!id || processingIds.has(id)) return;
    safeSetProcessing(id, true);
    try {
      await sendRequest(id);
      dismiss(id);
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.non_field_errors?.[0] ||
        (typeof err?.response?.data === 'string' ? err.response.data : null) ||
        "Impossible d'envoyer la demande d'ami.";
      alert(msg);
    } finally {
      safeSetProcessing(id, false);
    }
  };

  return (
    <Card className="p-4 mb-4 border-gray-100 shadow-sm">
      <div className="flex justify-between items-center mb-4 text-gray-500">
        <h3 className="font-bold text-purple-600 text-sm">Personnes que vous pourriez connaître</h3>
        <MoreHorizontal className="cursor-pointer hover:text-gray-700" size={20} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {isLoading ? (
          <div className="col-span-full text-xs text-gray-500">Chargement des suggestions...</div>
        ) : error ? (
          <div className="col-span-full text-xs text-red-600">{error}</div>
        ) : items.length === 0 ? (
          <div className="col-span-full text-xs text-gray-700">Aucune suggestion pour le moment.</div>
        ) : (
          items.slice(0, 6).map((u: any) => {
            const id = String(u.id);
            const busy = processingIds.has(id);
            const fullName = `${u.first_name || ''} ${u.last_name || ''}`.trim() || (u.email ?? 'Utilisateur');
            const mutual = Number(u.mutual_friends_count || 0);
            return (
              <div key={id} className="border border-gray-100 rounded-xl overflow-hidden flex flex-col bg-gray-50/50">
                <div className="h-32 bg-gray-200 relative">
                  <button
                    type="button"
                    onClick={() => dismiss(id)}
                    className="absolute top-2 right-2 bg-black/40 p-1.5 rounded-full text-white cursor-pointer hover:bg-black/60 z-10"
                    aria-label="Retirer"
                  >
                    <X size={14} />
                  </button>

                  <div className="w-full h-full flex items-center justify-center">
                    <Avatar src={getFullImageUrl(u.profile_picture_url)} alt={fullName} />
                  </div>
                </div>

                <div className="p-3 flex flex-col gap-2 flex-1 justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 truncate" title={fullName}>{fullName}</h4>
                    <p className="text-[10px] text-gray-500">{mutual} ami(e)s en commun</p>
                  </div>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleAdd(id)}
                    className="flex items-center justify-center gap-2 w-full bg-purple-600 text-white hover:bg-purple-700 font-bold py-2 rounded-lg transition text-xs disabled:opacity-60"
                  >
                    <UserPlus size={14} />
                    {busy ? 'Envoi...' : 'Ajouter'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
      
      <button className="w-full text-purple-600 font-bold py-3 mt-3 hover:bg-purple-50 rounded-xl text-xs transition-colors border border-transparent hover:border-purple-100">
          Voir toutes les suggestions
      </button>
    </Card>
  );
};