'use client'

import { useUser, SignOutButton } from '@clerk/nextjs'
import { User, LogOut } from 'lucide-react'

export default function UserProfile() {
  const { user, isLoaded } = useUser()

  if (!isLoaded) {
    return (
      <div className="flex items-center space-x-3 px-4 py-2">
        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
          {user.imageUrl ? (
            <img 
              src={user.imageUrl} 
              alt={user.fullName || 'User'} 
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <User className="w-5 h-5 text-white" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {user.fullName || user.emailAddresses[0]?.emailAddress}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {user.emailAddresses[0]?.emailAddress}
          </p>
        </div>
      </div>
      
      <SignOutButton>
        <button className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
          <LogOut className="w-4 h-4" />
          <span>Sign out</span>
        </button>
      </SignOutButton>
    </div>
  )
} 