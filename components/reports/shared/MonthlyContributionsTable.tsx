'use client'

import React, { useMemo } from 'react'

export interface ContributionItem {
  period: number | { $numberLong: string } | null
  payed: boolean
}

interface MonthlyContributionsTableProps {
  contributions: ContributionItem[]
  title?: string
  emptyMessage?: string
  totalLabel?: string
}

export default function MonthlyContributionsTable({
  contributions,
  title = 'Contribuciones',
  emptyMessage = 'No hay contribuciones registradas',
  totalLabel = 'Total de registros'
}: MonthlyContributionsTableProps) {

  const getMonthsList = () => {
    return [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ]
  }

  const contributionsByYear = useMemo(() => {
    if (!contributions || contributions.length === 0) return {}

    const result: Record<number, Record<number, { period: number | null, payed: boolean }>> = {}

    contributions.forEach((contribution) => {
      let period: number | null = null

      if (contribution.period) {
        if (typeof contribution.period === 'object' && '$numberLong' in contribution.period) {
          period = parseInt(contribution.period.$numberLong)
        } else if (typeof contribution.period === 'number') {
          period = contribution.period
        }
      }

      const date = period ? new Date(period) : null

      if (date) {
        const year = date.getFullYear()
        const month = date.getMonth()

        if (!result[year]) {
          result[year] = {}
        }

        result[year][month] = { period, payed: contribution.payed }
      }
    })

    return result
  }, [contributions])

  const years = useMemo(() => {
    return Object.keys(contributionsByYear)
      .map(Number)
      .sort((a, b) => b - a)
  }, [contributionsByYear])

  const renderStatusIcon = (year: number, month: number) => {
    const contribution = contributionsByYear[year]?.[month]

    if (!contribution) {
      return (
        <div className="flex justify-center">
          <i className="ki-duotone ki-minus text-gray-300">
            <span className="path1"></span>
            <span className="path2"></span>
          </i>
        </div>
      )
    }

    if (contribution.payed) {
      return (
        <div className="flex justify-center">
          <i className="ki-duotone ki-check-circle text-green-600">
            <span className="path1"></span>
            <span className="path2"></span>
          </i>
        </div>
      )
    }

    return (
      <div className="flex justify-center">
        <i className="ki-duotone ki-cross-circle text-yellow-500">
          <span className="path1"></span>
          <span className="path2"></span>
        </i>
      </div>
    )
  }

  if (!contributions || contributions.length === 0) {
    return (
      <div>
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-base font-medium text-gray-900">{title}</h3>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-sm bg-gradient-to-r from-emerald-600 to-emerald-500 text-white">
              0
            </span>
          </div>
          <div className="h-0.5 bg-gradient-to-r from-teal-500 via-emerald-500 to-transparent w-16"></div>
        </div>
        <div className="text-center py-8">
          <i className="ki-duotone ki-document text-4xl text-gray-300 mb-3">
            <span className="path1"></span>
            <span className="path2"></span>
          </i>
          <p className="text-sm font-medium text-gray-500">{emptyMessage}</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-base font-medium text-gray-900">{title}</h3>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-sm bg-gradient-to-r from-emerald-600 to-emerald-500 text-white">
            {contributions.length}
          </span>
        </div>
        <div className="h-0.5 bg-gradient-to-r from-teal-500 via-emerald-500 to-transparent w-16"></div>
      </div>

      <div className="bg-white/25 backdrop-blur-lg rounded-xl border border-gray-100/30 p-5 shadow-sm">
        {years.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border border-gray-200/30 p-3 bg-gradient-to-r from-teal-50/30 to-emerald-50/20 backdrop-blur-lg text-left text-xs font-semibold text-gray-700 uppercase">Ano</th>
                    {getMonthsList().map((month, index) => (
                      <th key={index} className="border border-gray-200/30 p-3 bg-gradient-to-r from-teal-50/30 to-emerald-50/20 backdrop-blur-lg text-center text-xs font-semibold text-gray-700 uppercase">
                        {month.substring(0, 3)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {years.map((year) => (
                    <tr key={year} className="hover:bg-teal-50/50 transition-colors duration-150">
                      <td className="border border-gray-200/30 p-3 font-semibold text-gray-800 bg-white/20">{year}</td>
                      {Array.from({ length: 12 }).map((_, monthIndex) => (
                        <td key={`${year}-${monthIndex}`} className="border border-gray-200/30 p-3 bg-white/10">
                          {renderStatusIcon(year, monthIndex)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200/30">
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2 bg-white/25 backdrop-blur-lg rounded-lg px-3 py-2 border border-gray-200/30">
                  <i className="ki-duotone ki-check-circle text-emerald-600">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                  <span className="text-xs font-semibold text-gray-700">En termino</span>
                </div>
                <div className="flex items-center gap-2 bg-white/25 backdrop-blur-lg rounded-lg px-3 py-2 border border-gray-200/30">
                  <i className="ki-duotone ki-cross-circle text-yellow-500">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                  <span className="text-xs font-semibold text-gray-700">Fuera de termino</span>
                </div>
                <div className="flex items-center gap-2 bg-white/25 backdrop-blur-lg rounded-lg px-3 py-2 border border-gray-200/30">
                  <i className="ki-duotone ki-minus text-gray-400">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                  <span className="text-xs font-semibold text-gray-700">No registra</span>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm font-bold text-gray-800">
                  {totalLabel}: {contributions.length}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <i className="ki-duotone ki-document text-4xl text-gray-300 mb-2">
              <span className="path1"></span>
              <span className="path2"></span>
            </i>
            <p className="text-sm text-gray-500">{emptyMessage}</p>
          </div>
        )}
      </div>
    </div>
  )
}
