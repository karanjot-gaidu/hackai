'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import DashboardNavbar from '../components/DashboardNavbar';

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

// Separate component that uses useSearchParams
function ThumbnailGeneratorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string>('');
  const [imageHistory, setImageHistory] = useState<ImageGeneration[]>([]);
  const [trendingHashtags, setTrendingHashtags] = useState<TrendingHashtag[]>([]);
  const [selectedHashtag, setSelectedHashtag] = useState<string>('');
  const [showEnhancedPrompt, setShowEnhancedPrompt] = useState(false);
  const [generationMode, setGenerationMode] = useState<'enhance' | 'direct'>('enhance');
  const [copySuccess, setCopySuccess] = useState(false);
  const [isAutoFilled, setIsAutoFilled] = useState(false);

  // Mock trending hashtags - replace with actual API call if available
  useEffect(() => {
    setTrendingHashtags([
      { hashtag: 'fitness', views: '1.2M', category: 'Fitness' },
      { hashtag: 'cooking', views: '890K', category: 'Food' },
      { hashtag: 'travel', views: '2.1M', category: 'Travel' },
      { hashtag: 'tech', views: '450K', category: 'Technology' },
      { hashtag: 'fashion', views: '1.8M', category: 'Fashion' },
      { hashtag: 'education', views: '320K', category: 'Education' },
    ]);
  }, []);

  // Handle incoming data from script page
  useEffect(() => {
    console.log('Thumbnail generator useEffect triggered');
    console.log('All search params:', Object.fromEntries(searchParams.entries()));
    
    const promptParam = searchParams.get('prompt');
    console.log('Thumbnail generator received prompt param:', promptParam);
    
    if (promptParam) {
      try {
        const decodedPrompt = decodeURIComponent(promptParam);
        console.log('Decoded prompt:', decodedPrompt);
        console.log('Decoded prompt length:', decodedPrompt.length);
        
        if (decodedPrompt) {
          console.log('Setting prompt to:', decodedPrompt);
          setPrompt(decodedPrompt);
          setShowEnhancedPrompt(true);
          setIsAutoFilled(true);
          console.log('Prompt set successfully, isAutoFilled:', true);
        }
      } catch (error) {
        console.error('Error decoding prompt parameter:', error);
      }
    } else {
      console.log('No prompt parameter found in URL');
      console.log('Current URL:', window.location.href);
    }
  }, [searchParams]);

  useEffect(() => {
    loadImageHistory();
  }, []);

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

  const generateImageDirectly = async () => {
    if (!prompt.trim()) return;
    
    setIsGeneratingImage(true);
    try {
      console.log('Sending request to generate image directly with prompt:', prompt);
      
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: prompt
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
    setPrompt(prev => prev + (prev.endsWith(' ') ? '' : ' ') + `#${hashtag}`);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(enhancedPrompt);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = 'thumbnail.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A]">
      {/* Navigation */}
      <DashboardNavbar 
        title="Thumbnail Ideas + Generation"
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
            <h2 className="text-xl font-bold text-white mb-4">🎨 Generate Eye-Catching Thumbnails</h2>
            <p className="text-gray-400">
              Create compelling thumbnails that will make your content stand out. 
              Use AI to enhance your prompts and generate stunning visuals.
            </p>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Input and Generation */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Prompt Input */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-2xl border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">📝 Describe Your Thumbnail</h3>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A vibrant cooking video thumbnail with fresh ingredients, A fitness motivation scene with energetic colors..."
                className="w-full bg-gray-700/50 border border-gray-600 rounded-xl p-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
              />
              
              {/* Trending Hashtags */}
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Trending Hashtags:</h4>
                <div className="flex flex-wrap gap-2">
                  {trendingHashtags.map((tag) => (
                    <button
                      key={tag.hashtag}
                      onClick={() => addHashtagToPrompt(tag.hashtag)}
                      className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-sm hover:bg-blue-500/30 transition-colors"
                    >
                      #{tag.hashtag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Generation Mode Toggle */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-2xl border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">⚙️ Generation Mode</h3>
              <div className="flex space-x-4">
                <button
                  onClick={() => setGenerationMode('enhance')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    generationMode === 'enhance'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Enhance Prompt
                </button>
                <button
                  onClick={() => setGenerationMode('direct')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    generationMode === 'direct'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Generate Directly
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              {generationMode === 'enhance' ? (
                <button
                  onClick={generateThumbnailIdeas}
                  disabled={isGenerating || !prompt.trim()}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? 'Enhancing...' : 'Enhance Prompt'}
                </button>
              ) : (
                <button
                  onClick={generateImageDirectly}
                  disabled={isGeneratingImage || !prompt.trim()}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingImage ? 'Generating...' : 'Generate Image'}
                </button>
              )}
            </div>

            {/* Enhanced Prompt Display */}
            {showEnhancedPrompt && enhancedPrompt && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 p-6 rounded-2xl border border-green-700/30"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">✨ Enhanced Prompt</h3>
                  <button
                    onClick={copyToClipboard}
                    className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                  >
                    {copySuccess ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="text-green-100 text-sm leading-relaxed mb-4">{enhancedPrompt}</p>
                <button
                  onClick={generateImage}
                  disabled={isGeneratingImage}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingImage ? 'Generating Image...' : 'Generate Image from Enhanced Prompt'}
                </button>
              </motion.div>
            )}
          </motion.div>

          {/* Right Column - Generated Image and History */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6"
          >
            {/* Generated Image */}
            {generatedImage && (
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-2xl border border-gray-700/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">🎨 Generated Thumbnail</h3>
                  <button
                    onClick={downloadImage}
                    className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700 transition-colors"
                  >
                    Download
                  </button>
                </div>
                <div className="relative">
                  <img
                    src={generatedImage}
                    alt="Generated thumbnail"
                    className="w-full rounded-xl shadow-lg"
                  />
                </div>
              </div>
            )}

            {/* Image History */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-2xl border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">📸 Recent Generations</h3>
              {imageHistory.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {imageHistory.map((image) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.image_url}
                        alt={image.prompt}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <button
                          onClick={() => setGeneratedImage(image.image_url)}
                          className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                        >
                          Use This
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">No recent generations yet. Create your first thumbnail!</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function ThumbnailGenerator() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading thumbnail generator...</p>
        </div>
      </div>
    }>
      <ThumbnailGeneratorContent />
    </Suspense>
  );
} 