'use client'

import React, { useState } from 'react'
import { ICorporateRelation } from '@/lib/types/report.types'
import { formatDate } from '@/lib/utils/dateUtils'

interface CompanyCorporateRelationsSectionProps {
  relations: ICorporateRelation[]
  companyName?: string
}

export default function CompanyCorporateRelationsSection({ relations, companyName = 'Empresa' }: CompanyCorporateRelationsSectionProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const getPositionBadgeColor = (position: string) => {
    const colorMap: Record<string, { bg: string; text: string; border: string }> = {
      'Director': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
      'Presidente': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
      'Vicepresidente': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
      'Socio': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
      'Sociedad Vinculada': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
      'Gerente': { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
      'Administrador': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
      'Sindico': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
      'Apoderado': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' }
    }
    return colorMap[position] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' }
  }

  const formatTaxId = (taxId: string) => {
    if (!taxId || taxId.length !== 11) return taxId
    return `${taxId.slice(0, 2)}-${taxId.slice(2, 10)}-${taxId.slice(10)}`
  }

  const getTimeSinceDesignation = (timestamp: number) => {
    const now = Date.now()
    const diffMs = now - timestamp
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffMonths = Math.floor(diffDays / 30)
    const diffYears = Math.floor(diffDays / 365)

    if (diffYears > 0) {
      return `${diffYears} ${diffYears === 1 ? 'ano' : 'anos'}`
    } else if (diffMonths > 0) {
      return `${diffMonths} ${diffMonths === 1 ? 'mes' : 'meses'}`
    } else if (diffDays > 0) {
      return `${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}`
    } else {
      return 'Hoy'
    }
  }

  const isCompanyRelation = (positions: { position: string, date: number }[]) => {
    return positions.some(pos => pos.position === 'Sociedad Vinculada' || pos.position === 'Socio')
  }

  if (!relations || relations.length === 0) {
    return (
      <div className="text-center py-8">
        <i className="ki-duotone ki-people text-4xl text-gray-300 mb-3">
          <span className="path1"></span>
          <span className="path2"></span>
          <span className="path3"></span>
        </i>
        <p className="text-sm font-medium text-gray-500">No se encontraron personas registradas en la nomina empresarial</p>
      </div>
    )
  }

  // Ordenar por fecha de designacion mas reciente
  const sortedRelations = [...relations].sort((a, b) => {
    const aMaxDate = Array.isArray(a.positions) ? Math.max(...a.positions.map(p => p.date)) : 0
    const bMaxDate = Array.isArray(b.positions) ? Math.max(...b.positions.map(p => p.date)) : 0
    return bMaxDate - aMaxDate
  })

  // Filtrar por busqueda
  const filteredRelations = sortedRelations.filter((relation) => {
    if (!searchQuery.trim()) return true

    const query = searchQuery.toLowerCase().trim()
    const name = relation.name.toLowerCase()
    const taxId = relation.taxId.replace(/-/g, '')
    const formattedTaxId = formatTaxId(relation.taxId).toLowerCase()

    return name.includes(query) || taxId.includes(query) || formattedTaxId.includes(query)
  })

  return (
    <div>
      {/* Buscador */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i className="ki-duotone ki-magnifier text-gray-400">
              <span className="path1"></span>
              <span className="path2"></span>
            </i>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre o CUIT..."
            className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/60 transition-all placeholder:text-gray-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              title="Limpiar busqueda"
            >
              <i className="ki-duotone ki-cross text-lg">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
            </button>
          )}
        </div>
      </div>

      {/* Contador de resultados */}
      {searchQuery && (
        <div className="mb-4 text-sm text-gray-600">
          {filteredRelations.length === 0 ? (
            <span className="text-gray-500">No se encontraron resultados para &quot;{searchQuery}&quot;</span>
          ) : (
            <span>
              Mostrando <span className="font-semibold text-gray-900">{filteredRelations.length}</span> de {sortedRelations.length} relaciones
            </span>
          )}
        </div>
      )}

      {/* Lista de relaciones */}
      <div className="space-y-3">
        {filteredRelations.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
            <i className="ki-duotone ki-magnifier text-4xl text-gray-300 mb-3">
              <span className="path1"></span>
              <span className="path2"></span>
            </i>
            <p className="text-sm font-medium text-gray-500">No se encontraron relaciones</p>
            {searchQuery && (
              <p className="text-xs text-gray-400 mt-1">Intenta con otros terminos de busqueda</p>
            )}
          </div>
        ) : (
          filteredRelations.map((relation, idx) => {
            const isCompany = isCompanyRelation(relation.positions)
            const mostRecentDate = Math.max(...relation.positions.map(p => p.date))

            return (
              <div
                key={idx}
                className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-start gap-3.5 mb-3.5">
                    {/* Icono */}
                    <div className={`w-11 h-11 rounded-lg flex items-center justify-center shadow-sm border border-gray-200 ${
                      isCompany ? 'bg-orange-50' : 'bg-blue-50'
                    }`}>
                      {isCompany ? (
                        <i className="ki-duotone ki-office-bag text-xl text-orange-600">
                          <span className="path1"></span>
                          <span className="path2"></span>
                          <span className="path3"></span>
                          <span className="path4"></span>
                        </i>
                      ) : (
                        <i className="ki-duotone ki-profile-circle text-xl text-blue-600">
                          <span className="path1"></span>
                          <span className="path2"></span>
                          <span className="path3"></span>
                        </i>
                      )}
                    </div>

                    {/* Nombre y badge */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h4 className="font-semibold text-gray-900 text-base truncate">
                          {relation.name}
                        </h4>
                        {relation.positions.length > 1 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                            {relation.positions.length} cargos
                          </span>
                        )}
                      </div>

                      {/* CUIL/CUIT */}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="text-xs font-medium">
                          {isCompany ? 'CUIT' : 'CUIL'}:
                        </span>
                        <span className="font-mono font-medium text-gray-900">
                          {formatTaxId(relation.taxId)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Posiciones */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                      {relation.positions.map((pos, posIdx) => {
                        const colors = getPositionBadgeColor(pos.position)
                        const timeSince = getTimeSinceDesignation(pos.date)
                        return (
                          <span
                            key={posIdx}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium ${colors.bg} ${colors.text} border ${colors.border} rounded-lg`}
                            title={`${pos.position} - Desde ${formatDate(pos.date)} (hace ${timeSince})`}
                          >
                            <i className="ki-duotone ki-briefcase text-xs">
                              <span className="path1"></span>
                              <span className="path2"></span>
                            </i>
                            {pos.position}
                            <span className="text-[10px] opacity-60">
                              {formatDate(pos.date)}
                            </span>
                          </span>
                        )
                      })}
                    </div>

                    {/* Tiempo transcurrido */}
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <i className="ki-duotone ki-calendar text-xs">
                        <span className="path1"></span>
                        <span className="path2"></span>
                      </i>
                      <span>Vinculado hace {getTimeSinceDesignation(mostRecentDate)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
