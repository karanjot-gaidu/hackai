'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '../components/Button';

interface TrendingCreator {
  tcm_id: string;
  user_id: string;
  nick_name: string;
  avatar_url: string;
  country_code: string;
  follower_cnt: number;
  liked_cnt: number;
  tt_link: string;
  tcm_link: string;
}

export default function TrendingCreators() {
  const router = useRouter();
  const [creators, setCreators] = useState<TrendingCreator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'top10' | 'mid-tier'>('all');

  useEffect(() => {
    fetchCreators();
  }, []);

  const fetchCreators = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/trending-creators');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch creators');
      }
      
      setCreators(data.creators);
    } catch (err) {
      console.error('Error fetching creators:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch creators');
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getFilteredCreators = () => {
    switch (filter) {
      case 'top10':
        return creators.slice(0, 10);
      case 'mid-tier':
        return creators.filter(creator => 
          creator.follower_cnt >= 50000 && creator.follower_cnt <= 500000
        );
      default:
        return creators;
    }
  };

  const getEngagementRate = (creator: TrendingCreator) => {
    if (creator.follower_cnt === 0) return 0;
    return ((creator.liked_cnt / creator.follower_cnt) * 100).toFixed(1);
  };

  const getTierColor = (followerCount: number) => {
    if (followerCount >= 1000000) return 'text-purple-400';
    if (followerCount >= 500000) return 'text-blue-400';
    if (followerCount >= 100000) return 'text-green-400';
    if (followerCount >= 50000) return 'text-yellow-400';
    return 'text-gray-400';
  };

  const getTierLabel = (followerCount: number) => {
    if (followerCount >= 1000000) return 'Mega Creator';
    if (followerCount >= 500000) return 'Macro Creator';
    if (followerCount >= 100000) return 'Micro Creator';
    if (followerCount >= 50000) return 'Nano Creator';
    return 'Emerging Creator';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading trending creators...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-4">Error Loading Creators</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <Button onClick={fetchCreators} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const filteredCreators = getFilteredCreators();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A]">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-md border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              LaunchCreator.ai
            </Link>
            <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              Trending TikTok Creators
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Discover the most popular creators on TikTok right now. Study their content, engagement rates, and growth patterns to inspire your own creator journey.
          </p>
        </motion.div>

        {/* Filter Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4 mb-8"
        >
          <Button
            onClick={() => setFilter('all')}
            variant={filter === 'all' ? 'primary' : 'outline'}
            size="sm"
          >
            All Creators ({creators.length})
          </Button>
          <Button
            onClick={() => setFilter('top10')}
            variant={filter === 'top10' ? 'primary' : 'outline'}
            size="sm"
          >
            Top 10
          </Button>
          <Button
            onClick={() => setFilter('mid-tier')}
            variant={filter === 'mid-tier' ? 'primary' : 'outline'}
            size="sm"
          >
            Mid-Tier (50K-500K)
          </Button>
        </motion.div>

        {/* Creators Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredCreators.map((creator, index) => (
            <motion.div
              key={creator.tcm_id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 + index * 0.1 }}
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-2xl border border-gray-700/50 backdrop-blur-sm hover:border-gray-600/50 transition-all duration-300"
            >
              {/* Creator Header */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="relative">
                  <img
                    src={creator.avatar_url}
                    alt={creator.nick_name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-600"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/64x64/374151/9CA3AF?text=👤';
                    }}
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{index + 1}</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-white truncate">
                    {creator.nick_name}
                  </h3>
                  <p className={`text-sm font-medium ${getTierColor(creator.follower_cnt)}`}>
                    {getTierLabel(creator.follower_cnt)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {creator.country_code} • ID: {creator.user_id.slice(-6)}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">
                    {formatNumber(creator.follower_cnt)}
                  </p>
                  <p className="text-xs text-gray-400">Followers</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">
                    {formatNumber(creator.liked_cnt)}
                  </p>
                  <p className="text-xs text-gray-400">Total Likes</p>
                </div>
              </div>

              {/* Engagement Rate */}
              <div className="text-center mb-4">
                <p className="text-sm text-gray-400">
                  Engagement Rate: <span className="text-green-400 font-semibold">
                    {getEngagementRate(creator)}%
                  </span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <a
                  href={creator.tt_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors text-center"
                >
                  View Profile
                </a>
                <a
                  href={creator.tcm_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors text-center"
                >
                  Creator Market
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredCreators.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">No creators found</h3>
            <p className="text-gray-400">Try adjusting your filters or check back later for updated data.</p>
          </motion.div>
        )}

        {/* Refresh Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="text-center mt-12"
        >
          <Button
            onClick={fetchCreators}
            variant="outline"
            size="lg"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Data
          </Button>
        </motion.div>
      </div>
    </div>
  );
} 