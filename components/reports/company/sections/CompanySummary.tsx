'use client'

import React from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import InfoTooltip from '@/components/reports/shared/InfoTooltip'
import ScoreBellCurve from '@/components/reports/shared/ScoreBellCurve'
import { CompanySummaryData, CompanyScore } from '@/lib/types/report.types'
import { formatDate } from '@/lib/utils/dateUtils'

interface CompanySummaryProps {
  summary: CompanySummaryData | null
  scoreHistory: CompanyScore[]
}

export default function CompanySummary({ summary, scoreHistory }: CompanySummaryProps) {
  if (!summary) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No hay informacion de resumen disponible</p>
      </div>
    )
  }

  const currentScore = scoreHistory?.find(s => s.period === "0")?.value || "N/A"

  const getScoreEvaluation = (score: string | number) => {
    const numScore = typeof score === 'string' ? parseInt(score) : score
    if (isNaN(numScore)) return { label: 'N/A', color: 'text-gray-600' }

    if (numScore >= 851) return { label: 'Excelente', color: 'text-green-600' }
    if (numScore >= 740) return { label: 'Bueno', color: 'text-blue-600' }
    if (numScore >= 600) return { label: 'Regular', color: 'text-yellow-600' }
    return { label: 'Malo', color: 'text-red-600' }
  }

  const scoreChartData = scoreHistory
    ?.filter(item => item.value && !isNaN(parseInt(item.value)))
    .map(item => ({
      period: item.period === "0" ? "Actual" : `${item.period} meses`,
      score: parseInt(item.value),
      sortOrder: item.period === "0" ? 0 : parseInt(item.period)
    }))
    .sort((a, b) => b.sortOrder - a.sortOrder) || []

  return (
    <div className="space-y-8">
      {/* Informacion Basica */}
      <div>
        <div className="mb-6">
          <h3 className="text-base font-medium text-gray-900 mb-2">Informacion Basica</h3>
          <div className="h-0.5 bg-gradient-to-r from-orange-500 via-orange-400 to-transparent w-16"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Columna izquierda */}
          <div className="lg:col-span-7 space-y-4">
            {/* Razon Social */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
              <span className="text-blue-600 text-xs font-semibold uppercase tracking-wider block mb-3">Razon Social</span>
              <span className="text-gray-900 font-bold text-2xl block leading-tight">{summary.rz || 'N/A'}</span>
            </div>

            {/* CUIT y Estado */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-6">
                <span className="text-purple-600 text-xs font-semibold uppercase tracking-wider block mb-3">CUIT</span>
                <span className="text-gray-900 font-bold text-xl font-mono block">{summary.taxId || 'N/A'}</span>
              </div>

              <div className={`rounded-xl p-6 border ${summary.cessation
                ? 'bg-red-50 border-red-200'
                : 'bg-emerald-50 border-emerald-200'
              }`}>
                <span className={`text-xs font-semibold uppercase tracking-wider block mb-3 ${summary.cessation ? 'text-red-600' : 'text-emerald-600'}`}>
                  Estado de la Empresa
                </span>
                <div className="flex items-center gap-2">
                  {summary.cessation ? (
                    <>
                      <i className="ki-duotone ki-cross-circle text-xl text-red-500">
                        <span className="path1"></span>
                        <span className="path2"></span>
                      </i>
                      <span className="text-red-700 font-bold text-lg">Con cesacion</span>
                    </>
                  ) : (
                    <>
                      <i className="ki-duotone ki-check-circle text-xl text-emerald-600">
                        <span className="path1"></span>
                        <span className="path2"></span>
                      </i>
                      <span className="text-emerald-700 font-bold text-lg">Activa</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider block mb-2">Fecha de Inicio</span>
                <span className="text-gray-900 font-bold text-lg block">{formatDate(summary.startDate)}</span>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider block mb-2">Fecha de Constitucion</span>
                <span className="text-gray-900 font-bold text-lg block">{formatDate(summary.constitutionDate)}</span>
              </div>
            </div>

            {/* Indicadores */}
            <div className="grid grid-cols-3 gap-3">
              <div className={`rounded-xl p-4 border ${summary.isBanked
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-gray-50 border-gray-200'
              }`}>
                <span className="text-gray-600 text-xs font-medium block mb-2">Bancarizada</span>
                <div className="flex items-center gap-2">
                  {summary.isBanked ? (
                    <>
                      <i className="ki-duotone ki-check text-emerald-600"><span className="path1"></span><span className="path2"></span></i>
                      <span className="text-emerald-700 font-bold text-sm">Si</span>
                    </>
                  ) : (
                    <>
                      <i className="ki-duotone ki-cross text-gray-500"><span className="path1"></span><span className="path2"></span></i>
                      <span className="text-gray-600 font-bold text-sm">No</span>
                    </>
                  )}
                </div>
              </div>

              <div className={`rounded-xl p-4 border ${summary.isExporter === 'Si'
                ? 'bg-blue-50 border-blue-200'
                : 'bg-gray-50 border-gray-200'
              }`}>
                <span className="text-gray-600 text-xs font-medium block mb-2">Exportadora</span>
                <div className="flex items-center gap-2">
                  {summary.isExporter === 'Si' ? (
                    <>
                      <i className="ki-duotone ki-check text-blue-600"><span className="path1"></span><span className="path2"></span></i>
                      <span className="text-blue-700 font-bold text-sm">Si</span>
                    </>
                  ) : (
                    <>
                      <i className="ki-duotone ki-cross text-gray-500"><span className="path1"></span><span className="path2"></span></i>
                      <span className="text-gray-600 font-bold text-sm">No</span>
                    </>
                  )}
                </div>
              </div>

              <div className={`rounded-xl p-4 border ${summary.stateSupplier === 'Si'
                ? 'bg-violet-50 border-violet-200'
                : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center gap-1 mb-2">
                  <span className="text-gray-600 text-xs font-medium">Prov. Estado</span>
                  <InfoTooltip content="Empresa habilitada para contratar con organismos publicos" />
                </div>
                <div className="flex items-center gap-2">
                  {summary.stateSupplier === 'Si' ? (
                    <>
                      <i className="ki-duotone ki-check text-violet-600"><span className="path1"></span><span className="path2"></span></i>
                      <span className="text-violet-700 font-bold text-sm">Si</span>
                    </>
                  ) : (
                    <>
                      <i className="ki-duotone ki-cross text-gray-500"><span className="path1"></span><span className="path2"></span></i>
                      <span className="text-gray-600 font-bold text-sm">No</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Columna derecha */}
          <div className="lg:col-span-5">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 h-full">
              <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-5 pb-3 border-b border-gray-200">
                Datos de la Empresa
              </h4>

              <div className="space-y-4">
                <div className="flex items-start justify-between py-3 px-4 bg-white rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className="ki-duotone ki-book text-lg text-blue-600">
                        <span className="path1"></span><span className="path2"></span>
                      </i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-sm font-medium text-gray-600">Tipo de Sociedad</span>
                        <InfoTooltip content="Forma juridica de la empresa" />
                      </div>
                      <span className="text-base font-bold text-gray-900 block break-words">{summary.societyType || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 px-4 bg-white rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <i className="ki-duotone ki-tag text-lg text-orange-600">
                        <span className="path1"></span><span className="path2"></span><span className="path3"></span>
                      </i>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-sm font-medium text-gray-600">Codigo CIIU</span>
                        <InfoTooltip content="Clasificacion Industrial Internacional Uniforme" />
                      </div>
                      <span className="text-base font-bold text-gray-900">{summary.ciiu || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 px-4 bg-white rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <i className="ki-duotone ki-people text-lg text-indigo-600">
                        <span className="path1"></span><span className="path2"></span><span className="path3"></span>
                      </i>
                    </div>
                    <span className="text-sm font-medium text-gray-600">Empleados</span>
                  </div>
                  <span className="text-base font-bold text-gray-900">{summary.employees || 'N/A'}</span>
                </div>

                <div className="flex items-center justify-between py-3 px-4 bg-white rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <i className="ki-duotone ki-time text-lg text-purple-600">
                        <span className="path1"></span><span className="path2"></span>
                      </i>
                    </div>
                    <span className="text-sm font-medium text-gray-600">Antiguedad</span>
                  </div>
                  <span className="text-base font-bold text-gray-900">
                    {summary.age ? `${summary.age} anos` : 'N/A'}
                  </span>
                </div>

                <div className="flex items-start justify-between py-3 px-4 bg-white rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className="ki-duotone ki-geolocation text-lg text-green-600">
                        <span className="path1"></span><span className="path2"></span>
                      </i>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600 block mb-1">Ubicacion</span>
                      <span className="text-base font-bold text-gray-900 block">
                        {summary.city && summary.province
                          ? `${summary.city}, ${summary.province}`
                          : summary.province || summary.city || 'N/A'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actividades Economicas */}
        {(summary.activity || summary.activity2) && (
          <div className="mt-6">
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Actividades Economicas</h4>
              <div className="h-0.5 bg-gradient-to-r from-teal-500 via-teal-400 to-transparent w-16"></div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {summary.activity && (
                <div className="relative bg-teal-50 border border-teal-100 rounded-xl p-6">
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-teal-600 text-white">
                      Principal
                    </span>
                  </div>

                  <div className="pr-24">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                      <span className="text-teal-700 text-xs font-semibold uppercase tracking-wider">Actividad Principal</span>
                    </div>
                    <p className="text-gray-900 font-medium text-sm leading-relaxed">{summary.activity}</p>
                  </div>
                </div>
              )}

              {summary.activity2 && (
                <div className="relative bg-blue-50 border border-blue-100 rounded-xl p-6">
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white">
                      Secundaria
                    </span>
                  </div>

                  <div className="pr-24">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-blue-700 text-xs font-semibold uppercase tracking-wider">Actividad Secundaria</span>
                    </div>
                    <p className="text-gray-900 font-medium text-sm leading-relaxed">{summary.activity2}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Score Crediticio */}
      {currentScore !== 'N/A' && (
        <div>
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-base font-medium text-gray-900">Score Crediticio</h3>
              <InfoTooltip content="Puntuacion crediticia empresarial (0-999): Excelente (851-999), Bueno (740-850), Regular (600-739), Malo (0-599)" />
            </div>
            <div className="h-0.5 bg-gradient-to-r from-indigo-500 via-indigo-400 to-transparent w-16"></div>
          </div>

          <div className="flex items-center justify-center gap-8 mb-6">
            {/* Score Circle */}
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center w-40 h-40">
                <svg className="absolute inset-0 w-40 h-40 transform -rotate-90" viewBox="0 0 160 160">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="#D1D5DB"
                    strokeWidth="10"
                    fill="none"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="#EF4444"
                    strokeWidth="10"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${(parseInt(currentScore) / 999) * 439.82} 439.82`}
                  />
                </svg>
                <div className="relative z-10 text-center">
                  <div className="text-sm font-normal text-gray-900 mb-1">Score</div>
                  <span className="text-4xl font-bold text-gray-900">{currentScore}</span>
                </div>
              </div>
              <div className="mt-3">
                <span className={`text-sm font-medium ${getScoreEvaluation(currentScore).color}`}>
                  {getScoreEvaluation(currentScore).label}
                </span>
              </div>
            </div>

            {/* Bell Curve */}
            <div className="w-64">
              <ScoreBellCurve score={parseInt(currentScore)} />
            </div>
          </div>

          {/* Score History Chart */}
          {scoreChartData.length > 1 && (
            <div className="h-72 bg-gray-50 rounded-lg p-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={scoreChartData}>
                  <defs>
                    <linearGradient id="scoreGradientCompany" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="period"
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    axisLine={{ stroke: '#d1d5db' }}
                    tickLine={{ stroke: '#d1d5db' }}
                  />
                  <YAxis
                    domain={[0, 999]}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    axisLine={{ stroke: '#d1d5db' }}
                    tickLine={{ stroke: '#d1d5db' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '10px',
                      fontSize: '13px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fill="url(#scoreGradientCompany)"
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4, stroke: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
