'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ServiceLabels, ServiceColors, ServiceType } from '@/lib/constants'
import { formatDate } from '@/lib/utils/dateUtils'

interface DashboardStats {
  totalAccounts: number
  activeAccounts: number
  totalUsers: number
  totalReceipts: number
  totalRevenue: number
  recentAccounts: {
    _id: string
    uid: string
    email: string
    status: string
    createdAt: string
    billing?: {
      name?: string
      taxId?: string
    }
  }[]
  serviceUsage: {
    type: ServiceType | string
    count: number
  }[]
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      label: 'Total Cuentas',
      value: stats?.totalAccounts || 0,
      icon: 'ki-people',
      color: 'bg-blue-500',
      href: '/accounts',
    },
    {
      label: 'Cuentas Activas',
      value: stats?.activeAccounts || 0,
      icon: 'ki-verify',
      color: 'bg-green-500',
      href: '/accounts?status=ACTIVE',
    },
    {
      label: 'Total Usuarios',
      value: stats?.totalUsers || 0,
      icon: 'ki-profile-user',
      color: 'bg-purple-500',
      href: '/users',
    },
    {
      label: 'Ingresos (USD)',
      value: `$${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: 'ki-dollar',
      color: 'bg-primary',
      href: '/billing',
    },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Dashboard</h1>
          <p className="text-gray-500 mt-1">Resumen general de la plataforma</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-outline flex items-center gap-2">
            <i className="ki-duotone ki-calendar text-xl">
              <span className="path1"></span>
              <span className="path2"></span>
            </i>
            Últimos 30 días
          </button>
          <button className="btn-primary flex items-center gap-2">
            <i className="ki-duotone ki-document text-xl">
              <span className="path1"></span>
              <span className="path2"></span>
            </i>
            Exportar
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <Link key={card.label} href={card.href} className="stat-card group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{card.label}</p>
                <p className="text-2xl font-bold text-secondary">{card.value}</p>
              </div>
              <div
                className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform`}
              >
                <i className={`ki-duotone ${card.icon} text-2xl`}>
                  <span className="path1"></span>
                  <span className="path2"></span>
                  <span className="path3"></span>
                  <span className="path4"></span>
                  <span className="path5"></span>
                </i>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent accounts */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-secondary">Cuentas Recientes</h2>
            <Link href="/accounts" className="text-primary hover:text-primary-dark text-sm font-medium">
              Ver todas
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="table-header">Cuenta</th>
                  <th className="table-header">Estado</th>
                  <th className="table-header">Fecha</th>
                  <th className="table-header"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats?.recentAccounts?.map((account) => (
                  <tr key={account._id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <div>
                        <p className="font-medium text-secondary">
                          {account.billing?.name || account.email}
                        </p>
                        <p className="text-sm text-gray-500">
                          {account.billing?.taxId || account.uid}
                        </p>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span
                        className={`badge ${
                          account.status === 'ACTIVE'
                            ? 'badge-success'
                            : account.status === 'PENDING'
                            ? 'badge-warning'
                            : 'badge-danger'
                        }`}
                      >
                        {account.status}
                      </span>
                    </td>
                    <td className="table-cell text-gray-500">
                      {formatDate(account.createdAt)}
                    </td>
                    <td className="table-cell">
                      <Link
                        href={`/accounts/${account._id}`}
                        className="text-primary hover:text-primary-dark"
                      >
                        <i className="ki-duotone ki-arrow-right text-xl">
                          <span className="path1"></span>
                          <span className="path2"></span>
                        </i>
                      </Link>
                    </td>
                  </tr>
                ))}
                {(!stats?.recentAccounts || stats.recentAccounts.length === 0) && (
                  <tr>
                    <td colSpan={4} className="table-cell text-center text-gray-500 py-8">
                      No hay cuentas recientes
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Service usage */}
        <div className="card">
          <h2 className="text-lg font-semibold text-secondary mb-6">Uso por Servicio</h2>
          <div className="space-y-4">
            {stats?.serviceUsage?.map((service) => {
              const maxCount = Math.max(...(stats.serviceUsage?.map((s) => s.count) || [1]))
              const percentage = (service.count / maxCount) * 100
              const serviceType = service.type as ServiceType
              const label = ServiceLabels[serviceType] || service.type.toUpperCase()
              const color = ServiceColors[serviceType] || '#6B7280'

              return (
                <div key={service.type}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {label}
                    </span>
                    <span className="text-sm text-gray-500">{service.count.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: color,
                      }}
                    ></div>
                  </div>
                </div>
              )
            })}
            {(!stats?.serviceUsage || stats.serviceUsage.length === 0) && (
              <p className="text-center text-gray-500 py-4">Sin datos de uso</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-secondary mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/accounts/new"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-colors group"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
              <i className="ki-duotone ki-plus-square text-2xl text-blue-600">
                <span className="path1"></span>
                <span className="path2"></span>
                <span className="path3"></span>
              </i>
            </div>
            <span className="text-sm font-medium text-secondary">Nueva Cuenta</span>
          </Link>
          <Link
            href="/benefits/new"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-colors group"
          >
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-green-200 transition-colors">
              <i className="ki-duotone ki-gift text-2xl text-green-600">
                <span className="path1"></span>
                <span className="path2"></span>
                <span className="path3"></span>
                <span className="path4"></span>
              </i>
            </div>
            <span className="text-sm font-medium text-secondary">Nuevo Beneficio</span>
          </Link>
          <Link
            href="/services"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-colors group"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-purple-200 transition-colors">
              <i className="ki-duotone ki-setting-2 text-2xl text-purple-600">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
            </div>
            <span className="text-sm font-medium text-secondary">Gestionar Servicios</span>
          </Link>
          <Link
            href="/billing"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-colors group"
          >
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-orange-200 transition-colors">
              <i className="ki-duotone ki-chart-line-up text-2xl text-orange-600">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
            </div>
            <span className="text-sm font-medium text-secondary">Ver Facturación</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
