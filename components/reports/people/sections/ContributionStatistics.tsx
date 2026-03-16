'use client'

import React from 'react'
import { calculatePercentage } from '@/lib/constants/laborConstants'
import InfoTooltip from '@/components/reports/shared/InfoTooltip'

interface PaymentStats {
  paid: number
  unpaid: number
  partialPaid: number
}

interface ContributionStats {
  employersLast3Months?: number
  employeePaymentsLast12Months?: PaymentStats
  employerPaymentsLast12Months?: PaymentStats
}

interface ContributionStatisticsProps {
  contributionStats?: ContributionStats
}

export default function ContributionStatistics({
  contributionStats
}: ContributionStatisticsProps) {
  // Helper function to get compliance status and color
  const getComplianceInfo = (paid: number, total: number) => {
    if (total === 0) {
      return {
        label: 'Sin datos',
        color: 'text-gray-600 bg-gray-50',
        icon: '⚪',
        percentage: 0
      }
    }

    const percentage = calculatePercentage(paid, total)

    if (percentage === 100) {
      return {
        label: 'Excelente',
        color: 'text-green-600 bg-green-50',
        icon: '🟢',
        percentage
      }
    } else if (percentage >= 80) {
      return {
        label: 'Bueno',
        color: 'text-yellow-600 bg-yellow-50',
        icon: '🟡',
        percentage
      }
    } else {
      return {
        label: 'Irregular',
        color: 'text-red-600 bg-red-50',
        icon: '🔴',
        percentage
      }
    }
  }

  if (!contributionStats) {
    return null
  }

  const { employersLast3Months, employeePaymentsLast12Months, employerPaymentsLast12Months } = contributionStats

  // Check if there's any data to display
  const hasEmployeeData = employeePaymentsLast12Months &&
    (employeePaymentsLast12Months.paid > 0 || employeePaymentsLast12Months.unpaid > 0 || employeePaymentsLast12Months.partialPaid > 0)
  const hasEmployerData = employerPaymentsLast12Months &&
    (employerPaymentsLast12Months.paid > 0 || employerPaymentsLast12Months.unpaid > 0 || employerPaymentsLast12Months.partialPaid > 0)
  const hasEmployersCount = employersLast3Months !== undefined && employersLast3Months !== null

  if (!hasEmployeeData && !hasEmployerData && !hasEmployersCount) {
    return null
  }

  // Calculate totals
  const employeeTotalMonths = employeePaymentsLast12Months
    ? employeePaymentsLast12Months.paid + employeePaymentsLast12Months.unpaid + employeePaymentsLast12Months.partialPaid
    : 0

  const employerTotalMonths = employerPaymentsLast12Months
    ? employerPaymentsLast12Months.paid + employerPaymentsLast12Months.unpaid + employerPaymentsLast12Months.partialPaid
    : 0

  const employeeCompliance = getComplianceInfo(
    employeePaymentsLast12Months?.paid || 0,
    employeeTotalMonths
  )

  const employerCompliance = getComplianceInfo(
    employerPaymentsLast12Months?.paid || 0,
    employerTotalMonths
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-base font-medium text-gray-900">Estadisticas de Aportes</h3>
          <InfoTooltip content="Metricas sobre el comportamiento de pago de aportes de seguridad social en los ultimos 12 meses" />
        </div>
        <div className="h-0.5 bg-gradient-to-r from-lime-500 via-lime-400 to-transparent w-24"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Employee Payments Card */}
        <div className="bg-gradient-to-br from-lime-50/30 to-green-50/20 backdrop-blur-lg border border-lime-100/30 rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden">
          <div className="bg-gradient-to-r from-lime-50/50 to-green-50/40 px-5 py-4 border-b border-lime-100/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-lime-100 rounded-full flex items-center justify-center">
                <span className="text-xl">👤</span>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Como Empleado</h4>
                <p className="text-xs text-gray-600">Ultimos 12 meses</p>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {hasEmployeeData ? (
              <>
                {/* Compliance Badge */}
                <div className="bg-white/30 backdrop-blur-sm rounded-xl px-4 py-3 border border-lime-200/40">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Estado de Cumplimiento</span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${employeeCompliance.color} ${
                      employeeCompliance.label === 'Excelente' ? 'border-green-200' :
                      employeeCompliance.label === 'Bueno' ? 'border-yellow-200' :
                      employeeCompliance.label === 'Irregular' ? 'border-red-200' : 'border-gray-200'
                    }`}>
                      <span>{employeeCompliance.icon}</span>
                      <span>{employeeCompliance.label} ({employeeCompliance.percentage}%)</span>
                    </span>
                  </div>
                </div>

                {/* Payment Stats - Card Based */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Pagados */}
                  <div className="bg-white/40 backdrop-blur-sm rounded-lg px-3 py-3 border border-green-200/50 hover:border-green-300/70 transition-all">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs font-semibold text-gray-600">Pagados</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-green-700">
                          {employeePaymentsLast12Months!.paid}
                        </span>
                        <span className="text-xs text-gray-500">
                          de {employeeTotalMonths}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pago Parcial */}
                  <div className="bg-white/40 backdrop-blur-sm rounded-lg px-3 py-3 border border-yellow-200/50 hover:border-yellow-300/70 transition-all">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-xs font-semibold text-gray-600">Parcial</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-yellow-700">
                          {employeePaymentsLast12Months!.partialPaid}
                        </span>
                        <span className="text-xs text-gray-500">
                          de {employeeTotalMonths}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Impagos */}
                  <div className="bg-white/40 backdrop-blur-sm rounded-lg px-3 py-3 border border-red-200/50 hover:border-red-300/70 transition-all">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-xs font-semibold text-gray-600">Impagos</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-red-700">
                          {employeePaymentsLast12Months!.unpaid}
                        </span>
                        <span className="text-xs text-gray-500">
                          de {employeeTotalMonths}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="bg-white/30 backdrop-blur-sm rounded-lg px-4 py-3 border border-lime-200/40">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-700">Cumplimiento General</span>
                    <span className="text-xs font-bold text-gray-900">{employeeCompliance.percentage}%</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-lime-500 transition-all duration-500"
                      style={{ width: `${employeeCompliance.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-4 text-gray-500 text-sm">
                Sin informacion disponible
              </div>
            )}
          </div>
        </div>

        {/* Employer Payments Card */}
        <div className="bg-gradient-to-br from-indigo-50/30 to-blue-50/20 backdrop-blur-lg border border-indigo-100/30 rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-50/50 to-blue-50/40 px-5 py-4 border-b border-indigo-100/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-xl">🏢</span>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Como Empleador</h4>
                <p className="text-xs text-gray-600">Ultimos 12 meses</p>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {hasEmployerData ? (
              <>
                {/* Compliance Badge */}
                <div className="bg-white/30 backdrop-blur-sm rounded-xl px-4 py-3 border border-indigo-200/40">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Estado de Cumplimiento</span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${employerCompliance.color} ${
                      employerCompliance.label === 'Excelente' ? 'border-green-200' :
                      employerCompliance.label === 'Bueno' ? 'border-yellow-200' :
                      employerCompliance.label === 'Irregular' ? 'border-red-200' : 'border-gray-200'
                    }`}>
                      <span>{employerCompliance.icon}</span>
                      <span>{employerCompliance.label} ({employerCompliance.percentage}%)</span>
                    </span>
                  </div>
                </div>

                {/* Payment Stats - Card Based */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Pagados */}
                  <div className="bg-white/40 backdrop-blur-sm rounded-lg px-3 py-3 border border-green-200/50 hover:border-green-300/70 transition-all">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs font-semibold text-gray-600">Pagados</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-green-700">
                          {employerPaymentsLast12Months!.paid}
                        </span>
                        <span className="text-xs text-gray-500">
                          de {employerTotalMonths}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pago Parcial */}
                  <div className="bg-white/40 backdrop-blur-sm rounded-lg px-3 py-3 border border-yellow-200/50 hover:border-yellow-300/70 transition-all">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-xs font-semibold text-gray-600">Parcial</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-yellow-700">
                          {employerPaymentsLast12Months!.partialPaid}
                        </span>
                        <span className="text-xs text-gray-500">
                          de {employerTotalMonths}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Impagos */}
                  <div className="bg-white/40 backdrop-blur-sm rounded-lg px-3 py-3 border border-red-200/50 hover:border-red-300/70 transition-all">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-xs font-semibold text-gray-600">Impagos</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-red-700">
                          {employerPaymentsLast12Months!.unpaid}
                        </span>
                        <span className="text-xs text-gray-500">
                          de {employerTotalMonths}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="bg-white/30 backdrop-blur-sm rounded-lg px-4 py-3 border border-indigo-200/40">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-700">Cumplimiento General</span>
                    <span className="text-xs font-bold text-gray-900">{employerCompliance.percentage}%</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-500"
                      style={{ width: `${employerCompliance.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-4 text-gray-500 text-sm">
                No registra actividad como empleador
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Employers in Last 3 Months */}
      {hasEmployersCount && (
        <div className="bg-gradient-to-br from-amber-50/30 to-orange-50/20 backdrop-blur-lg border border-amber-100/30 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <span className="text-xl">📊</span>
              </div>
              <div>
                <div className="text-xs font-medium text-amber-700 uppercase tracking-wider">
                  Empleadores (Ultimos 3 Meses)
                </div>
                <div className="text-sm text-amber-900 mt-0.5">
                  Cantidad de empleadores diferentes registrados
                </div>
              </div>
            </div>
            <div className="text-3xl font-bold text-amber-900">
              {employersLast3Months}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
