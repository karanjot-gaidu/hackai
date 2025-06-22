'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Hashtag {
  hashtag_name: string;
  rank: number;
  publish_cnt: number;
  video_views: number;
  country: string;
  industry: string | null;
  is_promoted: boolean;
  rank_diff: number;
  rank_diff_type: number;
}

interface ContentIdea {
  title: string;
  description: string;
  type: 'video' | 'post' | 'story' | 'reel';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  trendingContext: string;
}

export default function DiscoverHashtags() {
  const { user } = useUser();
  const router = useRouter();
  const [hashtags, setHashtags] = useState<Hashtag[]>([]);
  const [filteredHashtags, setFilteredHashtags] = useState<Hashtag[]>([]);
  const [userPassion, setUserPassion] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null);
  const [contentIdeas, setContentIdeas] = useState<ContentIdea[]>([]);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'relevant' | 'trending'>('all');
  const [trendingContext, setTrendingContext] = useState<string>('');

  useEffect(() => {
    fetchUserData();
    fetchHashtags();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/check-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.onboardingData?.passion) {
          setUserPassion(data.onboardingData.passion);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchHashtags = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/apify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        const data = await response.json();
        setHashtags(data.hashtags || []);
        setFilteredHashtags(data.hashtags || []);
      } else {
        console.error('❌ Failed to fetch hashtags:', response.status);
      }
    } catch (error) {
      console.error('❌ Error fetching hashtags:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateContentIdeas = async (hashtag: string) => {
    setSelectedHashtag(hashtag);
    setIsGeneratingIdeas(true);
    setContentIdeas([]);
    
    try {
      const response = await fetch('/api/hashtag-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hashtag,
          userPassion
        })
      });

      if (response.ok) {
        const data = await response.json();
        setContentIdeas(data.contentIdeas || []);
        setTrendingContext(data.trendingContext || '');
      } else {
        setContentIdeas([
          {
            title: `Creative #${hashtag} Content`,
            description: `Create engaging content using the trending hashtag #${hashtag}`,
            type: 'video',
            difficulty: 'beginner',
            trendingContext: ''
          }
        ]);
        setTrendingContext('');
      }
    } catch (error) {
      console.error('Error generating content ideas:', error);
      setContentIdeas([
        {
          title: `Creative #${hashtag} Content`,
          description: `Create engaging content using the trending hashtag #${hashtag}`,
          type: 'video',
          difficulty: 'beginner',
          trendingContext: ''
        }
      ]);
      setTrendingContext('');
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  const generateScript = async (contentIdea: ContentIdea) => {
    setIsGeneratingScript(true);
    
    try {
      const response = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentIdea: `${contentIdea.title}: ${contentIdea.description}`,
          hashtag: selectedHashtag,
          userPassion
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Navigate to script generator page with the generated script and thumbnail prompt
        const scriptData = encodeURIComponent(JSON.stringify({
          script: data.script,
          prompt: data.prompt,
          contentIdea: `${contentIdea.title}: ${contentIdea.description}`,
          hashtag: selectedHashtag,
          userPassion
        }));
        
        router.push(`/script?data=${scriptData}`);
      } else {
        console.error('Failed to generate script');
        // Fallback: navigate to script generator with just the content idea
        const scriptData = encodeURIComponent(JSON.stringify({
          script: '',
          prompt: '',
          contentIdea: `${contentIdea.title}: ${contentIdea.description}`,
          hashtag: selectedHashtag,
          userPassion
        }));
        
        router.push(`/script?data=${scriptData}`);
      }
    } catch (error) {
      console.error('Error generating script:', error);
      // Fallback: navigate to script generator with just the content idea
      const scriptData = encodeURIComponent(JSON.stringify({
        script: '',
        prompt: '',
        contentIdea: `${contentIdea.title}: ${contentIdea.description}`,
        hashtag: selectedHashtag,
        userPassion
      }));
      
      router.push(`/script?data=${scriptData}`);
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const filterHashtagsByPassion = async () => {
    if (!userPassion || filterMode !== 'relevant') {
      setFilteredHashtags(hashtags);
      return;
    }

    setIsFiltering(true);
    
    try {
      // If we have very few hashtags, use a simpler filtering approach
      if (hashtags.length <= 10) {
        const passionKeywords = userPassion.toLowerCase().split(' ');
        const filtered = hashtags.filter(hashtag => {
          const hashtagLower = hashtag.hashtag_name.toLowerCase();
          const industryLower = hashtag.industry?.toLowerCase() || '';
          return passionKeywords.some(keyword => 
            hashtagLower.includes(keyword) || industryLower.includes(keyword)
          );
        });
        
        setFilteredHashtags(filtered.length > 0 ? filtered : hashtags);
        setIsFiltering(false);
        return;
      }
      
      // Use AI filtering for larger datasets
      const response = await fetch('/api/ai-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `I'm a content creator passionate about ${userPassion}. Here are some trending TikTok hashtags. Please analyze each hashtag and tell me which ones are most relevant to my passion. Only respond with a JSON array of hashtag names that are relevant, nothing else. Hashtags: ${hashtags.map(h => h.hashtag_name).join(', ')}`
        })
      });

      if (response.ok) {
        const data = await response.json();
        const relevantHashtags = data.response || '';
        
        // Extract hashtag names from AI response
        const relevantNames = relevantHashtags
          .toLowerCase()
          .match(/[a-zA-Z0-9_]+/g) || [];
        
        const filtered = hashtags.filter(hashtag => 
          relevantNames.includes(hashtag.hashtag_name.toLowerCase())
        );
        
        setFilteredHashtags(filtered.length > 0 ? filtered : hashtags);
      }
    } catch (error) {
      console.error('❌ Error filtering hashtags:', error);
      setFilteredHashtags(hashtags);
    } finally {
      setIsFiltering(false);
    }
  };

  const handleFilterChange = (mode: 'all' | 'relevant' | 'trending') => {
    setFilterMode(mode);
    
    switch (mode) {
      case 'all':
        setFilteredHashtags(hashtags);
        break;
      case 'relevant':
        filterHashtagsByPassion();
        break;
      case 'trending':
        const top10 = hashtags.filter(h => h.rank <= 10);
        setFilteredHashtags(top10);
        break;
    }
  };

  const getRankChangeIcon = (diff: number, type: number) => {
    if (type === 1) return diff > 0 ? '↗️' : diff < 0 ? '↘️' : '➡️';
    if (type === 2) return '➡️';
    if (type === 3) return '🆕';
    if (type === 4) return '➡️';
    return '➡️';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400';
      case 'intermediate': return 'text-yellow-400';
      case 'advanced': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return '🎥';
      case 'post': return '📝';
      case 'story': return '📱';
      case 'reel': return '🎬';
      default: return '📄';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <header className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-md border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                Discover Trending Hashtags
              </h1>
            </div>
            <div className="text-gray-300">
              {userPassion && <span>Your passion: {userPassion}</span>}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              Trending TikTok Hashtags
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Discover the hottest hashtags on TikTok and get AI-powered content ideas tailored to your passion.
          </p>
          
          {/* Note about hashtag limitation */}
          {hashtags.length > 0 && hashtags.length <= 10 && (
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-4 rounded-xl border border-yellow-500/30 mb-8">
              <p className="text-yellow-200 text-center">
                📊 Currently showing {hashtags.length} trending hashtags. The Apify dataset may be limited to top hashtags only.
              </p>
            </div>
          )}
          
          {/* Filter Controls */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                filterMode === 'all'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              🔥 All Trending
            </button>
            <button
              onClick={() => handleFilterChange('relevant')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                filterMode === 'relevant'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
              disabled={isFiltering}
            >
              {isFiltering ? '🤖 AI Filtering...' : '🎯 Relevant to You'}
            </button>
            <button
              onClick={() => handleFilterChange('trending')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                filterMode === 'trending'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              ⭐ Top 10
            </button>
          </div>
        </motion.div>

        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading trending hashtags...</p>
          </div>
        )}

        {!isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredHashtags.map((hashtag, index) => (
              <motion.div
                key={hashtag.hashtag_name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-2xl border border-gray-700/50 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-blue-400">#{hashtag.rank}</span>
                    <span className="text-sm text-gray-400">
                      {getRankChangeIcon(hashtag.rank_diff, hashtag.rank_diff_type)}
                      {hashtag.rank_diff > 0 ? '+' : ''}{hashtag.rank_diff || 0}
                    </span>
                  </div>
                  {hashtag.is_promoted && (
                    <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">
                      Promoted
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-white mb-3">
                  #{hashtag.hashtag_name}
                </h3>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Views:</span>
                    <span className="text-white font-semibold">{formatNumber(hashtag.video_views)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Posts:</span>
                    <span className="text-white font-semibold">{formatNumber(hashtag.publish_cnt)}</span>
                  </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Industry:</span>
                      <span className="text-purple-400">{hashtag.industry || "N/A"}</span>
                    </div>
                </div>

                <button
                  onClick={() => generateContentIdeas(hashtag.hashtag_name)}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 font-medium"
                  disabled={isGeneratingIdeas && selectedHashtag === hashtag.hashtag_name}
                >
                  {isGeneratingIdeas && selectedHashtag === hashtag.hashtag_name
                    ? '🤖 Generating Ideas...'
                    : '💡 Get Content Ideas'
                  }
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}

        {selectedHashtag && contentIdeas.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedHashtag(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl border border-gray-700 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">
                  Content Ideas for #{selectedHashtag}
                </h3>
                <button
                  onClick={() => setSelectedHashtag(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {trendingContext && (
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl border border-blue-700/30">
                  <h4 className="text-lg font-semibold text-blue-300 mb-2">Why is #{selectedHashtag} trending?</h4>
                  <p className="text-blue-100 text-sm whitespace-pre-line">{trendingContext}</p>
                </div>
              )}

              <div className="space-y-4">
                {contentIdeas.map((idea, index) => (
                  <div
                    key={index}
                    className="bg-gray-800/50 p-4 rounded-xl border border-gray-700"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-lg font-semibold text-white">{idea.title}</h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getTypeIcon(idea.type)}</span>
                        <span className={`text-sm font-medium ${getDifficultyColor(idea.difficulty)}`}>
                          {idea.difficulty}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm mb-4">{idea.description}</p>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => generateScript(idea)}
                        disabled={isGeneratingScript}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 px-4 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGeneratingScript ? '🤖 Generating Script...' : '📝 Generate Script'}
                      </button>
                      
                      <Link
                        href={`/script?idea=${encodeURIComponent(`${idea.title}: ${idea.description}`)}&hashtag=${encodeURIComponent(selectedHashtag || '')}&passion=${encodeURIComponent(userPassion || '')}`}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-medium text-center"
                      >
                        ✏️ Write Script
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <p className="text-gray-400 text-sm">
                  💡 These ideas are AI-generated based on your passion for {userPassion || 'content creation'}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && filteredHashtags.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">No hashtags found</h3>
            <p className="text-gray-400">Try adjusting your filters or check back later for new trending hashtags.</p>
          </div>
        )}
      </div>
    </div>
  );
} 