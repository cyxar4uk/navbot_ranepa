import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function AdminGuard() {
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      navigate('/admin/login')
      return
    }
    api.setToken(token)
  }, [navigate])

  return <Outlet />
}
