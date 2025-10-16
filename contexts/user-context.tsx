"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useRef } from "react"
import { upsertUserByWallet } from "@/lib/api/api"

interface User {
  id: string
  wallet_address?: string
  username?: string
  isAnonymous: boolean
  total_staked?: number
  total_rewards?: number
  rank?: number
}

interface UserContextType {
  user: User | null
  isLoading: boolean
  setUserFromWallet: (walletAddress: string) => Promise<void>
  setAnonymousUser: () => void
  clearUser: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const initialized = useRef(false)

  // Generate anonymous user ID on first load
  useEffect(() => {
    if (initialized.current) return
    
    const initializeUser = () => {
      // Check if user is already set (from previous session or already initialized)
      if (user) {
        console.log('User already exists, skipping initialization:', user.id)
        initialized.current = true
        return
      }

      const savedUser = localStorage.getItem('matchmind_user')
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser)
          setUser(parsedUser)
          console.log('Restored user from localStorage:', parsedUser.id)
          initialized.current = true
          return
        } catch (error) {
          console.error('Failed to parse saved user:', error)
          localStorage.removeItem('matchmind_user')
        }
      }

      // Create anonymous user if no saved user
      console.log('Creating initial anonymous user')
      setAnonymousUser()
      initialized.current = true
    }

    initializeUser()
  }, [])

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('matchmind_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('matchmind_user')
    }
  }, [user])

  const setUserFromWallet = async (walletAddress: string) => {
    setIsLoading(true)
    try {
      console.log('Setting user from wallet:', walletAddress)
      const dbUser = await upsertUserByWallet(walletAddress)
      
      if (dbUser && dbUser.id) {
        const newUser: User = {
          id: dbUser.id,
          wallet_address: dbUser.wallet_address,
          username: dbUser.username,
          isAnonymous: false,
          total_staked: dbUser.total_staked || 0,
          total_rewards: dbUser.total_rewards || 0,
          rank: dbUser.rank || 999
        }
        setUser(newUser)
        console.log('User set from wallet:', newUser)
      } else {
        throw new Error('Failed to get user from database')
      }
    } catch (error) {
      console.error('Failed to set user from wallet:', error)
      // Create a registered user even if database fails - they still have a wallet
      const fallbackUser: User = {
        id: `wallet_${btoa(walletAddress).replace(/[^a-zA-Z0-9]/g, '').slice(0, 12)}`,
        wallet_address: walletAddress,
        username: `User_${walletAddress.slice(-6)}`,
        isAnonymous: false, // They have a wallet, so not anonymous
        total_staked: 0,
        total_rewards: 0,
        rank: 999
      }
      setUser(fallbackUser)
      console.log('Created fallback registered user:', fallbackUser)
    } finally {
      setIsLoading(false)
    }
  }

  const setAnonymousUser = () => {
    // Don't create a new anonymous user if we already have one
    if (user && user.isAnonymous) {
      console.log('Keeping existing anonymous user:', user.id)
      return
    }
    
    // Generate a consistent anonymous ID based on session
    const anonymousId = `anon_${btoa('anonymous').replace(/[^a-zA-Z0-9]/g, '').slice(0, 12)}`
    
    const newUser: User = {
      id: anonymousId,
      username: anonymousId, // Use ID as username for consistency
      isAnonymous: true,
      total_staked: 0,
      total_rewards: 0,
      rank: 999
    }
    setUser(newUser)
    console.log('Anonymous user created:', newUser)
  }

  const clearUser = () => {
    setUser(null)
    localStorage.removeItem('matchmind_user')
    console.log('User cleared')
  }

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        setUserFromWallet,
        setAnonymousUser,
        clearUser,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
