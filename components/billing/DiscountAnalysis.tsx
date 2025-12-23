'use client'

import { formatCurrency } from '@/lib/utils/currencyUtils'

interface DiscountStats {
  totalDiscountAmount: number
  discountCodeUsage: number
  bulkDiscountUsage: number
  averageDiscountPercentage: number
  topDiscountCodes: Array<{
    code: string
    usageCount: number
    totalDiscounted: number
  }>
}

interface DiscountAnalysisProps {
  data: DiscountStats
  isLoading?: boolean
}

export default function DiscountAnalysis({ data, isLoading }: DiscountAnalysisProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const totalUsage = data.discountCodeUsage + data.bulkDiscountUsage
  const codePercentage = totalUsage > 0 ? Math.round((data.discountCodeUsage / totalUsage) * 100) : 0
  const bulkPercentage = totalUsage > 0 ? Math.round((data.bulkDiscountUsage / totalUsage) * 100) : 0

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-secondary mb-4">Análisis de Descuentos</h3>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center">
              <i className="ki-duotone ki-discount text-red-500 text-lg">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
            </div>
            <span className="text-xs text-gray-500 font-medium">Total Descontado</span>
          </div>
          <p className="text-xl font-bold text-secondary">
            {formatCurrency(data.totalDiscountAmount, 'ARS', { showCurrencyCode: false })}
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <i className="ki-duotone ki-percentage text-blue-500 text-lg">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
            </div>
            <span className="text-xs text-gray-500 font-medium">Promedio</span>
          </div>
          <p className="text-xl font-bold text-secondary">
            ${data.averageDiscountPercentage.toLocaleString()}
          </p>
          <p className="text-xs text-gray-400">por transacción</p>
        </div>
      </div>

      {/* Usage breakdown */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Distribución de uso</span>
          <span className="text-sm font-medium text-secondary">{totalUsage} usos</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex">
          <div
            className="bg-purple-500 transition-all"
            style={{ width: `${codePercentage}%` }}
          />
          <div
            className="bg-orange-400 transition-all"
            style={{ width: `${bulkPercentage}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full" />
            <span className="text-gray-500">Códigos ({data.discountCodeUsage})</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-orange-400 rounded-full" />
            <span className="text-gray-500">Por volumen ({data.bulkDiscountUsage})</span>
          </div>
        </div>
      </div>

      {/* Top codes */}
      {data.topDiscountCodes.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-600 mb-3">Códigos más usados</h4>
          <div className="space-y-2">
            {data.topDiscountCodes.map((code, index) => (
              <div
                key={code.code}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded text-xs flex items-center justify-center font-bold ${
                    index === 0 ? 'bg-yellow-100 text-yellow-700' :
                    index === 1 ? 'bg-gray-200 text-gray-600' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {index + 1}
                  </span>
                  <code className="text-sm font-mono bg-white px-2 py-0.5 rounded border border-gray-200">
                    {code.code}
                  </code>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-secondary">{code.usageCount} usos</p>
                  <p className="text-xs text-gray-400">
                    -{formatCurrency(code.totalDiscounted, 'ARS', { showCurrencyCode: false })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!data.topDiscountCodes.length && totalUsage === 0 && (
        <div className="text-center py-8 text-gray-400">
          <i className="ki-duotone ki-discount text-3xl mb-2">
            <span className="path1"></span>
            <span className="path2"></span>
          </i>
          <p className="text-sm">No se usaron descuentos en este período</p>
        </div>
      )}
    </div>
  )
}
