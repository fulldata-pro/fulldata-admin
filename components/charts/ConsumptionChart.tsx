'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { ServiceLabels, ServiceColors, ServiceType, ServicesType } from '@/lib/constants'

interface ConsumptionDataPoint {
  date: string
  services: Record<string, number>
  total: number
}

interface ConsumptionByService {
  serviceType: string
  count: number
  tokens: number
}

interface ConsumptionData {
  data: ConsumptionDataPoint[]
  totals: ConsumptionByService[]
  grandTotal: number
}

type ViewMode = 'day' | 'month'
type DateRange = '7d' | '30d' | '90d' | '12m' | 'custom'

interface ConsumptionChartProps {
  startDate: string
  endDate: string
  dateRange: DateRange
}

const SERVICE_ORDER: ServiceType[] = [
  ServicesType.PEOPLE,
  ServicesType.COMPANIES,
  ServicesType.VEHICLES,
  ServicesType.PHONES,
  ServicesType.BANKS,
  ServicesType.OSINT,
  ServicesType.IDENTITY,
]

// Custom tooltip with glassmorphism
const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ dataKey: string; value: number; color: string }>
  label?: string
}) => {
  if (!active || !payload || !payload.length) return null

  const total = payload.reduce((sum, entry) => sum + (entry.value || 0), 0)
  const filteredPayload = payload.filter((entry) => entry.value > 0)

  if (filteredPayload.length === 0) return null

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-5 min-w-[220px]">
      <p className="text-base font-bold text-secondary mb-4 pb-3 border-b border-gray-200/50">
        {label}
      </p>
      <div className="space-y-3">
        {filteredPayload.map((entry) => {
          const serviceType = entry.dataKey as ServiceType
          const serviceLabel = ServiceLabels[serviceType] || entry.dataKey
          const percentage = total > 0 ? ((entry.value / total) * 100).toFixed(1) : '0'
          return (
            <div key={entry.dataKey} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full shadow-sm"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm font-medium text-gray-700">{serviceLabel}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-secondary">
                  {entry.value.toLocaleString()}
                </span>
                <span className="text-xs text-gray-400">({percentage}%)</span>
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-4 pt-3 border-t border-gray-200/50 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-500">Total</span>
        <span className="text-base font-bold text-secondary">{total.toLocaleString()}</span>
      </div>
    </div>
  )
}

// Custom legend with glassmorphism
const CustomLegend = ({
  activeServices,
  onToggle,
  totals,
}: {
  activeServices: Set<string>
  onToggle: (service: string) => void
  totals: ConsumptionByService[]
}) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center mt-6 px-4">
      {SERVICE_ORDER.map((service) => {
        const isActive = activeServices.has(service)
        const color = ServiceColors[service]
        const label = ServiceLabels[service]
        const total = totals.find((t) => t.serviceType === service)?.count || 0

        return (
          <button
            key={service}
            onClick={() => onToggle(service)}
            className={`group flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-white/80 backdrop-blur-sm shadow-md border border-white/30 text-secondary'
                : 'bg-gray-100/50 text-gray-400 hover:bg-gray-100'
            }`}
          >
            <div
              className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                isActive ? 'scale-100' : 'scale-75 opacity-40'
              }`}
              style={{ backgroundColor: color }}
            />
            <span>{label}</span>
            {isActive && total > 0 && (
              <span className="text-xs text-gray-400 font-normal">
                ({total.toLocaleString()})
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export default function ConsumptionChart({ startDate, endDate, dateRange }: ConsumptionChartProps) {
  const [data, setData] = useState<ConsumptionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeServices, setActiveServices] = useState<Set<string>>(new Set(SERVICE_ORDER))
  const [viewMode, setViewMode] = useState<'day' | 'month'>('day')

  // Determine if view mode toggle should be shown (only for short ranges)
  const canToggleViewMode = dateRange !== '12m' && dateRange !== '90d'

  // Calculate effective groupBy based on dateRange and viewMode
  const effectiveGroupBy = useMemo(() => {
    if (dateRange === '12m' || dateRange === '90d') {
      return 'month'
    }
    return viewMode
  }, [dateRange, viewMode])

  // Auto-adjust viewMode when dateRange changes
  useEffect(() => {
    if (dateRange === '12m' || dateRange === '90d') {
      setViewMode('month')
    } else if (dateRange === '7d') {
      setViewMode('day')
    }
  }, [dateRange])

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({
          startDate,
          endDate,
          groupBy: effectiveGroupBy,
        })

        const response = await fetch(`/api/dashboard/consumption?${params}`)

        if (!response.ok) {
          throw new Error('Error al obtener datos')
        }

        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [startDate, endDate, effectiveGroupBy])

  // Transform data for chart - fill in missing dates
  const chartData = useMemo(() => {
    if (!data?.data) return []

    // Create a map of existing data points by date
    const dataByDate = new Map(data.data.map((point) => [point.date, point]))

    // Generate all dates in range
    const allDates = generateDateRange(startDate, endDate, effectiveGroupBy)

    return allDates.map((dateKey) => {
      const point = dataByDate.get(dateKey)
      const isMonthFormat = dateKey.split('-').length === 2
      const formattedDate = isMonthFormat
        ? formatMonthLabel(dateKey)
        : formatDayLabel(dateKey)

      return {
        date: formattedDate,
        ...SERVICE_ORDER.reduce(
          (acc, service) => {
            acc[service] = point?.services[service] || 0
            return acc
          },
          {} as Record<string, number>
        ),
      }
    })
  }, [data, startDate, endDate, effectiveGroupBy])

  const toggleService = (service: string) => {
    setActiveServices((prev) => {
      const next = new Set(prev)
      if (next.has(service)) {
        if (next.size > 1) {
          next.delete(service)
        }
      } else {
        next.add(service)
      }
      return next
    })
  }

  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/60 to-white/30 backdrop-blur-xl border border-white/20 shadow-xl p-8">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="h-7 bg-gray-200/60 rounded-lg w-48 mb-3"></div>
              <div className="h-4 bg-gray-100/60 rounded w-32"></div>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-3 mb-8">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-100/60 rounded-2xl"></div>
            ))}
          </div>
          <div className="h-[350px] bg-gray-100/40 rounded-2xl"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/60 to-white/30 backdrop-blur-xl border border-white/20 shadow-xl p-8">
        <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <i className="ki-duotone ki-information-2 text-3xl text-red-400">
              <span className="path1"></span>
              <span className="path2"></span>
              <span className="path3"></span>
            </i>
          </div>
          <p className="text-lg font-medium text-gray-600">{error}</p>
          <p className="text-sm text-gray-400 mt-1">Intenta recargar la página</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-xl border border-white/30 shadow-xl">
      {/* Decorative background elements */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl" />

      <div className="relative p-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-secondary">Consumo por Servicio</h2>
            <p className="text-gray-500 mt-1">
              <span className="text-xl font-semibold text-secondary">
                {data?.grandTotal.toLocaleString() || 0}
              </span>{' '}
              consultas en el período seleccionado
            </p>
          </div>

          {/* View mode toggle - only show when applicable */}
          {canToggleViewMode && (
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('day')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  viewMode === 'day'
                    ? 'bg-white text-secondary shadow-sm'
                    : 'text-gray-400 hover:text-secondary'
                }`}
              >
                <i className="ki-duotone ki-calendar text-base">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
                Día
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  viewMode === 'month'
                    ? 'bg-white text-secondary shadow-sm'
                    : 'text-gray-400 hover:text-secondary'
                }`}
              >
                <i className="ki-duotone ki-calendar-2 text-base">
                  <span className="path1"></span>
                  <span className="path2"></span>
                  <span className="path3"></span>
                  <span className="path4"></span>
                  <span className="path5"></span>
                </i>
                Mes
              </button>
            </div>
          )}
        </div>

        {/* Stats cards with glassmorphism */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          {SERVICE_ORDER.map((service) => {
            const total = data?.totals.find((t) => t.serviceType === service)
            const color = ServiceColors[service]
            const label = ServiceLabels[service]
            const count = total?.count || 0
            const isActive = activeServices.has(service)
            const grandTotal = data?.grandTotal || 1
            const percentage = grandTotal > 0 ? ((count / grandTotal) * 100).toFixed(1) : '0'

            return (
              <button
                key={service}
                onClick={() => toggleService(service)}
                className={`relative overflow-hidden rounded-2xl p-4 transition-all duration-300 text-left ${
                  isActive
                    ? 'bg-white/70 backdrop-blur-sm shadow-lg border border-white/40 scale-100'
                    : 'bg-white/30 backdrop-blur-sm border border-white/20 scale-95 opacity-60'
                } hover:scale-100 hover:opacity-100`}
              >
                {/* Color accent bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                  style={{ backgroundColor: color }}
                />
                {/* Subtle background gradient */}
                <div
                  className="absolute inset-0 opacity-10 rounded-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${color}40 0%, transparent 60%)`,
                  }}
                />
                <div className="relative">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    {label}
                  </p>
                  <p className="text-2xl font-bold text-secondary">{count.toLocaleString()}</p>
                  <p className="text-xs text-gray-400 mt-1">{percentage}% del total</p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Chart container with glassmorphism */}
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
          <div className="h-[350px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    {SERVICE_ORDER.map((service) => (
                      <linearGradient
                        key={service}
                        id={`gradient-${service}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor={ServiceColors[service]} stopOpacity={0.4} />
                        <stop offset="100%" stopColor={ServiceColors[service]} stopOpacity={0.05} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 500 }}
                    dy={10}
                    interval={effectiveGroupBy === 'month' ? 0 : 'preserveStartEnd'}
                    angle={chartData.length > 12 ? -45 : 0}
                    textAnchor={chartData.length > 12 ? 'end' : 'middle'}
                    height={chartData.length > 12 ? 60 : 30}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 500 }}
                    dx={-10}
                    tickFormatter={(value) =>
                      value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toString()
                    }
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ stroke: '#9CA3AF', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  {SERVICE_ORDER.filter((s) => activeServices.has(s)).map((service, index) => (
                    <Area
                      key={service}
                      type="monotone"
                      dataKey={service}
                      stroke={ServiceColors[service]}
                      strokeWidth={2.5}
                      fill={`url(#gradient-${service})`}
                      stackId="1"
                      animationDuration={800}
                      animationBegin={index * 100}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-gray-100/80 flex items-center justify-center mx-auto mb-4">
                    <i className="ki-duotone ki-chart-line-up-2 text-4xl text-gray-300">
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                  </div>
                  <p className="text-gray-500 font-medium">No hay datos para el período</p>
                  <p className="text-sm text-gray-400 mt-1">Selecciona otro rango de fechas</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <CustomLegend
          activeServices={activeServices}
          onToggle={toggleService}
          totals={data?.totals || []}
        />
      </div>
    </div>
  )
}

// Helper functions for date formatting
function formatDayLabel(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  const day = date.getDate()
  const month = date.toLocaleDateString('es', { month: 'short' })
  return `${day} ${month}`
}

const MONTH_NAMES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

function formatMonthLabel(dateStr: string): string {
  // dateStr format: "2024-11" or "2024-11-25"
  const parts = dateStr.split('-')
  const year = parts[0]
  const monthIndex = parseInt(parts[1], 10) - 1
  const monthName = MONTH_NAMES[monthIndex] || parts[1]
  const shortYear = year.slice(-2)
  return `${monthName} ${shortYear}`
}

// Generate all dates in a range (for filling gaps)
function generateDateRange(startDateStr: string, endDateStr: string, groupBy: 'day' | 'month'): string[] {
  const dates: string[] = []
  const start = new Date(startDateStr + 'T00:00:00')
  const end = new Date(endDateStr + 'T00:00:00')

  if (groupBy === 'month') {
    // Generate months
    const current = new Date(start.getFullYear(), start.getMonth(), 1)
    while (current <= end) {
      const year = current.getFullYear()
      const month = String(current.getMonth() + 1).padStart(2, '0')
      dates.push(`${year}-${month}`)
      current.setMonth(current.getMonth() + 1)
    }
  } else {
    // Generate days
    const current = new Date(start)
    while (current <= end) {
      const year = current.getFullYear()
      const month = String(current.getMonth() + 1).padStart(2, '0')
      const day = String(current.getDate()).padStart(2, '0')
      dates.push(`${year}-${month}-${day}`)
      current.setDate(current.getDate() + 1)
    }
  }

  return dates
}
