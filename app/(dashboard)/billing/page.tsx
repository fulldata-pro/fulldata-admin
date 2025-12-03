'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ReceiptStatus } from '@/lib/constants'
import { formatDate } from '@/lib/utils/dateUtils'

interface DashboardStats {
  totalReceipts: number
  completedReceipts: number
  pendingReceipts: number
  totalRevenue: number
  revenueThisMonth: number
  recentReceipts: {
    _id: string
    uid: string
    status: string
    total: number
    currency: string
    accountId: { uid: string; email: string; billing?: { name?: string } }
    createdAt: string
  }[]
}

export default function BillingPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/billing/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Error fetching billing stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      label: 'Ingresos Totales',
      value: `$${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: 'ki-dollar',
      color: 'bg-green-500',
    },
    {
      label: 'Ingresos del Mes',
      value: `$${(stats?.revenueThisMonth || 0).toLocaleString()}`,
      icon: 'ki-calendar',
      color: 'bg-blue-500',
    },
    {
      label: 'Recibos Completados',
      value: stats?.completedReceipts || 0,
      icon: 'ki-verify',
      color: 'bg-primary',
    },
    {
      label: 'Recibos Pendientes',
      value: stats?.pendingReceipts || 0,
      icon: 'ki-time',
      color: 'bg-yellow-500',
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'badge-success'
      case 'PENDING':
        return 'badge-warning'
      case 'PROCESSING':
        return 'badge-info'
      case 'FAILED':
        return 'badge-danger'
      case 'REFUNDED':
        return 'badge-gray'
      default:
        return 'badge-gray'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Facturación</h1>
          <p className="text-gray-500 mt-1">Resumen de ingresos y transacciones</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/billing/receipts" className="btn-outline flex items-center gap-2">
            <i className="ki-duotone ki-document text-xl">
              <span className="path1"></span>
              <span className="path2"></span>
            </i>
            Ver Recibos
          </Link>
          <Link href="/billing/invoices" className="btn-outline flex items-center gap-2">
            <i className="ki-duotone ki-file-sheet text-xl">
              <span className="path1"></span>
              <span className="path2"></span>
            </i>
            Ver Facturas
          </Link>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div key={card.label} className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{card.label}</p>
                <p className="text-2xl font-bold text-secondary">{card.value}</p>
              </div>
              <div
                className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center text-white`}
              >
                <i className={`ki-duotone ${card.icon} text-2xl`}>
                  <span className="path1"></span>
                  <span className="path2"></span>
                  <span className="path3"></span>
                </i>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/billing/receipts" className="card hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
              <i className="ki-duotone ki-document text-2xl text-blue-600">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
            </div>
            <div>
              <h3 className="font-semibold text-secondary">Recibos</h3>
              <p className="text-sm text-gray-500">Gestionar recibos de pago</p>
            </div>
            <i className="ki-duotone ki-arrow-right text-xl text-gray-400 ml-auto">
              <span className="path1"></span>
              <span className="path2"></span>
            </i>
          </div>
        </Link>

        <Link href="/billing/invoices" className="card hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
              <i className="ki-duotone ki-file-sheet text-2xl text-green-600">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
            </div>
            <div>
              <h3 className="font-semibold text-secondary">Facturas</h3>
              <p className="text-sm text-gray-500">Gestionar facturas emitidas</p>
            </div>
            <i className="ki-duotone ki-arrow-right text-xl text-gray-400 ml-auto">
              <span className="path1"></span>
              <span className="path2"></span>
            </i>
          </div>
        </Link>

        <div className="card hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
              <i className="ki-duotone ki-chart-line-up-2 text-2xl text-purple-600">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
            </div>
            <div>
              <h3 className="font-semibold text-secondary">Reportes</h3>
              <p className="text-sm text-gray-500">Exportar datos financieros</p>
            </div>
            <i className="ki-duotone ki-arrow-right text-xl text-gray-400 ml-auto">
              <span className="path1"></span>
              <span className="path2"></span>
            </i>
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-secondary">Transacciones Recientes</h2>
          <Link href="/billing/receipts" className="text-primary hover:text-primary-dark text-sm font-medium">
            Ver todas
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="table-header">Recibo</th>
                <th className="table-header">Cuenta</th>
                <th className="table-header">Total</th>
                <th className="table-header">Estado</th>
                <th className="table-header">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats?.recentReceipts?.map((receipt) => (
                <tr key={receipt._id} className="hover:bg-gray-50">
                  <td className="table-cell">
                    <Link href={`/billing/receipts/${receipt._id}`} className="font-medium text-primary hover:text-primary-dark">
                      {receipt.uid}
                    </Link>
                  </td>
                  <td className="table-cell">
                    <div>
                      <p className="font-medium">{receipt.accountId?.billing?.name || receipt.accountId?.email}</p>
                      <p className="text-sm text-gray-500">{receipt.accountId?.uid}</p>
                    </div>
                  </td>
                  <td className="table-cell font-semibold">
                    ${receipt.total.toLocaleString()} {receipt.currency}
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${getStatusBadge(receipt.status)}`}>
                      {receipt.status}
                    </span>
                  </td>
                  <td className="table-cell text-gray-500">
                    {formatDate(receipt.createdAt)}
                  </td>
                </tr>
              ))}
              {(!stats?.recentReceipts || stats.recentReceipts.length === 0) && (
                <tr>
                  <td colSpan={5} className="table-cell text-center text-gray-500 py-8">
                    No hay transacciones recientes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
