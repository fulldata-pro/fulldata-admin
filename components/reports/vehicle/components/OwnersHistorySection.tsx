'use client'

import React from 'react'

enum ePersonType {
  PERSON = 'PERSON',
  COMPANY = 'COMPANY'
}

interface HistoricalOwner {
  taxId: string
  fullName: string
  type: ePersonType
}

interface OwnersHistorySectionProps {
  ownersHistoryData: HistoricalOwner[]
}

export default function OwnersHistorySection({ ownersHistoryData }: OwnersHistorySectionProps) {
  if (!ownersHistoryData || ownersHistoryData.length === 0) return null

  return (
    <div className="space-y-6">
      <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
        <div className="mb-6">
          <h2 className="text-2xl font-medium text-gray-900 mb-2">
            Historial de Propietarios
          </h2>
          <div className="h-0.5 bg-gradient-to-r from-amber-500 via-amber-400 to-transparent w-24"></div>
        </div>
        <span className="text-xs font-semibold text-gray-700 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
          {ownersHistoryData.length} propietario{ownersHistoryData.length !== 1 ? 's anteriores' : ' anterior'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ownersHistoryData.map((owner: HistoricalOwner, index: number) => (
          <div
            key={index}
            className="bg-white/95 backdrop-blur-sm rounded-xl border border-amber-200/60 hover:border-amber-300/80 hover:shadow-lg shadow-md shadow-amber-900/5 transition-all duration-300 overflow-hidden"
          >
            <div className="p-5 bg-gradient-to-r from-amber-50/50 via-amber-50/30 to-orange-50/20">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-amber-500 to-amber-600 border border-amber-400/20 flex-shrink-0 shadow-sm">
                  <i className={`ki-duotone text-lg text-white ${
                    owner.type === ePersonType.PERSON ? 'ki-profile-user' : 'ki-office-bag'
                  }`}>
                    <span className="path1"></span>
                    <span className="path2"></span>
                    {owner.type === ePersonType.PERSON && (
                      <>
                        <span className="path3"></span>
                        <span className="path4"></span>
                      </>
                    )}
                  </i>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="mb-2">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-gradient-to-r from-amber-100 to-amber-50 text-amber-700 rounded-full text-xs font-semibold border border-amber-200/50">
                      <i className="ki-duotone ki-time text-sm">
                        <span className="path1"></span>
                        <span className="path2"></span>
                      </i>
                      Anterior
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-1 line-clamp-2">
                    {owner.fullName}
                  </h3>
                  <p className="text-sm text-slate-600 mb-3">
                    {owner.type === ePersonType.PERSON ? 'Persona Fisica' : 'Persona Juridica'}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-slate-600 mb-3 pb-3 border-b border-amber-100">
                    <span className="font-mono bg-amber-50/50 px-2 py-1 rounded border border-amber-100">
                      {owner.type === ePersonType.PERSON ? 'CUIL/CUIT' : 'CUIT'}: {owner.taxId}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
