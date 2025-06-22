'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { useUserData } from '../contexts/UserContext';
import DashboardNavbar from '../components/DashboardNavbar';

export default function ScriptPage() {
  const { user } = useUser();
  const { userData } = useUserData();
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('engaging');
  const [length, setLength] = useState('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScript, setGeneratedScript] = useState('');
  const [error, setError] = useState('');

  const tones = [
    { value: 'engaging', label: 'Engaging', emoji: '🎯' },
    { value: 'funny', label: 'Funny', emoji: '😂' },
    { value: 'educational', label: 'Educational', emoji: '📚' },
    { value: 'inspirational', label: 'Inspirational', emoji: '✨' },
    { value: 'dramatic', label: 'Dramatic', emoji: '🎭' },
    { value: 'casual', label: 'Casual', emoji: '😊' }
  ];

  const lengths = [
    { value: 'short', label: 'Short (30-60s)', emoji: '⚡' },
    { value: 'medium', label: 'Medium (1-2min)', emoji: '⏱️' },
    { value: 'long', label: 'Long (2-5min)', emoji: '📹' }
  ];

  const generateScript = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic for your script');
      return;
    }

    setIsGenerating(true);
    setError('');
    setGeneratedScript('');

    try {
      const response = await fetch('/api/generate-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic.trim(),
          tone,
          length,
          userData: {
            passion: userData?.passion,
            mainGoal: userData?.mainGoal,
            comfortLevel: userData?.comfortLevel
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedScript(data.script);
      } else {
        throw new Error('Failed to generate script');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedScript);
  };

  const downloadScript = () => {
    const blob = new Blob([generatedScript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `script-${topic.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A]">
      {/* Navigation */}
      <DashboardNavbar 
        title="Script Generator"
        showBackButton={true}
        showUserInfo={false}
        showSignOut={false}
      />

      <div className="max-w-4xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              AI Script Generator
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Create engaging scripts tailored to your content style and audience. 
            Perfect for TikTok, YouTube, Instagram, and more.
          </p>
        </motion.div>

        {/* Script Generation Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-8 rounded-2xl border border-gray-700/50 mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6">📝 Generate Your Script</h2>
          
          {/* Topic Input */}
          <div className="mb-6">
            <label className="block text-gray-300 text-sm font-medium mb-2">
              What's your video about? *
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., How to make the perfect morning smoothie, My journey to becoming a content creator, 5 life hacks that actually work..."
              className="w-full bg-gray-700/50 border border-gray-600 rounded-xl p-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          {/* Tone Selection */}
          <div className="mb-6">
            <label className="block text-gray-300 text-sm font-medium mb-3">
              Choose your tone:
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {tones.map((toneOption) => (
                <button
                  key={toneOption.value}
                  onClick={() => setTone(toneOption.value)}
                  className={`p-3 rounded-xl border transition-all duration-300 ${
                    tone === toneOption.value
                      ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                      : 'border-gray-600 bg-gray-700/30 text-gray-300 hover:border-gray-500 hover:bg-gray-700/50'
                  }`}
                >
                  <div className="text-lg mb-1">{toneOption.emoji}</div>
                  <div className="text-sm font-medium">{toneOption.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Length Selection */}
          <div className="mb-6">
            <label className="block text-gray-300 text-sm font-medium mb-3">
              Video length:
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {lengths.map((lengthOption) => (
                <button
                  key={lengthOption.value}
                  onClick={() => setLength(lengthOption.value)}
                  className={`p-3 rounded-xl border transition-all duration-300 ${
                    length === lengthOption.value
                      ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                      : 'border-gray-600 bg-gray-700/30 text-gray-300 hover:border-gray-500 hover:bg-gray-700/50'
                  }`}
                >
                  <div className="text-lg mb-1">{lengthOption.emoji}</div>
                  <div className="text-sm font-medium">{lengthOption.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateScript}
            disabled={isGenerating || !topic.trim()}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Generating your script...</span>
              </div>
            ) : (
              'Generate Script'
            )}
          </button>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-red-900/20 border border-red-700/30 rounded-lg text-red-300 text-sm"
            >
              {error}
            </motion.div>
          )}
        </motion.div>

        {/* Generated Script */}
        {generatedScript && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 p-8 rounded-2xl border border-green-700/30"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">✨ Your Generated Script</h2>
              <div className="flex space-x-3">
                <button
                  onClick={copyToClipboard}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  Copy
                </button>
                <button
                  onClick={downloadScript}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors"
                >
                  Download
                </button>
              </div>
            </div>
            
            <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700/50">
              <pre className="text-green-100 text-sm whitespace-pre-line leading-relaxed">{generatedScript}</pre>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
} 