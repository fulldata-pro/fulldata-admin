'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useCallback, useRef } from 'react'

interface NavItem {
  label: string
  href: string
  icon: string
  badge?: number
}

interface NavSection {
  title: string
  items: NavItem[]
}

const MIN_WIDTH = 200
const MAX_WIDTH = 400
const DEFAULT_WIDTH = 256
const STORAGE_KEY = 'sidebar-width'

const navigation: NavSection[] = [
  {
    title: 'Principal',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: 'ki-element-11' },
    ],
  },
  {
    title: 'Gestión',
    items: [
      { label: 'Cuentas', href: '/accounts', icon: 'ki-people' },
      { label: 'Usuarios', href: '/users', icon: 'ki-profile-user' },
      { label: 'Administradores', href: '/admins', icon: 'ki-shield-tick' },
      { label: 'Reportes', href: '/reports', icon: 'ki-search-list' },
    ],
  },
  {
    title: 'Finanzas',
    items: [
      { label: 'Resumen', href: '/billing', icon: 'ki-chart-pie-simple' },
      { label: 'Recibos', href: '/billing/receipts', icon: 'ki-document' },
      { label: 'Facturas', href: '/billing/invoices', icon: 'ki-file-sheet' },
    ],
  },
  {
    title: 'Configuración',
    items: [
      { label: 'Precios Tokens', href: '/token-pricing', icon: 'ki-dollar' },
      { label: 'Servicios', href: '/services', icon: 'ki-setting-2' },
      { label: 'Beneficios', href: '/discount-codes', icon: 'ki-discount' },
      { label: 'Descuentos', href: '/bulk-discounts', icon: 'ki-basket' },
    ],
  },
]

interface SidebarProps {
  width: number
  onWidthChange: (width: number) => void
}

export default function Sidebar({ width, onWidthChange }: SidebarProps) {
  const pathname = usePathname()
  const isResizing = useRef(false)

  const isActive = (href: string) => {
    return pathname === href
  }

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    isResizing.current = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, e.clientX))
      onWidthChange(newWidth)
    }

    const handleMouseUp = () => {
      if (isResizing.current) {
        isResizing.current = false
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [onWidthChange])

  return (
    <aside
      className="fixed left-0 top-0 z-40 h-screen bg-secondary overflow-y-auto scrollbar-hide"
      style={{ width: `${width}px` }}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 border-b border-white/10">
          <Link href="/dashboard">
            <Image
              src="/logo-header-w.svg"
              alt="Fulldata Admin"
              width={140}
              height={36}
              priority
            />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-6">
          {navigation.map((section) => (
            <div key={section.title}>
              <p className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {section.title}
              </p>
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={isActive(item.href) ? 'sidebar-link-active' : 'sidebar-link'}
                    >
                      <i className={`ki-duotone ${item.icon} text-xl`}>
                        <span className="path1"></span>
                        <span className="path2"></span>
                        <span className="path3"></span>
                        <span className="path4"></span>
                        <span className="path5"></span>
                      </i>
                      <span className="font-medium">{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <div className="card-glass-dark text-center py-3">
            <p className="text-xs text-gray-400">Fulldata Admin v1.1</p>
          </div>
        </div>
      </div>

      {/* Resize handle */}
      <div
        className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/50 transition-colors group"
        onMouseDown={handleMouseDown}
      >
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1 h-16 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </aside>
  )
}
