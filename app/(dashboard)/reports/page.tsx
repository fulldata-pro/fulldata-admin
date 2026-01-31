'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { RequestStatus, ServiceLabels, ServicesType, RequestSource, RequestSourceLabels, RequestSourceType } from '@/lib/constants'
import { DataTable, Badge, ActionIcon, type Column, type FilterConfig, type ActionMenuItem, type Pagination, type ExportConfig } from '@/components/ui/DataTable'
import { formatDateTime, getRelativeTime } from '@/lib/utils/dateUtils'

interface Report {
  id: number
  uid: string
  type: string
  status: string
  searchQuery?: string
  isBatch?: boolean
  source?: 'API' | 'WEB' | null
  metadata?: {
    fullName?: string
    [key: string]: unknown
  }
  account?: {
    uid: string
    email: string
    name?: string
  }
  user?: {
    uid: string
    firstName: string
    lastName: string
    email: string
  }
  createdAt: string
  deletedAt?: string | null
}

const DEFAULT_PAGE_SIZE = 10

const statusLabels: Record<string, string> = {
  PENDING: 'Pendiente',
  REVIEW_NEEDED: 'Rev. necesaria',
  PROCESSING: 'Procesando',
  PARTIAL: 'Parcial',
  NOT_FOUND: 'No encontrado',
  COMPLETED: 'Completado',
  FAILED: 'Fallido',
  EXPIRED: 'Expirado',
}

const statusVariants: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'gray' | 'purple'> = {
  PENDING: 'gray',
  REVIEW_NEEDED: 'warning',
  PROCESSING: 'info',
  PARTIAL: 'purple',
  NOT_FOUND: 'gray',
  COMPLETED: 'success',
  FAILED: 'danger',
  EXPIRED: 'gray',
}

const typeLabels: Record<string, string> = {
  ...ServiceLabels,
}

export default function ReportsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [reports, setReports] = useState<Report[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState(searchParams?.get('search') || '')
  const [status, setStatus] = useState(searchParams?.get('status') || '')
  const [type, setType] = useState(searchParams?.get('type') || '')
  const [pageSize, setPageSize] = useState(parseInt(searchParams?.get('limit') || String(DEFAULT_PAGE_SIZE)))
  const [selectedReports, setSelectedReports] = useState<string[]>([])

  const fetchReports = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', searchParams?.get('page') || '1')
      params.set('limit', String(pageSize))
      if (search) params.set('search', search)
      if (status) params.set('status', status)
      if (type) params.set('type', type)

      const response = await fetch(`/api/reports?${params}`)
      if (response.ok) {
        const data = await response.json()
        setReports(data.reports)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
      toast.error('Error al cargar reportes')
    } finally {
      setIsLoading(false)
    }
  }, [searchParams, search, status, type, pageSize])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  const columns: Column<Report>[] = [
    {
      key: 'id',
      header: 'ID',
      exportValue: (report) => String(report.id),
      render: (report) => (
        <span className="font-mono text-sm text-gray-600">
          #{report.id}
        </span>
      )
    },
    {
      key: 'search',
      header: 'Búsqueda',
      exportValue: (report) =>
        report.type === 'IDENTITY' && report.metadata?.fullName
          ? report.metadata.fullName
          : report.searchQuery || '-',
      render: (report) => (
        <div className="max-w-[200px]">
          <span className="font-medium text-gray-900 truncate block">
            {report.type === 'IDENTITY' && report.metadata?.fullName
              ? report.metadata.fullName
              : report.searchQuery || '-'}
          </span>
        </div>
      )
    },
    {
      key: 'type',
      header: 'Tipo',
      exportValue: (report) => `${typeLabels[report.type] || report.type}${report.isBatch ? ' (Masiva)' : ''}`,
      render: (report) => (
        <div className="flex items-center gap-1.5">
          <Badge variant="info">
            {typeLabels[report.type] || report.type}
          </Badge>
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
      )
    },
    {
      key: 'source',
      header: 'Origen',
      exportValue: (report) => report.source ? RequestSourceLabels[report.source] : '-',
      render: (report) => (
        report.source ? (
          <Badge variant={report.source === 'API' ? 'purple' : 'info'}>
            {RequestSourceLabels[report.source]}
          </Badge>
        ) : (
          <span className="text-gray-400">-</span>
        )
      )
    },
    {
      key: 'status',
      header: 'Estado',
      exportValue: (report) => `${statusLabels[report.status] || report.status}${report.deletedAt ? ' (Eliminado)' : ''}`,
      render: (report) => (
        <div className="flex items-center gap-1.5">
          <Badge variant={statusVariants[report.status] || 'gray'}>
            {statusLabels[report.status] || report.status}
          </Badge>
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
      )
    },
    {
      key: 'account',
      header: 'Cuenta',
      exportValue: (report) => report.account?.name || report.account?.email || '',
      render: (report) => (
        report.account ? (
          <Link
            href={`/accounts/${report.account.uid}`}
            className="text-sm font-medium text-gray-900 hover:text-primary transition-colors"
          >
            {report.account.name || report.account.email}
          </Link>
        ) : (
          <span className="text-gray-400">-</span>
        )
      )
    },
    {
      key: 'user',
      header: 'Usuario',
      exportValue: (report) => report.user ? `${report.user.firstName} ${report.user.lastName}` : '',
      render: (report) => (
        report.user ? (
          <Link
            href={`/users/${report.user.uid}`}
            className="text-sm text-gray-700 hover:text-primary transition-colors"
          >
            {report.user.firstName} {report.user.lastName}
          </Link>
        ) : (
          <span className="text-gray-400">-</span>
        )
      )
    },
    {
      key: 'createdAt',
      header: 'Fecha',
      exportValue: (report) => formatDateTime(report.createdAt),
      render: (report) => (
        <div>
          <div className="text-sm text-gray-900">{formatDateTime(report.createdAt)}</div>
          <div className="text-xs text-gray-500">{getRelativeTime(report.createdAt)}</div>
        </div>
      )
    }
  ]

  const actions: ActionMenuItem<Report>[] = [
    {
      label: 'Ver reporte',
      icon: <ActionIcon icon="eye" className="text-gray-500" />,
      onClick: () => {
        // TODO: Implementar ver reporte
      }
    },
    {
      label: 'Historial de webhooks',
      icon: <ActionIcon icon="send" className="text-gray-500" />,
      onClick: () => {
        // TODO: Implementar historial de webhooks
      }
    },
    {
      label: 'Eliminar reporte',
      icon: <ActionIcon icon="trash" className="text-danger" />,
      onClick: () => {
        // TODO: Implementar eliminar reporte
      },
      className: 'text-danger'
    }
  ]

  const exportConfig: ExportConfig = {
    filename: 'reportes',
  }

  const filters: FilterConfig[] = [
    {
      key: 'search',
      type: 'text',
      placeholder: 'Buscar por ID, nombre, documento...',
      className: 'w-72'
    },
    {
      key: 'status',
      type: 'select',
      placeholder: 'Todos los estados',
      options: Object.entries(RequestStatus).map(([, value]) => ({
        value: value,
        label: statusLabels[value] || value
      })),
      className: 'w-48'
    },
    {
      key: 'type',
      type: 'select',
      placeholder: 'Todos los tipos',
      options: Object.entries(ServicesType).map(([, value]) => ({
        value: value,
        label: typeLabels[value] || value
      })),
      className: 'w-40'
    }
  ]

  const handleFilterSubmit = () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (status) params.set('status', status)
    if (type) params.set('type', type)
    if (pageSize !== DEFAULT_PAGE_SIZE) params.set('limit', String(pageSize))
    router.push(`/reports?${params}`)
  }

  const handleFilterClear = () => {
    setSearch('')
    setStatus('')
    setType('')
    setPageSize(DEFAULT_PAGE_SIZE)
    router.push('/reports')
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    const params = new URLSearchParams(searchParams?.toString() || '')
    params.set('limit', String(newSize))
    params.set('page', '1')
    router.push(`/reports?${params}`)
  }

  return (
    <DataTable
      data={reports}
      columns={columns}
      keyExtractor={(report) => report.uid}
      isLoading={isLoading}
      pagination={pagination}
      basePath="/reports"
      onPageSizeChange={handlePageSizeChange}
      filters={filters}
      filterValues={{ search, status, type }}
      onFilterChange={(key, value) => {
        if (key === 'search') setSearch(value)
        if (key === 'status') setStatus(value)
        if (key === 'type') setType(value)
      }}
      onFilterSubmit={handleFilterSubmit}
      onFilterClear={handleFilterClear}
      selectable
      selectedItems={selectedReports}
      onSelectionChange={setSelectedReports}
      actions={actions}
      title="Reportes"
      subtitle="Listado de reportes generados"
      emptyMessage="No se encontraron reportes"
      exportConfig={exportConfig}
    />
  )
}
