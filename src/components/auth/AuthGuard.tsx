'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@lib/hooks/useAPI';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    } else {
      setIsVerified(true);
    }
  }, [isAuthenticated, router]);

  if (!isVerified) {
    // Vous pouvez afficher un spinner de chargement ici
    return <p>Loading...</p>;
  }

  return <>{children}</>;
}
