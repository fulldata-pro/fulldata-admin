'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import { setAdmin, setLoading } from '@/store/slices/authSlice'
import Sidebar from './Sidebar'
import Header from './Header'

const DEFAULT_SIDEBAR_WIDTH = 256
const SIDEBAR_WIDTH_KEY = 'sidebar-width'

interface DashboardLayoutProps {
  children: React.ReactNode
  title?: string
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const router = useRouter()
  const dispatch = useDispatch()
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth)
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH)

  useEffect(() => {
    const savedWidth = localStorage.getItem(SIDEBAR_WIDTH_KEY)
    if (savedWidth) {
      setSidebarWidth(Number(savedWidth))
    }
  }, [])

  const handleSidebarWidthChange = useCallback((width: number) => {
    setSidebarWidth(width)
    localStorage.setItem(SIDEBAR_WIDTH_KEY, String(width))
  }, [])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          dispatch(setAdmin(data.admin))
        } else {
          dispatch(setAdmin(null))
          router.push('/login')
        }
      } catch {
        dispatch(setAdmin(null))
        router.push('/login')
      } finally {
        dispatch(setLoading(false))
      }
    }

    checkAuth()
  }, [dispatch, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar width={sidebarWidth} onWidthChange={handleSidebarWidthChange} />
      <div style={{ marginLeft: `${sidebarWidth}px` }} className="transition-[margin] duration-0">
        <Header title={title} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
