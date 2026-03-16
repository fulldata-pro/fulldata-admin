'use client'

import React from 'react'
import InfoTooltip from '@/components/reports/shared/InfoTooltip'
import { formatCurrency } from '@/lib/utils/currencyUtils'

interface CreditMetricsData {
  lendingCapacity?: number
  debtToIncomeRatio?: number
  monthlyCommitmentToIncomeRatio?: number
  currentDebtVs3MonthAvg?: number
  currentDebtVs6MonthAvg?: number
}

interface CreditMetricsProps {
  creditMetrics: CreditMetricsData
}

export default function CreditMetrics({ creditMetrics }: CreditMetricsProps) {
  const formatPercentage = (ratio: number) => {
    return `${Math.round(ratio * 100)}%`
  }

  const getRiskLabel = (ratio: number) => {
    if (ratio < 0.6) return 'Bajo'
    if (ratio < 0.8) return 'Medio'
    return 'Alto'
  }

  const getRiskColor = (ratio: number) => {
    if (ratio < 0.6) return 'text-green-600'
    if (ratio < 0.8) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getTrendDirection = (ratio: number) => {
    if (ratio < 1) return 'Reduccion'
    if (ratio > 1) return 'Aumento'
    return 'Estable'
  }

  const getTrendColor = (ratio: number) => {
    if (ratio < 1) return 'text-green-600'
    if (ratio > 1) return 'text-red-600'
    return 'text-gray-600'
  }

  // Check if there's any data to display
  const hasData = creditMetrics.lendingCapacity !== undefined ||
    creditMetrics.debtToIncomeRatio !== undefined ||
    creditMetrics.monthlyCommitmentToIncomeRatio !== undefined ||
    creditMetrics.currentDebtVs3MonthAvg !== undefined ||
    creditMetrics.currentDebtVs6MonthAvg !== undefined

  if (!hasData) {
    return null
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-base font-medium text-gray-900 mb-2">Metricas de Capacidad Crediticia</h3>
        <div className="h-0.5 bg-gradient-to-r from-purple-500 via-purple-400 to-transparent w-16"></div>
      </div>

      <div className="space-y-4">
        {creditMetrics.lendingCapacity !== undefined && (
          <div className="bg-gradient-to-br from-emerald-50/30 to-teal-50/20 backdrop-blur-lg border border-emerald-100/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-emerald-700">Capacidad de Endeudamiento</span>
                <InfoTooltip content="Monto mensual disponible para nuevo endeudamiento en ARS" />
              </div>
              <span className="text-lg font-bold text-gray-900">{formatCurrency(creditMetrics.lendingCapacity, 'ARS')}</span>
            </div>
            <div className="text-xs text-gray-600 mt-1">Disponible mensual</div>
          </div>
        )}

        {creditMetrics.debtToIncomeRatio !== undefined && (
          <div className="bg-gradient-to-br from-blue-50/30 to-indigo-50/20 backdrop-blur-lg border border-blue-100/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-blue-700">Ratio Deuda/Ingreso</span>
                <InfoTooltip content="Proporcion de deuda total respecto al ingreso. Menos de 60% es saludable" />
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-gray-900">{formatPercentage(creditMetrics.debtToIncomeRatio)}</span>
                <div className={`text-xs ${getRiskColor(creditMetrics.debtToIncomeRatio)}`}>
                  Riesgo: {getRiskLabel(creditMetrics.debtToIncomeRatio)}
                </div>
              </div>
            </div>
          </div>
        )}

        {creditMetrics.monthlyCommitmentToIncomeRatio !== undefined && (
          <div className="bg-gradient-to-br from-purple-50/30 to-pink-50/20 backdrop-blur-lg border border-purple-100/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-purple-700">Compromiso Mensual/Ingreso</span>
                <InfoTooltip content="Proporcion del compromiso de pago mensual respecto al ingreso total" />
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-gray-900">{formatPercentage(creditMetrics.monthlyCommitmentToIncomeRatio)}</span>
                <div className={`text-xs ${getRiskColor(creditMetrics.monthlyCommitmentToIncomeRatio)}`}>
                  Riesgo: {getRiskLabel(creditMetrics.monthlyCommitmentToIncomeRatio)}
                </div>
              </div>
            </div>
          </div>
        )}

        {creditMetrics.currentDebtVs3MonthAvg !== undefined && (
          <div className="bg-gradient-to-br from-orange-50/30 to-amber-50/20 backdrop-blur-lg border border-orange-100/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-orange-700">Deuda Actual vs Promedio 3M</span>
                <InfoTooltip content="Deuda actual comparada con promedio ultimos 3 meses. <1 indica reduccion de deuda" />
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-gray-900">{formatPercentage(creditMetrics.currentDebtVs3MonthAvg)}</span>
                <div className={`text-xs ${getTrendColor(creditMetrics.currentDebtVs3MonthAvg)}`}>
                  {getTrendDirection(creditMetrics.currentDebtVs3MonthAvg)}
                </div>
              </div>
            </div>
          </div>
        )}

        {creditMetrics.currentDebtVs6MonthAvg !== undefined && (
          <div className="bg-gradient-to-br from-rose-50/30 to-pink-50/20 backdrop-blur-lg border border-rose-100/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-rose-700">Deuda Actual vs Promedio 6M</span>
                <InfoTooltip content="Deuda actual comparada con promedio ultimos 6 meses. <1 indica reduccion de deuda" />
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-gray-900">{formatPercentage(creditMetrics.currentDebtVs6MonthAvg)}</span>
                <div className={`text-xs ${getTrendColor(creditMetrics.currentDebtVs6MonthAvg)}`}>
                  {getTrendDirection(creditMetrics.currentDebtVs6MonthAvg)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
