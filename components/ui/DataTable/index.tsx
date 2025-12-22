'use client'

import { ReactNode, useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useRouter, useSearchParams } from 'next/navigation'
import { Checkbox } from '@/components/ui/Checkbox'
import { Select } from '@/components/ui/Select'

// Types
export interface Column<T> {
  key: string
  header: string
  render?: (item: T, index: number) => ReactNode
  className?: string
  headerClassName?: string
  sortable?: boolean
}

export interface FilterConfig {
  key: string
  label?: string
  type: 'text' | 'select'
  placeholder?: string
  options?: { value: string; label: string }[]
  icon?: ReactNode
  className?: string
}

export interface ActionMenuItem<T> {
  label: string
  icon?: ReactNode
  onClick: (item: T) => void
  className?: string
  show?: (item: T) => boolean
}

export interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

export interface DataTableProps<T> {
  // Core
  data: T[]
  columns: Column<T>[]
  keyExtractor: (item: T) => string
  isLoading?: boolean

  // Pagination
  pagination?: Pagination | null
  basePath: string
  pageSizeOptions?: number[]
  onPageSizeChange?: (size: number) => void

  // Filters
  filters?: FilterConfig[]
  filterValues?: Record<string, string>
  onFilterChange?: (key: string, value: string) => void
  onFilterSubmit?: () => void
  onFilterClear?: () => void
  showFilters?: boolean

  // Selection
  selectable?: boolean
  selectedItems?: string[]
  onSelectionChange?: (selectedKeys: string[]) => void

  // Actions
  actions?: ActionMenuItem<T>[]
  onRowClick?: (item: T) => void

  // Customization
  emptyMessage?: string
  emptyIcon?: ReactNode
  title?: string
  subtitle?: string
  headerAction?: ReactNode
  showHeader?: boolean

  // Export
  exportData?: () => void
  exportLabel?: string

  // Styling
  glass?: boolean
  compact?: boolean
}

// Main DataTable Component
export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  isLoading = false,
  pagination,
  basePath,
  pageSizeOptions = [10, 25, 50, 100],
  onPageSizeChange,
  filters,
  filterValues = {},
  onFilterChange,
  onFilterSubmit,
  onFilterClear,
  showFilters = true,
  selectable = false,
  selectedItems = [],
  onSelectionChange,
  actions,
  onRowClick,
  emptyMessage = 'No se encontraron resultados',
  emptyIcon,
  title,
  subtitle,
  headerAction,
  showHeader = true,
  exportData,
  exportLabel = 'Exportar',
  glass = true,
  compact = false,
}: DataTableProps<T>) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; showAbove: boolean } | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const actionButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null)
        setDropdownPosition(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleOpenDropdown = useCallback((key: string) => {
    if (openDropdown === key) {
      setOpenDropdown(null)
      setDropdownPosition(null)
      return
    }

    const buttonEl = actionButtonRefs.current.get(key)
    if (buttonEl) {
      const rect = buttonEl.getBoundingClientRect()
      const dropdownHeight = 120 // Approximate height for 2 actions
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top
      const showAbove = spaceBelow < dropdownHeight && spaceAbove > dropdownHeight

      setDropdownPosition({
        top: showAbove ? rect.top : rect.bottom + 4,
        left: rect.right - 224, // 224 = w-56 (14rem)
        showAbove
      })
    }
    setOpenDropdown(key)
  }, [openDropdown])

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams?.toString() || '')
    params.set('page', String(newPage))
    router.push(`${basePath}?${params}`)
  }

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onFilterSubmit?.()
  }

  // Selection handlers
  const allKeys = data.map(keyExtractor)
  const isAllSelected = selectable && data.length > 0 && allKeys.every((key) => selectedItems.includes(key))
  const isSomeSelected = selectable && selectedItems.length > 0 && !isAllSelected

  const handleSelectAll = () => {
    if (!onSelectionChange) return
    if (isAllSelected) {
      onSelectionChange([])
    } else {
      onSelectionChange(allKeys)
    }
  }

  const handleSelectItem = (key: string) => {
    if (!onSelectionChange) return
    if (selectedItems.includes(key)) {
      onSelectionChange(selectedItems.filter((k) => k !== key))
    } else {
      onSelectionChange([...selectedItems, key])
    }
  }

  const totalColumns = columns.length + (actions ? 1 : 0) + (selectable ? 1 : 0)
  const cellPadding = compact ? 'px-4 py-3' : 'px-6 py-4'
  const headerPadding = compact ? 'px-4 py-2.5' : 'px-6 py-3'

  return (
    <div className="space-y-6">
      {/* Header */}
      {showHeader && (title || headerAction) && (
        <div className="flex items-center justify-between">
          <div>
            {title && <h1 className="text-2xl font-bold text-secondary">{title}</h1>}
            {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
          </div>
          {headerAction}
        </div>
      )}

      {/* Filters */}
      {showFilters && filters && filters.length > 0 && (
        <div className={glass ? 'card-glass' : 'card'}>
          <form onSubmit={handleFilterSubmit} className="flex flex-wrap items-end gap-4">
            {filters.map((filter) => (
              <div key={filter.key} className={filter.className || (filter.type === 'text' ? 'flex-1 min-w-[200px]' : 'w-48')}>
                {filter.label && <label className="label">{filter.label}</label>}
                {filter.type === 'text' ? (
                  <div className="relative">
                    {filter.icon && (
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {filter.icon}
                      </div>
                    )}
                    <input
                      type="text"
                      value={filterValues[filter.key] || ''}
                      onChange={(e) => onFilterChange?.(filter.key, e.target.value)}
                      className={`input-field ${filter.icon ? 'pl-10' : ''}`}
                      placeholder={filter.placeholder}
                    />
                  </div>
                ) : (
                  <select
                    value={filterValues[filter.key] || ''}
                    onChange={(e) => onFilterChange?.(filter.key, e.target.value)}
                    className="input-field"
                  >
                    <option value="">{filter.placeholder || 'Todos'}</option>
                    {filter.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}
            <div className="flex gap-2">
              <button type="submit" className="btn-secondary">
                Filtrar
              </button>
              {onFilterClear && (
                <button type="button" onClick={onFilterClear} className="btn-outline">
                  Limpiar
                </button>
              )}
              {exportData && (
                <button type="button" onClick={exportData} className="btn-outline flex items-center gap-2">
                  <i className="ki-duotone ki-exit-down text-lg">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                  {exportLabel}
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className={`${glass ? 'bg-white/60 backdrop-blur-sm border border-slate-200/40' : 'bg-white border border-gray-200'} rounded-2xl shadow-sm overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${glass ? 'bg-slate-50/80 backdrop-blur-sm' : 'bg-gray-50'}`}>
              <tr>
                {selectable && (
                  <th className={`${headerPadding} w-12`}>
                    <Checkbox
                      checked={isAllSelected}
                      indeterminate={isSomeSelected}
                      onChange={() => handleSelectAll()}
                      size="sm"
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`${headerPadding} text-left text-xs font-semibold text-slate-600 uppercase tracking-wider ${column.headerClassName || ''}`}
                  >
                    {column.header}
                  </th>
                ))}
                {actions && <th className={`${headerPadding} w-16`}></th>}
              </tr>
            </thead>
            <tbody className="bg-white/80 backdrop-blur-sm divide-y divide-slate-200/40">
              {isLoading ? (
                <tr>
                  <td colSpan={totalColumns} className={`${cellPadding} text-center py-16`}>
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 border-4 border-primary/20 rounded-full"></div>
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                      </div>
                      <span className="text-sm text-gray-400">Cargando...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={totalColumns} className={`${cellPadding} text-center py-16`}>
                    <div className="flex flex-col items-center gap-3">
                      {emptyIcon || (
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                          <i className="ki-duotone ki-folder text-3xl text-gray-300">
                            <span className="path1"></span>
                            <span className="path2"></span>
                          </i>
                        </div>
                      )}
                      <p className="text-gray-500">{emptyMessage}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((item, index) => {
                  const key = keyExtractor(item)
                  const isSelected = selectedItems.includes(key)
                  return (
                    <tr
                      key={key}
                      className={`
                        transition-all duration-200
                        ${onRowClick ? 'cursor-pointer' : ''}
                        ${glass ? 'hover:bg-slate-50/40' : 'hover:bg-gray-50'}
                        ${isSelected ? 'bg-primary/5' : ''}
                        ${index < data.length - 1 ? 'border-b border-slate-200/30' : ''}
                      `}
                      onClick={() => onRowClick?.(item)}
                    >
                      {selectable && (
                        <td className={`${cellPadding} w-12`}>
                          <Checkbox
                            checked={isSelected}
                            onChange={() => handleSelectItem(key)}
                            size="sm"
                          />
                        </td>
                      )}
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className={`${cellPadding} whitespace-nowrap text-sm text-gray-900 ${column.className || ''}`}
                        >
                          {column.render ? column.render(item, index) : String((item as Record<string, unknown>)[column.key] ?? '')}
                        </td>
                      ))}
                      {actions && (
                        <td className={`${cellPadding}`} onClick={(e) => e.stopPropagation()}>
                          <button
                            ref={(el) => {
                              if (el) actionButtonRefs.current.set(key, el)
                            }}
                            onClick={() => handleOpenDropdown(key)}
                            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <i className="ki-solid ki-dots-vertical text-lg"></i>
                          </button>
                        </td>
                      )}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && (pagination.pages > 1 || onPageSizeChange) && (
          <div className={`flex items-center justify-between px-6 py-4 border-t ${glass ? 'border-gray-100/50 bg-gray-50/30' : 'border-gray-100'}`}>
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-500">
                Mostrando <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> a{' '}
                <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> de{' '}
                <span className="font-medium">{pagination.total}</span> resultados
              </p>
              {onPageSizeChange && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Mostrar</span>
                  <Select
                    value={String(pagination.limit)}
                    onChange={(value) => onPageSizeChange(Number(value))}
                    options={pageSizeOptions.map((size) => ({
                      value: String(size),
                      label: String(size)
                    }))}
                    size="xs"
                    fullWidth={false}
                    className="w-16"
                  />
                  <span className="text-sm text-gray-500">por página</span>
                </div>
              )}
            </div>
            {pagination.pages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <i className="ki-duotone ki-arrow-left text-base">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                  Anterior
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    let pageNum: number
                    if (pagination.pages <= 5) {
                      pageNum = i + 1
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1
                    } else if (pagination.page >= pagination.pages - 2) {
                      pageNum = pagination.pages - 4 + i
                    } else {
                      pageNum = pagination.page - 2 + i
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-8 h-8 text-sm font-medium rounded-lg transition-colors ${
                          pagination.page === pageNum
                            ? 'bg-primary text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                  <i className="ki-duotone ki-arrow-right text-base">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions Dropdown Portal */}
      {openDropdown && dropdownPosition && actions && typeof window !== 'undefined' && createPortal(
        <div
          ref={dropdownRef}
          className="fixed w-56 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-[99999] animate-fade-in"
          style={{
            top: dropdownPosition.showAbove ? 'auto' : `${dropdownPosition.top}px`,
            bottom: dropdownPosition.showAbove ? `${window.innerHeight - dropdownPosition.top + 4}px` : 'auto',
            left: `${dropdownPosition.left}px`,
          }}
        >
          {actions
            .filter((action) => {
              const item = data.find((d) => keyExtractor(d) === openDropdown)
              return item && (!action.show || action.show(item))
            })
            .map((action, actionIndex, filteredActions) => {
              const item = data.find((d) => keyExtractor(d) === openDropdown)
              if (!item) return null
              return (
                <button
                  key={actionIndex}
                  onClick={() => {
                    action.onClick(item)
                    setOpenDropdown(null)
                    setDropdownPosition(null)
                  }}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                    actionIndex < filteredActions.length - 1 ? 'border-b border-gray-100' : ''
                  } ${
                    action.className || 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg">{action.icon}</span>
                  {action.label}
                </button>
              )
            })}
        </div>,
        document.body
      )}
    </div>
  )
}

// Utility Components
export function Badge({
  children,
  variant = 'gray',
  className = ''
}: {
  children: ReactNode
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'gray' | 'purple'
  className?: string
}) {
  const variants = {
    success: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20',
    warning: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20',
    danger: 'bg-red-50 text-red-700 ring-1 ring-red-600/20',
    info: 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20',
    gray: 'bg-gray-100 text-gray-700 ring-1 ring-gray-500/20',
    purple: 'bg-purple-50 text-purple-700 ring-1 ring-purple-600/20',
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}

export function Avatar({
  name,
  size = 'md',
  className = '',
  gradient = false
}: {
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  gradient?: boolean
}) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  }

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div
      className={`
        ${sizes[size]}
        rounded-full flex items-center justify-center font-semibold
        ${gradient
          ? 'bg-gradient-to-br from-secondary to-secondary-light text-white'
          : 'bg-primary/10 text-primary'
        }
        ${className}
      `}
    >
      {initials}
    </div>
  )
}

export function Code({ children }: { children: ReactNode }) {
  return (
    <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono text-gray-700">
      {children}
    </code>
  )
}

export function ActionIcon({
  icon,
  className = 'text-gray-500'
}: {
  icon: string
  className?: string
}) {
  return (
    <i className={`ki-duotone ki-${icon} text-xl ${className}`}>
      <span className="path1"></span>
      <span className="path2"></span>
      <span className="path3"></span>
      <span className="path4"></span>
      <span className="path5"></span>
    </i>
  )
}

export default DataTable
