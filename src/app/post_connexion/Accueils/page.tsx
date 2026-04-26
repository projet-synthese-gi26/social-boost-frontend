// src/app/post_connexion/accueils/page.tsx
import React from "react";
import Accueil from "@/features/post_connexion/Accueils/Accueil"; // adapter le chemin et le type d'export
import AuthGuard from "@/components/auth/AuthGuard";

export default function AccueilsRoute() {
  return (
    <AuthGuard>
      <Accueil />
    </AuthGuard>
  );
}