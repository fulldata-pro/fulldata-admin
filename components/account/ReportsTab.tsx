'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { formatDate, formatDateTime, getRelativeTime } from '@/lib/utils/dateUtils'
import { formatNumber } from '@/lib/utils/currencyUtils'
import { ROUTES, ServiceLabels } from '@/lib/constants'

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

  const fetchReports = useCallback(async () => {
    if (!accountId) return
    setIsLoadingReports(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(reportsPage))
      params.set('limit', '10')
      params.set('accountId', accountId)

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
  }, [accountId, reportsPage])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  // Status labels and styles
  const statusLabels: Record<string, string> = {
    'PENDING': 'Pendiente',
    'PROCESSING': 'Procesando',
    'COMPLETED': 'Completado',
    'CANCELLED': 'Cancelado',
    'ERROR': 'Error',
    'FAILED': 'Fallido'
  }

  const statusStyles: Record<string, string> = {
    'PENDING': 'badge-warning',
    'PROCESSING': 'badge-info',
    'COMPLETED': 'badge-success',
    'CANCELLED': 'badge-gray',
    'ERROR': 'badge-danger',
    'FAILED': 'badge-danger'
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

  return (
    <div className="rounded-2xl bg-white shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-secondary">Reportes Generados</h3>
        <p className="text-gray-500 text-sm mt-1">
          Historial de reportes y búsquedas
        </p>
      </div>

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
                  <tr key={report.uid} className="hover:bg-gray-50 transition-colors">
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
                      <span className={`badge ${statusStyles[report.status] || 'badge-gray'}`}>
                        {statusLabels[report.status] || report.status}
                      </span>
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
                      onClick={() => setReportsPage(reportsPage - 1)}
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
                            onClick={() => setReportsPage(page)}
                            className={`btn btn-sm ${reportsPage === page ? 'btn-primary' : 'btn-light'}`}
                          >
                            {page}
                          </button>
                        </div>
                      ))}
                    <button
                      onClick={() => setReportsPage(reportsPage + 1)}
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
    </div>
  )
}