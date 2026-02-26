'use client'

import React from 'react'
import { formatDate } from '@/lib/utils/dateUtils'

interface NicDomains {
  domain: string
  status?: string
}

interface ReportingEntity {
  status?: string
  creationDate?: number | { $numberLong: string }
  enabled?: boolean
  entityType?: string
}

interface AdditionalDataSectionProps {
  nicDomains?: NicDomains[]
  isDuplicated?: boolean
  duplicatedList?: any[]
  isBanked?: boolean
  reportingEntity?: ReportingEntity
}

export default function AdditionalDataSection({
  nicDomains,
  isDuplicated,
  duplicatedList,
  isBanked,
  reportingEntity
}: AdditionalDataSectionProps) {

  const formatCreationDate = (creationDate: number | { $numberLong: string } | undefined) => {
    if (!creationDate) return 'Sin informacion'
    return formatDate(creationDate)
  }

  return (
    <div className="space-y-12">
      {/* Informacion Adicional */}
      <div>
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-base font-medium text-gray-900">Informacion Adicional</h3>
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
              Estado
            </span>
          </div>
          <div className="h-0.5 bg-gradient-to-r from-rose-500 via-rose-400 to-transparent w-16"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-emerald-50/30 to-teal-50/20 backdrop-blur-lg border border-emerald-100/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-800 text-base">Bancarizado</h4>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                isBanked
                  ? 'text-green-700 bg-green-50'
                  : 'text-red-600 bg-red-50'
              }`}>
                {isBanked ? 'Si' : 'No'}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              {isBanked ? (
                <i className="ki-duotone ki-check-circle text-green-600">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
              ) : (
                <i className="ki-duotone ki-cross-circle text-red-500">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
              )}
              <span className="text-gray-600 text-sm">
                {isBanked ? 'Persona bancarizada' : 'Sin informacion bancaria'}
              </span>
            </div>
          </div>

          {isDuplicated !== undefined && (
            <div className="bg-gradient-to-br from-yellow-50/30 to-amber-50/20 backdrop-blur-lg border border-yellow-100/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-800 text-base">Registro Duplicado</h4>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  isDuplicated
                    ? 'text-yellow-700 bg-yellow-50'
                    : 'text-green-700 bg-green-50'
                }`}>
                  {isDuplicated ? 'Si' : 'No'}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                {isDuplicated ? (
                  <i className="ki-duotone ki-information-2 text-yellow-600">
                    <span className="path1"></span>
                    <span className="path2"></span>
                    <span className="path3"></span>
                  </i>
                ) : (
                  <i className="ki-duotone ki-check-circle text-green-600">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                )}
                <span className="text-gray-600 text-sm">
                  {isDuplicated ? 'Registro duplicado detectado' : 'Registro unico'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dominios NIC */}
      {nicDomains && nicDomains.length > 0 && (
        <div>
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-base font-medium text-gray-900">Dominios Web</h3>
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
                {nicDomains.length}
              </span>
            </div>
            <div className="h-0.5 bg-gradient-to-r from-teal-500 via-teal-400 to-transparent w-16"></div>
          </div>

          <div className="space-y-4">
            {nicDomains.map((domain, idx) => (
              <div key={idx} className="bg-gradient-to-br from-cyan-50/30 to-teal-50/20 backdrop-blur-lg border border-cyan-100/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full bg-blue-500 opacity-70 mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <i className="ki-duotone ki-globe text-blue-600">
                          <span className="path1"></span>
                          <span className="path2"></span>
                        </i>
                        <a
                          href={`https://${domain.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium hover:underline flex items-center gap-1 group"
                        >
                          {domain.domain}
                          <i className="ki-duotone ki-exit-right-corner text-xs opacity-70 group-hover:opacity-100">
                            <span className="path1"></span>
                            <span className="path2"></span>
                          </i>
                        </a>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        domain.status === 'VERIFIED'
                          ? 'text-green-700 bg-green-50'
                          : 'text-gray-600 bg-gray-50'
                      }`}>
                        {domain.status === 'VERIFIED' ? 'Verificado' : 'No Verificado'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de Duplicados */}
      {duplicatedList && duplicatedList.length > 0 && (
        <div>
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-base font-medium text-gray-900">Registros Duplicados</h3>
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
                {duplicatedList.length}
              </span>
            </div>
            <div className="h-0.5 bg-gradient-to-r from-amber-500 via-amber-400 to-transparent w-16"></div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50/30 to-orange-50/20 backdrop-blur-lg border border-yellow-100/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 rounded-full bg-yellow-500 opacity-70 mt-2 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <i className="ki-duotone ki-copy text-yellow-600">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                  <span className="font-medium text-gray-800 text-sm">
                    Se encontraron {duplicatedList.length} registros duplicados
                  </span>
                </div>

                <div className="space-y-3">
                  {duplicatedList.map((duplicate, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                      <div className="text-xs font-medium text-gray-600 mb-2">
                        Registro {idx + 1}
                      </div>
                      <pre className="text-xs text-gray-700 overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(duplicate, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Entidad de Reporte AML */}
      {reportingEntity && (
        <div>
          <div className="mb-6">
            <h3 className="text-base font-medium text-gray-900 mb-2">Entidad de Reporte AML</h3>
            <div className="h-0.5 bg-gradient-to-r from-purple-500 via-purple-400 to-transparent w-16"></div>
          </div>

          <div className="bg-gradient-to-br from-purple-50/30 to-pink-50/20 backdrop-blur-lg border border-purple-100/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 rounded-full bg-purple-500 opacity-70 mt-2 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <i className="ki-duotone ki-shield-tick text-purple-600">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                  <span className="font-medium text-gray-800 text-sm">
                    Informacion de Prevencion de Lavado de Dinero
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <span className="text-gray-500 text-xs font-medium block mb-1">Estado</span>
                    <span className="text-gray-800 font-medium text-sm">
                      {reportingEntity.status || 'Sin informacion'}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-500 text-xs font-medium block mb-1">Fecha de Registro</span>
                    <span className="text-gray-800 font-medium text-sm">
                      {formatCreationDate(reportingEntity.creationDate)}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-500 text-xs font-medium block mb-1">Habilitado</span>
                    <span className="text-gray-800 font-medium text-sm">
                      {reportingEntity.enabled === true ? 'Si' :
                       reportingEntity.enabled === false ? 'No' : 'Sin informacion'}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-500 text-xs font-medium block mb-1">Tipo de Entidad</span>
                    <span className="text-gray-800 font-medium text-sm">
                      {reportingEntity.entityType || 'Sin informacion'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-xs text-purple-700">
                    <strong>Informacion AML:</strong> Datos sobre si la persona es una entidad obligada a reportar operaciones sospechosas para prevenir lavado de dinero segun normativas FATF/GAFI.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
