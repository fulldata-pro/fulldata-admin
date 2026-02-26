'use client'

import React, { useMemo, useState } from 'react'
import { formatDate } from '@/lib/utils/dateUtils'
import { formatCurrency } from '@/lib/utils/currencyUtils'
import {
  translateLaborSituation,
  translateActivityType,
  getMonthsBetweenDates,
  formatDurationLabel,
  generateThemeColors,
  calculatePercentage,
  getSalaryRangeInfo
} from '@/lib/constants/laborConstants'
import InfoTooltip from '@/components/reports/shared/InfoTooltip'
import ContributionStatistics from './ContributionStatistics'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface LaborSectionProps {
  laborData: any
}

interface EmployerStats {
  name: string
  taxId?: string
  startDate: number
  finishDate: number
  state?: string
  salaryCategory?: string
  activity?: string
  employeeCount?: number
  address?: {
    address?: string
    city?: string
    province?: string
    postalCode?: string
  }
  months: number
  color: string
}

export default function LaborSection({ laborData }: LaborSectionProps) {
  const [showSalaryInfo, setShowSalaryInfo] = useState<number | null>(null)
  const [expandedEmployer, setExpandedEmployer] = useState<number | null>(null)

  const formatLocalDate = (timestamp: number | { $numberLong: string } | null | undefined) => {
    const formatted = formatDate(timestamp)
    return formatted === 'No disponible' ? 'N/A' : formatted
  }

  // Calculate employer statistics
  const { totalMonths, employerStats } = useMemo(() => {
    if (!laborData.employerHistory || laborData.employerHistory.length === 0) {
      return { totalMonths: 0, employerStats: [] }
    }

    const employerColors = generateThemeColors(laborData.employerHistory.length)

    const stats: EmployerStats[] = laborData.employerHistory.map((employer: any, index: number) => {
      const months = getMonthsBetweenDates(employer.startDate, employer.finishDate)
      return {
        ...employer,
        months,
        color: employerColors[index]
      }
    })

    const total = stats.reduce((acc, item) => acc + item.months, 0)

    return { totalMonths: total, employerStats: stats }
  }, [laborData.employerHistory])

  // Sort by months for chart
  const sortedEmployerStats = useMemo(() => {
    return [...employerStats].sort((a, b) => b.months - a.months)
  }, [employerStats])

  // Sort by end date for table
  const sortedByEndDate = useMemo(() => {
    return [...employerStats].sort((a, b) => {
      const endA = typeof a.finishDate === 'number' ? a.finishDate : 0
      const endB = typeof b.finishDate === 'number' ? b.finishDate : 0
      return endB - endA
    })
  }, [employerStats])

  // Chart data
  const chartData = useMemo(() => {
    if (!sortedEmployerStats.length) return []

    return sortedEmployerStats.map(employer => ({
      name: employer.name,
      value: employer.months,
      color: employer.color,
      percentage: calculatePercentage(employer.months, totalMonths)
    }))
  }, [sortedEmployerStats, totalMonths])

  const formatPercentage = (percentage: number): string => {
    if (percentage < 1 && percentage > 0) {
      return '<1%'
    }
    return `${percentage}%`
  }

  // Custom tooltip for pie chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-xl min-w-[200px] z-50">
          <p className="font-semibold text-gray-900 mb-2 text-sm">{data.name}</p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Duracion:</span>
              <span className="font-medium text-gray-900">{formatDurationLabel(data.value)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Porcentaje:</span>
              <span className="font-medium text-gray-900">{formatPercentage(data.percentage)}</span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-12">
      {/* SITUACIÓN LABORAL */}
      {laborData.laborSituation && laborData.laborSituation.length > 0 && (
        <div>
          <div className="mb-6">
            <h3 className="text-base font-medium text-gray-900 mb-2">Situacion Laboral</h3>
            <div className="h-0.5 bg-gradient-to-r from-rose-500 via-rose-400 to-transparent w-16"></div>
          </div>
          <div className="flex flex-wrap gap-2">
            {laborData.laborSituation.map((situation: string, idx: number) => (
              <span key={idx} className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 transition-colors duration-200">
                {translateLaborSituation(situation)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* INFORMACIÓN GENERAL */}
      <div>
        <div className="mb-6">
          <h3 className="text-base font-medium text-gray-900 mb-2">Informacion General</h3>
          <div className="h-0.5 bg-gradient-to-r from-teal-500 via-teal-400 to-transparent w-16"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Semanas Registro Fiscal */}
          {laborData.taxRegistrationWeeks && (
            <div className="bg-gradient-to-br from-teal-50/30 to-teal-50/20 backdrop-blur-lg border border-teal-100/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-all text-center">
              <div className="flex items-center justify-center gap-1 text-teal-700 text-xs font-semibold uppercase tracking-wide mb-2">
                <span>Registro Fiscal</span>
                <InfoTooltip content="Semanas registradas en el sistema de registro fiscal laboral" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {(() => {
                  const weeks = parseInt(laborData.taxRegistrationWeeks)
                  if (isNaN(weeks)) return laborData.taxRegistrationWeeks
                  const years = Math.floor(weeks / 52)
                  const remainingWeeks = weeks % 52
                  const months = Math.floor(remainingWeeks / 4)
                  return years > 0 ? `${years}a ${months}m` : `${weeks} sem`
                })()}
              </div>
            </div>
          )}

          {/* Estado Empleador */}
          <div className="bg-gradient-to-br from-emerald-50/30 to-emerald-50/20 backdrop-blur-lg border border-emerald-100/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-all text-center">
            <div className="flex items-center justify-center gap-1 text-emerald-700 text-xs font-semibold uppercase tracking-wide mb-2">
              <span>Estado Empleador</span>
              <InfoTooltip content="Situacion actual de la persona como empleador registrado en organismos oficiales" />
            </div>
            <div className="flex items-center justify-center gap-2">
              {laborData.employer ? (
                <span className="inline-flex items-center gap-2 text-green-600 font-medium">
                  <i className="ki-duotone ki-check-circle text-lg">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                  Empleador
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 text-gray-500 font-medium">
                  <i className="ki-duotone ki-cross-circle text-lg">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                  No Empleador
                </span>
              )}
            </div>
          </div>

          {/* En Sociedad */}
          <div className="bg-gradient-to-br from-purple-50/30 to-purple-50/20 backdrop-blur-lg border border-purple-100/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-all text-center">
            <div className="text-purple-700 text-xs font-semibold uppercase tracking-wide mb-2">En Sociedad</div>
            <div className="flex items-center justify-center gap-2">
              {laborData.inSociety ? (
                <span className="inline-flex items-center gap-2 text-purple-600 font-medium">
                  <i className="ki-duotone ki-check-circle text-lg">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                  Si
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 text-gray-500 font-medium">
                  <i className="ki-duotone ki-cross-circle text-lg">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                  No
                </span>
              )}
            </div>
          </div>

          {/* Estado Jubilación */}
          <div className="bg-gradient-to-br from-indigo-50/30 to-indigo-50/20 backdrop-blur-lg border border-indigo-100/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-all text-center">
            <div className="text-indigo-700 text-xs font-semibold uppercase tracking-wide mb-2">Estado Jubilacion</div>
            <div className="flex items-center justify-center gap-2">
              {laborData.retired ? (
                <span className="inline-flex items-center gap-2 text-indigo-600 font-medium">
                  <i className="ki-duotone ki-check-circle text-lg">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                  Jubilado
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 text-gray-500 font-medium">
                  <i className="ki-duotone ki-cross-circle text-lg">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                  No Jubilado
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Historial de aportes */}
        {laborData.aportHistory && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Historial de Aportes</h4>
              <div className="h-0.5 bg-gradient-to-r from-indigo-500 via-indigo-400 to-transparent w-12"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-emerald-50/30 to-emerald-50/20 backdrop-blur-lg border border-emerald-100/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-all text-center">
                <div className="text-emerald-700 text-xs font-semibold uppercase tracking-wide mb-2">Empleador</div>
                <div className="text-2xl font-bold text-gray-900">
                  {laborData.aportHistory.employerContributions
                    ? formatCurrency(laborData.aportHistory.employerContributions, 'ARS')
                    : 'N/A'
                  }
                </div>
              </div>
              <div className="bg-gradient-to-br from-teal-50/30 to-teal-50/20 backdrop-blur-lg border border-teal-100/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-all text-center">
                <div className="text-teal-700 text-xs font-semibold uppercase tracking-wide mb-2">Autonomos</div>
                <div className="text-2xl font-bold text-gray-900">
                  {laborData.aportHistory.autonomousContributions
                    ? formatCurrency(laborData.aportHistory.autonomousContributions, 'ARS')
                    : 'N/A'
                  }
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ESTADÍSTICAS DE APORTES */}
      {laborData.contributionStats && (
        <ContributionStatistics contributionStats={laborData.contributionStats} />
      )}

      {/* ACTIVIDADES ECONÓMICAS */}
      {laborData.activities && laborData.activities.length > 0 && (
        <div>
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-base font-medium text-gray-900">Actividades Economicas</h3>
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
                {laborData.activities.length}
              </span>
            </div>
            <div className="h-0.5 bg-gradient-to-r from-amber-500 via-amber-400 to-transparent w-16"></div>
          </div>

          <div className="space-y-3">
            {laborData.activities.map((activity: any, idx: number) => {
              const isPrimary = activity.type === 'P'
              const isSecondary = activity.type === 'S'
              const isTertiary = activity.type === 'T'

              return (
                <div
                  key={idx}
                  className={`
                    rounded-xl transition-all duration-200 shadow-sm hover:shadow-md backdrop-blur-lg
                    ${isPrimary
                      ? 'bg-gradient-to-br from-emerald-50/30 to-teal-50/20 border border-emerald-100/30'
                      : isSecondary || isTertiary
                        ? 'bg-gradient-to-br from-blue-50/30 to-indigo-50/20 border border-blue-100/30'
                        : 'bg-gradient-to-br from-gray-50/30 to-slate-50/20 border border-gray-100/30'
                    }
                  `}
                >
                  {/* Header */}
                  <div className="px-5 pt-4 pb-4 bg-white/20 backdrop-blur-sm border-b border-gray-200/40">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {activity.type && (
                            <span className={`
                              inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border
                              ${isPrimary
                                ? 'bg-emerald-100/80 text-emerald-700 border-emerald-200'
                                : isSecondary
                                  ? 'bg-blue-100/80 text-blue-700 border-blue-200'
                                  : isTertiary
                                    ? 'bg-indigo-100/80 text-indigo-700 border-indigo-200'
                                    : 'bg-gray-100/80 text-gray-600 border-gray-200'
                              }
                            `}>
                              {translateActivityType(activity.type)}
                            </span>
                          )}
                          {activity.ciiu && (
                            <span className="text-xs font-medium text-gray-600 bg-white/60 border border-gray-300/60 px-2.5 py-1 rounded-lg font-mono">
                              CIIU {activity.ciiu}
                            </span>
                          )}
                        </div>
                        <h4 className="text-base font-semibold text-gray-900 leading-snug">
                          {activity.description}
                        </h4>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="px-5 py-4 bg-white/10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activity.sector && (
                        <div className="bg-white/40 backdrop-blur-sm rounded-lg px-3 py-2.5 border border-gray-200/40">
                          <span className="text-xs font-semibold text-gray-600 block mb-1">Sector</span>
                          <span className="text-sm font-medium text-gray-900">
                            {activity.sector}
                          </span>
                        </div>
                      )}

                      {activity.category && (
                        <div className="bg-white/40 backdrop-blur-sm rounded-lg px-3 py-2.5 border border-gray-200/40">
                          <span className="text-xs font-semibold text-gray-600 block mb-1">Categoria</span>
                          <span className="text-sm font-medium text-gray-900">
                            {activity.category}
                          </span>
                        </div>
                      )}

                      {activity.startDate && (
                        <div className="bg-white/40 backdrop-blur-sm rounded-lg px-3 py-2.5 border border-gray-200/40 md:col-span-2">
                          <span className="text-xs font-semibold text-gray-600 block mb-1">Inicio de Actividad</span>
                          <div className="flex items-center gap-2">
                            <i className="ki-duotone ki-time text-sm text-gray-500">
                              <span className="path1"></span>
                              <span className="path2"></span>
                            </i>
                            <span className="text-sm font-medium text-gray-900">
                              {formatLocalDate(activity.startDate)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* RELACIÓN DE DEPENDENCIA */}
      {laborData.employerHistory && laborData.employerHistory.length > 0 && (
        <div>
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-base font-medium text-gray-900">Relacion de Dependencia</h3>
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
                {laborData.employerHistory.length}
              </span>
            </div>
            <div className="h-0.5 bg-gradient-to-r from-cyan-500 via-cyan-400 to-transparent w-16"></div>
          </div>

          {/* Tabla de empleadores */}
          <div className={`${showSalaryInfo !== null || expandedEmployer !== null ? 'overflow-visible' : 'overflow-x-auto'} bg-gradient-to-br from-blue-50/30 to-indigo-50/20 backdrop-blur-lg rounded-xl border border-blue-100/30 shadow-sm`}>
            <table className="min-w-full">
              <thead className="bg-white/40 backdrop-blur-sm border-b border-gray-200/60">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Empleador</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Salario</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Periodo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="bg-white/20 divide-y divide-gray-200/40">
                {sortedByEndDate.map((employer, idx) => {
                  const isActive = employer.state === 'Activo'
                  const isExpanded = expandedEmployer === idx

                  return (
                    <React.Fragment key={idx}>
                      {/* Main Row */}
                      <tr className="hover:bg-white/30 transition-colors duration-150">
                        {/* Estado */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-xs font-normal px-3 py-1.5 rounded-full border ${isActive
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : 'bg-gray-100 text-gray-600 border-gray-200'
                            }`}>
                            {isActive ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>

                        {/* Empleador */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <h4 className="font-semibold text-gray-900 text-sm">{employer.name}</h4>
                            {employer.taxId && (
                              <span className="text-xs font-medium text-gray-500 font-mono">
                                CUIT: {employer.taxId}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Salario */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {employer.salaryCategory ? (
                            <div className="relative">
                              <button
                                className="text-xs bg-white/60 backdrop-blur-sm text-gray-700 px-3 py-1.5 rounded-lg font-semibold border border-gray-300/60 hover:bg-white hover:border-gray-400 transition-all shadow-sm"
                                onMouseEnter={() => setShowSalaryInfo(idx)}
                                onMouseLeave={() => setShowSalaryInfo(null)}
                              >
                                {employer.salaryCategory}
                              </button>

                              {showSalaryInfo === idx && (
                                <div className="absolute bottom-full right-0 mb-2 bg-gradient-to-br from-indigo-50/95 to-purple-50/95 backdrop-blur-lg border border-indigo-200/60 rounded-xl shadow-xl p-4 w-64 z-50">
                                  {(() => {
                                    const category = getSalaryRangeInfo(employer.salaryCategory)
                                    if (category) {
                                      return (
                                        <div className="space-y-2.5">
                                          <div className="text-sm font-bold text-gray-900 border-b border-gray-200/40 pb-2">
                                            {employer.salaryCategory}
                                          </div>
                                          <div className="text-xs font-medium text-gray-700 bg-white/40 rounded-lg px-2.5 py-2">
                                            ${category.from.toLocaleString('es-AR')} - {category.to ? `$${category.to.toLocaleString('es-AR')}` : 'Sin limite'}
                                          </div>
                                          {category.equalsTo && (
                                            <div className="text-xs font-medium text-gray-600">
                                              <span className="text-gray-500">Monotributo:</span> {category.equalsTo}
                                            </div>
                                          )}
                                        </div>
                                      )
                                    }
                                    return null
                                  })()}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 font-normal">—</span>
                          )}
                        </td>

                        {/* Período */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <div className="text-sm font-medium text-gray-900">
                              {formatDurationLabel(employer.months)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatLocalDate(employer.startDate)} — {formatLocalDate(employer.finishDate)}
                            </div>
                          </div>
                        </td>

                        {/* Acciones */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => setExpandedEmployer(isExpanded ? null : idx)}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all border border-blue-200/60 hover:border-blue-300"
                          >
                            {isExpanded ? (
                              <>
                                <i className="ki-duotone ki-down text-sm">
                                  <span className="path1"></span>
                                  <span className="path2"></span>
                                </i>
                                <span>Ocultar</span>
                              </>
                            ) : (
                              <>
                                <i className="ki-duotone ki-right text-sm">
                                  <span className="path1"></span>
                                  <span className="path2"></span>
                                </i>
                                <span>Ver Detalles</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Accordion Content */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={5} className="px-0 py-0">
                            <div className="bg-white/40 backdrop-blur-sm border-t border-gray-100/40">
                              <div className="px-8 py-6">
                                <div className="mb-4 pb-3 border-b border-gray-200">
                                  <h5 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <i className="ki-duotone ki-office-bag text-lg text-gray-500">
                                      <span className="path1"></span>
                                      <span className="path2"></span>
                                    </i>
                                    Informacion de la Empresa
                                  </h5>
                                  <p className="text-xs text-gray-500 mt-1">Los siguientes datos corresponden al empleador</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                  {/* CUIT */}
                                  <div className="bg-gradient-to-br from-blue-50/30 to-blue-50/20 backdrop-blur-lg border border-blue-100/30 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                      <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide">CUIT</div>
                                    </div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {employer.taxId || '—'}
                                    </div>
                                  </div>

                                  {/* Empleados */}
                                  <div className="bg-gradient-to-br from-emerald-50/30 to-emerald-50/20 backdrop-blur-lg border border-emerald-100/30 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                      <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Empleados</div>
                                    </div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {employer.employeeCount ? employer.employeeCount.toLocaleString('es-AR') : '—'}
                                    </div>
                                  </div>

                                  {/* Dirección */}
                                  {(employer.address?.address || employer.address?.city || employer.address?.province) && (
                                    <div className="bg-gradient-to-br from-orange-50/30 to-orange-50/20 backdrop-blur-lg border border-orange-100/30 rounded-xl p-4 shadow-sm hover:shadow-md transition-all md:col-span-2">
                                      <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                          <div className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Direccion</div>
                                        </div>
                                        <a
                                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([
                                            employer.address?.address,
                                            employer.address?.city,
                                            employer.address?.province,
                                            'Argentina'
                                          ].filter(Boolean).join(', '))}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded-md hover:bg-orange-100 hover:text-orange-800 transition-colors"
                                          title="Ver en Google Maps"
                                        >
                                          <i className="ki-duotone ki-geolocation text-sm">
                                            <span className="path1"></span>
                                            <span className="path2"></span>
                                          </i>
                                          <span>Ver mapa</span>
                                        </a>
                                      </div>
                                      <div className="text-sm font-normal text-gray-900">
                                        {[
                                          employer.address?.address,
                                          employer.address?.city,
                                          employer.address?.province,
                                          employer.address?.postalCode
                                        ].filter(Boolean).join(', ')}
                                      </div>
                                    </div>
                                  )}

                                  {/* Actividad */}
                                  {employer.activity && (
                                    <div className="bg-gradient-to-br from-purple-50/30 to-purple-50/20 backdrop-blur-lg border border-purple-100/30 rounded-xl p-4 shadow-sm hover:shadow-md transition-all lg:col-span-4">
                                      <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                        <div className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Actividad</div>
                                      </div>
                                      <div className="text-sm font-medium text-gray-900">
                                        {employer.activity}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Distribución de Tiempo Laboral */}
          {chartData.length > 0 && (
            <div className="mt-12 pt-8 border-t-2 border-gray-200">
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Distribucion de Tiempo Laboral</h4>
                <div className="h-0.5 bg-gradient-to-r from-lime-500 via-lime-400 to-transparent w-12"></div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="flex items-center justify-center">
                  <div className="w-full max-w-sm relative" style={{ aspectRatio: '1/1' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius="40%"
                          outerRadius="70%"
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0">
                      <div className="text-center">
                        <p className="text-xs font-medium text-gray-600 mb-1">Total</p>
                        <p className="text-xs font-semibold text-gray-900 leading-tight">
                          {totalMonths >= 12
                            ? `${Math.floor(totalMonths / 12)}a ${totalMonths % 12}m`
                            : `${totalMonths}m`
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Leyenda de distribución */}
                <div className="flex flex-col justify-center">
                  <div className="space-y-4">
                    {sortedEmployerStats.map((employer, idx) => {
                      const percentage = calculatePercentage(employer.months, totalMonths)
                      return (
                        <div key={idx} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
                          <div className="flex items-center gap-4 min-w-0 flex-1">
                            <div
                              className="w-4 h-4 rounded-full flex-shrink-0"
                              style={{ backgroundColor: employer.color }}
                            ></div>
                            <span className="text-sm text-gray-800 truncate font-semibold">
                              {employer.name}
                            </span>
                          </div>
                          <div className="text-right flex-shrink-0 ml-4">
                            <p className="text-sm font-semibold text-gray-800">
                              {formatPercentage(percentage)}
                            </p>
                            <p className="text-xs font-medium text-gray-500">
                              {formatDurationLabel(employer.months)}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
