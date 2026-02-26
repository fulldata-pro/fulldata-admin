'use client'

import React from 'react'
import MonthlyContributionsTable from '@/components/reports/shared/MonthlyContributionsTable'
import InfoTooltip from '@/components/reports/shared/InfoTooltip'
import { formatDate } from '@/lib/utils/dateUtils'

interface TaxSectionProps {
  taxData: any
}

export default function TaxSection({ taxData }: TaxSectionProps) {
  const getTotalInscriptions = () => {
    let count = 0
    if (taxData.monotribute) count++
    if (taxData.gciaInscription) count++
    if (taxData.ivaInscription) count++
    return count
  }

  const getMonthName = (monthStr: string) => {
    const months: Record<string, string> = {
      '1': 'Enero', '2': 'Febrero', '3': 'Marzo', '4': 'Abril',
      '5': 'Mayo', '6': 'Junio', '7': 'Julio', '8': 'Agosto',
      '9': 'Septiembre', '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre'
    }
    return months[monthStr] || monthStr
  }

  const formatBooleanField = (value: boolean | null | undefined) => {
    if (value === true) return 'Si'
    if (value === false) return 'No'
    return 'Sin informacion'
  }

  return (
    <div className="space-y-12">
      {/* Inscripciones Tributarias */}
      <div>
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-base font-medium text-gray-900">Inscripciones Tributarias</h3>
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
              {getTotalInscriptions()}
            </span>
          </div>
          <div className="h-0.5 bg-gradient-to-r from-emerald-500 via-emerald-400 to-transparent w-16"></div>
        </div>

        <div className="space-y-6">
          {/* Monotributo */}
          {taxData.monotribute && (
            <div className="bg-gradient-to-br from-emerald-50/30 to-emerald-50/20 backdrop-blur-lg border border-emerald-100/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-800 text-base">Monotributo</h4>
                  <InfoTooltip content="Regimen simplificado para pequenos contribuyentes que unifica impuestos y aportes" />
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${taxData.monotribute.finishDate
                  ? 'text-red-600 bg-red-50'
                  : 'text-green-700 bg-green-50'
                  }`}>
                  {taxData.monotribute.finishDate ? 'Inactivo' : 'Activo'}
                </span>
              </div>

              {/* Información básica del monotributo */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                    Categoria {taxData.monotribute.category}
                  </span>
                  {taxData.monotribute.type && (
                    <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs font-medium">
                      {taxData.monotribute.type}
                    </span>
                  )}
                </div>
              </div>

              {/* Fechas y códigos del monotributo */}
              <div className="border-t border-gray-100 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-gray-500 text-xs font-medium block mb-1">Fecha Inicio</span>
                    <span className="text-gray-800 font-medium text-sm">
                      {formatDate(taxData.monotribute.startDate || 0)}
                    </span>
                  </div>

                  {taxData.monotribute.finishDate && (
                    <div>
                      <span className="text-gray-500 text-xs font-medium block mb-1">Fecha Fin</span>
                      <span className="text-gray-800 font-medium text-sm">
                        {formatDate(taxData.monotribute.finishDate)}
                      </span>
                    </div>
                  )}

                  {taxData.monotribute.code && (
                    <div>
                      <span className="text-gray-500 text-xs font-medium block mb-1">Codigo</span>
                      <span className="text-gray-800 font-medium text-sm font-mono">
                        {taxData.monotribute.code}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Ganancias */}
          <div className="bg-gradient-to-br from-purple-50/30 to-purple-50/20 backdrop-blur-lg border border-purple-100/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-gray-800 text-base">Impuesto a las Ganancias</h4>
                <InfoTooltip content="Impuesto que grava las ganancias obtenidas por personas fisicas y juridicas" />
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${taxData.gciaInscription
                ? 'text-green-700 bg-green-50'
                : 'text-gray-500 bg-gray-50'
                }`}>
                {taxData.gciaInscription ? 'Inscrito' : 'No Inscrito'}
              </span>
            </div>

            {taxData.gciaInscription && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {taxData.gciaInscriptionCondition && (
                  <div>
                    <span className="text-gray-500 text-xs font-medium block mb-1">Condicion</span>
                    <span className="text-gray-800 font-medium text-sm">
                      {taxData.gciaInscriptionCondition}
                    </span>
                  </div>
                )}

                <div>
                  <span className="text-gray-500 text-xs font-medium block mb-1">Fecha Inscripcion</span>
                  <span className="text-gray-800 font-medium text-sm">
                    {formatDate(taxData.gciaInscriptionDate || 0)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* IVA */}
          <div className="bg-gradient-to-br from-blue-50/30 to-blue-50/20 backdrop-blur-lg border border-blue-100/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-gray-800 text-base">IVA</h4>
                <InfoTooltip content="Impuesto al Valor Agregado - Impuesto que grava el consumo de bienes y servicios" />
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${taxData.ivaInscription
                ? 'text-green-700 bg-green-50'
                : 'text-gray-500 bg-gray-50'
                }`}>
                {taxData.ivaInscription ? 'Inscrito' : 'No Inscrito'}
              </span>
            </div>

            {taxData.ivaInscription && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {taxData.ivaInscriptionCondition && (
                  <div>
                    <span className="text-gray-500 text-xs font-medium block mb-1">Condicion</span>
                    <span className="text-gray-800 font-medium text-sm">
                      {taxData.ivaInscriptionCondition}
                    </span>
                  </div>
                )}

                <div>
                  <span className="text-gray-500 text-xs font-medium block mb-1">Fecha Inscripcion</span>
                  <span className="text-gray-800 font-medium text-sm">
                    {formatDate(taxData.ivaInscriptionDate || 0)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trabajo Autónomo */}
      {(taxData.autonomous !== undefined || taxData.autonomousDate || taxData.autonomousAct) && (
        <div>
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-base font-medium text-gray-900">Trabajo Autonomo</h3>
              <InfoTooltip content="Regimen de aportes previsionales para trabajadores independientes" />
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
                {taxData.autonomous || '0'}
              </span>
            </div>
            <div className="h-0.5 bg-gradient-to-r from-purple-500 via-purple-400 to-transparent w-16"></div>
          </div>

          <div className="bg-gradient-to-br from-orange-50/30 to-orange-50/20 backdrop-blur-lg border border-orange-100/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-gray-500 text-xs font-medium block mb-1">Valor</span>
                <span className="text-gray-800 font-medium text-sm">
                  {taxData.autonomous || '0'}
                </span>
              </div>

              {taxData.autonomousDate && (
                <div>
                  <span className="text-gray-500 text-xs font-medium block mb-1">Fecha</span>
                  <span className="text-gray-800 font-medium text-sm">
                    {formatDate(taxData.autonomousDate)}
                  </span>
                </div>
              )}

              {taxData.autonomousAct && (
                <div>
                  <span className="text-gray-500 text-xs font-medium block mb-1">Acta</span>
                  <span className="text-gray-800 font-medium text-sm font-mono">
                    {taxData.autonomousAct}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Detalles Autoridad Fiscal */}
      {taxData.taxAuthorityDetails && (
        <div>
          <div className="mb-6">
            <h3 className="text-base font-medium text-gray-900 mb-2">Detalles Autoridad Fiscal</h3>
            <div className="h-0.5 bg-gradient-to-r from-orange-500 via-orange-400 to-transparent w-16"></div>
          </div>

          <div className="bg-gradient-to-br from-amber-50/30 to-amber-50/20 backdrop-blur-lg border border-amber-100/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {taxData.taxAuthorityDetails.agencyCode && (
                <div>
                  <span className="text-gray-500 text-xs font-medium block mb-1">Codigo de Agencia</span>
                  <span className="text-gray-800 font-medium text-sm">
                    {taxData.taxAuthorityDetails.agencyCode}
                  </span>
                </div>
              )}

              {taxData.taxAuthorityDetails.fiscalYearEndMonth && (
                <div>
                  <span className="text-gray-500 text-xs font-medium block mb-1">Mes de Cierre Ejercicio Fiscal</span>
                  <span className="text-gray-800 font-medium text-sm">
                    {getMonthName(taxData.taxAuthorityDetails.fiscalYearEndMonth)}
                  </span>
                </div>
              )}

              <div>
                <span className="text-gray-500 text-xs font-medium block mb-1">Exento de Retencion de Ingresos</span>
                <span className="text-gray-800 font-medium text-sm">
                  {formatBooleanField(taxData.taxAuthorityDetails.incomeWithholdingExempt)}
                </span>
              </div>

              <div>
                <span className="text-gray-500 text-xs font-medium block mb-1">Exento de Retencion de IVA</span>
                <span className="text-gray-800 font-medium text-sm">
                  {formatBooleanField(taxData.taxAuthorityDetails.vatWithholdingExempt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contribuciones Monotributo */}
      {taxData.contributions && taxData.contributions.length > 0 && (
        <MonthlyContributionsTable
          contributions={taxData.contributions}
          title="Contribuciones Monotributo"
          emptyMessage="No hay contribuciones registradas"
          totalLabel="Total de contribuciones"
        />
      )}
    </div>
  )
}
