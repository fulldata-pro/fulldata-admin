'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

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

export default function Sidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    return pathname === href
  }

  return (
    <aside
      className="fixed left-0 top-0 z-40 h-screen w-64 sidebar-gradient overflow-y-auto scrollbar-hide"
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-center h-20 border-b border-white/10 backdrop-blur-xl">
          <Link href="/dashboard" className="sidebar-logo-link">
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
        <nav className="flex-1 px-4 py-6 space-y-8">
          {navigation.map((section) => (
            <div key={section.title} className="sidebar-section">
              <div className="flex items-center gap-3 px-3 mb-3">
                <div className="sidebar-section-line"></div>
                <p className="sidebar-section-title">
                  {section.title}
                </p>
              </div>
              <ul className="space-y-1.5">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={isActive(item.href) ? 'sidebar-link-active' : 'sidebar-link'}
                    >
                      <div className="sidebar-link-content">
                        <i className={`ki-duotone ${item.icon} sidebar-link-icon`}>
                          <span className="path1"></span>
                          <span className="path2"></span>
                          <span className="path3"></span>
                          <span className="path4"></span>
                          <span className="path5"></span>
                        </i>
                        <span className="sidebar-link-label">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="sidebar-badge">
                          {item.badge}
                        </span>
                      )}
                      {isActive(item.href) && (
                        <div className="sidebar-active-indicator"></div>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 backdrop-blur-xl">
          <div className="sidebar-footer">
            <div className="sidebar-footer-glow"></div>
            <div className="relative z-10">
              <p className="text-xs font-semibold text-white/90 mb-0.5">Fulldata Admin</p>
              <p className="text-[10px] text-white/50 font-medium">Version 1.1</p>
            </div>
          </div>
        </div>
      </div>

    </aside>
  )
}
