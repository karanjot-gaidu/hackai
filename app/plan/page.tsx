'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import Button from '../components/Button';

interface ShotItem {
  id: string;
  type: string;
  description: string;
  duration: string;
  visual: string;
}

export default function PlanPage() {
  const router = useRouter();
  const [voiceStyle, setVoiceStyle] = useState('friendly');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const shotList: ShotItem[] = [
    {
      id: '1',
      type: 'Intro Hook',
      description: 'Grab attention with a compelling opening',
      duration: '3-5 seconds',
      visual: 'Close-up of your face with engaging expression'
    },
    {
      id: '2',
      type: 'Main Content',
      description: 'Deliver your key message',
      duration: '15-20 seconds',
      visual: 'Medium shot showing you speaking to camera'
    },
    {
      id: '3',
      type: 'Visual Demo',
      description: 'Show practical examples or demonstrations',
      duration: '10-15 seconds',
      visual: 'Over-the-shoulder or hands-on demonstration'
    },
    {
      id: '4',
      type: 'Call to Action',
      description: 'Encourage engagement and follow',
      duration: '5-8 seconds',
      visual: 'Direct eye contact with camera, pointing gesture'
    }
  ];

  const voiceStyles = [
    {
      id: 'friendly',
      name: 'Friendly & Approachable',
      description: 'Warm, conversational tone',
      icon: '😊'
    },
    {
      id: 'serious',
      name: 'Professional & Serious',
      description: 'Authoritative, trustworthy voice',
      icon: '🎯'
    },
    {
      id: 'quirky',
      name: 'Fun & Quirky',
      description: 'Energetic, entertaining style',
      icon: '🤪'
    }
  ];

  const handleContinue = () => {
    localStorage.setItem('voiceStyle', voiceStyle);
    router.push('/preview');
  };

  const toggleAudioPreview = () => {
    setIsPlayingAudio(!isPlayingAudio);
    // In a real app, you'd play actual audio here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A]">
      <Navbar currentStep={4} totalSteps={5} />
      
      <div className="px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                Voice & Visual Plan
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Plan your visual shots and choose your voice style to bring your content to life.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Shot List */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-8 rounded-2xl border border-gray-700/50 backdrop-blur-sm"
            >
              <h2 className="text-2xl font-bold mb-6 text-white flex items-center">
                📹 Shot List
                <span className="ml-2 text-sm font-normal text-gray-400">(Visual Guide)</span>
              </h2>
              
              <div className="space-y-4">
                {shotList.map((shot, index) => (
                  <motion.div
                    key={shot.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-white">{shot.type}</h3>
                      <span className="text-sm text-gray-400 bg-gray-600/50 px-2 py-1 rounded-lg">
                        {shot.duration}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">{shot.description}</p>
                    <p className="text-gray-400 text-xs italic">Visual: {shot.visual}</p>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <h4 className="font-semibold text-blue-400 mb-2">💡 Pro Tips:</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Keep transitions smooth between shots</li>
                  <li>• Use natural lighting when possible</li>
                  <li>• Maintain consistent framing throughout</li>
                  <li>• Consider background music for atmosphere</li>
                </ul>
              </div>
            </motion.div>

            {/* Voice Style Selection */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-8 rounded-2xl border border-gray-700/50 backdrop-blur-sm"
            >
              <h2 className="text-2xl font-bold mb-6 text-white flex items-center">
                🎤 Voice Style
                <span className="ml-2 text-sm font-normal text-gray-400">(Choose Your Tone)</span>
              </h2>
              
              <div className="space-y-4 mb-6">
                {voiceStyles.map((style) => (
                  <motion.div
                    key={style.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className={`cursor-pointer transition-all duration-300 ${
                      voiceStyle === style.id 
                        ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900' 
                        : 'hover:ring-2 hover:ring-gray-600 hover:ring-offset-2 hover:ring-offset-gray-900'
                    }`}
                    onClick={() => setVoiceStyle(style.id)}
                  >
                    <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/50">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{style.icon}</span>
                        <div className="flex-1">
                          <h3 className="font-semibold text-white">{style.name}</h3>
                          <p className="text-gray-400 text-sm">{style.description}</p>
                        </div>
                        {voiceStyle === style.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"
                          >
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Audio Preview */}
              <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-600/50">
                <h4 className="font-semibold text-white mb-3">🎧 Voice Preview</h4>
                <p className="text-gray-400 text-sm mb-4">
                  Listen to how your script sounds with the selected voice style.
                </p>
                <Button
                  onClick={toggleAudioPreview}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  {isPlayingAudio ? (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Pause Preview
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Play Preview
                    </>
                  )}
                </Button>
              </div>

              {/* Production Tips */}
              <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                <h4 className="font-semibold text-purple-400 mb-2">🎬 Production Tips:</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Record in a quiet environment</li>
                  <li>• Use a good microphone if possible</li>
                  <li>• Speak clearly and at a steady pace</li>
                  <li>• Practice your script before recording</li>
                </ul>
              </div>
            </motion.div>
          </div>

          {/* Continue Button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center mt-12"
          >
            <Button
              onClick={handleContinue}
              size="lg"
            >
              Continue to Preview
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 