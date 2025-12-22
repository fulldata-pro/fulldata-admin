'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils/currencyUtils'

type PeriodType = 'today' | 'week' | 'month' | 'year'

interface RevenueByMoneda {
  currency: string
  total: number
  count: number
}

interface BillingStats {
  totalReceipts: number
  completedReceipts: number
  pendingReceipts: number
  failedReceipts: number
  revenueByCurrency: RevenueByMoneda[]
  revenuePreviousByCurrency: RevenueByMoneda[]
  period: {
    type: PeriodType
    start: string
    end: string
  }
}

const periodLabels: Record<PeriodType, string> = {
  today: 'Hoy',
  week: 'Esta semana',
  month: 'Este mes',
  year: 'Este año',
}

export default function BillingPage() {
  const [stats, setStats] = useState<BillingStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState<PeriodType>('month')

  const fetchStats = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/billing/stats?period=${period}`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching billing stats:', error)
    } finally {
      setIsLoading(false)
    }
  }, [period])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  /**
   * Calculate percentage change between current and previous period for a currency
   */
  const getPercentageChange = (currency: string): number | null => {
    if (!stats) return null

    const current = stats.revenueByCurrency.find((r) => r.currency === currency)?.total || 0
    const previous = stats.revenuePreviousByCurrency.find((r) => r.currency === currency)?.total || 0

    if (previous === 0) return current > 0 ? 100 : null
    return Math.round(((current - previous) / previous) * 100)
  }

  /**
   * Get all unique currencies from current and previous periods
   */
  const getAllCurrencies = (): string[] => {
    if (!stats) return []
    const currencies = new Set<string>()
    stats.revenueByCurrency.forEach((r) => currencies.add(r.currency))
    stats.revenuePreviousByCurrency.forEach((r) => currencies.add(r.currency))
    return Array.from(currencies).sort()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const currencies = getAllCurrencies()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Facturación</h1>
          <p className="text-gray-500 mt-1">Resumen de ingresos y transacciones</p>
        </div>

        {/* Period filter */}
        <div className="flex items-center gap-2">
          {(Object.keys(periodLabels) as PeriodType[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Revenue by currency cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currencies.length > 0 ? (
          currencies.map((currency) => {
            const current = stats?.revenueByCurrency.find((r) => r.currency === currency)
            const change = getPercentageChange(currency)

            return (
              <div key={currency} className="stat-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Ingresos {currency}</p>
                    <p className="text-2xl font-bold text-secondary">
                      {formatCurrency(current?.total || 0, currency, { showCurrencyCode: false })}
                    </p>
                    {change !== null && (
                      <p
                        className={`text-sm mt-1 flex items-center gap-1 ${
                          change >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        <i
                          className={`ki-duotone ${
                            change >= 0 ? 'ki-arrow-up' : 'ki-arrow-down'
                          } text-xs`}
                        >
                          <span className="path1"></span>
                          <span className="path2"></span>
                        </i>
                        {change >= 0 ? '+' : ''}
                        {change}% vs período anterior
                      </p>
                    )}
                  </div>
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white">
                    <i className="ki-duotone ki-dollar text-2xl">
                      <span className="path1"></span>
                      <span className="path2"></span>
                      <span className="path3"></span>
                    </i>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Ingresos</p>
                <p className="text-2xl font-bold text-secondary">$0</p>
                <p className="text-sm text-gray-400 mt-1">Sin transacciones en este período</p>
              </div>
              <div className="w-12 h-12 bg-gray-300 rounded-xl flex items-center justify-center text-white">
                <i className="ki-duotone ki-dollar text-2xl">
                  <span className="path1"></span>
                  <span className="path2"></span>
                  <span className="path3"></span>
                </i>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Counts cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Recibos Totales</p>
              <p className="text-2xl font-bold text-secondary">{stats?.totalReceipts || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white">
              <i className="ki-duotone ki-document text-2xl">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Completados</p>
              <p className="text-2xl font-bold text-secondary">{stats?.completedReceipts || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white">
              <i className="ki-duotone ki-verify text-2xl">
                <span className="path1"></span>
                <span className="path2"></span>
                <span className="path3"></span>
              </i>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Pendientes</p>
              <p className="text-2xl font-bold text-secondary">{stats?.pendingReceipts || 0}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center text-white">
              <i className="ki-duotone ki-time text-2xl">
                <span className="path1"></span>
                <span className="path2"></span>
                <span className="path3"></span>
              </i>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Fallidos</p>
              <p className="text-2xl font-bold text-secondary">{stats?.failedReceipts || 0}</p>
            </div>
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center text-white">
              <i className="ki-duotone ki-cross-circle text-2xl">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
            </div>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      </div>

    </div>
  )
}
