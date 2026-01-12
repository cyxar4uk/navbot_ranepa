import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { User } from '../types'
import api from '../services/api'
import telegram from '../services/telegram'

interface UserContextType {
  user: User | null
  loading: boolean
  error: string | null
  isAdmin: boolean
  refreshUser: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const authenticate = async () => {
    try {
      // Get init data from Telegram WebApp
      const initData = telegram.initData
      
      if (initData) {
        api.setToken(initData)
        const result = await api.validateAuth()
        setUser(result.user)
      } else {
        // Development mode - no Telegram
        console.warn('Running without Telegram WebApp')
        setError('Telegram WebApp не доступен')
      }
    } catch (err) {
      console.error('Authentication failed:', err)
      setError('Ошибка аутентификации')
    } finally {
      setLoading(false)
    }
  }

  const refreshUser = async () => {
    setLoading(true)
    await authenticate()
  }

  useEffect(() => {
    authenticate()
  }, [])

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        error,
        isAdmin: user?.role === 'admin',
        refreshUser,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
