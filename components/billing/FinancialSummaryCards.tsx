'use client'

import { formatCurrency } from '@/lib/utils/currencyUtils'

interface TokenSalesStats {
  totalTokensSold: number
  averageTokensPerPurchase: number
  averagePricePerToken: number
}

interface FinancialSummaryCardsProps {
  totalReceipts: number
  completedReceipts: number
  pendingReceipts: number
  failedReceipts: number
  refundedReceipts: number
  totalRevenue: Record<string, number>
  averageOrderValue: Record<string, number>
  tokenStats: TokenSalesStats
  isLoading?: boolean
}

export default function FinancialSummaryCards({
  totalReceipts,
  completedReceipts,
  pendingReceipts,
  failedReceipts,
  refundedReceipts,
  totalRevenue,
  averageOrderValue,
  tokenStats,
  isLoading,
}: FinancialSummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    )
  }

  const conversionRate = totalReceipts > 0
    ? Math.round((completedReceipts / totalReceipts) * 100)
    : 0

  const primaryCurrency = Object.keys(totalRevenue)[0] || 'ARS'
  const primaryRevenue = totalRevenue[primaryCurrency] || 0
  const primaryAOV = averageOrderValue[primaryCurrency] || 0

  return (
    <div className="space-y-4">
      {/* Revenue cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(totalRevenue).map(([currency, total]) => (
          <div
            key={currency}
            className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-5 text-white"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-green-100 text-sm font-medium">Ingresos {currency}</span>
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <i className="ki-duotone ki-dollar text-xl">
                  <span className="path1"></span>
                  <span className="path2"></span>
                  <span className="path3"></span>
                </i>
              </div>
            </div>
            <p className="text-3xl font-bold">
              {formatCurrency(total, currency, { showCurrencyCode: false })}
            </p>
            <p className="text-green-100 text-sm mt-1">
              Promedio: {formatCurrency(averageOrderValue[currency] || 0, currency, { showCurrencyCode: false })}
            </p>
          </div>
        ))}

        {Object.keys(totalRevenue).length === 0 && (
          <div className="bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl p-5 text-white">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-200 text-sm font-medium">Sin ingresos</span>
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <i className="ki-duotone ki-dollar text-xl">
                  <span className="path1"></span>
                  <span className="path2"></span>
                  <span className="path3"></span>
                </i>
              </div>
            </div>
            <p className="text-3xl font-bold">$0</p>
            <p className="text-gray-200 text-sm mt-1">No hay transacciones</p>
          </div>
        )}
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <i className="ki-duotone ki-document text-blue-600 text-lg">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
            </div>
            <span className="text-xs text-gray-500 font-medium">Total</span>
          </div>
          <p className="text-2xl font-bold text-secondary">{totalReceipts}</p>
          <p className="text-xs text-gray-400">recibos</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <i className="ki-duotone ki-check-circle text-green-600 text-lg">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
            </div>
            <span className="text-xs text-gray-500 font-medium">Completados</span>
          </div>
          <p className="text-2xl font-bold text-secondary">{completedReceipts}</p>
          <p className="text-xs text-green-600">{conversionRate}% tasa</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <i className="ki-duotone ki-time text-yellow-600 text-lg">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
            </div>
            <span className="text-xs text-gray-500 font-medium">Pendientes</span>
          </div>
          <p className="text-2xl font-bold text-secondary">{pendingReceipts}</p>
          <p className="text-xs text-gray-400">en proceso</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <i className="ki-duotone ki-cross-circle text-red-600 text-lg">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
            </div>
            <span className="text-xs text-gray-500 font-medium">Fallidos</span>
          </div>
          <p className="text-2xl font-bold text-secondary">{failedReceipts}</p>
          <p className="text-xs text-gray-400">rechazados</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <i className="ki-duotone ki-arrow-left text-purple-600 text-lg">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
            </div>
            <span className="text-xs text-gray-500 font-medium">Reembolsos</span>
          </div>
          <p className="text-2xl font-bold text-secondary">{refundedReceipts}</p>
          <p className="text-xs text-gray-400">devueltos</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <i className="ki-duotone ki-abstract-26 text-indigo-600 text-lg">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
            </div>
            <span className="text-xs text-gray-500 font-medium">Tokens</span>
          </div>
          <p className="text-2xl font-bold text-secondary">
            {tokenStats.totalTokensSold.toLocaleString()}
          </p>
          <p className="text-xs text-gray-400">
            ~{tokenStats.averageTokensPerPurchase}/compra
          </p>
        </div>
      </div>
    </div>
  )
}
