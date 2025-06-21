'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';

export default function Onboarding() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [onboardingData, setOnboardingData] = useState({
    passion: '',
    comfort_level: '',
    time_available: '',
    main_goal: ''
  });

  const onboardingSteps = [
    {
      question: "What's your biggest passion or interest?",
      field: 'passion',
      placeholder: "e.g., cooking, fitness, technology, travel..."
    },
    {
      question: "How comfortable are you with creating content?",
      field: 'comfort_level',
      options: ['Complete beginner', 'Some experience', 'Quite comfortable', 'Very experienced']
    },
    {
      question: "How much time can you dedicate to content creation?",
      field: 'time_available',
      options: ['1-2 hours per week', '3-5 hours per week', '5-10 hours per week', '10+ hours per week']
    },
    {
      question: "What's your main goal with content creation?",
      field: 'main_goal',
      options: ['Build an audience', 'Monetize content', 'Share knowledge', 'Personal growth', 'Build a business']
    }
  ];

  // Redirect if user is not authenticated
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
    }
  }, [isLoaded, user, router]);

  const handleOnboardingNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleCompleteOnboarding();
    }
  };

  const handleOnboardingBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCompleteOnboarding = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Save onboarding data to Supabase
      const response = await fetch('/api/onboarding/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(onboardingData),
      });

      if (!response.ok) {
        throw new Error('Failed to save onboarding data');
      }

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const updateOnboardingData = (field: string, value: string) => {
    setOnboardingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const currentStepData = onboardingSteps[currentStep];
  const isLastStep = currentStep === onboardingSteps.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          {/* Welcome message */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Welcome, {user.firstName || 'Creator'}!</h1>
            <p className="text-gray-300">Let's set up your content creation profile</p>
          </div>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-300 mb-2">
              <span>Step {currentStep + 1} of {onboardingSteps.length}</span>
              <span>{Math.round(((currentStep + 1) / onboardingSteps.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Question */}
          <motion.h2
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold text-white mb-6"
          >
            {currentStepData.question}
          </motion.h2>

          {/* Input */}
          <motion.div
            key={`input-${currentStep}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            {currentStepData.options ? (
              <div className="space-y-3">
                {currentStepData.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => updateOnboardingData(currentStepData.field, option)}
                    className={`w-full p-4 text-left rounded-lg border transition-all ${
                      onboardingData[currentStepData.field as keyof typeof onboardingData] === option
                        ? 'border-purple-500 bg-purple-500/20 text-white'
                        : 'border-gray-600 bg-white/5 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : (
              <input
                type="text"
                value={onboardingData[currentStepData.field as keyof typeof onboardingData]}
                onChange={(e) => updateOnboardingData(currentStepData.field, e.target.value)}
                placeholder={currentStepData.placeholder}
                className="w-full p-4 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
            )}
          </motion.div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={handleOnboardingBack}
              disabled={currentStep === 0}
              className="px-6 py-3 text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>
            
            <button
              onClick={handleOnboardingNext}
              disabled={!onboardingData[currentStepData.field as keyof typeof onboardingData] || isLoading}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Loading...' : isLastStep ? 'Complete Setup' : 'Next'}
            </button>
          </div>

          {error && (
            <p className="text-red-400 text-sm mt-4 text-center">{error}</p>
          )}
        </div>
      </motion.div>
    </div>
  );
} 