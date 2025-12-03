'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { InvoiceTypes } from '@/lib/constants'
import { DataTable, Badge, type Column, type FilterConfig, type Pagination } from '@/components/ui/DataTable'
import { formatDateTime, formatDate } from '@/lib/utils/dateUtils'

interface Invoice {
  _id: string
  uid: string
  type: string
  data: {
    cae?: string
    caeExpiration?: string
    invoiceNumber?: number
    pointOfSale?: number
    invoiceType?: string
  }
  file?: string
  accountId: {
    _id: string
    uid: string
    email: string
    billing?: { name?: string }
  }
  receiptId: {
    _id: string
    uid: string
    total: number
    currency: string
  }
  createdAt: string
}

const invoiceTypeLabels: Record<string, string> = {
  AFIP_A: 'Factura A',
  AFIP_B: 'Factura B',
  AFIP_C: 'Factura C',
  MANUAL: 'Manual',
}

export default function InvoicesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [type, setType] = useState(searchParams?.get('type') || '')

  const fetchInvoices = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', searchParams?.get('page') || '1')
      params.set('limit', '10')
      if (type) params.set('type', type)

      const response = await fetch(`/api/invoices?${params}`)
      if (response.ok) {
        const data = await response.json()
        setInvoices(data.invoices)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
      toast.error('Error al cargar facturas')
    } finally {
      setIsLoading(false)
    }
  }, [searchParams, type])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency || 'ARS',
    }).format(amount)
  }

  const columns: Column<Invoice>[] = [
    {
      key: 'invoice',
      header: 'Factura',
      render: (invoice) => (
        <div>
          <div className="font-medium text-gray-900">
            {invoice.data.pointOfSale && invoice.data.invoiceNumber
              ? `${String(invoice.data.pointOfSale).padStart(4, '0')}-${String(invoice.data.invoiceNumber).padStart(8, '0')}`
              : invoice.uid
            }
          </div>
          <div className="text-sm text-gray-500">{invoice.uid}</div>
        </div>
      )
    },
    {
      key: 'client',
      header: 'Cliente',
      render: (invoice) => (
        <div>
          <div className="text-sm text-gray-900">
            {invoice.accountId?.billing?.name || invoice.accountId?.email || 'N/A'}
          </div>
          <div className="text-sm text-gray-500">{invoice.accountId?.uid}</div>
        </div>
      )
    },
    {
      key: 'type',
      header: 'Tipo',
      render: (invoice) => (
        <Badge variant={invoice.type.startsWith('AFIP') ? 'info' : 'gray'}>
          {invoiceTypeLabels[invoice.type] || invoice.type}
        </Badge>
      )
    },
    {
      key: 'afipData',
      header: 'Datos AFIP',
      render: (invoice) => (
        invoice.data.cae ? (
          <div>
            <div className="text-sm text-gray-900">CAE: {invoice.data.cae}</div>
            {invoice.data.caeExpiration && (
              <div className="text-xs text-gray-500">
                Vto: {formatDate(invoice.data.caeExpiration)}
              </div>
            )}
          </div>
        ) : (
          <span className="text-sm text-gray-400">-</span>
        )
      )
    },
    {
      key: 'amount',
      header: 'Monto',
      render: (invoice) => (
        <div className="font-medium text-gray-900">
          {invoice.receiptId
            ? formatCurrency(invoice.receiptId.total, invoice.receiptId.currency)
            : 'N/A'
          }
        </div>
      )
    },
    {
      key: 'createdAt',
      header: 'Fecha',
      render: (invoice) => (
        <span className="text-sm text-gray-500">{formatDateTime(invoice.createdAt)}</span>
      )
    },
    {
      key: 'actions',
      header: 'Acciones',
      headerClassName: 'text-right',
      className: 'text-right',
      render: (invoice) => (
        <div className="flex justify-end gap-3">
          {invoice.file && (
            <a
              href={invoice.file}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary-dark"
            >
              <i className="ki-duotone ki-document text-lg">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
            </a>
          )}
          <Link
            href={`/billing/receipts?receiptId=${invoice.receiptId?._id}`}
            className="text-gray-600 hover:text-gray-900 text-sm font-medium"
          >
            Ver recibo
          </Link>
        </div>
      )
    }
  ]

  const filters: FilterConfig[] = [
    {
      key: 'type',
      type: 'select',
      placeholder: 'Todos los tipos',
      options: Object.entries(InvoiceTypes).map(([key, value]) => ({
        value: value,
        label: invoiceTypeLabels[value] || value
      })),
      className: 'w-48'
    }
  ]

  const handleFilterSubmit = () => {
    const params = new URLSearchParams()
    if (type) params.set('type', type)
    router.push(`/billing/invoices?${params}`)
  }

  const handleFilterClear = () => {
    setType('')
    router.push('/billing/invoices')
  }

  return (
    <DataTable
      data={invoices}
      columns={columns}
      keyExtractor={(invoice) => invoice._id}
      isLoading={isLoading}
      pagination={pagination}
      basePath="/billing/invoices"
      filters={filters}
      filterValues={{ type }}
      onFilterChange={(key, value) => {
        if (key === 'type') setType(value)
      }}
      onFilterSubmit={handleFilterSubmit}
      onFilterClear={handleFilterClear}
      title="Facturas"
      subtitle="Listado de facturas emitidas"
      emptyMessage="No se encontraron facturas"
    />
  )
}
