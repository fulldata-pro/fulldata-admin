'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/store/store'
import { logout } from '@/store/slices/authSlice'
import { toast } from 'react-toastify'
import { ROUTES } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils/currencyUtils'

interface TokenPrice {
  currency: string
  price: number
}

interface HeaderProps {
  title?: string
}

export default function Header({ title }: HeaderProps) {
  const router = useRouter()
  const dispatch = useDispatch()
  const { admin } = useSelector((state: RootState) => state.auth)
  const [showDropdown, setShowDropdown] = useState(false)
  const [tokenPrices, setTokenPrices] = useState<TokenPrice[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const fetchTokenPrices = async () => {
      try {
        const response = await fetch('/api/token-pricing?simple=true')
        if (response.ok) {
          const data = await response.json()
          setTokenPrices(data.prices || [])
        }
      } catch (error) {
        console.error('Error fetching token prices:', error)
      }
    }

    fetchTokenPrices()
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      dispatch(logout())
      toast.success('Sesión cerrada correctamente')
      router.push('/login')
    } catch {
      toast.error('Error al cerrar sesión')
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'Super Admin'
      case 'ADMIN':
        return 'Administrador'
      case 'MODERATOR':
        return 'Moderador'
      default:
        return role
    }
  }

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left side - Title */}
        <div>
          {title && <h1 className="text-xl font-semibold text-secondary">{title}</h1>}
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-4">
          {/* Token Prices */}
          {tokenPrices.length > 0 && (
            <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-1.5 text-gray-500">
                <i className="ki-duotone ki-dollar text-lg text-primary">
                  <span className="path1"></span>
                  <span className="path2"></span>
                  <span className="path3"></span>
                </i>
                <span className="text-xs font-medium">1 Token</span>
              </div>
              <div className="h-4 w-px bg-gray-200"></div>
              <div className="flex items-center gap-3">
                {tokenPrices.map((tp) => (
                  <div key={tp.currency} className="flex items-center gap-1">
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(tp.price, tp.currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notifications */}
          <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <i className="ki-duotone ki-notification text-xl">
              <span className="path1"></span>
              <span className="path2"></span>
              <span className="path3"></span>
            </i>
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
          </button>

          {/* User dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-semibold">
                {admin?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">{admin?.name || 'Admin'}</p>
                <p className="text-xs text-gray-500">{admin ? getRoleLabel(admin.role) : ''}</p>
              </div>
              <i className="ki-duotone ki-down text-gray-400 text-sm">
                <span className="path1"></span>
              </i>
            </button>

            {/* Dropdown menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 animate-fade-in">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{admin?.name}</p>
                  <p className="text-xs text-gray-500">{admin?.email}</p>
                </div>
                <ul className="py-1">
                  <li>
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <i className="ki-duotone ki-profile-circle text-xl text-gray-400">
                        <span className="path1"></span>
                        <span className="path2"></span>
                        <span className="path3"></span>
                      </i>
                      Mi Perfil
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setShowDropdown(false)
                        router.push(ROUTES.SETTINGS)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <i className="ki-duotone ki-setting-3 text-xl text-gray-400">
                        <span className="path1"></span>
                        <span className="path2"></span>
                        <span className="path3"></span>
                        <span className="path4"></span>
                        <span className="path5"></span>
                      </i>
                      Configuración
                    </button>
                  </li>
                </ul>
                <div className="border-t border-gray-100 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <i className="ki-duotone ki-exit-right text-xl">
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
