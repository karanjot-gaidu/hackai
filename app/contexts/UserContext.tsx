'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser } from '@clerk/nextjs';

interface UserData {
  name: string;
  passion: string;
  mainGoal: string;
  timeAvailable: string;
  comfortLevel: string;
}

interface UserContextType {
  userData: UserData | null;
  isLoading: boolean;
  refreshUserData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { user, isLoaded } = useUser();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = async () => {
    if (!isLoaded || !user) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/check-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.exists && data.isOnboarded && data.user) {
          setUserData({
            name: data.user.full_name,
            passion: data.onboardingData?.passion || 'Not specified',
            mainGoal: data.onboardingData?.main_goal || 'Not specified',
            timeAvailable: data.onboardingData?.time_available || 'Not specified',
            comfortLevel: data.onboardingData?.comfort_level || 'Not specified'
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUserData = async () => {
    await fetchUserData();
  };

  useEffect(() => {
    fetchUserData();
  }, [isLoaded, user]);

  return (
    <UserContext.Provider value={{ userData, isLoading, refreshUserData }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserData() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserProvider');
  }
  return context;
} 