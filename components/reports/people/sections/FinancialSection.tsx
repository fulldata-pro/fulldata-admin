'use client'

import React from 'react'
import { formatCurrency, formatNumber } from '@/lib/utils/currencyUtils'
import BCRATable from '@/components/reports/shared/BCRATable'
import OperativeBanks from '@/components/reports/shared/OperativeBanks'
import InfoTooltip from '@/components/reports/shared/InfoTooltip'
import CreditMetrics from './CreditMetrics'
import DebtHistory from './DebtHistory'

interface FinancialSectionProps {
  financialData: any
}

export default function FinancialSection({ financialData }: FinancialSectionProps) {
  // Formatear compromiso mensual (multiplicar por 1000)
  const formatMonthlyCommitment = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseInt(amount) : amount
    const actualAmount = (num * 1000) / 100
    return formatCurrency(actualAmount, 'ARS')
  }

  // Formatear monto total de bancos
  const formatBanksAmount = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseInt(amount) : amount
    return formatCurrency(num, 'ARS')
  }

  // Obtener color de situacion
  const getSituationColor = (situation: string) => {
    const code = parseInt(situation)
    if (code === 1) return 'text-green-600 bg-green-50'
    if (code <= 3) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  // Obtener etiqueta de situacion
  const getSituationLabelShort = (situation: string) => {
    const situations: { [key: string]: string } = {
      '1': 'Normal',
      '2': 'Con retraso',
      '3': 'Irregular',
      '4': 'Muy irregular',
      '5': 'Perdida total'
    }
    return situations[situation] || situation
  }

  // Renderizar resumen financiero
  const renderFinancialSummary = () => (
    <div>
      <div className="mb-6">
        <h3 className="text-base font-medium text-gray-900 mb-2">Resumen Financiero</h3>
        <div className="h-0.5 bg-gradient-to-r from-rose-500 via-rose-400 to-transparent w-16"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50/30 to-indigo-50/20 backdrop-blur-lg border border-blue-100/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-all text-center">
          <span className="text-blue-700 text-xs font-semibold uppercase tracking-wide block mb-3">Bancos</span>
          <span className="text-gray-900 font-bold text-2xl">{financialData.banks || '0'}</span>
        </div>

        <div className="bg-gradient-to-br from-emerald-50/30 to-teal-50/20 backdrop-blur-lg border border-emerald-100/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-all text-center">
          <div className="flex items-center justify-center gap-1 mb-3">
            <span className="text-emerald-700 text-xs font-semibold uppercase tracking-wide">Monto Total</span>
            <InfoTooltip content="Sumatoria de todos los montos de los bancos operativos" />
          </div>
          <span className="text-gray-900 font-bold text-base">
            {formatBanksAmount(financialData.banksAmount || '0')}
          </span>
        </div>

        <div className="bg-gradient-to-br from-red-50/30 to-rose-50/20 backdrop-blur-lg border border-red-100/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-all text-center">
          <div className="flex items-center justify-center gap-1 mb-3">
            <span className="text-red-700 text-xs font-semibold uppercase tracking-wide">Peor Situacion</span>
            <InfoTooltip content="Peor calificacion crediticia registrada en el sistema financiero (1=Normal, 2=Con retraso, 3=Irregular, 4=Muy irregular, 5=Perdida total)" />
          </div>
          <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-medium ${getSituationColor(financialData.worstSituation || '1')}`}>
            {financialData.worstSituation} - {getSituationLabelShort(financialData.worstSituation || '1')}
          </span>
        </div>

        <div className="bg-gradient-to-br from-purple-50/30 to-pink-50/20 backdrop-blur-lg border border-purple-100/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-all text-center">
          <div className="flex items-center justify-center gap-1 mb-3">
            <span className="text-purple-700 text-xs font-semibold uppercase tracking-wide">Compromiso Mensual</span>
            <InfoTooltip content="Desembolsos mensuales para atender deudas del sistema financiero" />
          </div>
          <span className="text-gray-900 font-bold text-base">
            {formatMonthlyCommitment(financialData.monthlyComparison || '0')}
          </span>
        </div>
      </div>
    </div>
  )

  // Renderizar informacion Veraz
  const renderVerazInfo = () => {
    if (!financialData.veraz) {
      return null
    }

    return (
      <div>
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-base font-medium text-gray-900">Informacion Veraz</h3>
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
              Score
            </span>
          </div>
          <div className="h-0.5 bg-gradient-to-r from-teal-500 via-teal-400 to-transparent w-16"></div>
        </div>

        <div className="space-y-6 bg-gradient-to-br from-teal-50/30 to-cyan-50/20 backdrop-blur-lg border border-teal-100/30 rounded-xl p-6">
          {/* Score y Categoria */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <span className="text-gray-500 text-xs">Score</span>
                <InfoTooltip content="Puntuacion crediticia Veraz que indica la probabilidad de pago (mayor puntaje = menor riesgo)" />
              </div>
              <span className="text-gray-800 font-medium text-lg">{financialData.veraz.scoreRange || 'N/A'}</span>
            </div>

            <div className="text-center">
              <span className="text-gray-500 text-xs block mb-2">Categoria</span>
              <span className="text-gray-800 font-medium">{financialData.veraz.category || 'N/A'}</span>
            </div>

            <div className="text-center">
              <span className="text-gray-500 text-xs block mb-2">Segmento</span>
              <span className="text-gray-800 font-medium">{financialData.veraz.scoreSegment || 'N/A'}</span>
            </div>
          </div>

          {/* Predictor de Ingresos */}
          {financialData.veraz.incomePredictorRange && (
            <div className="border-t border-teal-100 pt-6">
              <div className="flex items-center gap-2 mb-4">
                <h4 className="font-medium text-gray-800 text-sm">Predictor de Ingresos</h4>
                <InfoTooltip content="Estimacion de capacidad de ingresos basada en comportamiento crediticio e informacion disponible" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <span className="text-gray-500 text-xs block mb-1">Rango</span>
                  <span className="text-gray-800 font-medium">{financialData.veraz.incomePredictorRange}</span>
                </div>
                {financialData.veraz.incomePredictorText && (
                  <div>
                    <span className="text-gray-500 text-xs block mb-1">Descripcion</span>
                    <span className="text-gray-800 font-medium text-sm">{financialData.veraz.incomePredictorText}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Obligaciones Bancarias */}
          {(financialData.veraz.banksObligations24m || financialData.veraz.amountObligations24m) && (
            <div className="border-t border-teal-100 pt-6">
              <h4 className="font-medium text-gray-800 mb-4 text-sm">Obligaciones Bancarias 24m</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <span className="text-gray-500 text-xs block mb-1">Cantidad</span>
                  <span className="text-gray-800 font-medium">{financialData.veraz.banksObligations24m || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-xs block mb-1">Monto</span>
                  <span className="text-gray-800 font-medium">
                    {financialData.veraz.amountObligations24m
                      ? formatCurrency(financialData.veraz.amountObligations24m / 100, 'ARS')
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Obligaciones Activas */}
          {financialData.veraz.activeObsBa && financialData.veraz.activeObsBa.length > 0 && (
            <div className="border-t border-teal-100 pt-6">
              <h4 className="font-medium text-gray-800 mb-4 text-sm">Obligaciones Vigentes</h4>
              <div className="space-y-3">
                {financialData.veraz.activeObsBa.map((obs: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between bg-white/50 rounded-lg p-3 border border-teal-100">
                    <span className="font-medium text-gray-800 text-sm">{obs.entity}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-800 font-medium text-sm">
                        {formatCurrency(obs.amount / 100, 'ARS')}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(obs.date * 1000).toLocaleDateString('es-AR')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Renderizar informacion adicional
  const renderAdditionalInfo = () => (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-base font-medium text-gray-900">Informacion Adicional</h3>
          <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
            Riesgos
          </span>
        </div>
        <div className="h-0.5 bg-gradient-to-r from-indigo-500 via-indigo-400 to-transparent w-16"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-red-50/30 to-rose-50/20 backdrop-blur-lg border border-red-100/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-all text-center">
          <div className="flex items-center justify-center gap-1 mb-3">
            <span className="text-red-700 text-xs font-semibold uppercase tracking-wide">Cheques 24m</span>
            <InfoTooltip content="Cantidad de cheques rechazados en los ultimos 24 meses" />
          </div>
          <span className="text-gray-900 font-bold text-2xl">{financialData.checks24m || '0'}</span>
        </div>

        <div className="bg-gradient-to-br from-orange-50/30 to-amber-50/20 backdrop-blur-lg border border-orange-100/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-all text-center">
          <span className="text-orange-700 text-xs font-semibold uppercase tracking-wide block mb-3">Quiebras 24m</span>
          <span className="text-gray-900 font-bold text-2xl">{financialData.bankruptcy24m || '0'}</span>
        </div>

        <div className="bg-gradient-to-br from-yellow-50/30 to-amber-50/20 backdrop-blur-lg border border-yellow-100/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-all text-center">
          <span className="text-yellow-700 text-xs font-semibold uppercase tracking-wide block mb-3">Juicios 24m</span>
          <span className="text-gray-900 font-bold text-2xl">{financialData.lawsuits24m || '0'}</span>
        </div>

        <div className="bg-gradient-to-br from-rose-50/30 to-pink-50/20 backdrop-blur-lg border border-rose-100/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-all text-center">
          <div className="flex items-center justify-center gap-1 mb-3">
            <span className="text-rose-700 text-xs font-semibold uppercase tracking-wide">Impagos 6m</span>
            <InfoTooltip content="Cantidad de obligaciones impagas registradas en los ultimos 6 meses" />
          </div>
          <span className="text-gray-900 font-bold text-2xl">{financialData.nonPaid6m || '0'}</span>
          {financialData.nonPaid6mAmount && (
            <span className="text-xs text-gray-600 block mt-1">{formatCurrency(financialData.nonPaid6mAmount, 'ARS')}</span>
          )}
        </div>

        <div className="bg-gradient-to-br from-indigo-50/30 to-purple-50/20 backdrop-blur-lg border border-indigo-100/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-all text-center">
          <span className="text-indigo-700 text-xs font-semibold uppercase tracking-wide block mb-3">% Peor Situacion</span>
          <span className="text-gray-900 font-bold text-2xl">{financialData.worstSituationPercentage || '0'}%</span>
        </div>

        {financialData.ansesBenefits && (
          <div className="bg-gradient-to-br from-teal-50/30 to-cyan-50/20 backdrop-blur-lg border border-teal-100/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-all text-center">
            <span className="text-teal-700 text-xs font-semibold uppercase tracking-wide block mb-3">ANSES</span>
            <span className="text-gray-900 font-bold text-base">{financialData.ansesBenefits}</span>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-12">
      {/* Resumen Financiero */}
      {renderFinancialSummary()}

      {/* Metricas Crediticias */}
      {financialData.creditMetrics && (
        <CreditMetrics creditMetrics={financialData.creditMetrics} />
      )}

      {/* Bancos Operativos */}
      {financialData.operativeBanks && financialData.operativeBanks.length > 0 && (
        <OperativeBanks
          banks={financialData.operativeBanks}
          title="Bancos Operativos"
        />
      )}

      {/* Informacion Veraz */}
      {renderVerazInfo()}

      {/* Informacion BCRA */}
      {financialData.bcraInfo && financialData.bcraInfo.length > 0 && (
        <BCRATable bcraInfo={financialData.bcraInfo} />
      )}

      {/* Historial de Deuda */}
      {financialData.bcraInfo && financialData.bcraInfo.length > 0 && (
        <DebtHistory bcraInfo={financialData.bcraInfo} />
      )}

      {/* Informacion Adicional */}
      {renderAdditionalInfo()}
    </div>
  )
}
