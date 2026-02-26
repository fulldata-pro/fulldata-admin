'use client'

import React from 'react'
import { SummaryData, Score } from '@/lib/types/report.types'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import InfoTooltip from '@/components/reports/shared/InfoTooltip'
import ScoreBellCurve from '@/components/reports/shared/ScoreBellCurve'
import { formatDate } from '@/lib/utils/dateUtils'
import { formatCurrency, formatNumber } from '@/lib/utils/currencyUtils'

interface PeopleSummaryProps {
  summary: SummaryData | null
  scoreHistory: Score[]
}

export default function PeopleSummary({ summary, scoreHistory }: PeopleSummaryProps) {
  if (!summary) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No hay datos de resumen disponibles</p>
      </div>
    )
  }

  const translateMaritalStatus = (status: string) => {
    const translations: { [key: string]: string } = {
      'SINGLE': 'Soltero/a',
      'MARRIED': 'Casado/a',
      'DIVORCED': 'Divorciado/a',
      'WIDOWER': 'Viudo/a'
    }
    return translations[status] || status
  }

  const getScoreEvaluation = (score: string | number) => {
    const numScore = typeof score === 'string' ? parseInt(score) : score
    if (isNaN(numScore)) return { label: 'N/A', color: 'text-gray-600' }

    if (numScore >= 851) return { label: 'Excelente', color: 'text-green-600' }
    if (numScore >= 740) return { label: 'Bueno', color: 'text-blue-600' }
    if (numScore >= 600) return { label: 'Regular', color: 'text-yellow-600' }
    return { label: 'Malo', color: 'text-red-600' }
  }

  const getSocioeconomicLevelInfo = (level: string) => {
    const levels: { [key: string]: { label: string } } = {
      'A': { label: 'Ingresos elevados, educacion universitaria, ocupaciones profesionales.' },
      'B': { label: 'Clase media alta, ingresos solidos, educacion universitaria o tecnica.' },
      'C1': { label: 'Clase media, ingresos moderados, educacion secundaria completa.' },
      'C2': { label: 'Clase media baja, ingresos ajustados, educacion secundaria completa.' },
      'C3': { label: 'Clase media baja, ingresos ligeramente mas bajos.' },
      'D1': { label: 'Ingresos bajos, educacion basica, ocupaciones manuales.' },
      'D2': { label: 'Ingresos bajos, educacion basica, ocupaciones manuales o de servicios.' },
      'E': { label: 'Ingresos muy bajos, educacion limitada.' }
    }
    return levels[level] || levels['C2']
  }

  const getPercentileDescription = (percentile: number) => {
    if (percentile <= 1) return '🔝 Dentro del 1% con mayor nivel económico (élite)'
    if (percentile <= 5) return '💎 Entre el 5% con mayor nivel económico'
    if (percentile <= 10) return '💰 En el 10% superior de la población'
    if (percentile <= 25) return '📈 Por encima del promedio (25% superior)'
    if (percentile <= 50) return '⚖️ En el promedio económico de la población'
    if (percentile <= 75) return '📉 Por debajo del promedio (25% inferior)'
    return '⬇️ En el nivel económico más bajo de la población'
  }

  const formatIncomeAmount = (amount: number) => {
    // Format without decimals and without currency code
    return `$ ${formatNumber(Math.round(amount))}`
  }

  const currentScore = scoreHistory?.find(s => s.period === "0")?.value || "N/A"

  // Prepare score chart data - sort by period (oldest to newest)
  const scoreChartData = (scoreHistory || [])
    .filter(item => item.value && !isNaN(parseInt(item.value)))
    .map(item => ({
      period: item.period === "0" ? "Actual" : `${item.period} meses`,
      score: parseInt(item.value),
      sortOrder: item.period === "0" ? 0 : parseInt(item.period)
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <div className="space-y-8">
      {/* Alert for deceased person */}
      {summary.deathDate && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl px-5 py-4 flex items-center gap-3">
          <i className="ki-duotone ki-information-5 text-xl text-orange-500">
            <span className="path1"></span>
            <span className="path2"></span>
            <span className="path3"></span>
          </i>
          <span className="text-sm font-semibold text-orange-800">Registro de persona fallecida</span>
        </div>
      )}

      {/* Basic Information */}
      <div>
        <div className="mb-6">
          <h3 className="text-base font-medium text-gray-900 mb-2">Informacion Basica</h3>
          <div className="h-0.5 bg-gradient-to-r from-blue-500 via-blue-400 to-transparent w-16"></div>
        </div>

        {/* Highlighted Data */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
            <span className="text-blue-600 text-xs font-medium uppercase tracking-wide block mb-2">Nombre Completo</span>
            <span className="text-gray-900 font-semibold text-base block">{summary.firstName} {summary.lastName}</span>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5">
            <span className="text-emerald-600 text-xs font-medium uppercase tracking-wide block mb-2">DNI</span>
            <span className="text-gray-900 font-semibold text-base font-mono">
              {summary.nationalId}
              {summary.nationalIdVersion && (
                <span className="text-xs text-gray-500 ml-1 font-normal">(Ej. {summary.nationalIdVersion})</span>
              )}
            </span>
          </div>

          <div className="bg-purple-50 border border-purple-100 rounded-xl p-5">
            <span className="text-purple-600 text-xs font-medium uppercase tracking-wide block mb-2">CUIT/CUIL</span>
            <span className="text-gray-900 font-semibold text-base font-mono">{summary.taxId}</span>
          </div>
        </div>

        {/* Detailed Information Grid */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-500 flex items-center justify-center">
                <i className="ki-duotone ki-calendar-add text-xl text-white">
                  <span className="path1"></span>
                  <span className="path2"></span>
                  <span className="path3"></span>
                </i>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Fecha de Nacimiento</p>
                <p className="text-sm font-bold text-gray-900">{formatDate(summary.birthDate)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                <i className="ki-duotone ki-calendar text-xl text-white">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Edad</p>
                <p className="text-sm font-bold text-gray-900">{summary.age ? `${summary.age} anos` : 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
                <i className="ki-duotone ki-profile-circle text-xl text-white">
                  <span className="path1"></span>
                  <span className="path2"></span>
                  <span className="path3"></span>
                </i>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Sexo</p>
                <p className="text-sm font-bold text-gray-900">
                  {summary.sex === 'M' ? 'Masculino' : summary.sex === 'F' ? 'Femenino' : summary.sex}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-pink-500 flex items-center justify-center">
                <i className="ki-duotone ki-heart text-xl text-white">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Estado Civil</p>
                <p className="text-sm font-bold text-gray-900">{translateMaritalStatus(summary.maritalStatus) || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center">
                <i className="ki-duotone ki-flag text-xl text-white">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Nacionalidad</p>
                <p className="text-sm font-bold text-gray-900">{summary.nationality || 'N/A'}</p>
              </div>
            </div>

            {summary.deathDate && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
                  <i className="ki-duotone ki-cross-circle text-xl text-white">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Fecha de Fallecimiento</p>
                  <p className="text-sm font-bold text-gray-900">{formatDate(summary.deathDate)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Credit Score */}
      {currentScore !== 'N/A' && (
        <div>
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-base font-medium text-gray-900">Score Crediticio</h3>
              <InfoTooltip content="Puntuacion crediticia (0-999): Excelente (851-999), Bueno (740-850), Regular (600-739), Malo (0-599)" />
            </div>
            <div className="h-0.5 bg-gradient-to-r from-indigo-500 via-indigo-400 to-transparent w-16"></div>
          </div>

          <div className="flex items-center justify-center gap-8 mb-6">
            {/* Score Circle */}
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center w-48 h-48">
                <svg className="absolute inset-0 w-48 h-48 transform -rotate-90" viewBox="0 0 192 192">
                  <circle
                    cx="96"
                    cy="96"
                    r="84"
                    stroke="#D1D5DB"
                    strokeWidth="10"
                    fill="none"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="84"
                    stroke="#EF4444"
                    strokeWidth="10"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${(parseInt(currentScore) / 999) * 527.79} 527.79`}
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="relative z-10 text-center">
                  <div className="text-sm font-normal text-gray-900 mb-1">Score</div>
                  <span className="text-5xl font-bold text-gray-900">{currentScore}</span>
                </div>
              </div>
              <div className="mt-4">
                <span className={`text-sm font-medium ${getScoreEvaluation(currentScore).color}`}>
                  {getScoreEvaluation(currentScore).label}
                </span>
              </div>
            </div>

            {/* Bell Curve */}
            <div className="w-72">
              <ScoreBellCurve score={parseInt(currentScore)} />
            </div>
          </div>

          {/* Score History Chart */}
          {scoreChartData.length > 1 && (
            <div className="h-72 bg-gray-50 rounded-xl p-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={scoreChartData}>
                  <defs>
                    <linearGradient id="scoreGradientPeople" x1="0" y1="0" x2="0" y2="1">
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
                    label={{ value: 'Historial', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: '#6b7280' } }}
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
                    labelStyle={{ fontWeight: 600, marginBottom: '4px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fill="url(#scoreGradientPeople)"
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4, stroke: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Socioeconomic Level */}
      {summary.socioeconomicLevel && (
        <div>
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-base font-medium text-gray-900">Nivel Socioeconomico</h3>
              <InfoTooltip content="Clasificacion basada en ingresos, educacion y ocupacion que determina el poder adquisitivo" />
            </div>
            <div className="h-0.5 bg-gradient-to-r from-purple-500 via-purple-400 to-transparent w-16"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-purple-50 border border-purple-100 rounded-xl p-6 text-center flex flex-col items-center justify-center">
              <span className="text-xs font-medium text-purple-600 uppercase tracking-wide mb-3 block">Nivel Actual</span>
              <div className="text-4xl font-bold bg-purple-500 text-white w-16 h-16 rounded-full flex items-center justify-center mb-3">
                {summary.socioeconomicLevel}
              </div>
              <p className="text-xs text-gray-700">
                {getSocioeconomicLevelInfo(summary.socioeconomicLevel).label}
              </p>
            </div>

            <div className="lg:col-span-2 bg-gray-50 border border-gray-200 rounded-xl p-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-4">Clasificacion de Niveles</h4>
              <div className="space-y-2">
                {['A', 'B', 'C1', 'C2', 'C3', 'D1', 'D2', 'E'].map((level) => {
                  const info = getSocioeconomicLevelInfo(level)
                  const isActive = level === summary.socioeconomicLevel
                  return (
                    <div
                      key={level}
                      className={`flex items-start gap-3 py-2 px-3 rounded-lg ${isActive ? 'bg-purple-50 border border-purple-200' : ''}`}
                    >
                      <div className="flex items-center gap-2 min-w-[40px]">
                        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-purple-500' : 'bg-gray-300'}`} />
                        <span className={`font-semibold text-xs ${isActive ? 'text-purple-600' : 'text-gray-600'}`}>
                          {level}
                        </span>
                      </div>
                      <p className={`text-xs flex-1 ${isActive ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                        {info.label}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Additional Socioeconomic Info */}
          {(summary.nsePercentile || summary.nseAverageIncome) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {summary.nsePercentile && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-medium text-indigo-600 uppercase tracking-wide">Percentil Socioeconomico</span>
                    <InfoTooltip content="Posicion economica relativa. Menor numero = mejor posicion" />
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {getPercentileDescription(summary.nsePercentile)}
                  </div>
                </div>
              )}
              {summary.nseAverageIncome && (
                <div className="bg-cyan-50 border border-cyan-100 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-medium text-cyan-600 uppercase tracking-wide">Ingreso Promedio del Segmento</span>
                    <InfoTooltip content="Ingreso promedio de todas las personas en este percentil socioeconomico" />
                  </div>
                  <div className="text-lg font-bold text-gray-900">{formatIncomeAmount(summary.nseAverageIncome)}</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
