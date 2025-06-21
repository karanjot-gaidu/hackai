'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import Button from '../components/Button';

interface NicheSuggestion {
  id: string;
  title: string;
  emoji: string;
  description: string;
  reasons: string[];
  audience: string;
}

export default function NichePage() {
  const router = useRouter();
  const [selectedNiche, setSelectedNiche] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [niches, setNiches] = useState<NicheSuggestion[]>([
    {
      id: '1',
      title: 'Tech Tips & Tutorials',
      emoji: '💻',
      description: 'Share practical technology tips, software tutorials, and digital productivity hacks.',
      reasons: [
        'High demand for tech content',
        'Evergreen topics with staying power',
        'Multiple monetization opportunities',
        'Global audience reach'
      ],
      audience: 'Tech enthusiasts, professionals, students'
    },
    {
      id: '2',
      title: 'Fitness & Wellness Journey',
      emoji: '💪',
      description: 'Document your fitness journey, share workout routines, and inspire healthy lifestyle changes.',
      reasons: [
        'Growing health consciousness',
        'Authentic personal story potential',
        'Strong community engagement',
        'Partnership opportunities'
      ],
      audience: 'Fitness enthusiasts, health-conscious individuals'
    }
  ]);

  const regenerateNiches = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const newNiches = [
        {
          id: '3',
          title: 'Cooking Adventures',
          emoji: '👨‍🍳',
          description: 'Share cooking experiments, recipe modifications, and kitchen tips for home chefs.',
          reasons: [
            'Universal appeal across cultures',
            'Visual content opportunities',
            'Recipe affiliate potential',
            'Community recipe sharing'
          ],
          audience: 'Home cooks, food enthusiasts, families'
        },
        {
          id: '4',
          title: 'Travel Vlogs',
          emoji: '✈️',
          description: 'Explore new destinations, share travel tips, and document cultural experiences.',
          reasons: [
            'Aspirational content appeal',
            'Partnership with travel brands',
            'Diverse content opportunities',
            'Global audience interest'
          ],
          audience: 'Travel enthusiasts, adventure seekers'
        }
      ];
      setNiches(newNiches);
      setSelectedNiche(null);
      setIsLoading(false);
    }, 2000);
  };

  const handleNicheSelect = (nicheId: string) => {
    setSelectedNiche(nicheId);
  };

  const handleContinue = () => {
    if (selectedNiche) {
      const selected = niches.find(n => n.id === selectedNiche);
      localStorage.setItem('selectedNiche', JSON.stringify(selected));
      router.push('/script');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A]">
      <Navbar currentStep={2} totalSteps={5} />
      
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
                Choose Your Niche
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Based on your interests, here are some niche suggestions that could be perfect for you. 
              Pick the one that resonates most with your vision.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid md:grid-cols-2 gap-8 mb-8"
          >
            {niches.map((niche, index) => (
              <motion.div
                key={niche.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
                className={`relative cursor-pointer transition-all duration-300 ${
                  selectedNiche === niche.id 
                    ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900' 
                    : 'hover:ring-2 hover:ring-gray-600 hover:ring-offset-2 hover:ring-offset-gray-900'
                }`}
                onClick={() => handleNicheSelect(niche.id)}
              >
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-8 rounded-2xl border border-gray-700/50 backdrop-blur-sm h-full">
                  <div className="flex items-start space-x-4">
                    <div className="text-4xl">{niche.emoji}</div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-3 text-white">{niche.title}</h3>
                      <p className="text-gray-400 mb-4 leading-relaxed">{niche.description}</p>
                      
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-300 mb-2">Why this niche works:</h4>
                        <ul className="space-y-1">
                          {niche.reasons.map((reason, idx) => (
                            <li key={idx} className="text-sm text-gray-400 flex items-center">
                              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        <strong>Target Audience:</strong> {niche.audience}
                      </div>
                    </div>
                  </div>
                  
                  {selectedNiche === niche.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-4 right-4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button
              onClick={regenerateNiches}
              variant="outline"
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                  Regenerate Suggestions
                </>
              )}
            </Button>
            
            <Button
              onClick={handleContinue}
              disabled={!selectedNiche}
              size="lg"
            >
              Continue
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