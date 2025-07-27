'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { getUserPreferences, updateUserPreferences, testDatabaseConnection } from '@/lib/database'

interface DarkModeContextType {
  isDark: boolean
  toggleDarkMode: () => void
  isLoading: boolean
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined)

export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useUser()

  useEffect(() => {
    const initializeTheme = async () => {
      try {
        if (user?.id) {
          // Test database connection first
          const isConnected = await testDatabaseConnection()
          
          if (isConnected) {
            // Try to get user preference from database
            const preferences = await getUserPreferences(user.id)
            if (preferences) {
              setIsDark(preferences.dark_mode)
            } else {
              // Fallback to localStorage
              const savedTheme = localStorage.getItem('darkMode')
              if (savedTheme !== null) {
                setIsDark(savedTheme === 'true')
              } else {
                // Check system preference
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
                setIsDark(prefersDark)
              }
            }
          } else {
            // Database not available, use localStorage
            console.log('Database not available, using localStorage fallback')
            const savedTheme = localStorage.getItem('darkMode')
            if (savedTheme !== null) {
              setIsDark(savedTheme === 'true')
            } else {
              const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
              setIsDark(prefersDark)
            }
          }
        } else {
          // Not logged in, use localStorage
          const savedTheme = localStorage.getItem('darkMode')
          if (savedTheme !== null) {
            setIsDark(savedTheme === 'true')
          } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
            setIsDark(prefersDark)
          }
        }
      } catch (error) {
        console.error('Error initializing theme:', error)
        // Fallback to localStorage on any error
        const savedTheme = localStorage.getItem('darkMode')
        if (savedTheme !== null) {
          setIsDark(savedTheme === 'true')
        } else {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          setIsDark(prefersDark)
        }
      } finally {
        setIsLoading(false)
      }
    }

    initializeTheme()
  }, [user?.id])

  useEffect(() => {
    // Update document class when theme changes
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
    // Save to localStorage as fallback
    localStorage.setItem('darkMode', isDark.toString())
    
    // Save to database if user is logged in
    if (user?.id && !isLoading) {
      updateUserPreferences(user.id, isDark)
    }
  }, [isDark, user?.id, isLoading])

  const toggleDarkMode = () => {
    setIsDark(!isDark)
  }

  return (
    <DarkModeContext.Provider value={{ isDark, toggleDarkMode, isLoading }}>
      {children}
    </DarkModeContext.Provider>
  )
}

export function useDarkMode() {
  const context = useContext(DarkModeContext)
  if (context === undefined) {
    throw new Error('useDarkMode must be used within a DarkModeProvider')
  }
  return context
} 