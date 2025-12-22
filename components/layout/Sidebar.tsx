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
      { label: 'Servicios', href: '/services', icon: 'ki-setting-2' },
      { label: 'Beneficios', href: '/benefits', icon: 'ki-gift' },
      { label: 'Ajustes', href: '/settings', icon: 'ki-gear' },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    return pathname === href
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-secondary overflow-y-auto scrollbar-hide">
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
            <p className="text-xs text-gray-400">Fulldata Admin v1.0</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
