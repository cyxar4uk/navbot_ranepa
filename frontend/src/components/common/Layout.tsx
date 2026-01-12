import { ReactNode, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import telegram from '../../services/telegram'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Handle back button
    if (location.pathname !== '/') {
      telegram.showBackButton(() => {
        navigate(-1)
      })
    } else {
      telegram.hideBackButton()
    }

    return () => {
      telegram.hideBackButton()
    }
  }, [location.pathname, navigate])

  return (
    <div className="min-h-screen tg-bg tg-text safe-area-top safe-area-bottom">
      <main className="animate-fadeIn">
        {children}
      </main>
    </div>
  )
}
