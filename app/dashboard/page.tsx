'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import Link from 'next/link';
import DashboardNavbar from '../components/DashboardNavbar';

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
      id: 'discover-hashtags',
      title: 'Discover Hashtags',
      description: 'Find trending TikTok hashtags with AI filtering',
      icon: '🔥',
      color: 'from-orange-500 to-red-600',
      href: '/discover-hashtags'
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
      id: 'thumbnail-designer',
      title: 'Thumbnail Ideas + Generation',
      description: 'Get thumbnail ideas and generate images for your content',
      icon: '🎨',
      color: 'from-pink-500 to-purple-600',
      href: '/thumbnail-generator'
    },
    {
      id: 'video-upload',
      title: 'Video Upload & Subtitles',
      description: 'Upload videos and generate automatic subtitles',
      icon: '🎬',
      color: 'from-cyan-500 to-blue-600',
      href: '/video-upload'
    },
    {
      id: 'trending-creators',
      title: 'Trending Creators',
      description: 'See the most popular TikTok creators right now',
      icon: '🌟',
      color: 'from-yellow-400 to-pink-500',
      href: '/trending-creators'
    },
    {
      id: 'analytics',
      title: 'Content Analytics',
      description: 'Track your content performance',
      icon: '📊',
      color: 'from-gray-500 to-gray-600',
      href: '#',
      disabled: true
    },
  ];

  const trendingOptions = [
    {
      id: 'trending-hashtags',
      title: 'Trending Hashtags',
      description: 'Discover the hottest hashtags on TikTok',
      icon: '🔥',
      color: 'from-orange-500 to-red-600',
      href: '/discover-hashtags'
    },
    {
      id: 'trending-creators',
      title: 'Trending Creators',
      description: 'See the most popular TikTok creators',
      icon: '🌟',
      color: 'from-yellow-400 to-pink-500',
      href: '/trending-creators'
    },
    {
      id: 'trending-videos',
      title: 'Trending Videos',
      description: 'Watch the latest viral TikTok videos',
      icon: '📹',
      color: 'from-purple-500 to-pink-600',
      href: '/trending-videos'
    },
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
      {/* Navigation */}
      <DashboardNavbar />

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

        {/* Success Plan Section - Standalone Highlighted */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mb-12"
        >
          <Link href="/success-plan">
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 p-8 rounded-2xl border-2 border-green-500/50 hover:border-green-400/70 transition-all duration-300 group cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300 mr-4">
                    📚
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-green-400 transition-colors">
                      Success Plan
                    </h3>
                    <p className="text-gray-300 text-lg">
                      Complete guide to content creation success - Your roadmap to becoming a top creator
                    </p>
                  </div>
                </div>
                <div className="text-green-400 group-hover:text-green-300 transition-colors">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Trending TikTok Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-12"
        >
          <h3 className="text-xl font-bold text-white mb-6">🔥 See what's trending on TikTok</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {trendingOptions.map((option, index) => (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="group"
              >
                <Link href={option.href}>
                  <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-2xl border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 h-full">
                    <div className={`w-12 h-12 bg-gradient-to-r ${option.color} rounded-xl flex items-center justify-center mb-4 text-2xl`}>
                      {option.icon}
                    </div>
                    <h4 className="font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                      {option.title}
                    </h4>
                    <p className="text-gray-400 text-sm">{option.description}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Creator Tools Section */}
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
                {tool.disabled ? (
                  <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 p-6 rounded-2xl border border-gray-600/50 opacity-60 cursor-not-allowed">
                    <div className={`w-12 h-12 bg-gradient-to-r ${tool.color} rounded-xl flex items-center justify-center mb-4 text-2xl`}>
                      {tool.icon}
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-400">
                        {tool.title}
                      </h4>
                      <span className="bg-gray-600 text-gray-300 px-2 py-1 rounded text-xs">
                        Coming Soon
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm">{tool.description}</p>
                  </div>
                ) : (
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
                )}
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
    </div>
  );
}


