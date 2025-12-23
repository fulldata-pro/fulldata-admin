'use client'

import { ReactNode, useState, useEffect, useRef, useCallback, useMemo } from 'react'
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
  /** Key to use for export (defaults to column key) */
  exportKey?: string
  /** Custom export formatter */
  exportValue?: (item: T) => string | number
}

export interface FilterConfig {
  key: string
  label?: string
  type: 'text' | 'select' | 'date' | 'dateRange'
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

export interface ExportConfig {
  /** Filename without extension */
  filename?: string
  /** Custom data transformer before export */
  transformData?: (data: unknown[]) => unknown[]
  /** Columns to include (defaults to all visible columns) */
  includeColumns?: string[]
  /** Columns to exclude from export */
  excludeColumns?: string[]
}

export type SortDirection = 'asc' | 'desc' | null

export interface SortConfig {
  key: string
  direction: SortDirection
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
  /** Enable instant search with debounce (ms). Set to 0 to disable */
  searchDebounce?: number

  // Sorting
  sortable?: boolean
  defaultSort?: SortConfig
  onSortChange?: (sort: SortConfig | null) => void
  /** If true, sorting is handled server-side via onSortChange callback */
  serverSideSort?: boolean

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
  exportConfig?: ExportConfig
  /** @deprecated Use exportConfig instead */
  exportData?: () => void

  // Styling
  glass?: boolean
  compact?: boolean
}

// Export utilities
function downloadFile(content: string | Blob, filename: string, mimeType: string) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    if (delay <= 0) {
      setDebouncedValue(value)
      return
    }
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
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
  searchDebounce = 0,
  sortable = false,
  defaultSort,
  onSortChange,
  serverSideSort = false,
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
  exportConfig,
  exportData,
  glass = true,
  compact = false,
}: DataTableProps<T>) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; showAbove: boolean } | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const actionButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  // Sorting state
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(defaultSort || null)

  // Filters popover state
  const [filtersPopoverOpen, setFiltersPopoverOpen] = useState(false)
  const [filtersPopoverPosition, setFiltersPopoverPosition] = useState<{ top: number; left: number } | null>(null)
  const filtersButtonRef = useRef<HTMLButtonElement>(null)
  const filtersPopoverRef = useRef<HTMLDivElement>(null)

  // Temporary filter values for popover (only applied on "Aplicar" click)
  const [tempFilterValues, setTempFilterValues] = useState<Record<string, string>>({})

  // Sync temp values when popover opens
  useEffect(() => {
    if (filtersPopoverOpen) {
      setTempFilterValues({ ...filterValues })
    }
  }, [filtersPopoverOpen, filterValues])

  // Debounced search
  const searchFilter = filters?.find(f => f.type === 'text')
  const searchValue = searchFilter ? filterValues[searchFilter.key] || '' : ''
  const debouncedSearchValue = useDebounce(searchValue, searchDebounce)

  // Trigger search on debounced value change
  useEffect(() => {
    if (searchDebounce > 0 && debouncedSearchValue !== undefined && onFilterSubmit) {
      onFilterSubmit()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchValue])

  // Handle filters popover toggle
  const handleFiltersPopoverToggle = useCallback(() => {
    if (filtersPopoverOpen) {
      setFiltersPopoverOpen(false)
      setFiltersPopoverPosition(null)
    } else {
      if (filtersButtonRef.current) {
        const rect = filtersButtonRef.current.getBoundingClientRect()
        setFiltersPopoverPosition({
          top: rect.bottom + 8,
          left: rect.left
        })
      }
      setFiltersPopoverOpen(true)
    }
  }, [filtersPopoverOpen])

  // Close filters popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement

      // Check if click is inside a Select portal (dropdown options)
      const isSelectPortalClick = target.closest('[data-select-portal]') || target.closest('[data-select]')

      // Don't close filters popover if clicking inside Select components
      if (filtersPopoverRef.current && !filtersPopoverRef.current.contains(event.target as Node) &&
          filtersButtonRef.current && !filtersButtonRef.current.contains(event.target as Node) &&
          !isSelectPortalClick) {
        setFiltersPopoverOpen(false)
        setFiltersPopoverPosition(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

  // Sorting handlers
  const handleSort = (columnKey: string) => {
    const column = columns.find(c => c.key === columnKey)
    if (!column?.sortable && !sortable) return

    let newSort: SortConfig | null
    if (sortConfig?.key === columnKey) {
      if (sortConfig.direction === 'asc') {
        newSort = { key: columnKey, direction: 'desc' }
      } else if (sortConfig.direction === 'desc') {
        newSort = null
      } else {
        newSort = { key: columnKey, direction: 'asc' }
      }
    } else {
      newSort = { key: columnKey, direction: 'asc' }
    }

    setSortConfig(newSort)
    onSortChange?.(newSort)
  }

  // Sort data client-side if not server-side sorting
  const sortedData = useMemo(() => {
    if (serverSideSort || !sortConfig) return data

    return [...data].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortConfig.key]
      const bVal = (b as Record<string, unknown>)[sortConfig.key]

      if (aVal === bVal) return 0
      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1

      const comparison = aVal < bVal ? -1 : 1
      return sortConfig.direction === 'asc' ? comparison : -comparison
    })
  }, [data, sortConfig, serverSideSort])

  // Export handlers
  const getExportColumns = useCallback(() => {
    if (!exportConfig) return columns

    let exportCols = columns
    if (exportConfig.includeColumns?.length) {
      exportCols = columns.filter(c => exportConfig.includeColumns!.includes(c.key))
    }
    if (exportConfig.excludeColumns?.length) {
      exportCols = exportCols.filter(c => !exportConfig.excludeColumns!.includes(c.key))
    }
    return exportCols
  }, [columns, exportConfig])

  const getExportData = useCallback(() => {
    const exportCols = getExportColumns()
    // Only export selected items
    const dataToExport = sortedData.filter(item => selectedItems.includes(keyExtractor(item)))

    const rawData = dataToExport.map(item => {
      const row: Record<string, unknown> = {}
      exportCols.forEach(col => {
        const key = col.exportKey || col.key
        if (col.exportValue) {
          row[key] = col.exportValue(item)
        } else {
          row[key] = (item as Record<string, unknown>)[col.key]
        }
      })
      return row
    })

    if (exportConfig?.transformData) {
      return exportConfig.transformData(rawData)
    }
    return rawData
  }, [sortedData, getExportColumns, exportConfig, selectedItems, keyExtractor])

  const handleExportExcel = useCallback(() => {
    // Excel XML format (simple approach without external libraries)
    const exportCols = getExportColumns()
    const exportRows = getExportData() as Record<string, unknown>[]

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<?mso-application progid="Excel.Sheet"?>\n'
    xml += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"\n'
    xml += '  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n'
    xml += '  <Worksheet ss:Name="Datos">\n'
    xml += '    <Table>\n'

    // Headers
    xml += '      <Row>\n'
    exportCols.forEach(col => {
      xml += `        <Cell><Data ss:Type="String">${col.header}</Data></Cell>\n`
    })
    xml += '      </Row>\n'

    // Data rows
    exportRows.forEach(row => {
      xml += '      <Row>\n'
      exportCols.forEach(col => {
        const value = row[col.exportKey || col.key]
        const type = typeof value === 'number' ? 'Number' : 'String'
        const safeValue = String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        xml += `        <Cell><Data ss:Type="${type}">${safeValue}</Data></Cell>\n`
      })
      xml += '      </Row>\n'
    })

    xml += '    </Table>\n'
    xml += '  </Worksheet>\n'
    xml += '</Workbook>'

    const filename = `${exportConfig?.filename || 'export'}.xlsx`
    downloadFile(xml, filename, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  }, [getExportColumns, getExportData, exportConfig])

  const hasExport = exportConfig || exportData
  const canExport = hasExport && selectedItems.length > 0

  // Separate text filter (search) from other filters
  const textFilter = filters?.find(f => f.type === 'text')
  const otherFilters = filters?.filter(f => f.type !== 'text') || []

  // Count active filters (excluding search)
  const activeFiltersCount = otherFilters.reduce((count, filter) => {
    if (filter.type === 'dateRange') {
      const fromValue = filterValues[`${filter.key}_from`]
      const toValue = filterValues[`${filter.key}_to`]
      if (fromValue || toValue) return count + 1
    } else if (filterValues[filter.key]) {
      return count + 1
    }
    return count
  }, 0)

  // Selection handlers
  const allKeys = sortedData.map(keyExtractor)
  const isAllSelected = selectable && sortedData.length > 0 && allKeys.every((key) => selectedItems.includes(key))
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
  const cellPadding = compact ? 'px-5 py-3.5' : 'px-6 py-5'
  const headerPadding = compact ? 'px-5 py-3' : 'px-6 py-4'

  return (
    <div className="space-y-5">
      {/* Header */}
      {showHeader && (title || headerAction) && (
        <div className="flex items-center justify-between">
          <div>
            {title && <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">{title}</h1>}
            {subtitle && <p className="text-slate-500 mt-1.5 text-sm">{subtitle}</p>}
          </div>
          {headerAction}
        </div>
      )}

      {/* Filters Bar */}
      {showFilters && filters && filters.length > 0 && (
        <div className={`${glass ? 'bg-white/70 backdrop-blur-xl border border-white/40 shadow-lg shadow-slate-200/50' : 'bg-white border border-slate-200 shadow-sm'} rounded-2xl p-4`}>
          <form onSubmit={handleFilterSubmit} className="flex items-center gap-4">
            {/* Search input (left side) */}
            {textFilter && (
              <div className="flex-1 min-w-[220px] max-w-md relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-primary">
                  <i className="ki-duotone ki-magnifier text-lg">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                </div>
                <input
                  type="text"
                  value={filterValues[textFilter.key] || ''}
                  onChange={(e) => onFilterChange?.(textFilter.key, e.target.value)}
                  className="w-full h-11 pl-11 pr-4 bg-slate-50/80 border border-slate-200/60 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 focus:bg-white transition-all duration-200"
                  placeholder={textFilter.placeholder || 'Buscar...'}
                />
              </div>
            )}

            {/* Filters button (opens popover) */}
            {otherFilters.length > 0 && (
              <button
                ref={filtersButtonRef}
                type="button"
                onClick={handleFiltersPopoverToggle}
                className={`inline-flex items-center gap-2.5 h-11 px-4 text-sm font-medium rounded-xl border transition-all duration-200 ${
                  activeFiltersCount > 0
                    ? 'bg-primary/5 border-primary/30 text-primary hover:bg-primary/10'
                    : 'bg-white/80 border-slate-200/60 text-slate-600 hover:bg-slate-50 hover:border-slate-300/60'
                }`}
              >
                <i className="ki-duotone ki-filter text-lg">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
                Filtros
                {activeFiltersCount > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-[11px] font-semibold bg-primary text-white rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Export button (right side) - only enabled when items are selected */}
            {hasExport && (
              <button
                type="button"
                onClick={handleExportExcel}
                disabled={!canExport}
                className={`inline-flex items-center gap-2.5 h-11 px-4 text-sm font-medium rounded-xl border transition-all duration-200 ${
                  canExport
                    ? 'bg-white/80 border-slate-200/60 text-slate-600 hover:bg-slate-50 hover:border-slate-300/60'
                    : 'bg-slate-50/50 border-slate-200/40 text-slate-400 cursor-not-allowed'
                }`}
                title={canExport ? `Exportar ${selectedItems.length} elemento(s)` : 'Selecciona elementos para exportar'}
              >
                <i className="ki-duotone ki-exit-down text-lg">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
                Exportar{selectedItems.length > 0 ? ` (${selectedItems.length})` : ''}
              </button>
            )}
          </form>
        </div>
      )}

      {/* Table */}
      <div className={`${glass ? 'bg-white/70 backdrop-blur-xl border border-white/50 shadow-xl shadow-slate-200/40' : 'bg-white border border-slate-200 shadow-sm'} rounded-2xl overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${glass ? 'bg-gradient-to-b from-slate-50/90 to-slate-100/70 backdrop-blur-sm' : 'bg-slate-50'}`}>
              <tr>
                {selectable && (
                  <th className={`${headerPadding} w-14`}>
                    <Checkbox
                      checked={isAllSelected}
                      indeterminate={isSomeSelected}
                      onChange={() => handleSelectAll()}
                      size="sm"
                    />
                  </th>
                )}
                {columns.map((column) => {
                  const isSortable = column.sortable || sortable
                  const isCurrentSort = sortConfig?.key === column.key
                  return (
                    <th
                      key={column.key}
                      className={`${headerPadding} text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider ${column.headerClassName || ''} ${isSortable ? 'cursor-pointer select-none hover:bg-slate-100/60 transition-colors duration-150' : ''}`}
                      onClick={isSortable ? () => handleSort(column.key) : undefined}
                    >
                      <div className="flex items-center gap-2">
                        {column.header}
                        {isSortable && (
                          <span className={`flex flex-col ${isCurrentSort ? 'text-primary' : 'text-slate-300'}`}>
                            <i className={`ki-solid ki-up text-[8px] -mb-0.5 ${isCurrentSort && sortConfig?.direction === 'asc' ? 'text-primary' : ''}`}></i>
                            <i className={`ki-solid ki-down text-[8px] ${isCurrentSort && sortConfig?.direction === 'desc' ? 'text-primary' : ''}`}></i>
                          </span>
                        )}
                      </div>
                    </th>
                  )
                })}
                {actions && <th className={`${headerPadding} w-16`}></th>}
              </tr>
            </thead>
            <tbody className={`${glass ? 'bg-white/60 backdrop-blur-sm' : 'bg-white'}`}>
              {isLoading ? (
                <tr>
                  <td colSpan={totalColumns} className={`${cellPadding} text-center py-20`}>
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 border-4 border-primary/10 rounded-full"></div>
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                      </div>
                      <span className="text-sm text-slate-400 font-medium">Cargando...</span>
                    </div>
                  </td>
                </tr>
              ) : sortedData.length === 0 ? (
                <tr>
                  <td colSpan={totalColumns} className={`${cellPadding} text-center py-20`}>
                    <div className="flex flex-col items-center gap-4">
                      {emptyIcon || (
                        <div className="w-16 h-16 rounded-2xl bg-slate-100/80 flex items-center justify-center">
                          <i className="ki-duotone ki-folder text-3xl text-slate-300">
                            <span className="path1"></span>
                            <span className="path2"></span>
                          </i>
                        </div>
                      )}
                      <p className="text-slate-500 font-medium">{emptyMessage}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedData.map((item, index) => {
                  const key = keyExtractor(item)
                  const isSelected = selectedItems.includes(key)
                  return (
                    <tr
                      key={key}
                      className={`
                        transition-all duration-150 ease-out
                        ${onRowClick ? 'cursor-pointer' : ''}
                        ${glass ? 'hover:bg-slate-50/70' : 'hover:bg-slate-50'}
                        ${isSelected ? 'bg-primary/[0.04]' : ''}
                        ${index < sortedData.length - 1 ? 'border-b border-slate-100' : ''}
                      `}
                      onClick={() => onRowClick?.(item)}
                    >
                      {selectable && (
                        <td className={`${cellPadding} w-14`}>
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
                          className={`${cellPadding} whitespace-nowrap text-[13px] text-slate-700 ${column.className || ''}`}
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
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100/80 rounded-lg transition-all duration-150"
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
          <div className={`flex items-center justify-between px-6 py-4 border-t ${glass ? 'border-slate-100/80 bg-slate-50/50 backdrop-blur-sm' : 'border-slate-100 bg-slate-50/80'}`}>
            <div className="flex items-center gap-5">
              <p className="text-[13px] text-slate-500">
                Mostrando <span className="font-semibold text-slate-700">{(pagination.page - 1) * pagination.limit + 1}</span> a{' '}
                <span className="font-semibold text-slate-700">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> de{' '}
                <span className="font-semibold text-slate-700">{pagination.total}</span> resultados
              </p>
              {onPageSizeChange && (
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-slate-500">Mostrar</span>
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
                  <span className="text-[13px] text-slate-500">por página</span>
                </div>
              )}
            </div>
            {pagination.pages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-medium text-slate-600 bg-white/80 border border-slate-200/60 rounded-xl hover:bg-white hover:border-slate-300/60 hover:shadow-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white/80 disabled:hover:border-slate-200/60 disabled:hover:shadow-none transition-all duration-150"
                >
                  <i className="ki-duotone ki-arrow-left text-base">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                  Anterior
                </button>
                <div className="flex items-center gap-1 mx-1">
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
                        className={`w-9 h-9 text-[13px] font-medium rounded-xl transition-all duration-150 ${
                          pagination.page === pageNum
                            ? 'bg-primary text-white shadow-md shadow-primary/25'
                            : 'text-slate-600 hover:bg-slate-100/80'
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
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-medium text-slate-600 bg-white/80 border border-slate-200/60 rounded-xl hover:bg-white hover:border-slate-300/60 hover:shadow-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white/80 disabled:hover:border-slate-200/60 disabled:hover:shadow-none transition-all duration-150"
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

      {/* Filters Popover Portal */}
      {filtersPopoverOpen && filtersPopoverPosition && otherFilters.length > 0 && typeof window !== 'undefined' && createPortal(
        <div
          ref={filtersPopoverRef}
          className="fixed bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-slate-200/50 border border-white/60 p-5 z-[99999] animate-fade-in min-w-[300px]"
          style={{
            top: `${filtersPopoverPosition.top}px`,
            left: `${filtersPopoverPosition.left}px`,
          }}
        >
          <div className="space-y-5">
            {otherFilters.map((filter) => (
              <div key={filter.key} className={filter.className}>
                {filter.label && (
                  <label className="block text-[13px] font-medium text-slate-700 mb-2">{filter.label}</label>
                )}
                {filter.type === 'select' && (
                  <Select
                    value={tempFilterValues[filter.key] || ''}
                    onChange={(value) => setTempFilterValues(prev => ({ ...prev, [filter.key]: value }))}
                    options={[
                      { value: '', label: filter.placeholder || 'Todos' },
                      ...(filter.options || [])
                    ]}
                    fullWidth
                  />
                )}
                {filter.type === 'date' && (
                  <input
                    type="date"
                    value={tempFilterValues[filter.key] || ''}
                    onChange={(e) => setTempFilterValues(prev => ({ ...prev, [filter.key]: e.target.value }))}
                    className="w-full h-10 px-3 bg-slate-50/80 border border-slate-200/60 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all duration-200"
                  />
                )}
                {filter.type === 'dateRange' && (
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-xs text-slate-500 mb-1.5">Desde</label>
                      <input
                        type="date"
                        value={tempFilterValues[`${filter.key}_from`] || ''}
                        onChange={(e) => setTempFilterValues(prev => ({ ...prev, [`${filter.key}_from`]: e.target.value }))}
                        className="w-full h-10 px-3 bg-slate-50/80 border border-slate-200/60 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all duration-200"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-slate-500 mb-1.5">Hasta</label>
                      <input
                        type="date"
                        value={tempFilterValues[`${filter.key}_to`] || ''}
                        onChange={(e) => setTempFilterValues(prev => ({ ...prev, [`${filter.key}_to`]: e.target.value }))}
                        className="w-full h-10 px-3 bg-slate-50/80 border border-slate-200/60 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all duration-200"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  // Clear temp values and apply
                  otherFilters.forEach(filter => {
                    if (filter.type === 'dateRange') {
                      onFilterChange?.(`${filter.key}_from`, '')
                      onFilterChange?.(`${filter.key}_to`, '')
                    } else {
                      onFilterChange?.(filter.key, '')
                    }
                  })
                  setTempFilterValues({})
                  onFilterSubmit?.()
                  setFiltersPopoverOpen(false)
                  setFiltersPopoverPosition(null)
                }}
                className="flex-1 h-10 text-[13px] font-medium text-slate-600 bg-slate-100/80 hover:bg-slate-200/80 rounded-xl transition-all duration-150"
              >
                Limpiar
              </button>
              <button
                type="button"
                onClick={() => {
                  // Apply temp values to actual filter values
                  Object.entries(tempFilterValues).forEach(([key, value]) => {
                    onFilterChange?.(key, value)
                  })
                  // Small delay to ensure state is updated before submit
                  setTimeout(() => {
                    onFilterSubmit?.()
                  }, 0)
                  setFiltersPopoverOpen(false)
                  setFiltersPopoverPosition(null)
                }}
                className="flex-1 h-10 text-[13px] font-medium text-white bg-primary hover:bg-primary/90 rounded-xl shadow-md shadow-primary/25 transition-all duration-150"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Actions Dropdown Portal */}
      {openDropdown && dropdownPosition && actions && typeof window !== 'undefined' && createPortal(
        <div
          ref={dropdownRef}
          className="fixed w-56 bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl shadow-slate-200/50 border border-white/60 overflow-hidden z-[99999] animate-fade-in"
          style={{
            top: dropdownPosition.showAbove ? 'auto' : `${dropdownPosition.top}px`,
            bottom: dropdownPosition.showAbove ? `${window.innerHeight - dropdownPosition.top + 4}px` : 'auto',
            left: `${dropdownPosition.left}px`,
          }}
        >
          {actions
            .filter((action) => {
              const item = sortedData.find((d) => keyExtractor(d) === openDropdown)
              return item && (!action.show || action.show(item))
            })
            .map((action, actionIndex, filteredActions) => {
              const item = sortedData.find((d) => keyExtractor(d) === openDropdown)
              if (!item) return null
              return (
                <button
                  key={actionIndex}
                  onClick={() => {
                    action.onClick(item)
                    setOpenDropdown(null)
                    setDropdownPosition(null)
                  }}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3.5 text-[13px] font-medium transition-all duration-150 ${
                    actionIndex < filteredActions.length - 1 ? 'border-b border-slate-100' : ''
                  } ${
                    action.className || 'text-slate-700 hover:bg-slate-50/80'
                  }`}
                >
                  <span className="text-lg opacity-70">{action.icon}</span>
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
    success: 'bg-emerald-50/80 text-emerald-700 ring-1 ring-emerald-500/25',
    warning: 'bg-amber-50/80 text-amber-700 ring-1 ring-amber-500/25',
    danger: 'bg-red-50/80 text-red-700 ring-1 ring-red-500/25',
    info: 'bg-blue-50/80 text-blue-700 ring-1 ring-blue-500/25',
    gray: 'bg-slate-100/80 text-slate-600 ring-1 ring-slate-400/20',
    purple: 'bg-purple-50/80 text-purple-700 ring-1 ring-purple-500/25',
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide ${variants[variant]} ${className}`}>
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
    sm: 'w-8 h-8 text-[11px]',
    md: 'w-10 h-10 text-[13px]',
    lg: 'w-12 h-12 text-sm',
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
        rounded-xl flex items-center justify-center font-semibold tracking-wide
        ${gradient
          ? 'bg-gradient-to-br from-secondary to-secondary-light text-white shadow-md shadow-secondary/20'
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
    <code className="px-2 py-1 bg-slate-100/80 rounded-md text-[13px] font-mono text-slate-700">
      {children}
    </code>
  )
}

export function ActionIcon({
  icon,
  className = 'text-slate-500'
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
