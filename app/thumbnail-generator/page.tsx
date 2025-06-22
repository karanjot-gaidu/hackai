'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface TrendingHashtag {
  hashtag: string;
  views: string;
  category: string;
}

interface ImageGeneration {
  id: string;
  prompt: string;
  image_url: string;
  generation_time_seconds: number | null;
  created_at: string;
}

export default function ThumbnailGenerator() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string>('');
  const [imageHistory, setImageHistory] = useState<ImageGeneration[]>([]);
  const [trendingHashtags, setTrendingHashtags] = useState<TrendingHashtag[]>([]);
  const [selectedHashtag, setSelectedHashtag] = useState<string>('');

  // Mock trending hashtags - replace with actual API call if available
  const mockTrendingHashtags: TrendingHashtag[] = [
    { hashtag: '#TikTokTrends', views: '2.1B', category: 'Entertainment' },
    { hashtag: '#ViralDance', views: '1.8B', category: 'Dance' },
    { hashtag: '#LifeHacks', views: '1.5B', category: 'Education' },
    { hashtag: '#FoodTok', views: '1.2B', category: 'Food' },
    { hashtag: '#FashionTrends', views: '900M', category: 'Fashion' },
    { hashtag: '#FitnessMotivation', views: '800M', category: 'Fitness' },
    { hashtag: '#ComedySkits', views: '750M', category: 'Comedy' },
    { hashtag: '#BeautyTips', views: '600M', category: 'Beauty' },
  ];

  useEffect(() => {
    if (!isLoaded || !user) {
      router.push('/sign-in');
      return;
    }
    setTrendingHashtags(mockTrendingHashtags);
    loadImageHistory();
  }, [isLoaded, user, router]);

  const loadImageHistory = async () => {
    try {
      const response = await fetch('/api/generate-image?limit=20');
      if (response.ok) {
        const data = await response.json();
        setImageHistory(data.records || []);
      }
    } catch (error) {
      console.error('Error loading image history:', error);
    }
  };

  const generateThumbnailIdeas = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const response = await fetch('/api/thumbnail-ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          context: selectedHashtag ? `Top TikTok hashtags: ${selectedHashtag}` : undefined
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setEnhancedPrompt(data.enhancedPrompt || data.originalPrompt || prompt);
      } else {
        console.error('Failed to generate thumbnail ideas');
      }
    } catch (error) {
      console.error('Error generating thumbnail ideas:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateImage = async () => {
    if (!enhancedPrompt.trim()) return;
    
    setIsGeneratingImage(true);
    try {
      console.log('Sending request to generate image with prompt:', enhancedPrompt);
      
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: enhancedPrompt
        }),
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Response data:', data);
        
        if (data.success && data.imageUrl) {
          setGeneratedImage(data.imageUrl);
          console.log('Image URL set:', data.imageUrl);
          
          if (data.fallback) {
            console.log('Using fallback base64 image');
          }
          
          loadImageHistory();
        } else {
          console.error('Response missing imageUrl:', data);
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Failed to generate image:', errorData);
      }
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const addHashtagToPrompt = (hashtag: string) => {
    setSelectedHashtag(hashtag);
    setPrompt(prev => prev ? `${prev} ${hashtag}` : hashtag);
  };

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
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
              <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                Thumbnail Ideas + Generation
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Trending Hashtags */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-2xl border border-gray-700/50"
            >
              <h3 className="text-xl font-bold text-white mb-4">🔥 Trending Hashtags</h3>
              <div className="space-y-3">
                {trendingHashtags.map((hashtag, index) => (
                  <motion.div
                    key={hashtag.hashtag}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all duration-300 ${
                      selectedHashtag === hashtag.hashtag
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-700 hover:border-gray-600 bg-gray-800/30'
                    }`}
                    onClick={() => addHashtagToPrompt(hashtag.hashtag)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-white font-medium">{hashtag.hashtag}</span>
                      <span className="text-gray-400 text-sm">{hashtag.views}</span>
                    </div>
                    <div className="text-gray-500 text-xs mt-1">{hashtag.category}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Center Column - Chatbox and Generation */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-2xl border border-gray-700/50 mb-6"
            >
              <h3 className="text-xl font-bold text-white mb-4">💬 Generate Thumbnail Ideas</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Describe your content or thumbnail idea
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., A cooking tutorial for making pasta, A fitness challenge video, A comedy skit about dating..."
                    className="w-full p-4 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-colors"
                    rows={4}
                  />
                </div>

                {selectedHashtag && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400 text-sm">Selected hashtag:</span>
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                      {selectedHashtag}
                    </span>
                    <button
                      onClick={() => setSelectedHashtag('')}
                      className="text-gray-500 hover:text-gray-300"
                    >
                      ×
                    </button>
                  </div>
                )}

                <button
                  onClick={generateThumbnailIdeas}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? 'Enhancing Prompt...' : 'Enhance Prompt'}
                </button>
              </div>

              {/* Enhanced Prompt Display - Editable */}
              {enhancedPrompt && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-6"
                >
                  <h4 className="text-white font-medium mb-2">Enhanced Prompt (Editable):</h4>
                  <textarea
                    value={enhancedPrompt}
                    onChange={(e) => setEnhancedPrompt(e.target.value)}
                    className="w-full p-4 bg-gray-900/30 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-colors mb-4"
                    rows={3}
                    placeholder="Edit the enhanced prompt here..."
                  />
                  
                  <button
                    onClick={generateImage}
                    disabled={isGeneratingImage || !enhancedPrompt.trim()}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-6 rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGeneratingImage ? 'Generating Image...' : 'Generate Image'}
                  </button>
                </motion.div>
              )}

              {/* Generated Image Display */}
              {generatedImage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-6"
                >
                  <h4 className="text-white font-medium mb-4">Generated Thumbnail:</h4>
                  <div className="relative">
                    <img
                      src={generatedImage}
                      alt="Generated thumbnail"
                      className="w-full max-w-md rounded-xl border border-gray-700"
                    />
                    <a
                      href={generatedImage}
                      download
                      className="absolute top-2 right-2 bg-black/50 text-white px-3 py-1 rounded-lg text-sm hover:bg-black/70 transition-colors"
                    >
                      Download
                    </a>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Image History */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8"
        >
          <h3 className="text-xl font-bold text-white mb-6">📸 Recent Generations</h3>
          {imageHistory.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {imageHistory.map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-4 rounded-2xl border border-gray-700/50"
                >
                  <img
                    src={image.image_url}
                    alt={image.prompt}
                    className="w-full h-48 object-cover rounded-xl mb-3"
                  />
                  <p className="text-gray-300 text-sm mb-2 line-clamp-2">{image.prompt}</p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>{new Date(image.created_at).toLocaleDateString()}</span>
                    <span>{image.generation_time_seconds?.toFixed(1)}s</span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50">
              <div className="text-4xl mb-4">🎨</div>
              <h4 className="text-lg font-semibold text-white mb-2">No images generated yet</h4>
              <p className="text-gray-400">Start by generating some thumbnail ideas above!</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
} 