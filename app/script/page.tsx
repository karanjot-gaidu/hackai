'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import Button from '../components/Button';

export default function ScriptPage() {
  const router = useRouter();
  const [script, setScript] = useState('');
  const [tone, setTone] = useState('educational');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const sampleScripts = {
    educational: `Hey everyone! 👋 Today we're diving into something that's been a game-changer for me - [Your Topic].

Let me break this down into 3 simple steps that anyone can follow:

Step 1: [First step with explanation]
This is crucial because [reason why it matters]

Step 2: [Second step with explanation] 
Here's a pro tip: [helpful insight]

Step 3: [Third step with explanation]
This is where most people mess up, so pay attention!

The key takeaway? [Main lesson or insight]

If you found this helpful, drop a like and follow for more tips like this! What topic should I cover next? Comment below! 👇

#YourNiche #Tips #Education #ContentCreator`,
    
    funny: `Okay, so picture this... 😂 You're trying to [common problem], and it's going about as well as my attempt to cook without burning the kitchen down! 🔥

But guess what? I discovered this absolutely ridiculous hack that actually works! 

Here's the deal: [funny explanation of the solution]

*Insert dramatic pause* 

And that's when I realized... [funny revelation]

Pro tip: [humorous advice]

The best part? [funny benefit]

So next time you're [situation], remember this! Unless you want to end up like me - learning everything the hard way! 😅

Like and follow if you're also a professional disaster like me! 🤪

#Funny #LifeHacks #Relatable #ContentCreator`,
    
    motivational: `Listen up, because this changed everything for me... 💪

I used to think [limiting belief], until I discovered this powerful truth: [motivational insight]

Here's what I learned:

🔥 [First powerful lesson]
This hit me like a ton of bricks when I realized...

🔥 [Second powerful lesson] 
The moment I understood this, everything shifted...

🔥 [Third powerful lesson]
This is what separates the dreamers from the doers...

The truth is, [motivational truth]

You have the power to [empowering statement]. Right now. Today.

Don't wait for the perfect moment. Create it.

If this resonates with you, drop a ❤️ and let's build this community of go-getters together!

Remember: [motivational quote or phrase]

#Motivation #Mindset #Success #Inspiration`
  };

  useEffect(() => {
    generateScript();
  }, [tone]);

  const generateScript = () => {
    setIsGenerating(true);
    // Simulate API call
    setTimeout(() => {
      setScript(sampleScripts[tone as keyof typeof sampleScripts]);
      setIsGenerating(false);
    }, 2000);
  };

  const handleContinue = () => {
    localStorage.setItem('generatedScript', script);
    localStorage.setItem('scriptTone', tone);
    router.push('/plan');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(script);
    // You could add a toast notification here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1A1A] via-[#2A2A2A] to-[#1A1A1A]">
      <Navbar currentStep={3} totalSteps={5} />
      
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
                    {isEditing ? 'Save' : 'Edit'}
                  </Button>
                  <Button
                    onClick={copyToClipboard}
                    variant="outline"
                    size="sm"
                  >
                    Copy
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
                <textarea
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  disabled={!isEditing}
                  className={`w-full p-6 bg-gray-700/50 border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                    isEditing ? '' : 'cursor-default'
                  }`}
                  rows={15}
                  placeholder="Your AI-generated script will appear here..."
                />
              )}
            </div>

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
                Continue to Planning
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