'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-toastify'
import { ROUTES, ReceiptStatus } from '@/lib/constants'
import { formatDateTime, formatDate } from '@/lib/utils/dateUtils'
import { formatCurrency, formatNumber } from '@/lib/utils/currencyUtils'
import { Badge } from '@/components/ui/DataTable'

interface ReceiptTokens {
  quantity: number
  unitPrice: number
}

interface Invoice {
  uid: string
  data: {
    invoice: string
    billType: string
    cae: string
    caeExpiredDate: number
    qrCode: string
    pdfUrl?: string
  }
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

interface Benefit {
  name: string
  description: string
}

interface Account {
  uid: string
  email?: string
  billingName?: string
  avatar?: string
  billing?: {
    name?: string
    taxId?: string
    [key: string]: any
  }
}

interface Receipt {
  id: number
  uid: string
  status: string
  statusMessage?: string
  total: number
  subtotal: number
  currency: string
  tokens?: ReceiptTokens
  paymentProvider?: string
  providerTransactionId?: string
  providerTransactionUrl?: string
  account: Account
  invoice?: Invoice
  discountCode?: DiscountCode
  bulkDiscount?: BulkDiscount
  benefit?: Benefit
  expiredAt?: string
  createdAt: string
  updatedAt?: string
}

const getStatusConfig = (status: string) => {
  const configs: Record<string, {
    label: string
    variant: 'warning' | 'info' | 'success' | 'danger' | 'gray'
    iconClass: string
    bgGradient: string
    borderColor: string
    textColor: string
    iconColor: string
  }> = {
    [ReceiptStatus.PENDING]: {
      label: 'Pendiente',
      variant: 'warning',
      iconClass: 'ki-time',
      bgGradient: 'from-yellow-50 to-amber-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-600',
    },
    [ReceiptStatus.PROCESSING]: {
      label: 'Procesando',
      variant: 'info',
      iconClass: 'ki-loading',
      bgGradient: 'from-blue-50 to-indigo-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-600',
    },
    [ReceiptStatus.COMPLETED]: {
      label: 'Completado',
      variant: 'success',
      iconClass: 'ki-check-circle',
      bgGradient: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      iconColor: 'text-green-600',
    },
    [ReceiptStatus.FAILED]: {
      label: 'Fallido',
      variant: 'danger',
      iconClass: 'ki-cross-circle',
      bgGradient: 'from-red-50 to-rose-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      iconColor: 'text-red-600',
    },
    [ReceiptStatus.REFUNDED]: {
      label: 'Reembolsado',
      variant: 'gray',
      iconClass: 'ki-arrow-circle-left',
      bgGradient: 'from-gray-50 to-slate-50',
      borderColor: 'border-gray-200',
      textColor: 'text-gray-800',
      iconColor: 'text-gray-600',
    },
  }
  return configs[status] || configs[ReceiptStatus.PENDING]
}

// Función para traducir mensajes de estado comunes
const translateStatusMessage = (message: string | undefined): string | undefined => {
  if (!message) return undefined

  const translations: Record<string, string> = {
    'Receipt expired due to inactivity': 'Recibo expirado por inactividad',
    'Payment completed successfully': 'Pago completado exitosamente',
    'Payment failed': 'Pago fallido',
    'Payment pending': 'Pago pendiente',
    'Transaction cancelled': 'Transacción cancelada',
    'Refund processed': 'Reembolso procesado',
  }

  return translations[message] || message
}

export default function ReceiptDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false)

  useEffect(() => {
    if (params?.uid) {
      fetchReceipt(params.uid as string)
    }
  }, [params?.uid])

  const fetchReceipt = async (uid: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/receipts/${uid}`)
      if (response.ok) {
        const data = await response.json()
        setReceipt(data.receipt)
      } else if (response.status === 404) {
        toast.error('Recibo no encontrado')
        router.push(ROUTES.BILLING.RECEIPTS)
      } else {
        toast.error('Error al cargar el recibo')
      }
    } catch (error) {
      console.error('Error fetching receipt:', error)
      toast.error('Error al cargar el recibo')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateInvoice = async () => {
    if (!receipt) return

    setIsGeneratingInvoice(true)
    try {
      const response = await fetch(`/api/receipts/${receipt.uid}/generate-invoice`, {
        method: 'POST',
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Factura generada exitosamente')
        await fetchReceipt(receipt.uid)
      } else {
        toast.error(data.error || 'Error al generar la factura')
      }
    } catch (error) {
      console.error('Error generating invoice:', error)
      toast.error('Error al generar la factura')
    } finally {
      setIsGeneratingInvoice(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#eb1034] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando recibo...</p>
        </div>
      </div>
    )
  }

  if (!receipt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="ki-duotone ki-information-5 text-6xl text-gray-400 block mb-4">
            <span className="path1"></span>
            <span className="path2"></span>
            <span className="path3"></span>
          </i>
          <h2 className="text-xl font-semibold text-gray-700">Recibo no encontrado</h2>
          <Link
            href={ROUTES.BILLING.RECEIPTS}
            className="mt-4 inline-flex items-center gap-2 text-[#eb1034] hover:text-red-700"
          >
            <i className="ki-duotone ki-arrow-left text-base">
              <span className="path1"></span>
              <span className="path2"></span>
            </i>
            Volver a recibos
          </Link>
        </div>
      </div>
    )
  }

  const statusConfig = getStatusConfig(receipt.status)
  const discountAmount = receipt.subtotal - receipt.total
  const hasDiscount = discountAmount > 0

  // Check if invoice can be generated
  const canGenerateInvoice =
    receipt.status === ReceiptStatus.COMPLETED &&
    !receipt.invoice &&
    !receipt.benefit // No invoice for gifts

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href={ROUTES.BILLING.RECEIPTS}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
          >
            <i className="ki-duotone ki-arrow-left text-lg group-hover:-translate-x-1 transition-transform">
              <span className="path1"></span>
              <span className="path2"></span>
            </i>
            <span>Volver a recibos</span>
          </Link>
        </div>

        {/* Header Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white/50 shadow-2xl shadow-gray-200/30 p-8 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-600 bg-clip-text text-transparent">
                Recibo #{receipt.id}
              </h1>
              <div className="flex items-center gap-4 mt-4">
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  <i className="ki-duotone ki-calendar-8 text-base">
                    <span className="path1"></span>
                    <span className="path2"></span>
                    <span className="path3"></span>
                    <span className="path4"></span>
                    <span className="path5"></span>
                    <span className="path6"></span>
                  </i>
                  {formatDateTime(receipt.createdAt)}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-3">
              <Badge variant={statusConfig.variant} className="px-5 py-2.5">
                <i className={`ki-duotone ${statusConfig.iconClass} text-lg mr-2`}>
                  <span className="path1"></span>
                  <span className="path2"></span>
                  <span className="path3"></span>
                  <span className="path4"></span>
                </i>
                {statusConfig.label}
              </Badge>
              {receipt.paymentProvider && (
                <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {receipt.paymentProvider.replace('_', ' ')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Status Message */}
        {receipt.statusMessage && (
          <div className={`bg-gradient-to-r ${statusConfig.bgGradient} rounded-xl p-4 ${statusConfig.borderColor} border mb-6`}>
            <div className="flex items-start gap-3">
              <i className={`ki-duotone ki-information-5 text-xl ${statusConfig.iconColor}`}>
                <span className="path1"></span>
                <span className="path2"></span>
                <span className="path3"></span>
              </i>
              <p className={`text-sm ${statusConfig.textColor}`}>{translateStatusMessage(receipt.statusMessage)}</p>
            </div>
          </div>
        )}

        {/* Gift/Benefit Card */}
        {receipt.benefit && (
          <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 rounded-2xl p-8 mb-6 text-white shadow-2xl shadow-purple-300/30">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
            <div className="relative flex items-start gap-5">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center flex-shrink-0">
                <i className="ki-duotone ki-gift text-3xl text-white">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-2">Regalo / Beneficio</h3>
                <p className="text-xl text-purple-100">{receipt.benefit.name}</p>
                {receipt.benefit.description && (
                  <p className="text-sm text-purple-200 mt-3">{receipt.benefit.description}</p>
                )}
                <div className="mt-4 inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-lg">
                  <i className="ki-duotone ki-information-5 text-lg">
                    <span className="path1"></span>
                    <span className="path2"></span>
                    <span className="path3"></span>
                  </i>
                  <span className="text-sm font-medium">Los regalos no generan factura fiscal</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Invoice Section */}
          <div className="lg:col-span-2">
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl shadow-gray-200/20 border border-white/50 overflow-hidden">
              <div className="px-6 py-5 bg-gradient-to-r from-blue-50/50 via-white to-indigo-50/50 border-b border-blue-100/30">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <i className="ki-duotone ki-document text-2xl text-blue-600">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                  Factura
                </h2>
              </div>

              <div className="p-6">
                {receipt.invoice ? (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Número de factura</p>
                        <p className="text-2xl font-bold text-gray-900">{receipt.invoice.data.invoice}</p>
                      </div>
                      <Badge variant="success" className="px-4 py-2">
                        <i className="ki-duotone ki-verify text-lg mr-2">
                          <span className="path1"></span>
                          <span className="path2"></span>
                        </i>
                        Factura {receipt.invoice.data.billType}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-6 p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">CAE</p>
                        <p className="font-mono text-gray-900 font-semibold">{receipt.invoice.data.cae}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Vencimiento CAE</p>
                        <p className="text-gray-900 font-semibold">
                          {formatDate(new Date(receipt.invoice.data.caeExpiredDate))}
                        </p>
                      </div>
                    </div>

                    {receipt.invoice.data.pdfUrl && (
                      <div className="flex gap-3 pt-2">
                        <a
                          href={receipt.invoice.data.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-[#eb1034] to-red-600 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all shadow-lg shadow-red-200/30 hover:shadow-xl hover:shadow-red-300/30 transform hover:-translate-y-0.5"
                        >
                          <i className="ki-duotone ki-eye text-xl">
                            <span className="path1"></span>
                            <span className="path2"></span>
                            <span className="path3"></span>
                          </i>
                          Ver Factura
                        </a>
                        <a
                          href={receipt.invoice.data.pdfUrl}
                          download
                          className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                        >
                          <i className="ki-duotone ki-download text-xl">
                            <span className="path1"></span>
                            <span className="path2"></span>
                          </i>
                          Descargar PDF
                        </a>
                      </div>
                    )}
                  </div>
                ) : receipt.benefit ? (
                  <div className="text-center py-12">
                    <i className="ki-duotone ki-gift text-6xl text-purple-300 block mb-4">
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                    <p className="text-gray-500 font-medium">Los regalos no generan factura</p>
                  </div>
                ) : canGenerateInvoice ? (
                  <div className="text-center py-12">
                    <i className="ki-duotone ki-document text-6xl text-gray-300 block mb-4">
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                    <p className="text-gray-600 mb-6">No hay factura generada para este recibo</p>
                    <button
                      onClick={handleGenerateInvoice}
                      disabled={isGeneratingInvoice}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#eb1034] to-red-600 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all shadow-lg shadow-red-200/30 hover:shadow-xl hover:shadow-red-300/30 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                    >
                      {isGeneratingInvoice ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                          Generando factura...
                        </>
                      ) : (
                        <>
                          <i className="ki-duotone ki-document-code text-xl">
                            <span className="path1"></span>
                            <span className="path2"></span>
                          </i>
                          Generar Factura
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <i className="ki-duotone ki-information-5 text-6xl text-gray-300 block mb-4">
                      <span className="path1"></span>
                      <span className="path2"></span>
                      <span className="path3"></span>
                    </i>
                    <p className="text-gray-500 font-medium">
                      {receipt.status !== ReceiptStatus.COMPLETED
                        ? 'La factura se generará cuando se complete el pago'
                        : 'No se puede generar factura para este recibo'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div>
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl shadow-gray-200/20 border border-white/50 overflow-hidden">
              <div className="px-6 py-5 bg-gradient-to-r from-emerald-50/50 via-white to-green-50/50 border-b border-green-100/30">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <i className="ki-duotone ki-credit-cart text-2xl text-green-600">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                  Detalles del Pago
                </h2>
              </div>

              <div className="p-6 space-y-5">
                {/* Tokens */}
                {receipt.tokens && (
                  <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 rounded-xl p-5 border border-blue-200/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-2">Tokens comprados</p>
                        <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                          {formatNumber(receipt.tokens.quantity)}
                        </p>
                        <p className="text-sm text-blue-700 mt-2">
                          {formatCurrency(receipt.tokens.unitPrice, receipt.currency)} c/u
                        </p>
                      </div>
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-2xl flex items-center justify-center">
                        <i className="ki-duotone ki-shop text-4xl text-blue-600">
                          <span className="path1"></span>
                          <span className="path2"></span>
                          <span className="path3"></span>
                          <span className="path4"></span>
                        </i>
                      </div>
                    </div>
                  </div>
                )}

                {/* Amounts Breakdown */}
                <div className="space-y-3">
                  {hasDiscount && (
                    <>
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span className="font-medium">
                          {formatCurrency(receipt.subtotal, receipt.currency)}
                        </span>
                      </div>

                      {receipt.discountCode && (
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200/50">
                          <span className="flex items-center gap-2 text-green-700">
                            <i className="ki-duotone ki-discount text-lg">
                              <span className="path1"></span>
                              <span className="path2"></span>
                            </i>
                            <span className="font-medium">{receipt.discountCode.code}</span>
                          </span>
                          <span className="text-green-700 font-semibold">
                            -{formatCurrency(
                              receipt.discountCode.type === 'percentage'
                                ? (receipt.subtotal * receipt.discountCode.value) / 100
                                : receipt.discountCode.value,
                              receipt.currency
                            )}
                          </span>
                        </div>
                      )}

                      {receipt.bulkDiscount && receipt.bulkDiscount.appliedTier && (
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200/50">
                          <span className="flex items-center gap-2 text-green-700">
                            <i className="ki-duotone ki-percentage text-lg">
                              <span className="path1"></span>
                              <span className="path2"></span>
                            </i>
                            <span className="text-sm">Descuento por volumen ({receipt.bulkDiscount.appliedTier.discountPercentage}%)</span>
                          </span>
                          <span className="text-green-700 font-semibold">
                            -{formatCurrency(
                              (receipt.subtotal * receipt.bulkDiscount.appliedTier.discountPercentage) / 100,
                              receipt.currency
                            )}
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t-2 border-gray-200">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-3xl font-bold bg-gradient-to-r from-[#eb1034] to-red-600 bg-clip-text text-transparent">
                      {formatCurrency(receipt.total, receipt.currency)}
                    </span>
                  </div>
                </div>

                {/* Payment Provider */}
                {receipt.providerTransactionId && (
                  <div className="pt-4 border-t">
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 uppercase tracking-wider">ID de transacción</p>
                      <div className="flex items-start justify-between gap-3">
                        <code className="text-xs text-gray-700 bg-gray-100 px-3 py-1.5 rounded font-mono break-all">
                          {receipt.providerTransactionId}
                        </code>
                        {receipt.providerTransactionUrl && (
                          <a
                            href={receipt.providerTransactionUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0 text-blue-600 hover:text-blue-800 transition-colors group relative"
                            title={`Ver en ${receipt.paymentProvider?.replace('_', ' ')}`}
                          >
                            <i className="ki-duotone ki-exit-up text-xl">
                              <span className="path1"></span>
                              <span className="path2"></span>
                            </i>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dates & Account */}
          <div className="space-y-6">
            {/* Dates */}
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl shadow-gray-200/20 border border-white/50 overflow-hidden">
              <div className="px-6 py-5 bg-gradient-to-r from-gray-50 via-white to-slate-50 border-b border-gray-100/60">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <i className="ki-duotone ki-calendar text-2xl text-gray-600">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                  Fechas
                </h2>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Creación</span>
                  <span className="text-sm font-medium text-gray-900">{formatDateTime(receipt.createdAt)}</span>
                </div>

                {receipt.updatedAt && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Actualización</span>
                    <span className="text-sm font-medium text-gray-900">{formatDateTime(receipt.updatedAt)}</span>
                  </div>
                )}

                {receipt.expiredAt && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Vencimiento</span>
                    <span className="text-sm font-medium text-gray-900">{formatDate(receipt.expiredAt)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Account */}
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl shadow-gray-200/20 border border-white/50 overflow-hidden">
              <div className="px-6 py-5 bg-gradient-to-r from-purple-50/30 via-white to-indigo-50/30 border-b border-purple-100/40">
                <h2 className="text-xl font-semibold text-gray-900">Cuenta</h2>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-4">
                  {receipt.account.avatar ? (
                    <img
                      src={receipt.account.avatar}
                      alt={receipt.account.email || receipt.account.billingName || 'Avatar'}
                      className="w-16 h-16 rounded-full ring-4 ring-white shadow-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl ring-4 ring-white shadow-lg">
                      {(receipt.account.email || receipt.account.billingName || receipt.account.billing?.name || 'A').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">
                      {receipt.account.billingName || receipt.account.billing?.name || receipt.account.email || 'Cuenta'}
                    </p>
                    {receipt.account.email && (
                      <p className="text-sm text-gray-600">{receipt.account.email}</p>
                    )}
                    <Link
                      href={ROUTES.ACCOUNT_DETAIL(receipt.account.uid)}
                      className="text-xs text-[#eb1034] hover:text-red-700 mt-1 inline-flex items-center gap-1"
                    >
                      Ver cuenta
                      <i className="ki-duotone ki-arrow-right text-xs">
                        <span className="path1"></span>
                        <span className="path2"></span>
                      </i>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}