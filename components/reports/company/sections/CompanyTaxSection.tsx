'use client'

import React from 'react'
import { CompanyTaxData } from '@/lib/types/report.types'
import { formatDate } from '@/lib/utils/dateUtils'
import InfoTooltip from '@/components/reports/shared/InfoTooltip'

interface CompanyTaxSectionProps {
  taxData: CompanyTaxData | null
}

export default function CompanyTaxSection({ taxData }: CompanyTaxSectionProps) {
  if (!taxData) {
    return (
      <div className="text-center py-8">
        <i className="ki-duotone ki-document text-4xl text-gray-300 mb-3">
          <span className="path1"></span>
          <span className="path2"></span>
        </i>
        <p className="text-sm font-medium text-gray-500">No hay informacion tributaria disponible</p>
      </div>
    )
  }

  const getTotalInscriptions = () => {
    let count = 0
    if (taxData.taxRegistrationDate) count++
    if (taxData.incomeTax === 'Activo') count++
    return count
  }

  return (
    <div className="space-y-8">
      {/* Inscripciones Tributarias */}
      <div>
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-medium text-gray-900">Inscripciones Tributarias</h3>
              <InfoTooltip content="Registros oficiales de la empresa en organismos tributarios" />
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-600 text-white">
              {getTotalInscriptions()}
            </span>
          </div>
          <div className="h-0.5 bg-gradient-to-r from-amber-500 via-amber-400 to-transparent w-16"></div>
        </div>

        <div className="space-y-4">
          {/* AFIP */}
          <div className={`rounded-xl p-6 border ${
            taxData.taxRegistrationDate
              ? 'bg-emerald-50 border-emerald-100'
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${taxData.taxRegistrationDate ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
                <h4 className="font-semibold text-gray-900 text-base">AFIP</h4>
                <InfoTooltip content="Administracion Federal de Ingresos Publicos" />
              </div>
              <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                taxData.taxRegistrationDate
                  ? 'text-emerald-700 bg-emerald-100 border border-emerald-200'
                  : 'text-gray-600 bg-gray-100 border border-gray-200'
              }`}>
                {taxData.taxRegistrationDate ? 'Inscrito' : 'No Inscrito'}
              </span>
            </div>

            {taxData.taxRegistrationDate && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-emerald-100">
                <div>
                  <span className="text-emerald-700 text-xs font-semibold uppercase tracking-wide block mb-2">Fecha Inscripcion</span>
                  <span className="text-gray-900 font-semibold text-sm">
                    {formatDate(taxData.taxRegistrationDate)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Ganancias */}
          <div className={`rounded-xl p-6 border ${
            taxData.incomeTax === 'Activo'
              ? 'bg-blue-50 border-blue-100'
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${taxData.incomeTax === 'Activo' ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
                <h4 className="font-semibold text-gray-900 text-base">Impuesto a las Ganancias</h4>
                <InfoTooltip content="Impuesto que grava las ganancias obtenidas" />
              </div>
              <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                taxData.incomeTax === 'Activo'
                  ? 'text-blue-700 bg-blue-100 border border-blue-200'
                  : 'text-gray-600 bg-gray-100 border border-gray-200'
              }`}>
                {taxData.incomeTax === 'Activo' ? 'Inscrito' : 'No Inscrito'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 pt-4 border-t border-blue-100">
              <div>
                <span className="text-blue-700 text-xs font-semibold uppercase tracking-wide block mb-2">Fecha Inscripcion</span>
                <span className="text-gray-900 font-semibold text-sm">
                  {formatDate(taxData.incomeTaxRegistrationDate)}
                </span>
              </div>

              <div>
                <span className="text-blue-700 text-xs font-semibold uppercase tracking-wide block mb-2">Excluido</span>
                <div className="flex items-center gap-2">
                  {taxData.incomeTaxExcluded ? (
                    <>
                      <i className="ki-duotone ki-information text-amber-600"><span className="path1"></span><span className="path2"></span><span className="path3"></span></i>
                      <span className="text-amber-700 font-semibold text-sm">Si</span>
                    </>
                  ) : (
                    <>
                      <i className="ki-duotone ki-check-circle text-emerald-600"><span className="path1"></span><span className="path2"></span></i>
                      <span className="text-emerald-700 font-semibold text-sm">No</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Aportes Jubilatorios */}
      {taxData.retirementContributions24m && taxData.retirementContributions24m.length > 0 && (
        <div>
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-base font-medium text-gray-900">Aportes Patronales</h3>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-600 text-white">
                {taxData.retirementContributions24m.length} meses
              </span>
            </div>
            <div className="h-0.5 bg-gradient-to-r from-teal-500 via-teal-400 to-transparent w-16"></div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 overflow-x-auto">
            <div className="flex flex-wrap gap-2">
              {taxData.retirementContributions24m.map((contribution, index) => (
                <div
                  key={index}
                  className={`px-3 py-2 rounded-lg text-xs font-medium ${
                    contribution.payed
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      : 'bg-red-100 text-red-700 border border-red-200'
                  }`}
                >
                  {formatDate(contribution.period)}
                  <span className="ml-1">{contribution.payed ? '✓' : '✗'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Detalle de Impuestos */}
      {taxData.taxesDetail && taxData.taxesDetail.length > 0 && (
        <div>
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-base font-medium text-gray-900">Detalle de Impuestos</h3>
              <InfoTooltip content="Listado de impuestos especificos de la empresa" />
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-600 text-white">
                {taxData.taxesDetail.length}
              </span>
            </div>
            <div className="h-0.5 bg-gradient-to-r from-cyan-500 via-cyan-400 to-transparent w-16"></div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Impuesto
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Fecha de Alta
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[...taxData.taxesDetail]
                  .sort((a, b) => (b.registrationDate || 0) - (a.registrationDate || 0))
                  .map((tax, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                          {tax.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {formatDate(tax.registrationDate)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
