'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Button from '../components/Button';
import MDEditor from '@uiw/react-md-editor';

export default function ScriptPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [script, setScript] = useState('');
  const [thumbnailPrompt, setThumbnailPrompt] = useState('');
  const [contentIdea, setContentIdea] = useState('');
  const [hashtag, setHashtag] = useState('');
  const [userPassion, setUserPassion] = useState('');
  const [tone, setTone] = useState('educational');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isGeneratingFromIdea, setIsGeneratingFromIdea] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const hasProcessedIncomingData = useRef(false);

  useEffect(() => {
    // Only process incoming data once
    if (hasProcessedIncomingData.current) return;
    
    // Handle incoming data from discover hashtags page
    const dataParam = searchParams.get('data');
    if (dataParam) {
      try {
        const data = JSON.parse(decodeURIComponent(dataParam));
        setScript(data.script || '');
        setThumbnailPrompt(data.prompt || '');
        console.log('Thumbnail prompt:', data.prompt);
        setContentIdea(data.contentIdea || '');
        setHashtag(data.hashtag || '');
        setUserPassion(data.userPassion || '');
        hasProcessedIncomingData.current = true;
      } catch (error) {
        console.error('Error parsing data parameter:', error);
        hasProcessedIncomingData.current = true;
      }
    } else {
      // Handle individual URL parameters
      const ideaParam = searchParams.get('idea');
      const hashtagParam = searchParams.get('hashtag');
      const passionParam = searchParams.get('passion');
      
      if (ideaParam) setContentIdea(decodeURIComponent(ideaParam));
      if (hashtagParam) setHashtag(decodeURIComponent(hashtagParam));
      if (passionParam) setUserPassion(decodeURIComponent(passionParam));
      hasProcessedIncomingData.current = true;
    }
  }, [searchParams]);

  // Debug useEffect to monitor thumbnailPrompt changes
  useEffect(() => {
    console.log('thumbnailPrompt state changed to:', thumbnailPrompt);
  }, [thumbnailPrompt]);

  const generateScript = async () => {
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentIdea: contentIdea || 'Create an engaging TikTok script',
          hashtag: hashtag,
          userPassion: userPassion,
          tone: tone
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Script generation response:', data);
        console.log('Response keys:', Object.keys(data));
        console.log('Script length:', data.script?.length);
        console.log('Prompt length:', data.prompt?.length);
        console.log('Prompt value:', data.prompt);
        setScript(data.script);
        setThumbnailPrompt(data.prompt);
        console.log('Set thumbnail prompt to:', data.prompt);
      } else {
        console.error('Failed to generate script');
        setScript('Failed to generate script. Please try again.');
        setThumbnailPrompt('');
      }
    } catch (error) {
      console.error('Error generating script:', error);
      setScript('Error generating script. Please try again.');
      setThumbnailPrompt('');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateScriptFromIdea = async () => {
    if (!contentIdea.trim()) return;
    
    setIsGeneratingFromIdea(true);
    
    try {
      const response = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentIdea: contentIdea,
          hashtag: hashtag,
          userPassion: userPassion,
          tone: tone
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Script generation from idea response:', data);
        console.log('Response keys:', Object.keys(data));
        console.log('Script length:', data.script?.length);
        console.log('Prompt length:', data.prompt?.length);
        console.log('Prompt value:', data.prompt);
        setScript(data.script);
        setThumbnailPrompt(data.prompt);
        console.log('Set thumbnail prompt to:', data.prompt);
      } else {
        console.error('Failed to generate script from idea');
      }
    } catch (error) {
      console.error('Error generating script from idea:', error);
    } finally {
      setIsGeneratingFromIdea(false);
    }
  };

  const handleContinue = () => {
    localStorage.setItem('generatedScript', script);
    localStorage.setItem('scriptTone', tone);
    
    console.log('handleContinue called');
    console.log('Current thumbnailPrompt state:', thumbnailPrompt);
    console.log('Current script state:', script);
    
    // Navigate to thumbnail generator with the generated prompt
    if (thumbnailPrompt) {
      console.log('Passing prompt to thumbnail generator:', thumbnailPrompt);
      // Pass the prompt directly as a URL parameter
      const encodedPrompt = encodeURIComponent(thumbnailPrompt);
      console.log('Encoded prompt:', encodedPrompt);
      const url = `/thumbnail-generator?prompt=${encodedPrompt}`;
      console.log('Navigating to:', url);
      
      // Use window.location.href to ensure search params are passed correctly
      window.location.href = url;
    } else {
      console.log('No thumbnail prompt available, navigating without prompt');
      // Fallback to thumbnail generator without prompt
      window.location.href = '/thumbnail-generator';
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(script);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = script;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A]">
      {/* Header with Back Button */}
      <header className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-md border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                Script Generator
              </h1>
            </div>
          </div>
        </div>
      </header>
      
      <div className="px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                Your AI-Generated Script
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Here's your personalized script! Customize the tone and feel free to edit it to match your style.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-8 rounded-2xl border border-gray-700/50 backdrop-blur-sm mb-8"
          >
            {/* Content Idea Input */}
            {(contentIdea || !script) && (
              <div className="mb-6">
                <label className="block text-lg font-semibold mb-3 text-gray-200">
                  Your Content Idea 💡
                </label>
                <textarea
                  value={contentIdea}
                  onChange={(e) => setContentIdea(e.target.value)}
                  placeholder="Describe your content idea, topic, or what you want to create a script about..."
                  className="w-full p-4 bg-gray-700/50 border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                />
                
                <div className="mt-3 flex space-x-2">
                  {contentIdea ? (
                    <Button
                      onClick={generateScriptFromIdea}
                      disabled={isGeneratingFromIdea || !contentIdea.trim()}
                      variant="outline"
                      size="sm"
                    >
                      {isGeneratingFromIdea ? '🤖 Generating...' : '📝 Generate Script from Idea'}
                    </Button>
                  ) : (
                    <Button
                      onClick={generateScript}
                      disabled={isGenerating}
                      variant="outline"
                      size="sm"
                    >
                      {isGenerating ? '🤖 Generating...' : '🎲 Generate Random Script'}
                    </Button>
                  )}
                  
                  {hashtag && (
                    <span className="px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm">
                      #{hashtag}
                    </span>
                  )}
                  
                  {userPassion && (
                    <span className="px-3 py-2 bg-purple-500/20 text-purple-400 rounded-lg text-sm">
                      {userPassion}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Tone Selector */}
            <div className="mb-6">
              <label className="block text-lg font-semibold mb-3 text-gray-200">
                Choose Your Tone 🎭
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full p-4 bg-gray-700/50 border border-gray-600 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="educational">Educational & Informative</option>
                <option value="funny">Funny & Entertaining</option>
                <option value="motivational">Motivational & Inspirational</option>
              </select>
              <p className="text-sm text-gray-400 mt-2">
                Current tone: <span className="text-blue-400 capitalize">{tone}</span> - This will be used when generating new scripts
              </p>
            </div>

            {/* Script Display */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-lg font-semibold text-gray-200">
                  Your Script 📝
                </label>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => setIsEditing(!isEditing)}
                    variant="outline"
                    size="sm"
                  >
                    {isEditing ? 'Preview' : 'Edit'}
                  </Button>
                  <Button
                    onClick={copyToClipboard}
                    variant="outline"
                    size="sm"
                    className={copySuccess ? 'bg-green-600 text-white' : ''}
                  >
                    {copySuccess ? '✓ Copied!' : 'Copy'}
                  </Button>
                </div>
              </div>
              
              {isGenerating ? (
                <div className="bg-gray-700/50 border border-gray-600 rounded-2xl p-8 text-center">
                  <div className="flex items-center justify-center space-x-3">
                    <svg className="animate-spin h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-gray-400">Generating your perfect script...</span>
                  </div>
                </div>
              ) : (
                <div className="border border-gray-600 rounded-2xl overflow-hidden">
                  {isEditing ? (
                    <div className="bg-gray-700/50">
                      <textarea
                        value={script}
                        onChange={(e) => setScript(e.target.value)}
                        className="w-full p-6 bg-gray-700/50 border-none text-white placeholder-gray-400 focus:outline-none focus:ring-0 resize-none"
                        style={{
                          height: '400px',
                          fontSize: '16px',
                          lineHeight: '1.6',
                          color: '#F9FAFB',
                          backgroundColor: '#374151'
                        }}
                        placeholder="Write your script here... You can use markdown formatting like **bold**, *italic*, # headers, etc."
                      />
                    </div>
                  ) : (
                    <div className="bg-gray-700/50 p-6 min-h-[400px]">
                      <MDEditor.Markdown 
                        source={script} 
                        style={{ 
                          backgroundColor: 'transparent',
                          color: 'white',
                          fontSize: '16px',
                          lineHeight: '1.6'
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Thumbnail Prompt Display */}
            {thumbnailPrompt && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 p-4 bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-xl border border-green-700/30"
              >
                <h4 className="text-white font-medium mb-2 flex items-center">
                  <span className="text-green-400 mr-2">🎨</span>
                  Generated Thumbnail Prompt
                </h4>
                <p className="text-gray-400 text-sm mb-3">
                  AI has created a thumbnail prompt based on your script. This will be used to generate your thumbnail.
                </p>
                <div className="bg-gray-900/30 p-4 rounded-xl border border-gray-700">
                  <p className="text-green-100 text-sm whitespace-pre-line">{thumbnailPrompt}</p>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={generateScript}
                variant="outline"
                disabled={isGenerating}
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Regenerate Script
                  </>
                )}
              </Button>
              
              <Button
                onClick={handleContinue}
                disabled={!script.trim()}
                size="lg"
              >
                Start Creating Thumbnail
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 