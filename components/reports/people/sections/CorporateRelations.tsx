'use client'

import React from 'react'
import { formatDate } from '@/lib/utils/dateUtils'

interface CorporateRelation {
  companyName: string
  companyTaxId: string
  position: string
  startDate?: number | { $numberLong: string }
  endDate?: number | { $numberLong: string } | null
  active: boolean
}

interface CorporateRelationsProps {
  corporateRelations: CorporateRelation[]
}

export default function CorporateRelationsSection({ corporateRelations }: CorporateRelationsProps) {
  const hasRelations = corporateRelations && corporateRelations.length > 0

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-base font-medium text-gray-900">Relaciones Empresariales</h3>
          {hasRelations && (
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
              {corporateRelations.length}
            </span>
          )}
        </div>
        <div className="h-0.5 bg-gradient-to-r from-indigo-500 via-indigo-400 to-transparent w-16"></div>
      </div>

      {!hasRelations ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <i className="ki-duotone ki-shop text-3xl text-gray-400">
                <span className="path1"></span>
                <span className="path2"></span>
                <span className="path3"></span>
                <span className="path4"></span>
                <span className="path5"></span>
              </i>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Sin relaciones empresariales registradas</p>
              <p className="text-xs text-gray-500">No se encontraron vinculos con empresas o cargos directivos</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {corporateRelations.map((relation, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-indigo-50/30 to-indigo-50/20 backdrop-blur-lg border border-indigo-100/30 rounded-xl p-6 shadow-sm hover:shadow-md transition-all"
              >
                {/* Header con empresa y estado */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <i className="ki-duotone ki-shop text-xl text-purple-600">
                        <span className="path1"></span>
                        <span className="path2"></span>
                        <span className="path3"></span>
                        <span className="path4"></span>
                        <span className="path5"></span>
                      </i>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-1 break-words">
                        {relation.companyName}
                      </h4>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-gray-600">CUIT: {relation.companyTaxId}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${relation.active
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-gray-50 text-gray-600 border border-gray-200'
                      }`}>
                      {relation.active ? 'Vigente' : 'Inactivo'}
                    </span>
                  </div>
                </div>

                {/* Informacion del cargo */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <i className="ki-duotone ki-profile-user text-gray-400">
                      <span className="path1"></span>
                      <span className="path2"></span>
                      <span className="path3"></span>
                      <span className="path4"></span>
                    </i>
                    <div>
                      <div className="text-xs text-gray-500 uppercase">Cargo</div>
                      <div className="text-sm font-medium text-gray-900">{relation.position}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <i className="ki-duotone ki-calendar text-gray-400">
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                    <div>
                      <div className="text-xs text-gray-500 uppercase">Fecha de Inicio</div>
                      <div className="text-sm font-medium text-gray-900">{formatDate(relation.startDate)}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <i className="ki-duotone ki-calendar text-gray-400">
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                    <div>
                      <div className="text-xs text-gray-500 uppercase">Fecha de Fin</div>
                      <div className="text-sm font-medium text-gray-900">
                        {relation.endDate ? formatDate(relation.endDate) : 'Vigente'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Informacion adicional */}
          <div className="mt-6 p-4 bg-gradient-to-br from-purple-50/30 to-purple-50/20 backdrop-blur-lg border border-purple-100/30 rounded-xl shadow-sm">
            <div className="text-sm text-purple-800">
              <div className="font-semibold mb-2">Informacion sobre relaciones empresariales:</div>
              <ul className="space-y-1 text-xs">
                <li>Las relaciones vigentes indican participacion activa en empresas</li>
                <li>Los cargos directivos pueden implicar responsabilidades legales</li>
                <li>Multiples participaciones pueden indicar experiencia empresarial</li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
