'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { InvoiceTypes, ROUTES } from '@/lib/constants'
import { DataTable, Badge, ActionIcon, type Column, type FilterConfig, type ActionMenuItem, type Pagination } from '@/components/ui/DataTable'
import { formatDateTime, formatDate } from '@/lib/utils/dateUtils'
import { formatCurrency } from '@/lib/utils/currencyUtils'

interface AFIPData {
  invoiceNumber: string
  billType: 'A' | 'B' | 'C'
  voucherType: string
  total: number
  currency: string
  cae: string
  caeExpiredDate: string
  emitedDate: string
  customer: {
    name: string
    taxId: string
    taxCondition: string
  }
}

interface Invoice {
  id: number
  uid: string
  type: string
  displayNumber: string
  afipData?: AFIPData
  fileUrl?: string
  hasFile: boolean
  account: {
    uid: string
    email: string
    billingName?: string
    taxId?: string
  }
  receipt?: {
    uid: string
    total: number
    currency: string
  }
  createdAt: string
}

const DEFAULT_PAGE_SIZE = 10

const invoiceTypeLabels: Record<string, string> = {
  AFIP: 'AFIP',
  INTERNATIONAL: 'Internacional',
  GENERIC: 'Genérica',
}

const billTypeColors: Record<string, { bg: string; text: string }> = {
  A: { bg: 'bg-blue-100', text: 'text-blue-700' },
  B: { bg: 'bg-green-100', text: 'text-green-700' },
  C: { bg: 'bg-purple-100', text: 'text-purple-700' },
}

export default function InvoicesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [type, setType] = useState(searchParams?.get('type') || '')
  const [pageSize, setPageSize] = useState(parseInt(searchParams?.get('limit') || String(DEFAULT_PAGE_SIZE)))
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([])

  const fetchInvoices = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', searchParams?.get('page') || '1')
      params.set('limit', String(pageSize))
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
  }, [searchParams, type, pageSize])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  const columns: Column<Invoice>[] = [
    {
      key: 'invoice',
      header: 'Factura',
      render: (invoice) => (
        <span className="font-medium text-gray-900 font-mono">
          {invoice.displayNumber}
        </span>
      )
    },
    {
      key: 'type',
      header: 'Tipo',
      render: (invoice) => {
        if (invoice.type === 'AFIP' && invoice.afipData) {
          const colors = billTypeColors[invoice.afipData.billType] || { bg: 'bg-gray-100', text: 'text-gray-700' }
          return (
            <span className={`px-2 py-1 rounded text-xs font-medium ${colors.bg} ${colors.text}`}>
              FA-{invoice.afipData.billType}
            </span>
          )
        }
        return (
          <Badge variant="gray">
            {invoiceTypeLabels[invoice.type] || invoice.type}
          </Badge>
        )
      }
    },
    {
      key: 'client',
      header: 'Cliente',
      render: (invoice) => {
        // Prioridad: datos AFIP > datos de cuenta
        const customerName = invoice.afipData?.customer?.name || invoice.account?.billingName || invoice.account?.email || 'N/A'
        const customerTaxId = invoice.afipData?.customer?.taxId || invoice.account?.taxId

        return (
          <div>
            <Link
              href={`/accounts?uid=${invoice.account?.uid}`}
              className="font-medium text-gray-900 hover:text-primary transition-colors"
            >
              {customerName}
            </Link>
            {customerTaxId && (
              <div className="text-xs text-gray-500">
                CUIT: {customerTaxId}
              </div>
            )}
          </div>
        )
      }
    },
    {
      key: 'cae',
      header: 'CAE',
      render: (invoice) => (
        invoice.afipData?.cae ? (
          <div>
            <div className="text-sm font-mono text-gray-900">{invoice.afipData.cae}</div>
            {invoice.afipData.caeExpiredDate && (
              <div className="text-xs text-gray-500">
                Vto: {formatDate(invoice.afipData.caeExpiredDate)}
              </div>
            )}
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        )
      )
    },
    {
      key: 'amount',
      header: 'Monto',
      render: (invoice) => {
        // Usar monto de AFIP data si está disponible, sino del receipt
        const total = invoice.afipData?.total ?? invoice.receipt?.total
        const currency = invoice.afipData?.currency ?? invoice.receipt?.currency ?? 'ARS'

        return total !== undefined ? (
          <div className="font-medium text-gray-900">
            {formatCurrency(total, currency)}
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        )
      }
    },
    {
      key: 'pdf',
      header: 'PDF',
      render: (invoice) => (
        invoice.hasFile ? (
          <button
            onClick={() => invoice.fileUrl && window.open(invoice.fileUrl, '_blank')}
            className="text-primary hover:text-primary-dark transition-colors"
            title="Descargar PDF"
          >
            <i className="ki-duotone ki-document text-xl">
              <span className="path1"></span>
              <span className="path2"></span>
            </i>
          </button>
        ) : (
          <span className="text-gray-300">
            <i className="ki-duotone ki-document text-xl">
              <span className="path1"></span>
              <span className="path2"></span>
            </i>
          </span>
        )
      )
    },
    {
      key: 'createdAt',
      header: 'Fecha',
      render: (invoice) => (
        <span className="text-sm text-gray-500">{formatDateTime(invoice.createdAt)}</span>
      )
    }
  ]

  const actions: ActionMenuItem<Invoice>[] = [
    {
      label: 'Ver recibo',
      icon: <ActionIcon icon="receipt" className="text-gray-500" />,
      onClick: (invoice) => {
        if (invoice.receipt?.uid) {
          router.push(ROUTES.BILLING.RECEIPT_DETAIL(invoice.receipt.uid))
        }
      },
      show: (invoice) => !!invoice.receipt
    }
  ]

  const filters: FilterConfig[] = [
    {
      key: 'type',
      type: 'select',
      placeholder: 'Todos los tipos',
      options: Object.entries(InvoiceTypes).map(([, value]) => ({
        value: value,
        label: invoiceTypeLabels[value] || value
      })),
      className: 'w-48'
    }
  ]

  const handleFilterSubmit = () => {
    const params = new URLSearchParams()
    if (type) params.set('type', type)
    if (pageSize !== DEFAULT_PAGE_SIZE) params.set('limit', String(pageSize))
    router.push(`/billing/invoices?${params}`)
  }

  const handleFilterClear = () => {
    setType('')
    setPageSize(DEFAULT_PAGE_SIZE)
    router.push('/billing/invoices')
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    const params = new URLSearchParams(searchParams?.toString() || '')
    params.set('limit', String(newSize))
    params.set('page', '1')
    router.push(`/billing/invoices?${params}`)
  }

  return (
    <DataTable
      data={invoices}
      columns={columns}
      keyExtractor={(invoice) => invoice.uid}
      isLoading={isLoading}
      pagination={pagination}
      basePath="/billing/invoices"
      onPageSizeChange={handlePageSizeChange}
      filters={filters}
      filterValues={{ type }}
      onFilterChange={(key, value) => {
        if (key === 'type') setType(value)
      }}
      onFilterSubmit={handleFilterSubmit}
      onFilterClear={handleFilterClear}
      selectable
      selectedItems={selectedInvoices}
      onSelectionChange={setSelectedInvoices}
      actions={actions}
      title="Facturas"
      subtitle="Listado de facturas emitidas"
      emptyMessage="No se encontraron facturas"
    />
  )
}
