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
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/81cb5446-668f-43af-b09f-f0be6da0ac8c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'UserContext.tsx:21',message:'authenticate start',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    try {
      // Get init data from Telegram WebApp
      const initData = telegram.initData
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/81cb5446-668f-43af-b09f-f0be6da0ac8c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'UserContext.tsx:25',message:'initData check',data:{hasInitData:!!initData,initDataLength:initData?.length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      
      if (initData) {
        api.setToken(initData)
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/81cb5446-668f-43af-b09f-f0be6da0ac8c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'UserContext.tsx:28',message:'token set, calling validateAuth',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        const result = await api.validateAuth()
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/81cb5446-668f-43af-b09f-f0be6da0ac8c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'UserContext.tsx:30',message:'validateAuth success',data:{valid:result.valid,hasUser:!!result.user},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        setUser(result.user)
      } else {
        // Development mode - no Telegram
        console.warn('Running without Telegram WebApp')
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/81cb5446-668f-43af-b09f-f0be6da0ac8c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'UserContext.tsx:33',message:'no initData - dev mode',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        setError('Telegram WebApp не доступен')
      }
    } catch (err) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/81cb5446-668f-43af-b09f-f0be6da0ac8c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'UserContext.tsx:36',message:'authenticate error',data:{errorMessage:err instanceof Error?err.message:String(err)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
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
