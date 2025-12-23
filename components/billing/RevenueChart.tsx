'use client'

import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { formatCurrency } from '@/lib/utils/currencyUtils'

interface RevenueDataPoint {
  date: string
  revenue: number
  count: number
  currency: string
}

interface RevenueChartProps {
  data: RevenueDataPoint[]
  isLoading?: boolean
}

const CURRENCY_COLORS: Record<string, string> = {
  ARS: '#10B981',
  USD: '#3B82F6',
  EUR: '#8B5CF6',
  BRL: '#F59E0B',
}

const MONTH_NAMES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

function formatDateLabel(dateStr: string): string {
  const parts = dateStr.split('-')
  if (parts.length === 2) {
    // Month format: "2024-11"
    const monthIndex = parseInt(parts[1], 10) - 1
    return `${MONTH_NAMES[monthIndex]} ${parts[0].slice(-2)}`
  }
  // Day format: "2024-11-25"
  const date = new Date(dateStr + 'T00:00:00')
  const day = date.getDate()
  const month = MONTH_NAMES[date.getMonth()]
  return `${day} ${month}`
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ dataKey: string; value: number; color: string; payload: { count?: number } }>
  label?: string
}) => {
  if (!active || !payload || !payload.length) return null

  return (
    <div className="bg-white/90 backdrop-blur-xl border border-white/20 rounded-xl shadow-xl p-4 min-w-[200px]">
      <p className="text-sm font-semibold text-secondary mb-3 pb-2 border-b border-gray-100">
        {label}
      </p>
      <div className="space-y-2">
        {payload.map((entry) => {
          const currency = entry.dataKey
          return (
            <div key={entry.dataKey} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-600">{currency}</span>
              </div>
              <span className="text-sm font-semibold text-secondary">
                {formatCurrency(entry.value, currency, { showCurrencyCode: false })}
              </span>
            </div>
          )
        })}
      </div>
      {payload[0]?.payload.count !== undefined && (
        <div className="mt-3 pt-2 border-t border-gray-100 text-xs text-gray-400">
          {payload[0].payload.count} transacciones
        </div>
      )}
    </div>
  )
}

export default function RevenueChart({ data, isLoading }: RevenueChartProps) {
  // Transform data: group by date and pivot currencies
  const chartData = useMemo(() => {
    if (!data?.length) return []

    const groupedByDate = new Map<string, Record<string, number> & { count: number }>()

    data.forEach((point) => {
      const existing = groupedByDate.get(point.date) || { count: 0 }
      existing[point.currency] = (existing[point.currency] || 0) + point.revenue
      existing.count += point.count
      groupedByDate.set(point.date, existing)
    })

    return Array.from(groupedByDate.entries())
      .map(([date, values]) => ({
        date: formatDateLabel(date),
        ...values,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [data])

  // Get unique currencies
  const currencies = useMemo(() => {
    const currencySet = new Set<string>()
    data?.forEach((point) => currencySet.add(point.currency))
    return Array.from(currencySet)
  }, [data])

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="h-[300px] bg-gray-100 rounded-xl"></div>
        </div>
      </div>
    )
  }

  if (!chartData.length) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-secondary mb-4">Ingresos en el Tiempo</h3>
        <div className="flex items-center justify-center h-[300px] text-gray-400">
          <div className="text-center">
            <i className="ki-duotone ki-chart-line-up text-4xl mb-2">
              <span className="path1"></span>
              <span className="path2"></span>
            </i>
            <p>No hay datos para el período seleccionado</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-secondary mb-4">Ingresos en el Tiempo</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              {currencies.map((currency) => (
                <linearGradient
                  key={currency}
                  id={`gradient-${currency}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor={CURRENCY_COLORS[currency] || '#6B7280'}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="100%"
                    stopColor={CURRENCY_COLORS[currency] || '#6B7280'}
                    stopOpacity={0.05}
                  />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
              tickFormatter={(value) =>
                value >= 1000000
                  ? `${(value / 1000000).toFixed(1)}M`
                  : value >= 1000
                    ? `${(value / 1000).toFixed(0)}K`
                    : value.toString()
              }
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => <span className="text-sm text-gray-600">{value}</span>}
            />
            {currencies.map((currency) => (
              <Area
                key={currency}
                type="monotone"
                dataKey={currency}
                stroke={CURRENCY_COLORS[currency] || '#6B7280'}
                strokeWidth={2}
                fill={`url(#gradient-${currency})`}
                animationDuration={500}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
