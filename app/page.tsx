'use client'

import { useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { SignInButton } from '@clerk/nextjs'
import ChatInterface from '@/components/ChatInterface'
import DarkModeToggle from '@/components/DarkModeToggle'
import UserProfile from '@/components/UserProfile'
import { useDarkMode } from '@/contexts/DarkModeContext'

export default function Home() {
  const { isSignedIn, isLoaded } = useAuth()
  const { isDark, toggleDarkMode } = useDarkMode()

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Dark Mode Toggle */}
            <div className="flex justify-end mb-4">
              <DarkModeToggle isDark={isDark} onToggle={toggleDarkMode} />
            </div>
            
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4 transition-colors duration-300">
                Aven Customer Support
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg mb-8 transition-colors duration-300">
                Sign in to access AI-powered assistance
              </p>
              
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md mx-auto">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
                  Welcome Back
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Please sign in to continue to your personalized chat experience.
                </p>
                <SignInButton mode="modal">
                  <button className="w-full bg-primary-600 text-white py-3 px-6 rounded-xl hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors">
                    Sign In
                  </button>
                </SignInButton>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header with Dark Mode Toggle */}
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white transition-colors duration-300">
              Aven Customer Support
            </h1>
            <DarkModeToggle isDark={isDark} onToggle={toggleDarkMode} />
          </div>
          
          <ChatInterface />
          
          {/* User Profile */}
          <div className="mt-6">
            <UserProfile />
          </div>
        </div>
      </div>
    </main>
  )
} 