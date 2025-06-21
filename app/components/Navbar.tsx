'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface NavbarProps {
  currentStep?: number;
  totalSteps?: number;
}

export default function Navbar({ currentStep, totalSteps }: NavbarProps) {
  return (
    <nav className="relative z-10 px-6 py-4 bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-md border-b border-gray-700/50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent"
          >
            <Link href="/">LaunchCreator.ai</Link>
          </motion.div>
          {currentStep && totalSteps && (
            <div className="text-sm text-gray-400">
              Step {currentStep} of {totalSteps}
            </div>
          )}
        </div>
        
        {currentStep && totalSteps && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full bg-gray-700/50 rounded-full h-2"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
            />
          </motion.div>
        )}
      </div>
    </nav>
  );
} 