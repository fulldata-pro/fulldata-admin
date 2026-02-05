'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import * as XLSX from 'xlsx'
import { formatDate, formatDateTime, getRelativeTime } from '@/lib/utils/dateUtils'
import { formatNumber } from '@/lib/utils/currencyUtils'
import { ROUTES, ServiceLabels } from '@/lib/constants'
import { Checkbox } from '@/components/ui/Checkbox'

interface Report {
  _id: string
  id: number
  uid: string
  type: string
  status: string
  searchQuery?: string
  source?: string
  isBatch?: boolean
  user?: {
    uid: string
    firstName: string
    lastName: string
  }
  metadata?: {
    searchCount?: number
    resultCount?: number
    fullName?: string
    params?: any
  }
  createdAt: string
  deletedAt?: string | null
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

interface ReportsTabProps {
  accountId: string
}

export function ReportsTab({ accountId }: ReportsTabProps) {
  const [reports, setReports] = useState<Report[]>([])
  const [isLoadingReports, setIsLoadingReports] = useState(false)
  const [reportsPage, setReportsPage] = useState(1)
  const [reportsPagination, setReportsPagination] = useState<Pagination | null>(null)

  // Filter states
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [appliedDateFrom, setAppliedDateFrom] = useState('')
  const [appliedDateTo, setAppliedDateTo] = useState('')

  // Selection state
  const [selectedReports, setSelectedReports] = useState<string[]>([])
  const [allPagesSelected, setAllPagesSelected] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  // Filter popover state
  const [filtersPopoverOpen, setFiltersPopoverOpen] = useState(false)
  const [filtersPopoverPosition, setFiltersPopoverPosition] = useState<{ top: number; left: number } | null>(null)
  const filtersButtonRef = useRef<HTMLButtonElement>(null)
  const filtersPopoverRef = useRef<HTMLDivElement>(null)

  const fetchReports = useCallback(async () => {
    if (!accountId) return
    setIsLoadingReports(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(reportsPage))
      params.set('limit', '10')
      params.set('accountId', accountId)
      if (appliedDateFrom) params.set('dateFrom', appliedDateFrom)
      if (appliedDateTo) params.set('dateTo', appliedDateTo)

      const response = await fetch(`/api/reports?${params}`)
      if (response.ok) {
        const data = await response.json()
        setReports(data.reports)
        setReportsPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setIsLoadingReports(false)
    }
  }, [accountId, reportsPage, appliedDateFrom, appliedDateTo])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  // Status labels and styles
  const statusLabels: Record<string, string> = {
    'PENDING': 'Pendiente',
    'REVIEW_NEEDED': 'Rev. necesaria',
    'PROCESSING': 'Procesando',
    'PARTIAL': 'Parcial',
    'NOT_FOUND': 'No encontrado',
    'COMPLETED': 'Completado',
    'CANCELLED': 'Cancelado',
    'ERROR': 'Error',
    'FAILED': 'Fallido',
    'EXPIRED': 'Expirado'
  }

  const statusStyles: Record<string, string> = {
    'PENDING': 'badge-gray',
    'REVIEW_NEEDED': 'badge-warning',
    'PROCESSING': 'badge-info',
    'PARTIAL': 'badge-purple',
    'NOT_FOUND': 'badge-gray',
    'COMPLETED': 'badge-success',
    'CANCELLED': 'badge-gray',
    'ERROR': 'badge-danger',
    'FAILED': 'badge-danger',
    'EXPIRED': 'badge-gray'
  }

  // Type labels - map old report types to new service types
  const typeLabels: Record<string, string> = {
    'PERSON': ServiceLabels.PEOPLE || 'Personas',
    'PEOPLE': ServiceLabels.PEOPLE || 'Personas',
    'COMPANY': ServiceLabels.COMPANIES || 'Empresas',
    'COMPANIES': ServiceLabels.COMPANIES || 'Empresas',
    'PERSON_EXTENDED': 'Persona Extendida',
    'COMPANY_EXTENDED': 'Empresa Extendida',
    'SEARCH': 'Búsqueda',
    'IDENTITY': ServiceLabels.IDENTITY || 'Identidad',
    'VEHICLES': ServiceLabels.VEHICLES || 'Vehículos',
    'PHONES': ServiceLabels.PHONES || 'Teléfonos',
    'BANKS': ServiceLabels.BANKS || 'Bancos',
    'OSINT': ServiceLabels.OSINT || 'WEB'
  }

  // Source labels
  const sourceLabels: Record<string, string> = {
    'API': 'API',
    'WEB': 'Web',
    'ZAPIER': 'Zapier'
  }

  // Filter popover handlers
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
      // Sync temp values with applied values when opening
      setDateFrom(appliedDateFrom)
      setDateTo(appliedDateTo)
      setFiltersPopoverOpen(true)
    }
  }, [filtersPopoverOpen, appliedDateFrom, appliedDateTo])

  // Close filters popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filtersPopoverRef.current && !filtersPopoverRef.current.contains(event.target as Node) &&
          filtersButtonRef.current && !filtersButtonRef.current.contains(event.target as Node)) {
        setFiltersPopoverOpen(false)
        setFiltersPopoverPosition(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleApplyFilters = () => {
    setAppliedDateFrom(dateFrom)
    setAppliedDateTo(dateTo)
    setReportsPage(1)
    setSelectedReports([])
    setAllPagesSelected(false)
    setFiltersPopoverOpen(false)
    setFiltersPopoverPosition(null)
  }

  const handleClearFilters = () => {
    setDateFrom('')
    setDateTo('')
    setAppliedDateFrom('')
    setAppliedDateTo('')
    setReportsPage(1)
    setSelectedReports([])
    setAllPagesSelected(false)
    setFiltersPopoverOpen(false)
    setFiltersPopoverPosition(null)
  }

  // Page change handler - clears selection unless all pages are selected
  const handlePageChange = (newPage: number) => {
    setReportsPage(newPage)
    if (!allPagesSelected) {
      setSelectedReports([])
    }
  }

  const hasActiveFilters = appliedDateFrom || appliedDateTo
  const activeFiltersCount = (appliedDateFrom ? 1 : 0) + (appliedDateTo ? 1 : 0)

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedReports.length === reports.length) {
      setSelectedReports([])
      setAllPagesSelected(false)
    } else {
      setSelectedReports(reports.map(r => r.uid))
    }
  }

  const handleSelectReport = (uid: string) => {
    setAllPagesSelected(false) // Reset all pages selection when individual selection changes
    setSelectedReports(prev =>
      prev.includes(uid)
        ? prev.filter(id => id !== uid)
        : [...prev, uid]
    )
  }

  const handleSelectAllPages = () => {
    setAllPagesSelected(true)
    setSelectedReports(reports.map(r => r.uid)) // Also select current page visually
  }

  const handleClearSelection = () => {
    setSelectedReports([])
    setAllPagesSelected(false)
  }

  const isAllCurrentPageSelected = reports.length > 0 && selectedReports.length === reports.length
  const isAllSelected = isAllCurrentPageSelected || allPagesSelected
  const isSomeSelected = !allPagesSelected && selectedReports.length > 0 && selectedReports.length < reports.length
  const totalReports = reportsPagination?.total || 0
  const showSelectAllBanner = isAllCurrentPageSelected && !allPagesSelected && totalReports > reports.length

  // Export handler - using xlsx library
  const handleExportExcel = async () => {
    setIsExporting(true)

    try {
      let dataToExport: Report[]

      if (allPagesSelected) {
        // Fetch all reports from backend
        const params = new URLSearchParams()
        params.set('accountId', accountId)
        params.set('limit', '10000') // Large limit to get all
        if (appliedDateFrom) params.set('dateFrom', appliedDateFrom)
        if (appliedDateTo) params.set('dateTo', appliedDateTo)

        const response = await fetch(`/api/reports?${params}`)
        if (!response.ok) throw new Error('Error al obtener reportes')
        const data = await response.json()
        dataToExport = data.reports
      } else {
        // Export only selected reports from current page
        dataToExport = reports.filter(r => selectedReports.includes(r.uid))
      }

      const exportData = dataToExport.map(report => ({
        'ID': report.id,
        'Búsqueda': report.type === 'IDENTITY' && report.metadata?.fullName
          ? report.metadata.fullName
          : report.searchQuery || '-',
        'Tipo': typeLabels[report.type] || report.type,
        'Origen': report.source ? sourceLabels[report.source] || report.source : '-',
        'Estado': statusLabels[report.status] || report.status,
        'Usuario': report.user ? `${report.user.firstName} ${report.user.lastName}` : '-',
        'Fecha': formatDateTime(report.createdAt),
        'Eliminado': report.deletedAt ? 'Sí' : 'No'
      }))

      const ws = XLSX.utils.json_to_sheet(exportData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Reportes')

      const filename = `reportes-cuenta-${accountId}.xlsx`
      XLSX.writeFile(wb, filename)
    } catch (error) {
      console.error('Error exporting:', error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="rounded-2xl bg-white shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-secondary">Reportes Generados</h3>
            <p className="text-gray-500 text-sm mt-1">
              Historial de reportes y búsquedas
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Filters button */}
            <button
              ref={filtersButtonRef}
              type="button"
              onClick={handleFiltersPopoverToggle}
              className={`inline-flex items-center gap-2 h-10 px-4 text-sm font-medium rounded-xl border transition-all duration-200 ${
                activeFiltersCount > 0
                  ? 'bg-primary/5 border-primary/30 text-primary hover:bg-primary/10'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
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

            {/* Export button */}
            <button
              type="button"
              onClick={handleExportExcel}
              disabled={selectedReports.length === 0 && !allPagesSelected || isExporting}
              className={`inline-flex items-center gap-2 h-10 px-4 text-sm font-medium rounded-xl border transition-all duration-200 ${
                (selectedReports.length > 0 || allPagesSelected) && !isExporting
                  ? 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                  : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              title={allPagesSelected ? `Exportar todos los ${totalReports} reportes` : selectedReports.length > 0 ? `Exportar ${selectedReports.length} reporte(s)` : 'Selecciona reportes para exportar'}
            >
              {isExporting ? (
                <>
                  <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></span>
                  Exportando...
                </>
              ) : (
                <>
                  <i className="ki-duotone ki-exit-down text-lg">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                  Exportar{allPagesSelected ? ` (${totalReports})` : selectedReports.length > 0 ? ` (${selectedReports.length})` : ''}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Selection banner */}
      {(showSelectAllBanner || allPagesSelected) && (
        <div className="px-6 py-3 bg-primary/5 border-b border-primary/10">
          <div className="flex items-center justify-center gap-2 text-sm">
            {allPagesSelected ? (
              <>
                <span className="text-primary font-medium">
                  Los {totalReports} reportes están seleccionados.
                </span>
                <button
                  onClick={handleClearSelection}
                  className="text-primary hover:text-primary-dark font-medium underline underline-offset-2"
                >
                  Limpiar selección
                </button>
              </>
            ) : (
              <>
                <span className="text-gray-600">
                  {selectedReports.length} reportes seleccionados en esta página.
                </span>
                <button
                  onClick={handleSelectAllPages}
                  className="text-primary hover:text-primary-dark font-medium underline underline-offset-2"
                >
                  Seleccionar todos los {totalReports} reportes
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        {isLoadingReports ? (
          <div className="p-12 text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="text-gray-500 mt-3">Cargando reportes...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center">
            <i className="ki-duotone ki-document text-gray-300 text-5xl mb-3">
              <span className="path1"></span>
              <span className="path2"></span>
            </i>
            <p className="text-gray-500">No hay reportes generados</p>
            <p className="text-gray-400 text-sm mt-1">
              Los reportes aparecerán aquí cuando se generen búsquedas
            </p>
          </div>
        ) : (
          <>
            <table className="table-auto w-full">
              <thead className="bg-gray-50 border-y border-gray-100">
                <tr>
                  <th className="table-header w-14">
                    <Checkbox
                      checked={isAllSelected}
                      indeterminate={isSomeSelected}
                      onChange={handleSelectAll}
                      size="sm"
                    />
                  </th>
                  <th className="table-header">ID</th>
                  <th className="table-header">Búsqueda</th>
                  <th className="table-header">Tipo</th>
                  <th className="table-header">Origen</th>
                  <th className="table-header">Estado</th>
                  <th className="table-header">Usuario</th>
                  <th className="table-header">Fecha</th>
                  <th className="table-header text-end">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reports.map((report) => (
                  <tr key={report.uid} className={`hover:bg-gray-50 transition-colors ${selectedReports.includes(report.uid) || allPagesSelected ? 'bg-primary/5' : ''}`}>
                    <td className="table-cell w-14">
                      <Checkbox
                        checked={selectedReports.includes(report.uid) || allPagesSelected}
                        onChange={() => handleSelectReport(report.uid)}
                        size="sm"
                      />
                    </td>
                    <td className="table-cell">
                      <span className="font-mono text-sm text-gray-600">
                        #{report.id}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="max-w-[200px]">
                        <span className="font-medium text-gray-900 truncate block">
                          {report.type === 'IDENTITY' && report.metadata?.fullName
                            ? report.metadata.fullName
                            : report.searchQuery || '-'}
                        </span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1.5">
                        <span className="badge badge-info">
                          {typeLabels[report.type] || report.type}
                        </span>
                        {report.isBatch && (
                          <div className="relative group">
                            <i className="ki-duotone ki-abstract-26 text-purple-500 text-lg cursor-help">
                              <span className="path1"></span>
                              <span className="path2"></span>
                            </i>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                              Búsqueda masiva
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="table-cell">
                      {report.source ? (
                        <span className={`badge ${report.source === 'API' ? 'badge-purple' : 'badge-info'}`}>
                          {sourceLabels[report.source] || report.source}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1.5">
                        <span className={`badge ${statusStyles[report.status] || 'badge-gray'}`}>
                          {statusLabels[report.status] || report.status}
                        </span>
                        {report.deletedAt && (
                          <div className="relative group">
                            <i className="ki-duotone ki-trash text-red-400 text-base cursor-help">
                              <span className="path1"></span>
                              <span className="path2"></span>
                              <span className="path3"></span>
                              <span className="path4"></span>
                              <span className="path5"></span>
                            </i>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                              Eliminado por el usuario
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="table-cell">
                      {report.user ? (
                        <Link
                          href={`/users/${report.user.uid}`}
                          className="text-sm text-gray-700 hover:text-primary transition-colors"
                        >
                          {report.user.firstName} {report.user.lastName}
                        </Link>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="table-cell">
                      <div className="text-sm">
                        <div className="text-gray-900">{formatDateTime(report.createdAt)}</div>
                        <div className="text-xs text-gray-500">{getRelativeTime(report.createdAt)}</div>
                      </div>
                    </td>
                    <td className="table-cell text-end">
                      <Link
                        href={`/reports/${report.uid}`}
                        className="btn btn-sm btn-light"
                      >
                        <i className="ki-duotone ki-eye">
                          <span className="path1"></span>
                          <span className="path2"></span>
                          <span className="path3"></span>
                        </i>
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Paginación */}
            {reportsPagination && reportsPagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Mostrando {((reportsPage - 1) * reportsPagination.limit) + 1} a{' '}
                    {Math.min(reportsPage * reportsPagination.limit, reportsPagination.total)} de{' '}
                    {reportsPagination.total} reportes
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePageChange(reportsPage - 1)}
                      disabled={reportsPage === 1}
                      className="btn btn-sm btn-light"
                    >
                      <i className="ki-duotone ki-left"></i>
                      Anterior
                    </button>
                    {Array.from({ length: reportsPagination.totalPages }, (_, i) => i + 1)
                      .filter(page => {
                        const distance = Math.abs(page - reportsPage)
                        return distance === 0 || distance === 1 || page === 1 || page === reportsPagination.totalPages
                      })
                      .map((page, index, array) => (
                        <div key={page} className="flex items-center gap-2">
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="text-gray-400">...</span>
                          )}
                          <button
                            onClick={() => handlePageChange(page)}
                            className={`btn btn-sm ${reportsPage === page ? 'btn-primary' : 'btn-light'}`}
                          >
                            {page}
                          </button>
                        </div>
                      ))}
                    <button
                      onClick={() => handlePageChange(reportsPage + 1)}
                      disabled={!reportsPagination.hasMore}
                      className="btn btn-sm btn-light"
                    >
                      Siguiente
                      <i className="ki-duotone ki-right"></i>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Filters Popover Portal */}
      {filtersPopoverOpen && filtersPopoverPosition && typeof window !== 'undefined' && createPortal(
        <div
          ref={filtersPopoverRef}
          className="fixed bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-200 p-5 z-[99999] animate-fade-in min-w-[280px]"
          style={{
            top: `${filtersPopoverPosition.top}px`,
            left: `${filtersPopoverPosition.left}px`,
          }}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Fecha desde
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Fecha hasta
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-5 pt-4 border-t border-gray-100">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="flex-1 h-9 px-3 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Limpiar
              </button>
            )}
            <button
              type="button"
              onClick={handleApplyFilters}
              className="flex-1 h-9 px-3 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors"
            >
              Aplicar
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}