export const getFullImageUrl = (url: string | undefined | null): string => {
  const backendUrlRaw = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  const backendUrl = backendUrlRaw.replace(/\/+$/, '');

  const trimmed = (url || '').trim();
  if (!trimmed) return '/default-avatar.svg';

  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }

  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${backendUrl}${path}`;
};

 export type EntityHrefKind = 'user' | 'page';

 export function getEntityHref(kind: EntityHrefKind, id: string | number) {
   if (kind === 'page') {
     return `/post_connexion/pages/${id}`;
   }
   return `/post_connexion/Profils/${id}`;
 }
