'use client'

import React, { useState, useMemo } from 'react'
import { getBankImage } from '@/lib/utils/bankUtils'
import { formatCurrency } from '@/lib/utils/currencyUtils'
import Image from 'next/image'
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

interface BankData {
  name: string
  period?: number
  loan?: number
  situation?: string
}

interface DebtHistoryProps {
  bcraInfo: BankData[]
}

interface ViewMode {
  type: 'year' | 'month'
  year: number
  month?: number
}

interface ChartDataPoint {
  period: string
  timestamp: number
  totalDebt: number
  banks: {
    name: string
    amount: number
    image?: string | null
  }[]
}

export default function DebtHistory({ bcraInfo }: DebtHistoryProps) {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()

  const [viewMode, setViewMode] = useState<ViewMode>({
    type: 'year',
    year: currentYear
  })

  // Format period key for grouping
  const formatPeriod = (timestamp: number, mode: 'year' | 'month') => {
    const date = new Date(timestamp)
    if (mode === 'year') {
      return date.getFullYear().toString()
    } else {
      const year = date.getFullYear()
      const month = date.getMonth()
      return `${year}-${month.toString().padStart(2, '0')}`
    }
  }

  // Format for display in chart
  const formatDisplayPeriod = (periodKey: string, mode: 'year' | 'month') => {
    if (mode === 'year') {
      return periodKey
    } else {
      const [year, month] = periodKey.split('-')
      const date = new Date(parseInt(year), parseInt(month), 1)
      return date.toLocaleDateString('es-AR', {
        month: 'short',
        year: 'numeric'
      })
    }
  }

  // Process data for chart based on view mode
  const chartData = useMemo(() => {
    if (!bcraInfo || bcraInfo.length === 0) return []

    if (viewMode.type === 'month') {
      // Monthly mode: group by month
      const groupedData = new Map<string, ChartDataPoint>()

      bcraInfo.forEach(item => {
        if (!item.period || !item.loan || item.loan === 0) return

        const periodKey = formatPeriod(item.period, 'month')

        if (!groupedData.has(periodKey)) {
          groupedData.set(periodKey, {
            period: formatDisplayPeriod(periodKey, 'month'),
            timestamp: item.period,
            totalDebt: 0,
            banks: []
          })
        }

        const dataPoint = groupedData.get(periodKey)!

        // Check if bank already exists in this period
        const existingBankIndex = dataPoint.banks.findIndex(b => b.name === item.name)

        if (existingBankIndex >= 0) {
          dataPoint.banks[existingBankIndex].amount += item.loan
        } else {
          dataPoint.banks.push({
            name: item.name,
            amount: item.loan,
            image: getBankImage(item.name)
          })
        }

        dataPoint.totalDebt += item.loan
      })

      return Array.from(groupedData.values())
        .sort((a, b) => a.timestamp - b.timestamp)
    } else {
      // Annual mode: take the last record of each year
      const yearlyData = new Map<number, BankData[]>()

      // Group records by year
      bcraInfo.forEach(item => {
        if (!item.period || !item.loan || item.loan === 0) return

        const date = new Date(item.period)
        const year = date.getFullYear()

        if (!yearlyData.has(year)) {
          yearlyData.set(year, [])
        }
        yearlyData.get(year)!.push(item)
      })

      // For each year, take the most recent record
      const result: ChartDataPoint[] = []

      yearlyData.forEach((items, year) => {
        // Sort by date descending
        items.sort((a, b) => b.period! - a.period!)

        // For current year, filter by current month
        let relevantItems = items
        if (year === currentYear) {
          relevantItems = items.filter(item => {
            const itemMonth = new Date(item.period!).getMonth()
            return itemMonth === currentMonth
          })
          // If no data for current month, use last available record
          if (relevantItems.length === 0) {
            relevantItems = items
          }
        }

        // Take the most recent record
        const latestTimestamp = relevantItems[0].period!

        // Group banks from same period
        const banksMap = new Map<string, number>()
        let totalDebt = 0

        relevantItems.forEach(item => {
          // Only include records from same month/year as most recent
          if (item.period === latestTimestamp && item.loan) {
            const currentAmount = banksMap.get(item.name) || 0
            banksMap.set(item.name, currentAmount + item.loan)
            totalDebt += item.loan
          }
        })

        // Convert to banks format
        const banks = Array.from(banksMap.entries()).map(([name, amount]) => ({
          name,
          amount,
          image: getBankImage(name)
        }))

        result.push({
          period: year.toString(),
          timestamp: latestTimestamp,
          totalDebt,
          banks
        })
      })

      return result.sort((a, b) => a.timestamp - b.timestamp)
    }
  }, [bcraInfo, viewMode.type, currentYear, currentMonth])

  // Get available date range
  const dateRange = useMemo(() => {
    if (!bcraInfo || bcraInfo.length === 0) return { minYear: currentYear, maxYear: currentYear }

    const years = bcraInfo
      .filter(item => item.period)
      .map(item => new Date(item.period!).getFullYear())

    return {
      minYear: Math.min(...years),
      maxYear: Math.max(...years)
    }
  }, [bcraInfo, currentYear])

  // Filter data based on selected view
  const filteredChartData = useMemo(() => {
    return chartData.filter(item => {
      const itemDate = new Date(item.timestamp)
      const itemYear = itemDate.getFullYear()

      if (viewMode.type === 'year') {
        return true
      } else {
        return itemYear === viewMode.year
      }
    })
  }, [chartData, viewMode.type, viewMode.year])

  // Navigation functions
  const navigatePrevious = () => {
    if (viewMode.year > dateRange.minYear) {
      setViewMode(prev => ({ ...prev, year: prev.year - 1 }))
    }
  }

  const navigateNext = () => {
    if (viewMode.year < dateRange.maxYear) {
      setViewMode(prev => ({ ...prev, year: prev.year + 1 }))
    }
  }

  const canNavigatePrevious = () => {
    if (viewMode.type === 'year') return false
    return viewMode.year > dateRange.minYear
  }

  const canNavigateNext = () => {
    if (viewMode.type === 'year') return false
    return viewMode.year < dateRange.maxYear
  }

  // Change view type
  const changeViewType = (newType: 'year' | 'month') => {
    if (newType === 'month' && viewMode.type === 'year') {
      const month = viewMode.year === currentYear ? currentMonth : 0
      setViewMode({ type: 'month', year: viewMode.year, month })
    } else if (newType === 'year' && viewMode.type === 'month') {
      setViewMode({ type: 'year', year: viewMode.year })
    }
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartDataPoint

      return (
        <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-lg">
          <p className="font-medium text-slate-800 mb-2">{label}</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm">Total: {formatCurrency(data.totalDebt, 'ARS')}</span>
            </div>
            {data.banks.length > 0 && (
              <div className="border-t border-slate-100 pt-2 mt-2">
                <p className="text-xs text-slate-500 mb-1">Por entidad:</p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {[...data.banks]
                    .sort((a, b) => b.amount - a.amount)
                    .slice(0, 5)
                    .map((bank, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        {bank.image ? (
                          <Image
                            src={bank.image}
                            alt={bank.name}
                            width={16}
                            height={16}
                            className="w-4 h-4 object-contain"
                            unoptimized
                          />
                        ) : (
                          <div className="w-4 h-4 bg-slate-100 rounded-sm flex items-center justify-center">
                            <i className="ki-duotone ki-bank text-xs text-slate-400"></i>
                          </div>
                        )}
                        <span className="truncate flex-1">{bank.name}</span>
                        <span className="font-medium">{formatCurrency(bank.amount, 'ARS')}</span>
                      </div>
                    ))}
                  {data.banks.length > 5 && (
                    <div className="text-xs text-slate-400 pl-6">
                      +{data.banks.length - 5} mas...
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )
    }
    return null
  }

  if (!bcraInfo || bcraInfo.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 border border-slate-200 rounded-xl">
        <div className="space-y-2">
          <div className="text-slate-400">
            <i className="ki-duotone ki-chart-line text-4xl"></i>
          </div>
          <p className="text-slate-500 font-medium">No hay datos de historial de deuda</p>
          <p className="text-sm text-slate-400">Los datos apareceran aqui cuando esten disponibles</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-base font-medium text-gray-900">Historial de Deuda</h3>
            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
              Evolucion
            </span>
          </div>
          <div className="h-0.5 bg-gradient-to-r from-amber-500 via-amber-400 to-transparent w-16"></div>
        </div>

        {/* View controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* View type selector */}
          <div className="inline-flex bg-gray-50 rounded-lg p-0.5 border border-gray-200">
            <button
              onClick={() => changeViewType('year')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${viewMode.type === 'year'
                ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
            >
              Anual
            </button>
            <button
              onClick={() => changeViewType('month')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${viewMode.type === 'month'
                ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
            >
              Mensual
            </button>
          </div>

          {/* Navigation controls */}
          <div className="flex items-center">
            {viewMode.type === 'month' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={navigatePrevious}
                  disabled={!canNavigatePrevious()}
                  className={`p-2 rounded-md transition-all duration-200 ${canNavigatePrevious()
                    ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                    : 'text-gray-200 cursor-not-allowed'
                    }`}
                >
                  <i className="ki-duotone ki-left text-base"></i>
                </button>

                <div className="px-3 py-1 text-sm font-medium text-gray-700 min-w-[60px] text-center">
                  {viewMode.year}
                </div>

                <button
                  onClick={navigateNext}
                  disabled={!canNavigateNext()}
                  className={`p-2 rounded-md transition-all duration-200 ${canNavigateNext()
                    ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                    : 'text-gray-200 cursor-not-allowed'
                    }`}
                >
                  <i className="ki-duotone ki-right text-base"></i>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-gradient-to-br from-amber-50/30 to-orange-50/20 backdrop-blur-lg border border-amber-100/30 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={filteredChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="period"
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickFormatter={(value) => {
                  if (value >= 1000000) {
                    return `$${(value / 1000000).toFixed(1)}M`
                  } else if (value >= 1000) {
                    return `$${(value / 1000).toFixed(0)}K`
                  } else {
                    return `$${value}`
                  }
                }}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              <Line
                type="monotone"
                dataKey="totalDebt"
                stroke="#eb1034"
                strokeWidth={3}
                dot={{ fill: '#eb1034', r: 6 }}
                name="Deuda Total"
                connectNulls={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
