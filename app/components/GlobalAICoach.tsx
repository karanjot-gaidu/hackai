'use client';

import { useUser } from '@clerk/nextjs';
import { useUserData } from '../contexts/UserContext';
import { usePathname } from 'next/navigation';
import AICoach from './AICoach';

export default function GlobalAICoach() {
  const { user, isLoaded } = useUser();
  const { userData } = useUserData();
  const pathname = usePathname();

  // Don't show AICoach if:
  // 1. User is not authenticated or not onboarded
  // 2. User is on the landing page (root path "/")
  if (!isLoaded || !user || !userData || pathname === '/') {
    return null;
  }

  return <AICoach userData={userData} />;
} 