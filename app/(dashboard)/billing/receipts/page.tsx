'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { ReceiptStatus, ROUTES } from '@/lib/constants'
import { DataTable, Badge, ActionIcon, type Column, type FilterConfig, type ActionMenuItem, type Pagination, type ExportConfig } from '@/components/ui/DataTable'
import { formatDateTime } from '@/lib/utils/dateUtils'
import { formatCurrency } from '@/lib/utils/currencyUtils'
import Image from 'next/image'

interface ReceiptTokens {
  quantity: number
  unitPrice: number
}

interface Invoice {
  id: string
  uid: string
  number?: string
  status: string
}

interface DiscountCode {
  code: string
  name: string
  value: number
  type: string
}

interface BulkDiscount {
  name: string
  appliedTier?: {
    minTokens: number
    discountPercentage: number
    label?: string
  }
}

interface Account {
  id?: number
  uid: string
  email: string
  avatar?: string
  billingName?: string
}

interface Receipt {
  id: number
  uid: string
  status: string
  total: number
  subtotal: number
  currency: string
  tokens?: ReceiptTokens
  paymentProvider?: string
  invoice?: Invoice
  discountCode?: DiscountCode
  bulkDiscount?: BulkDiscount
  expiredAt?: string
  account: Account
  createdAt: string
}

const DEFAULT_PAGE_SIZE = 10

interface DiscountPopupPosition {
  top: number
  left: number
  showAbove: boolean
}

export default function ReceiptsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [status, setStatus] = useState(searchParams?.get('status') || '')
  const [pageSize, setPageSize] = useState(parseInt(searchParams?.get('limit') || String(DEFAULT_PAGE_SIZE)))
  const [selectedReceipts, setSelectedReceipts] = useState<string[]>([])
  const [hoveredDiscount, setHoveredDiscount] = useState<string | null>(null)
  const [discountPopupPosition, setDiscountPopupPosition] = useState<DiscountPopupPosition | null>(null)
  const discountButtonRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  const fetchReceipts = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', searchParams?.get('page') || '1')
      params.set('limit', String(pageSize))
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
  }, [status, pageSize, searchParams])

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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'Completado'
      case 'PENDING': return 'Pendiente'
      case 'PROCESSING': return 'Procesando'
      case 'FAILED': return 'Fallido'
      case 'REFUNDED': return 'Reembolsado'
      default: return status
    }
  }

  const handleDiscountHover = (receiptUid: string) => {
    const buttonEl = discountButtonRefs.current.get(receiptUid)
    if (buttonEl) {
      const rect = buttonEl.getBoundingClientRect()
      const popupHeight = 150
      const spaceBelow = window.innerHeight - rect.bottom
      const showAbove = spaceBelow < popupHeight && rect.top > popupHeight

      setDiscountPopupPosition({
        top: showAbove ? rect.top : rect.bottom + 8,
        left: rect.left,
        showAbove
      })
    }
    setHoveredDiscount(receiptUid)
  }

  const handleDiscountLeave = () => {
    setHoveredDiscount(null)
    setDiscountPopupPosition(null)
  }

  const calculateDiscountAmount = (receipt: Receipt): number => {
    // La diferencia entre subtotal y total es el descuento aplicado
    return receipt.subtotal - receipt.total
  }

  const columns: Column<Receipt>[] = [
    {
      key: 'id',
      header: 'ID',
      exportValue: (receipt) => receipt.id,
      render: (receipt) => (
        <span className="font-mono text-sm text-gray-600">{receipt.id}</span>
      )
    },
    {
      key: 'account',
      header: 'Cuenta',
      exportValue: (receipt) => receipt.account?.billingName || receipt.account?.email || 'N/A',
      render: (receipt) => (
        <div className="flex items-center gap-3">
          {receipt.account?.avatar ? (
            <img
              src={receipt.account.avatar}
              alt=""
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-xs text-gray-500">
                {(receipt.account?.billingName || receipt.account?.email || '?')[0].toUpperCase()}
              </span>
            </div>
          )}
          <Link
            href={ROUTES.ACCOUNT_DETAIL(receipt.account?.uid || '')}
            className="font-medium text-gray-900 hover:text-primary transition-colors"
          >
            {receipt.account?.billingName || receipt.account?.email || 'N/A'}
          </Link>
        </div>
      )
    },
    {
      key: 'paymentProvider',
      header: 'Pago',
      exportValue: (receipt) => receipt.paymentProvider || '',
      render: (receipt) => {
        if (!receipt.paymentProvider) {
          return <span className="text-gray-400">-</span>
        }

        const provider = receipt.paymentProvider.toLowerCase()

        if (provider === 'mercado_pago') {
          return (
            <Image
              src="/images/payment-methods/mercado_pago.svg"
              alt="MercadoPago"
              width={80}
              height={24}
              className="h-6 w-auto"
            />
          )
        }

        if (provider === 'stripe') {
          return (
            <Image
              src="/images/payment-methods/stripe.svg"
              alt="Stripe"
              width={50}
              height={24}
              className="h-6 w-auto"
            />
          )
        }

        return <span className="text-gray-700">{receipt.paymentProvider}</span>
      }
    },
    {
      key: 'tokens',
      header: 'Tokens',
      exportValue: (receipt) => receipt.tokens?.quantity || 0,
      render: (receipt) => (
        <div>
          {receipt.tokens ? (
            <p className="font-medium text-gray-900">
              {receipt.tokens.quantity.toLocaleString('es-AR')}
            </p>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      )
    },
    {
      key: 'subtotal',
      header: 'Subtotal',
      exportValue: (receipt) => receipt.subtotal,
      render: (receipt) => (
        <p className="text-gray-600">
          {formatCurrency(receipt.subtotal, receipt.currency)}
        </p>
      )
    },
    {
      key: 'discounts',
      header: 'Descuentos',
      exportValue: (receipt) => calculateDiscountAmount(receipt),
      render: (receipt) => {
        const hasDiscountCode = receipt.discountCode
        const hasBulkDiscount = receipt.bulkDiscount
        const discountAmount = calculateDiscountAmount(receipt)

        if (!hasDiscountCode && !hasBulkDiscount && discountAmount <= 0) {
          return <span className="text-gray-400">-</span>
        }

        const discountCount = [hasDiscountCode, hasBulkDiscount].filter(Boolean).length

        return (
          <div
            ref={(el) => {
              if (el) discountButtonRefs.current.set(receipt.uid, el)
            }}
            className="relative"
            onMouseEnter={() => handleDiscountHover(receipt.uid)}
            onMouseLeave={handleDiscountLeave}
          >
            <div className="flex items-center gap-1.5 cursor-pointer">
              <i className="ki-duotone ki-discount text-green-500">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
              <span className="font-medium text-green-600">
                -{formatCurrency(discountAmount, receipt.currency)}
              </span>
              {discountCount > 1 && (
                <span className="text-xs text-gray-400">({discountCount})</span>
              )}
            </div>
          </div>
        )
      }
    },
    {
      key: 'total',
      header: 'Total',
      exportValue: (receipt) => receipt.total,
      render: (receipt) => (
        <p className="font-semibold text-gray-900">
          {formatCurrency(receipt.total, receipt.currency)}
        </p>
      )
    },
    {
      key: 'status',
      header: 'Estado',
      exportValue: (receipt) => getStatusLabel(receipt.status),
      render: (receipt) => (
        <Badge variant={getStatusVariant(receipt.status) as 'success' | 'warning' | 'info' | 'danger' | 'gray'}>
          {getStatusLabel(receipt.status)}
        </Badge>
      )
    },
    {
      key: 'invoice',
      header: 'Factura',
      exportValue: (receipt) => receipt.invoice?.number || receipt.invoice?.uid || '',
      render: (receipt) => {
        if (!receipt.invoice) {
          return <span className="text-gray-400">-</span>
        }
        return (
          <Link
            href={`/billing/invoices/${receipt.invoice.id}`}
            className="text-primary hover:underline text-sm"
          >
            {receipt.invoice.number || receipt.invoice.uid}
          </Link>
        )
      }
    },
    {
      key: 'expiredAt',
      header: 'Vencimiento',
      exportValue: (receipt) => receipt.expiredAt ? formatDateTime(receipt.expiredAt) : '',
      render: (receipt) => (
        <span className="text-gray-500 text-sm">
          {receipt.expiredAt ? formatDateTime(receipt.expiredAt) : '-'}
        </span>
      )
    },
    {
      key: 'createdAt',
      header: 'Creado',
      exportValue: (receipt) => formatDateTime(receipt.createdAt),
      render: (receipt) => (
        <span className="text-gray-500 text-sm">
          {formatDateTime(receipt.createdAt)}
        </span>
      )
    }
  ]

  const exportConfig: ExportConfig = {
    filename: 'recibos'
  }

  const filters: FilterConfig[] = [
    {
      key: 'status',
      label: 'Estado',
      type: 'select',
      placeholder: 'Todos',
      options: Object.values(ReceiptStatus).map((s) => ({ value: s, label: getStatusLabel(s) })),
      className: 'w-48'
    }
  ]

  const actions: ActionMenuItem<Receipt>[] = [
    {
      label: 'Ver detalle',
      icon: <ActionIcon icon="eye" className="text-gray-500" />,
      onClick: (receipt) => router.push(`/billing/receipts/${receipt.uid}`)
    }
  ]

  const handleFilterSubmit = () => {
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    if (pageSize !== DEFAULT_PAGE_SIZE) params.set('limit', String(pageSize))
    router.push(`/billing/receipts?${params}`)
  }

  const handleFilterClear = () => {
    setStatus('')
    setPageSize(DEFAULT_PAGE_SIZE)
    router.push('/billing/receipts')
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    const params = new URLSearchParams(searchParams?.toString() || '')
    params.set('limit', String(newSize))
    params.set('page', '1')
    router.push(`/billing/receipts?${params}`)
  }

  const hoveredReceipt = receipts.find(r => r.uid === hoveredDiscount)

  return (
    <>
      <DataTable
        data={receipts}
        columns={columns}
        keyExtractor={(receipt) => receipt.uid}
        isLoading={isLoading}
        pagination={pagination}
        basePath="/billing/receipts"
        onPageSizeChange={handlePageSizeChange}
        filters={filters}
        filterValues={{ status }}
        onFilterChange={(key, value) => {
          if (key === 'status') setStatus(value)
        }}
        onFilterSubmit={handleFilterSubmit}
        onFilterClear={handleFilterClear}
        selectable
        selectedItems={selectedReceipts}
        onSelectionChange={setSelectedReceipts}
        actions={actions}
        title="Recibos"
        subtitle="Historial de recibos de pago"
        emptyMessage="No se encontraron recibos"
        exportConfig={exportConfig}
      />

      {/* Discount Popup Portal */}
      {hoveredDiscount && hoveredReceipt && discountPopupPosition && typeof window !== 'undefined' && createPortal(
        <div
          className="fixed w-64 bg-white/95 backdrop-blur-xl rounded-xl shadow-xl border border-gray-100 py-2 z-[99999] animate-fade-in"
          style={{
            top: discountPopupPosition.showAbove ? 'auto' : `${discountPopupPosition.top}px`,
            bottom: discountPopupPosition.showAbove ? `${window.innerHeight - discountPopupPosition.top + 8}px` : 'auto',
            left: `${discountPopupPosition.left}px`,
          }}
          onMouseEnter={() => setHoveredDiscount(hoveredDiscount)}
          onMouseLeave={handleDiscountLeave}
        >
          <div className="px-4 pb-2 border-b border-gray-100">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Descuentos aplicados</span>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {hoveredReceipt.discountCode && (
              <div className="px-4 py-2.5 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">Código</span>
                  <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                    -{hoveredReceipt.discountCode.value}%
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {hoveredReceipt.discountCode.code}
                  {hoveredReceipt.discountCode.name && ` - ${hoveredReceipt.discountCode.name}`}
                </div>
              </div>
            )}
            {hoveredReceipt.bulkDiscount && (
              <div className="px-4 py-2.5 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">Volumen</span>
                  <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                    {hoveredReceipt.bulkDiscount.appliedTier
                      ? `-${hoveredReceipt.bulkDiscount.appliedTier.discountPercentage}%`
                      : 'Aplicado'}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {hoveredReceipt.bulkDiscount.name}
                  {hoveredReceipt.bulkDiscount.appliedTier?.label && ` - ${hoveredReceipt.bulkDiscount.appliedTier.label}`}
                </div>
              </div>
            )}
            {/* Si hay descuento pero no hay código ni bulk vinculado */}
            {!hoveredReceipt.discountCode && !hoveredReceipt.bulkDiscount && hoveredReceipt.subtotal > hoveredReceipt.total && (
              <div className="px-4 py-2.5 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">Descuento</span>
                  <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
                    -{Math.round((1 - hoveredReceipt.total / hoveredReceipt.subtotal) * 100)}%
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Descuento por paquete de tokens
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
