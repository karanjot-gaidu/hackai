'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import TrendingVideos from '../components/trending-videos';
import DashboardNavbar from '../components/DashboardNavbar';

interface TrendingVideo {
  video_id: string;
  title: string;
  duration_in_sec: number;
  url: string;
  thumbnail: string;
  region: string;
  country_code: string;
  author: {
    id: string;
    uniqueId: string;
    name: string;
    profile_url: string;
    profile_picture_url: string;
    bio: string;
    verifiedAccount: boolean;
    privateAccount: boolean;
  };
  stats: {
    diggCount: string;
    shareCount: string;
    commentCount: string;
    playCount: string;
    collectCount: string;
  };
}

export default function TrendingVideosPage() {
  const [trendingVideos, setTrendingVideos] = useState<TrendingVideo[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);

  useEffect(() => {
    fetchTrendingVideos();
  }, []);

  const fetchTrendingVideos = async () => {
    try {
      const response = await fetch('/api/trending-videos');
      if (response.ok) {
        const data = await response.json();
        setTrendingVideos(data.videos || []);
      } else {
        console.error('Failed to fetch trending videos');
      }
    } catch (error) {
      console.error('Error fetching trending videos:', error);
    } finally {
      setIsLoadingVideos(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A]">
      {/* Navigation */}
      <DashboardNavbar 
        title="Trending TikTok Videos"
        showBackButton={true}
        showUserInfo={false}
        showSignOut={false}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Description */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-2xl border border-gray-700/50">
            <h2 className="text-xl font-bold text-white mb-4">🔥 Discover What's Trending</h2>
            <p className="text-gray-400">
              Stay ahead of the curve with the latest trending TikTok videos. Analyze what's working 
              and get inspiration for your own content creation.
            </p>
          </div>
        </motion.div>

        {/* Trending Videos Component */}
        <TrendingVideos 
          trendingVideos={trendingVideos} 
          isLoadingVideos={isLoadingVideos} 
        />

        {/* Refresh Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 text-center"
        >
          <button
            onClick={fetchTrendingVideos}
            disabled={isLoadingVideos}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingVideos ? 'Refreshing...' : 'Refresh Trending Videos'}
          </button>
        </motion.div>
      </div>
    </div>
  );
} 