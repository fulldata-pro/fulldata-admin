'use client'

import React from 'react'
import { ReportResponse, PhoneData } from '@/lib/types/report.types'

interface OwnerData {
  taxId: number | string
  name: string
  personType: 'PERSON' | 'COMPANY'
}

interface PhoneReportViewProps {
  reportData: ReportResponse
  phoneData: PhoneData
}

function OwnerCard({ owner, index, isLatest, totalOwners }: {
  owner: OwnerData
  index: number
  isLatest: boolean
  totalOwners: number
}) {
  const isCompany = owner.personType === 'COMPANY'
  const isLast = index === totalOwners - 1

  return (
    <div className="relative">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-4 top-12 w-px h-4 bg-gray-200"></div>
      )}

      <div className={`bg-white/95 backdrop-blur-sm border rounded-xl p-5 hover:border-gray-300/60 hover:shadow-lg transition-all duration-300 shadow-sm shadow-slate-900/5 ${
        isLatest ? 'border-rose-300/50' : 'border-gray-200/50'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            {/* Timeline indicator */}
            <div className={`w-2 h-2 rounded-full flex-shrink-0 shadow-sm ${
              isLatest ? 'bg-rose-500' : 'bg-gray-300'
            }`}></div>

            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-50/50 to-gray-100/50 border border-gray-200/30 flex items-center justify-center shadow-sm">
              <i className={`ki-duotone ${isCompany ? 'ki-abstract-34' : 'ki-user'} text-lg text-gray-600`}>
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-3">
                  <h3 className={`font-medium truncate ${
                    isLatest ? 'text-gray-900' : 'text-gray-600'
                  }`}>
                    {owner.name}
                  </h3>
                  {isLatest && (
                    <span className="text-xs text-gray-500">
                      Actual
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3 text-sm">
                <span className="text-gray-500 font-mono">{owner.taxId}</span>
                <span className="px-2 py-0.5 text-xs rounded-md bg-gradient-to-br from-slate-50/50 to-gray-100/50 border border-gray-200/30 text-gray-700">
                  {isCompany ? 'Empresa' : 'Persona'}
                </span>
                <span className="text-xs text-gray-400">
                  #{index + 1}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-16 text-center shadow-lg shadow-slate-900/5">
      <div className="w-20 h-20 bg-gradient-to-br from-slate-50/50 to-gray-100/50 border border-gray-200/30 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
        <i className="ki-duotone ki-information text-xl text-gray-400">
          <span className="path1"></span>
          <span className="path2"></span>
          <span className="path3"></span>
        </i>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">Sin registros encontrados</h3>
      <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
        No se encontraron propietarios registrados para este numero de telefono.
      </p>
    </div>
  )
}

export default function PhoneReportView({ reportData, phoneData }: PhoneReportViewProps) {
  if (!phoneData) return null

  const owners: OwnerData[] = phoneData.owners || []
  const totalOwners = owners.length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {owners.length > 0 ? (
          <div className="space-y-6">
            {/* Enhanced header section */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-gray-200/50 hover:border-gray-300/60 hover:shadow-xl p-8 shadow-lg shadow-slate-900/5 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-50/50 to-gray-100/50 border border-gray-200/30 rounded-xl flex items-center justify-center shadow-sm">
                    <i className="ki-duotone ki-time text-xl text-gray-600">
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      Historial de Propietarios
                    </h2>
                    <div className="h-0.5 bg-gradient-to-r from-rose-500 via-rose-400 to-transparent w-24"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">{totalOwners}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                    {totalOwners === 1 ? 'Propietario' : 'Cambios'}
                  </div>
                </div>
              </div>

              {/* Timeline legend */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-100/50">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-rose-500 rounded-full shadow-sm"></div>
                    <span className="text-sm text-gray-700 font-medium">Propietario actual</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                    <span className="text-sm text-gray-700 font-medium">Historico</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <i className="ki-duotone ki-arrow-down text-base">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                  <span>Mas reciente a mas antiguo</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {owners.map((owner: OwnerData, index: number) => (
                <OwnerCard
                  key={`${owner.taxId}-${index}`}
                  owner={owner}
                  index={index}
                  isLatest={index === 0}
                  totalOwners={totalOwners}
                />
              ))}
            </div>
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  )
}
