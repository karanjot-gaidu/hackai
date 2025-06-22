'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { useUserData } from '../contexts/UserContext';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface DashboardNavbarProps {
  title?: string;
  showBackButton?: boolean;
  showUserInfo?: boolean;
  showSignOut?: boolean;
  backHref?: string;
  rightContent?: React.ReactNode;
}

export default function DashboardNavbar({
  title,
  showBackButton = false,
  showUserInfo = true,
  showSignOut = true,
  backHref = '/dashboard',
  rightContent
}: DashboardNavbarProps) {
  const { user } = useUser();
  const { userData } = useUserData();
  const { signOut } = useClerk();

  const handleSignOut = () => {
    signOut();
  };

  return (
    <header className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-md border-b border-gray-700/50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Side */}
          <div className="flex items-center space-x-4">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center space-x-3 hover:from-blue-500 hover:to-purple-700 transition-all duration-300">
              <Image 
                src="/logo.png" 
                alt="CreatorStudio Logo" 
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                CreatorStudio
              </span>
            </Link>

            {/* Back Button and Title */}
            {(showBackButton || title) && (
              <div className="flex items-center space-x-2">
                {showBackButton && (
                  <Link 
                    href={backHref} 
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </Link>
                )}
                {title && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent"
                  >
                    {title}
                  </motion.div>
                )}
              </div>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Custom Right Content */}
            {rightContent}

            {/* User Info */}
            {showUserInfo && user && (
              <span className="text-gray-300">
                Welcome, {user.firstName || userData?.name || 'Creator'}! 🌟
              </span>
            )}

            {/* Sign Out Button */}
            {showSignOut && (
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors hover:bg-gray-700/50 rounded-lg"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 