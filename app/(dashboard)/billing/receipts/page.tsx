'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { ReceiptStatus, ServiceLabels, ServiceType } from '@/lib/constants'
import { DataTable, Badge, ActionIcon, type Column, type FilterConfig, type ActionMenuItem, type Pagination } from '@/components/ui/DataTable'
import { formatDate } from '@/lib/utils/dateUtils'

interface SearchPurchased {
  serviceType: ServiceType
  quantity: number
  cost: number
}

interface Receipt {
  _id: string
  uid: string
  status: string
  total: number
  totalUSD: number
  currency: string
  searches: SearchPurchased[]
  accountId: {
    _id: string
    uid: string
    email: string
    billing?: { name?: string }
  }
  createdAt: string
}

export default function ReceiptsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [status, setStatus] = useState(searchParams?.get('status') || '')

  const fetchReceipts = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', searchParams?.get('page') || '1')
      params.set('limit', '10')
      if (status) params.set('status', status)

      const response = await fetch(`/api/receipts?${params}`)
      if (response.ok) {
        const data = await response.json()
        setReceipts(data.receipts)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching receipts:', error)
      toast.error('Error al cargar recibos')
    } finally {
      setIsLoading(false)
    }
  }, [status, searchParams])

  useEffect(() => {
    fetchReceipts()
  }, [fetchReceipts])

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'success'
      case 'PENDING': return 'warning'
      case 'PROCESSING': return 'info'
      case 'FAILED': return 'danger'
      case 'REFUNDED': return 'gray'
      default: return 'gray'
    }
  }

  const columns: Column<Receipt>[] = [
    {
      key: 'uid',
      header: 'Recibo',
      render: (receipt) => (
        <span className="font-medium text-primary">{receipt.uid}</span>
      )
    },
    {
      key: 'account',
      header: 'Cuenta',
      render: (receipt) => (
        <div>
          <Link
            href={`/accounts/${receipt.accountId?._id}`}
            className="font-medium text-gray-900 hover:text-primary transition-colors"
          >
            {receipt.accountId?.billing?.name || receipt.accountId?.email || 'N/A'}
          </Link>
          <p className="text-sm text-gray-500">{receipt.accountId?.uid}</p>
        </div>
      )
    },
    {
      key: 'services',
      header: 'Servicios',
      render: (receipt) => (
        <div className="flex flex-wrap gap-1">
          {receipt.searches?.slice(0, 3).map((s, i) => (
            <Badge key={i} variant="info" className="text-xs">
              {ServiceLabels[s.serviceType]} x{s.quantity}
            </Badge>
          ))}
          {receipt.searches?.length > 3 && (
            <Badge variant="gray" className="text-xs">
              +{receipt.searches.length - 3}
            </Badge>
          )}
        </div>
      )
    },
    {
      key: 'total',
      header: 'Total',
      render: (receipt) => (
        <div>
          <p className="font-semibold text-gray-900">
            ${receipt.total.toLocaleString()} {receipt.currency}
          </p>
          {receipt.currency !== 'USD' && (
            <p className="text-sm text-gray-500">${receipt.totalUSD.toFixed(2)} USD</p>
          )}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Estado',
      render: (receipt) => (
        <Badge variant={getStatusVariant(receipt.status) as 'success' | 'warning' | 'info' | 'danger' | 'gray'}>
          {receipt.status}
        </Badge>
      )
    },
    {
      key: 'createdAt',
      header: 'Fecha',
      render: (receipt) => (
        <span className="text-gray-500 text-sm">
          {formatDate(receipt.createdAt)}
        </span>
      )
    }
  ]

  const filters: FilterConfig[] = [
    {
      key: 'status',
      label: 'Estado',
      type: 'select',
      placeholder: 'Todos',
      options: Object.values(ReceiptStatus).map((s) => ({ value: s, label: s })),
      className: 'w-48'
    }
  ]

  const actions: ActionMenuItem<Receipt>[] = [
    {
      label: 'Ver detalle',
      icon: <ActionIcon icon="eye" className="text-gray-500" />,
      onClick: (receipt) => router.push(`/billing/receipts/${receipt._id}`)
    }
  ]

  const handleFilterSubmit = () => {
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    router.push(`/billing/receipts?${params}`)
  }

  const handleFilterClear = () => {
    setStatus('')
    router.push('/billing/receipts')
  }

  return (
    <DataTable
      data={receipts}
      columns={columns}
      keyExtractor={(receipt) => receipt._id}
      isLoading={isLoading}
      pagination={pagination}
      basePath="/billing/receipts"
      filters={filters}
      filterValues={{ status }}
      onFilterChange={(key, value) => {
        if (key === 'status') setStatus(value)
      }}
      onFilterSubmit={handleFilterSubmit}
      onFilterClear={handleFilterClear}
      actions={actions}
      title="Recibos"
      subtitle="Historial de recibos de pago"
      headerAction={
        <Link href="/billing" className="btn-outline flex items-center gap-2">
          <i className="ki-duotone ki-arrow-left text-lg">
            <span className="path1"></span>
            <span className="path2"></span>
          </i>
          Volver
        </Link>
      }
      emptyMessage="No se encontraron recibos"
    />
  )
}
