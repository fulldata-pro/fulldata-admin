'use client'

import { useState, useMemo } from 'react'

export type DateRange = '7d' | '30d' | '90d' | '12m' | 'custom'
export type ViewMode = 'day' | 'month'

export interface DateRangeValue {
  startDate: string
  endDate: string
  dateRange: DateRange
  viewMode: ViewMode
  effectiveGroupBy: ViewMode
}

interface DateRangePickerProps {
  value: DateRangeValue
  onChange: (value: DateRangeValue) => void
  showViewMode?: boolean
}

const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: '7d', label: '7 días' },
  { value: '30d', label: '30 días' },
  { value: '90d', label: '90 días' },
  { value: '12m', label: '12 meses' },
  { value: 'custom', label: 'Personalizado' },
]

export function useDateRange(initialRange: DateRange = '30d'): [DateRangeValue, (value: Partial<DateRangeValue>) => void] {
  const [dateRange, setDateRange] = useState<DateRange>(initialRange)
  const [viewMode, setViewMode] = useState<ViewMode>('day')
  const [customStartDate, setCustomStartDate] = useState<string>('')
  const [customEndDate, setCustomEndDate] = useState<string>('')

  const value = useMemo(() => {
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
          return {
            startDate: customStartDate,
            endDate: customEndDate,
            dateRange,
            viewMode,
            effectiveGroupBy: viewMode,
          }
        }
        start.setDate(end.getDate() - 30)
        break
    }

    const effectiveGroupBy = dateRange === '12m' || dateRange === '90d' ? 'month' : viewMode

    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      dateRange,
      viewMode,
      effectiveGroupBy,
    }
  }, [dateRange, viewMode, customStartDate, customEndDate])

  const updateValue = (partial: Partial<DateRangeValue>) => {
    if (partial.dateRange !== undefined) {
      setDateRange(partial.dateRange)
      // Auto switch view mode for longer ranges
      if (partial.dateRange === '12m' || partial.dateRange === '90d') {
        setViewMode('month')
      } else if (partial.dateRange === '7d') {
        setViewMode('day')
      }
    }
    if (partial.viewMode !== undefined) {
      setViewMode(partial.viewMode)
    }
    if (partial.startDate !== undefined && partial.dateRange === 'custom') {
      setCustomStartDate(partial.startDate)
    }
    if (partial.endDate !== undefined && partial.dateRange === 'custom') {
      setCustomEndDate(partial.endDate)
    }
  }

  return [value, updateValue]
}

export default function DateRangePicker({ value, onChange, showViewMode = true }: DateRangePickerProps) {
  const handleDateRangeChange = (newRange: DateRange) => {
    const end = new Date()
    const start = new Date()
    let newViewMode = value.viewMode

    switch (newRange) {
      case '7d':
        start.setDate(end.getDate() - 7)
        newViewMode = 'day'
        break
      case '30d':
        start.setDate(end.getDate() - 30)
        break
      case '90d':
        start.setDate(end.getDate() - 90)
        newViewMode = 'month'
        break
      case '12m':
        start.setMonth(end.getMonth() - 12)
        newViewMode = 'month'
        break
      case 'custom':
        break
    }

    const effectiveGroupBy = newRange === '12m' || newRange === '90d' ? 'month' : newViewMode

    onChange({
      startDate: newRange === 'custom' ? value.startDate : start.toISOString().split('T')[0],
      endDate: newRange === 'custom' ? value.endDate : end.toISOString().split('T')[0],
      dateRange: newRange,
      viewMode: newViewMode,
      effectiveGroupBy,
    })
  }

  const handleViewModeChange = (newMode: ViewMode) => {
    const effectiveGroupBy = value.dateRange === '12m' || value.dateRange === '90d' ? 'month' : newMode
    onChange({
      ...value,
      viewMode: newMode,
      effectiveGroupBy,
    })
  }

  const handleCustomDateChange = (type: 'start' | 'end', date: string) => {
    const newValue = {
      ...value,
      [type === 'start' ? 'startDate' : 'endDate']: date,
    }
    onChange(newValue)
  }

  return (
    <div className="w-full">
      {/* Main container with glassmorphism */}
      <div className="relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-xl border border-white/50 shadow-lg">
        {/* Decorative gradient */}
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-gradient-to-br from-primary/10 to-pink-500/5 rounded-full blur-2xl" />
        <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-gradient-to-br from-blue-400/10 to-cyan-500/5 rounded-full blur-2xl" />

        <div className="relative flex items-center justify-between gap-4 p-2">
          {/* Date range options */}
          <div className="flex items-center flex-1 bg-white/40 rounded-xl p-1">
            {DATE_RANGE_OPTIONS.map((option, index) => (
              <button
                key={option.value}
                onClick={() => handleDateRangeChange(option.value)}
                className={`flex-1 px-4 py-2.5 text-sm font-semibold transition-all duration-300 rounded-lg ${
                  value.dateRange === option.value
                    ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg shadow-primary/25'
                    : 'text-gray-500 hover:text-secondary hover:bg-white/60'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Custom date inputs with glassmorphism */}
      {value.dateRange === 'custom' && (
        <div className="flex items-center gap-4 mt-3 p-4 bg-white/60 backdrop-blur-xl rounded-xl border border-white/50 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
              <i className="ki-duotone ki-calendar text-primary text-sm">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
            </div>
            <label className="text-sm font-semibold text-gray-500">Desde:</label>
            <input
              type="date"
              value={value.startDate}
              onChange={(e) => handleCustomDateChange('start', e.target.value)}
              className="px-4 py-2.5 bg-white/80 backdrop-blur-sm border border-white/50 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary shadow-sm transition-all"
            />
          </div>
          <div className="w-8 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
              <i className="ki-duotone ki-calendar text-primary text-sm">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
            </div>
            <label className="text-sm font-semibold text-gray-500">Hasta:</label>
            <input
              type="date"
              value={value.endDate}
              onChange={(e) => handleCustomDateChange('end', e.target.value)}
              className="px-4 py-2.5 bg-white/80 backdrop-blur-sm border border-white/50 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary shadow-sm transition-all"
            />
          </div>
        </div>
      )}
    </div>
  )
}
