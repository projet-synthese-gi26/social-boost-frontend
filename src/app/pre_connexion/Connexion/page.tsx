// src/app/pre_connexion/page.tsx
// Route : /pre_connexion  →  Page de connexion (Login)
// Ta page de connexion existante est déplacée ici depuis /
// La landing page occupe désormais la route racine /

import LoginPage from '@/features/pre_connexion/Connexion/LoginPage';

export default function ConnexionRoute() {
  return <LoginPage />;
}