'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import Link from 'next/link';
import AICoach from '../components/AICoach';

interface UserData {
  name: string;
  passion: string;
  mainGoal: string;
  timeAvailable: string;
  comfortLevel: string;
}

export default function Dashboard() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserStatus = async () => {
      if (!isLoaded || !user) {
        return;
      }

      try {
        // Check if user exists in our database and is onboarded
        const response = await fetch('/api/auth/check-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          
          if (!data.exists) {
            // User doesn't exist in database, create them
            const createResponse = await fetch('/api/auth/create-user', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                clerk_id: user.id,
                email: user.emailAddresses[0]?.emailAddress || '',
                username: user.username || user.emailAddresses[0]?.emailAddress?.split('@')[0] || 'user',
              }),
            });

            if (createResponse.ok) {
              // User created, redirect to onboarding
              router.push('/onboarding');
              return;
            } else {
              console.error('Failed to create user');
              return;
            }
          }

          // User exists, check if onboarded
          setIsOnboarded(data.isOnboarded);
          
          if (!data.isOnboarded) {
            // User is not onboarded, redirect to onboarding
            router.push('/onboarding');
            return;
          }

          // Load user data from onboarding
          if (data.user) {
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
        console.error('Error checking user status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserStatus();
  }, [isLoaded, user, router]);

  // Redirect if not authenticated
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
    }
  }, [isLoaded, user, router]);

  const handleSignOut = () => {
    // Clerk handles sign out automatically
    router.push('/');
  };

  const creatorTools = [
    {
      id: 'success-plan',
      title: 'Success Plan',
      description: 'Complete guide to content creation success',
      icon: '📚',
      color: 'from-green-500 to-emerald-600',
      href: '/success-plan'
    },
    {
      id: 'discover-hashtags',
      title: 'Discover Hashtags',
      description: 'Find trending TikTok hashtags with AI filtering',
      icon: '🔥',
      color: 'from-orange-500 to-red-600',
      href: '/discover-hashtags'
    },
    {
      id: 'niche-finder',
      title: 'Niche Finder',
      description: 'Discover your perfect content niche',
      icon: '🎯',
      color: 'from-blue-500 to-purple-600',
      href: '/tools/niche-finder'
    },
    {
      id: 'script-generator',
      title: 'Script Generator',
      description: 'Create engaging scripts with AI',
      icon: '📝',
      color: 'from-purple-500 to-pink-600',
      href: '/script'
    },
    {
      id: 'content-planner',
      title: 'Content Planner',
      description: 'Plan your content calendar',
      icon: '📅',
      color: 'from-green-500 to-blue-600',
      href: '/tools/content-planner'
    },
    {
      id: 'caption-writer',
      title: 'Caption Writer',
      description: 'Write compelling social media captions',
      icon: '💬',
      color: 'from-orange-500 to-red-600',
      href: '/tools/caption-writer'
    },
    {
      id: 'thumbnail-designer',
      title: 'Thumbnail Ideas + Generation',
      description: 'Get thumbnail ideas and generate images for your content',
      icon: '🎨',
      color: 'from-pink-500 to-purple-600',
      href: '/thumbnail-generator'
    },
    {
      id: 'analytics',
      title: 'Content Analytics',
      description: 'Track your content performance',
      icon: '📊',
      color: 'from-indigo-500 to-purple-600',
      href: '/tools/analytics'
    },
    {
      id: 'trending-creators',
      title: 'Trending Creators',
      description: 'See the most popular TikTok creators right now',
      icon: '🌟',
      color: 'from-yellow-400 to-pink-500',
      href: '/trending-creators'
    },
  ];

  const quickActions = [
    {
      title: 'Success Plan',
      description: 'Complete guide to content creation success',
      action: () => router.push('/success-plan')
    },
    {
      title: 'Generate a Script',
      description: 'Create content for your next video',
      action: () => router.push('/tools/script-generator')
    },
    {
      title: 'Find Your Niche',
      description: 'Discover what content to create',
      action: () => router.push('/tools/niche-finder')
    },
    {
      title: 'Write Captions',
      description: 'Create engaging social media posts',
      action: () => router.push('/tools/caption-writer')
    }
  ];

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to sign-in
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A]">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-md border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                LaunchCreator.ai
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">Welcome, {user.firstName || userData.name}!</span>
              <button
                onClick={() => signOut()}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            Welcome back, {user.firstName || userData.name}! 👋
          </h2>
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-2xl border border-gray-700/50">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold text-gray-300 mb-2">Your Passion</h3>
                <p className="text-gray-400">{userData.passion}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-300 mb-2">Your Goal</h3>
                <p className="text-gray-400 capitalize">{userData.mainGoal.replace('-', ' ')}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-300 mb-2">Time Commitment</h3>
                <p className="text-gray-400">{userData.timeAvailable}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-12"
        >
          <h3 className="text-xl font-bold text-white mb-6">Quick Actions</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-2xl border border-gray-700/50 cursor-pointer hover:border-blue-500/50 transition-all duration-300"
                onClick={action.action}
              >
                <h4 className="font-semibold text-white mb-2">{action.title}</h4>
                <p className="text-gray-400 text-sm">{action.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Creator Tools */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h3 className="text-xl font-bold text-white mb-6">Creator Tools</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {creatorTools.map((tool, index) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                className="group"
              >
                <Link href={tool.href}>
                  <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-2xl border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 h-full">
                    <div className={`w-12 h-12 bg-gradient-to-r ${tool.color} rounded-xl flex items-center justify-center mb-4 text-2xl`}>
                      {tool.icon}
                    </div>
                    <h4 className="font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                      {tool.title}
                    </h4>
                    <p className="text-gray-400 text-sm">{tool.description}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12"
        >
          <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-2xl border border-gray-700/50">
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🎉</div>
              <h4 className="text-lg font-semibold text-white mb-2">Welcome to LaunchCreator.ai!</h4>
              <p className="text-gray-400">Start using our tools to create amazing content. Your activity will appear here.</p>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* AI Creator Coach */}
      <AICoach userData={userData} />
    </div>
  );
}
