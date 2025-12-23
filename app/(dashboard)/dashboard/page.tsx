'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import ConsumptionChart from '@/components/charts/ConsumptionChart'
import DateRangePicker, { DateRangeValue } from '@/components/dashboard/DateRangePicker'

type DateRange = '7d' | '30d' | '90d' | '12m' | 'custom'

interface RevenueByCurrency {
  currency: string
  total: number
  count: number
}

interface RevenueByProvider {
  provider: string
  total: number
  count: number
}

interface DashboardStats {
  totalAccounts: number
  activeAccounts: number
  totalUsers: number
  totalRequests: number
  revenue: {
    total: number
    byCurrency: RevenueByCurrency[]
    byProvider: RevenueByProvider[]
    receipts: {
      completed: number
      pending: number
    }
  }
}

// Helper function to calculate date range
function calculateDateRange(dateRange: DateRange, customStartDate?: string, customEndDate?: string): { startDate: string; endDate: string } {
  const end = new Date()
  const start = new Date()

  switch (dateRange) {
    case '7d':
      start.setDate(end.getDate() - 7)
      break
    case '30d':
      start.setDate(end.getDate() - 30)
      break
    case '90d':
      start.setDate(end.getDate() - 90)
      break
    case '12m':
      start.setMonth(end.getMonth() - 12)
      break
    case 'custom':
      if (customStartDate && customEndDate) {
        return { startDate: customStartDate, endDate: customEndDate }
      }
      start.setDate(end.getDate() - 30)
      break
  }

  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  }
}

// Format currency value
function formatCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}

// Get provider display name
function getProviderName(provider: string): string {
  const names: Record<string, string> = {
    MERCADO_PAGO: 'Mercado Pago',
    STRIPE: 'Stripe',
  }
  return names[provider] || provider
}

// Get provider icon class
function getProviderIcon(provider: string): string {
  const icons: Record<string, string> = {
    MERCADO_PAGO: 'ki-wallet',
    STRIPE: 'ki-credit-cart',
  }
  return icons[provider] || 'ki-dollar'
}

// Get provider color
function getProviderColor(provider: string): string {
  const colors: Record<string, string> = {
    MERCADO_PAGO: 'bg-blue-500',
    STRIPE: 'bg-purple-500',
  }
  return colors[provider] || 'bg-gray-500'
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Global date range state
  const [dateRange, setDateRange] = useState<DateRange>('30d')
  const [customStartDate, setCustomStartDate] = useState<string>('')
  const [customEndDate, setCustomEndDate] = useState<string>('')

  // Calculate dates based on state
  const { startDate, endDate } = useMemo(() => {
    return calculateDateRange(dateRange, customStartDate, customEndDate)
  }, [dateRange, customStartDate, customEndDate])

  // Create the DateRangeValue object for the picker
  const dateRangeValue: DateRangeValue = useMemo(() => ({
    startDate,
    endDate,
    dateRange,
    viewMode: 'day',
    effectiveGroupBy: 'day',
  }), [startDate, endDate, dateRange])

  // Handle date range changes from picker
  const handleDateRangeChange = (value: DateRangeValue) => {
    setDateRange(value.dateRange)
    if (value.dateRange === 'custom') {
      setCustomStartDate(value.startDate)
      setCustomEndDate(value.endDate)
    }
  }

  // Fetch stats when date range changes
  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams({
          startDate,
          endDate,
        })
        const response = await fetch(`/api/dashboard/stats?${params}`)
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
  }, [startDate, endDate])

  const statCards = [
    {
      label: 'Cuentas Nuevas',
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
      label: 'Usuarios Nuevos',
      value: stats?.totalUsers || 0,
      icon: 'ki-profile-user',
      color: 'bg-purple-500',
      href: '/users',
    },
    {
      label: 'Consultas Realizadas',
      value: stats?.totalRequests || 0,
      icon: 'ki-search-list',
      color: 'bg-orange-500',
      href: '#',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page header with glassmorphism */}
      <div className="relative">
        <h1 className="text-2xl font-bold text-secondary">Dashboard</h1>
        <p className="text-gray-500 mt-1">Resumen general de la plataforma</p>
      </div>

      {/* Global date picker - full width */}
      <DateRangePicker
        value={dateRangeValue}
        onChange={handleDateRangeChange}
      />

      {/* Stats cards with glassmorphism */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <Link
            key={card.label}
            href={card.href}
            className="group relative overflow-hidden rounded-2xl bg-white/60 backdrop-blur-xl border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:bg-white/80"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Decorative gradient orb */}
            <div
              className={`absolute -top-12 -right-12 w-32 h-32 ${card.color} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity duration-300`}
            />

            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">{card.label}</p>
                  <p className="text-3xl font-bold text-secondary">
                    {isLoading ? (
                      <span className="inline-block w-20 h-9 bg-gradient-to-r from-gray-200 to-gray-100 rounded-lg animate-pulse"></span>
                    ) : (
                      typeof card.value === 'number' ? card.value.toLocaleString() : card.value
                    )}
                  </p>
                </div>
                <div
                  className={`w-14 h-14 ${card.color} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
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

              {/* Subtle bottom border accent */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 ${card.color} opacity-20 group-hover:opacity-40 transition-opacity`} />
            </div>
          </Link>
        ))}
      </div>

      {/* Revenue Card - Full Width with enhanced glassmorphism */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/80 via-white/60 to-white/40 backdrop-blur-2xl border border-white/50 shadow-2xl">
        {/* Decorative background elements */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-green-400/20 to-emerald-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-br from-blue-400/15 to-cyan-500/10 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl" />

        <div className="relative p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                  <i className="ki-duotone ki-chart-line-up text-xl text-white">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                </div>
                <h2 className="text-2xl font-bold text-secondary">Ingresos</h2>
              </div>
              <p className="text-gray-500 ml-13">Resumen de facturación del período</p>
            </div>
            <Link
              href="/billing"
              className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white/50 backdrop-blur-sm border border-white/40 text-secondary hover:bg-white/80 hover:shadow-md transition-all duration-300"
            >
              <span className="text-sm font-medium">Ver facturación</span>
              <i className="ki-duotone ki-arrow-right text-lg group-hover:translate-x-1 transition-transform">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
            </Link>
          </div>

          {isLoading ? (
            <div className="animate-pulse">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white/50 rounded-2xl p-6">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
                    <div className="h-8 bg-gray-200 rounded w-32"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Main Stats Row with enhanced glassmorphism */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Revenue */}
                <div className="group relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-2xl p-5 border border-white/50 shadow-lg hover:shadow-xl hover:bg-white/80 transition-all duration-300">
                  <div className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br from-green-400/20 to-emerald-500/10 rounded-full blur-2xl group-hover:scale-110 transition-transform" />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/25">
                        <i className="ki-duotone ki-dollar text-lg text-white">
                          <span className="path1"></span>
                          <span className="path2"></span>
                          <span className="path3"></span>
                        </i>
                      </div>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ingresos Totales</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold text-secondary">
                        ${(stats?.revenue?.total || 0).toLocaleString()}
                      </p>
                      <span className="text-sm font-semibold text-gray-400">USD</span>
                    </div>
                  </div>
                </div>

                {/* Completed Receipts */}
                <div className="group relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-2xl p-5 border border-white/50 shadow-lg hover:shadow-xl hover:bg-white/80 transition-all duration-300">
                  <div className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-cyan-500/10 rounded-full blur-2xl group-hover:scale-110 transition-transform" />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                        <i className="ki-duotone ki-check-circle text-lg text-white">
                          <span className="path1"></span>
                          <span className="path2"></span>
                        </i>
                      </div>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Pagos Completados</span>
                    </div>
                    <p className="text-3xl font-bold text-secondary">
                      {stats?.revenue?.receipts?.completed || 0}
                    </p>
                  </div>
                </div>

                {/* Pending Receipts */}
                <div className="group relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-2xl p-5 border border-white/50 shadow-lg hover:shadow-xl hover:bg-white/80 transition-all duration-300">
                  <div className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br from-amber-400/20 to-yellow-500/10 rounded-full blur-2xl group-hover:scale-110 transition-transform" />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/25">
                        <i className="ki-duotone ki-time text-lg text-white">
                          <span className="path1"></span>
                          <span className="path2"></span>
                        </i>
                      </div>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Pagos Pendientes</span>
                    </div>
                    <p className="text-3xl font-bold text-secondary">
                      {stats?.revenue?.receipts?.pending || 0}
                    </p>
                  </div>
                </div>

                {/* Conversion Rate */}
                <div className="group relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-2xl p-5 border border-white/50 shadow-lg hover:shadow-xl hover:bg-white/80 transition-all duration-300">
                  <div className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-violet-500/10 rounded-full blur-2xl group-hover:scale-110 transition-transform" />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                        <i className="ki-duotone ki-chart-pie text-lg text-white">
                          <span className="path1"></span>
                          <span className="path2"></span>
                          <span className="path3"></span>
                        </i>
                      </div>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tasa de Conversión</span>
                    </div>
                    <p className="text-3xl font-bold text-secondary">
                      {(() => {
                        const completed = stats?.revenue?.receipts?.completed || 0
                        const pending = stats?.revenue?.receipts?.pending || 0
                        const total = completed + pending
                        if (total === 0) return '0%'
                        return `${Math.round((completed / total) * 100)}%`
                      })()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Revenue by Currency and Provider with enhanced glassmorphism */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue by Currency */}
                <div className="relative overflow-hidden bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-lg">
                  <div className="absolute -top-16 -right-16 w-32 h-32 bg-gradient-to-br from-emerald-400/10 to-green-500/5 rounded-full blur-2xl" />
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg flex items-center justify-center shadow-md">
                        <i className="ki-duotone ki-wallet text-white text-sm">
                          <span className="path1"></span>
                          <span className="path2"></span>
                          <span className="path3"></span>
                          <span className="path4"></span>
                        </i>
                      </div>
                      <h3 className="text-lg font-bold text-secondary">Por Moneda</h3>
                    </div>
                    {stats?.revenue?.byCurrency && stats.revenue.byCurrency.length > 0 ? (
                      <div className="space-y-5">
                        {stats.revenue.byCurrency.map((item) => {
                          const maxTotal = Math.max(...stats.revenue.byCurrency.map((c) => c.total))
                          const percentage = maxTotal > 0 ? (item.total / maxTotal) * 100 : 0
                          return (
                            <div key={item.currency} className="group">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                  <span className="text-sm font-bold text-secondary bg-white/60 px-2 py-1 rounded-lg">
                                    {item.currency}
                                  </span>
                                  <span className="text-xs text-gray-400 font-medium">
                                    {item.count} {item.count === 1 ? 'pago' : 'pagos'}
                                  </span>
                                </div>
                                <span className="text-base font-bold text-secondary">
                                  {formatCurrency(item.total, item.currency)}
                                </span>
                              </div>
                              <div className="w-full h-3 bg-gray-100/80 rounded-full overflow-hidden shadow-inner">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600 transition-all duration-700 ease-out group-hover:shadow-lg group-hover:shadow-green-500/30"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-12 text-gray-400">
                        <div className="text-center">
                          <div className="w-16 h-16 rounded-2xl bg-gray-100/80 flex items-center justify-center mx-auto mb-4">
                            <i className="ki-duotone ki-wallet text-3xl opacity-40">
                              <span className="path1"></span>
                              <span className="path2"></span>
                              <span className="path3"></span>
                              <span className="path4"></span>
                            </i>
                          </div>
                          <p className="text-sm font-medium">Sin ingresos en este período</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Revenue by Payment Provider */}
                <div className="relative overflow-hidden bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-lg">
                  <div className="absolute -top-16 -right-16 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-500/5 rounded-full blur-2xl" />
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center shadow-md">
                        <i className="ki-duotone ki-credit-cart text-white text-sm">
                          <span className="path1"></span>
                          <span className="path2"></span>
                        </i>
                      </div>
                      <h3 className="text-lg font-bold text-secondary">Por Método de Pago</h3>
                    </div>
                    {stats?.revenue?.byProvider && stats.revenue.byProvider.length > 0 ? (
                      <div className="space-y-5">
                        {stats.revenue.byProvider.map((item) => {
                          const maxTotal = Math.max(...stats.revenue.byProvider.map((p) => p.total))
                          const percentage = maxTotal > 0 ? (item.total / maxTotal) * 100 : 0
                          return (
                            <div key={item.provider} className="group">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-10 h-10 ${getProviderColor(item.provider)} rounded-xl flex items-center justify-center text-white shadow-lg`}
                                  >
                                    <i className={`ki-duotone ${getProviderIcon(item.provider)} text-lg`}>
                                      <span className="path1"></span>
                                      <span className="path2"></span>
                                      <span className="path3"></span>
                                    </i>
                                  </div>
                                  <div>
                                    <span className="text-sm font-bold text-secondary block">
                                      {getProviderName(item.provider)}
                                    </span>
                                    <span className="text-xs text-gray-400 font-medium">
                                      {item.count} {item.count === 1 ? 'transacción' : 'transacciones'}
                                    </span>
                                  </div>
                                </div>
                                <span className="text-base font-bold text-secondary">
                                  ${item.total.toLocaleString()}
                                </span>
                              </div>
                              <div className="w-full h-3 bg-gray-100/80 rounded-full overflow-hidden shadow-inner">
                                <div
                                  className={`h-full rounded-full ${getProviderColor(item.provider)} transition-all duration-700 ease-out group-hover:shadow-lg`}
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-12 text-gray-400">
                        <div className="text-center">
                          <div className="w-16 h-16 rounded-2xl bg-gray-100/80 flex items-center justify-center mx-auto mb-4">
                            <i className="ki-duotone ki-credit-cart text-3xl opacity-40">
                              <span className="path1"></span>
                              <span className="path2"></span>
                            </i>
                          </div>
                          <p className="text-sm font-medium">Sin pagos en este período</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Consumption Chart - Main feature */}
      <ConsumptionChart
        startDate={startDate}
        endDate={endDate}
        dateRange={dateRange}
      />

      {/* Quick actions with glassmorphism */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/80 via-white/60 to-white/40 backdrop-blur-2xl border border-white/50 shadow-xl">
        {/* Decorative background elements */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-gradient-to-br from-primary/10 to-pink-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-gradient-to-br from-blue-400/10 to-cyan-500/5 rounded-full blur-3xl" />

        <div className="relative p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg">
              <i className="ki-duotone ki-rocket text-xl text-white">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
            </div>
            <h2 className="text-xl font-bold text-secondary">Acciones Rápidas</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/accounts/new"
              className="group relative overflow-hidden flex flex-col items-center p-6 bg-white/50 backdrop-blur-sm border border-white/40 rounded-2xl hover:bg-white/80 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
            >
              <div className="absolute -top-8 -right-8 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-cyan-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/25 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <i className="ki-duotone ki-plus-square text-2xl text-white">
                  <span className="path1"></span>
                  <span className="path2"></span>
                  <span className="path3"></span>
                </i>
              </div>
              <span className="text-sm font-semibold text-secondary">Nueva Cuenta</span>
            </Link>

            <Link
              href="/benefits/new"
              className="group relative overflow-hidden flex flex-col items-center p-6 bg-white/50 backdrop-blur-sm border border-white/40 rounded-2xl hover:bg-white/80 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
            >
              <div className="absolute -top-8 -right-8 w-20 h-20 bg-gradient-to-br from-green-400/20 to-emerald-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-green-500/25 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <i className="ki-duotone ki-gift text-2xl text-white">
                  <span className="path1"></span>
                  <span className="path2"></span>
                  <span className="path3"></span>
                  <span className="path4"></span>
                </i>
              </div>
              <span className="text-sm font-semibold text-secondary">Nuevo Beneficio</span>
            </Link>

            <Link
              href="/services"
              className="group relative overflow-hidden flex flex-col items-center p-6 bg-white/50 backdrop-blur-sm border border-white/40 rounded-2xl hover:bg-white/80 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
            >
              <div className="absolute -top-8 -right-8 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-violet-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative w-14 h-14 bg-gradient-to-br from-purple-400 to-violet-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/25 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <i className="ki-duotone ki-setting-2 text-2xl text-white">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
              </div>
              <span className="text-sm font-semibold text-secondary">Gestionar Servicios</span>
            </Link>

            <Link
              href="/billing"
              className="group relative overflow-hidden flex flex-col items-center p-6 bg-white/50 backdrop-blur-sm border border-white/40 rounded-2xl hover:bg-white/80 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
            >
              <div className="absolute -top-8 -right-8 w-20 h-20 bg-gradient-to-br from-orange-400/20 to-amber-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative w-14 h-14 bg-gradient-to-br from-orange-400 to-amber-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-orange-500/25 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <i className="ki-duotone ki-chart-line-up text-2xl text-white">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
              </div>
              <span className="text-sm font-semibold text-secondary">Ver Facturación</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
