'use client'

import React from 'react'
import { CompanyFinancialSituationData } from '@/lib/types/report.types'
import { formatDate } from '@/lib/utils/dateUtils'
import { formatCurrency } from '@/lib/utils/currencyUtils'
import InfoTooltip from '@/components/reports/shared/InfoTooltip'

interface CompanyFinancialSectionProps {
  financialData: CompanyFinancialSituationData | null
}

const getSituationLabel = (situation: string | number) => {
  const code = typeof situation === 'string' ? parseInt(situation) : situation
  const labels: { [key: number]: string } = {
    1: 'Normal',
    2: 'Riesgo Bajo',
    3: 'Riesgo Medio',
    4: 'Riesgo Alto',
    5: 'Irrecuperable',
    6: 'Irrecuperable por Disposicion Tecnica'
  }
  return labels[code] || situation
}

const getSituationColor = (situation: string | number) => {
  const code = typeof situation === 'string' ? parseInt(situation) : situation
  if (code === 1) return 'text-green-600 bg-green-50'
  if (code <= 3) return 'text-yellow-600 bg-yellow-50'
  return 'text-red-600 bg-red-50'
}

export default function CompanyFinancialSection({ financialData }: CompanyFinancialSectionProps) {
  if (!financialData) {
    return (
      <div className="text-center py-8">
        <i className="ki-duotone ki-dollar text-4xl text-gray-300 mb-3">
          <span className="path1"></span>
          <span className="path2"></span>
          <span className="path3"></span>
        </i>
        <p className="text-sm font-medium text-gray-500">No hay informacion financiera disponible</p>
      </div>
    )
  }

  const getEstimatedBillingInfo = (level: string) => {
    const revenueRanges: { [key: string]: { min: number | null, max: number | null, average: number, label: string } } = {
      '1': { min: null, max: 110977106, average: 54366897, label: 'Nivel 1' },
      '2': { min: 110977106, max: 554885505, average: 330801764, label: 'Nivel 2' },
      '3': { min: 554885505, max: 2774427388, average: 1505676648, label: 'Nivel 3' },
      '4': { min: 2774427388, max: 13872136818, average: 6664894767, label: 'Nivel 4' },
      '5': { min: 13872136818, max: 69360683952, average: 30606188332, label: 'Nivel 5' },
      '6': { min: 69360683952, max: null, average: 30606188332, label: 'Nivel 6' },
    }
    return revenueRanges[level] || null
  }

  return (
    <div className="space-y-8">
      {/* Resumen Financiero */}
      <div>
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-base font-medium text-gray-900">Resumen Financiero</h3>
            <InfoTooltip content="Estado crediticio y bancario actual de la empresa" />
          </div>
          <div className="h-0.5 bg-gradient-to-r from-lime-500 via-lime-400 to-transparent w-16"></div>
        </div>

        {/* Facturacion Estimada */}
        {financialData.estimatedBilling && (() => {
          const revenueInfo = getEstimatedBillingInfo(financialData.estimatedBilling)
          return revenueInfo ? (
            <div className="mb-6 bg-slate-50 rounded-xl p-6 border border-slate-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center">
                  <i className="ki-duotone ki-dollar text-2xl text-white">
                    <span className="path1"></span>
                    <span className="path2"></span>
                    <span className="path3"></span>
                  </i>
                </div>
                <div>
                  <h4 className="text-slate-800 text-lg font-bold">Facturacion Estimada</h4>
                  <p className="text-slate-500 text-xs">Rango de facturacion anual segun actividad economica</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-5 border border-slate-200">
                  <div className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-2">Nivel de Facturacion</div>
                  <div className="text-slate-800 text-3xl font-bold">{revenueInfo.label}</div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-slate-200">
                  <div className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-2">Rango Anual</div>
                  <div className="text-slate-700 text-sm font-semibold space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-xs">Minimo:</span>
                      <span>{revenueInfo.min ? formatCurrency(revenueInfo.min, 'ARS') : 'Desde inicio'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-xs">Maximo:</span>
                      <span>{revenueInfo.max ? formatCurrency(revenueInfo.max, 'ARS') : 'Sin limite'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-slate-200">
                  <div className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-2">Facturacion Promedio</div>
                  <div className="text-slate-800 text-2xl font-bold">{formatCurrency(revenueInfo.average, 'ARS')}</div>
                  <div className="text-slate-400 text-xs mt-1">Estimacion anual</div>
                </div>
              </div>
            </div>
          ) : null
        })()}

        {/* Metricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-50 border border-red-100 rounded-xl p-5 text-center">
            <span className="text-red-700 text-xs font-semibold uppercase tracking-wide block mb-3">Peor Situacion</span>
            <span className="text-gray-900 font-bold text-2xl">{getSituationLabel(financialData.worstSituation) || 'N/A'}</span>
          </div>

          <div className="bg-purple-50 border border-purple-100 rounded-xl p-5 text-center">
            <span className="text-purple-700 text-xs font-semibold uppercase tracking-wide block mb-3">Aseguradora</span>
            <span className="text-gray-900 font-bold text-base truncate block">{financialData.insurer || 'N/A'}</span>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 text-center">
            <div className="flex items-center justify-center gap-1 mb-3">
              <span className="text-emerald-700 text-xs font-semibold uppercase tracking-wide">Compromiso Mensual</span>
              <InfoTooltip content="Desembolsos mensuales para atender deudas" />
            </div>
            <span className="text-gray-900 font-bold text-base">
              {financialData.monthlyCommitment ? formatCurrency(parseFloat(financialData.monthlyCommitment), 'ARS') : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Morosidad */}
      {financialData.isLatePayment && financialData.entitiesInArrears && (
        <div className="bg-red-50 rounded-xl border border-red-200 p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <i className="ki-duotone ki-information-2 text-2xl text-red-600">
                <span className="path1"></span>
                <span className="path2"></span>
                <span className="path3"></span>
              </i>
            </div>
            <div className="flex-1">
              <h4 className="text-base font-bold text-red-900 mb-2">Morosidad Detectada</h4>
              <p className="text-sm text-red-800 font-medium mb-4">
                La empresa registra morosidad con {financialData.entitiesInArrearsCount || financialData.entitiesInArrears.split(',').length} entidad(es) financiera(s):
              </p>
              <ul className="space-y-2">
                {financialData.entitiesInArrears.split(',').map((entity, idx) => (
                  <li key={idx} className="text-sm text-red-800 font-medium flex items-center gap-3 bg-white/50 px-3 py-2 rounded-lg">
                    <span className="w-2 h-2 bg-red-600 rounded-full flex-shrink-0"></span>
                    {entity.trim()}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Balance General */}
      {financialData.balanceSheet && financialData.balanceSheet.totalAssets && (
        <div>
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-base font-medium text-gray-900">Balance General</h3>
              <InfoTooltip content="Estado financiero de activos, pasivos y patrimonio" />
            </div>
            <div className="h-0.5 bg-gradient-to-r from-blue-500 via-blue-400 to-transparent w-16"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Activos */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 pb-3 border-b border-blue-200">
                <i className="ki-duotone ki-chart-line-up2 text-lg text-blue-600"><span className="path1"></span><span className="path2"></span></i>
                <h4 className="text-sm font-semibold text-blue-900">Activos</h4>
              </div>
              {financialData.balanceSheet.currentAssets !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-blue-700 text-xs font-medium">Activo Corriente</span>
                  <span className="font-semibold text-gray-900 text-sm">{formatCurrency(financialData.balanceSheet.currentAssets, 'ARS')}</span>
                </div>
              )}
              {financialData.balanceSheet.nonCurrentAssets !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-blue-700 text-xs font-medium">Activo No Corriente</span>
                  <span className="font-semibold text-gray-900 text-sm">{formatCurrency(financialData.balanceSheet.nonCurrentAssets, 'ARS')}</span>
                </div>
              )}
              {financialData.balanceSheet.totalAssets !== undefined && (
                <div className="flex justify-between items-center pt-3 border-t border-blue-200 mt-2">
                  <span className="text-blue-900 text-xs font-bold uppercase tracking-wide">Total Activos</span>
                  <span className="font-bold text-blue-700 text-base">{formatCurrency(financialData.balanceSheet.totalAssets, 'ARS')}</span>
                </div>
              )}
            </div>

            {/* Pasivos */}
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 pb-3 border-b border-orange-200">
                <i className="ki-duotone ki-chart-line-down text-lg text-orange-600"><span className="path1"></span><span className="path2"></span></i>
                <h4 className="text-sm font-semibold text-orange-900">Pasivos</h4>
              </div>
              {financialData.balanceSheet.currentLiabilities !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-orange-700 text-xs font-medium">Pasivo Corriente</span>
                  <span className="font-semibold text-gray-900 text-sm">{formatCurrency(financialData.balanceSheet.currentLiabilities, 'ARS')}</span>
                </div>
              )}
              {financialData.balanceSheet.nonCurrentLiabilities !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-orange-700 text-xs font-medium">Pasivo No Corriente</span>
                  <span className="font-semibold text-gray-900 text-sm">{formatCurrency(financialData.balanceSheet.nonCurrentLiabilities, 'ARS')}</span>
                </div>
              )}
              {financialData.balanceSheet.totalLiabilities !== undefined && (
                <div className="flex justify-between items-center pt-3 border-t border-orange-200 mt-2">
                  <span className="text-orange-900 text-xs font-bold uppercase tracking-wide">Total Pasivos</span>
                  <span className="font-bold text-orange-700 text-base">{formatCurrency(financialData.balanceSheet.totalLiabilities, 'ARS')}</span>
                </div>
              )}
            </div>

            {/* Patrimonio */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 pb-3 border-b border-emerald-200">
                <i className="ki-duotone ki-wallet text-lg text-emerald-600"><span className="path1"></span><span className="path2"></span></i>
                <h4 className="text-sm font-semibold text-emerald-900">Patrimonio y Resultados</h4>
              </div>
              {financialData.balanceSheet.netEquity !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-emerald-700 text-xs font-medium">Patrimonio Neto</span>
                  <span className="font-semibold text-gray-900 text-sm">{formatCurrency(financialData.balanceSheet.netEquity, 'ARS')}</span>
                </div>
              )}
              {financialData.balanceSheet.netSales !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-emerald-700 text-xs font-medium">Ventas Netas</span>
                  <span className="font-semibold text-gray-900 text-sm">{formatCurrency(financialData.balanceSheet.netSales, 'ARS')}</span>
                </div>
              )}
              {financialData.balanceSheet.exerciseResult !== undefined && (
                <div className="flex justify-between items-center pt-3 border-t border-emerald-200 mt-2">
                  <span className="text-emerald-900 text-xs font-bold uppercase tracking-wide">Resultado del Ejercicio</span>
                  <span className={`font-bold text-base ${financialData.balanceSheet.exerciseResult >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                    {formatCurrency(financialData.balanceSheet.exerciseResult, 'ARS')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {financialData.balanceSheet.lastUpdateDate && (
            <div className="mt-4 text-center">
              <span className="text-xs text-gray-600 font-medium bg-gray-100 px-3 py-1.5 rounded-full">
                Ultima actualizacion: {formatDate(financialData.balanceSheet.lastUpdateDate)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Evaluacion de Riesgo */}
      <div>
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-base font-medium text-gray-900">Evaluacion de Riesgo</h3>
            <InfoTooltip content="Analisis de riesgos crediticios y alertas financieras" />
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-600 text-white">
              Analisis
            </span>
          </div>
          <div className="h-0.5 bg-gradient-to-r from-orange-500 via-orange-400 to-transparent w-16"></div>
        </div>

        <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Juicios */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">Juicios</h4>

              <div className="flex justify-between items-center bg-white rounded-lg px-3 py-2 border border-gray-200">
                <span className="text-gray-700 text-sm font-medium">Ult. 3 meses</span>
                <span className={`font-bold text-sm ${(financialData.judments3m && parseInt(financialData.judments3m) > 0) ? 'text-red-600' : 'text-emerald-600'}`}>
                  {financialData.judments3m || '0'}
                </span>
              </div>

              <div className="flex justify-between items-center bg-white rounded-lg px-3 py-2 border border-gray-200">
                <span className="text-gray-700 text-sm font-medium">Ult. 12 meses</span>
                <span className={`font-bold text-sm ${(financialData.judments12m && parseInt(financialData.judments12m) > 0) ? 'text-red-600' : 'text-emerald-600'}`}>
                  {financialData.judments12m || '0'}
                </span>
              </div>

              <div className="flex justify-between items-center bg-white rounded-lg px-3 py-2 border border-gray-200">
                <span className="text-gray-700 text-sm font-medium">Ult. 24 meses</span>
                <span className={`font-bold text-sm ${(financialData.judments24m && parseInt(financialData.judments24m) > 0) ? 'text-red-600' : 'text-emerald-600'}`}>
                  {financialData.judments24m || '0'}
                </span>
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between items-center bg-white rounded-lg px-3 py-2 border border-gray-200">
                  <span className="text-gray-700 text-sm font-medium">Facturas Apocrifas</span>
                  <span className={`font-bold text-sm ${financialData.hasApocryphalInvoices ? 'text-red-600' : 'text-emerald-600'}`}>
                    {financialData.hasApocryphalInvoices ? 'Si' : 'No'}
                  </span>
                </div>

                <div className="flex justify-between items-center bg-white rounded-lg px-3 py-2 border border-gray-200">
                  <span className="text-gray-700 text-sm font-medium">Cheques Rechazados</span>
                  <span className={`font-bold text-sm ${(financialData.bouncedChecks && financialData.bouncedChecks.length > 0) ? 'text-red-600' : 'text-emerald-600'}`}>
                    {financialData.bouncedChecks?.length || '0'}
                  </span>
                </div>
              </div>
            </div>

            {/* Concursos y Quiebras */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">Concursos y Quiebras</h4>

              <div className="flex justify-between items-center bg-white rounded-lg px-3 py-2 border border-gray-200">
                <span className="text-gray-700 text-sm font-medium">Ult. 3 meses</span>
                <span className={`font-bold text-sm ${(financialData.contestAndBankruptcies3m && parseInt(financialData.contestAndBankruptcies3m) > 0) ? 'text-red-600' : 'text-emerald-600'}`}>
                  {financialData.contestAndBankruptcies3m || '0'}
                </span>
              </div>

              <div className="flex justify-between items-center bg-white rounded-lg px-3 py-2 border border-gray-200">
                <span className="text-gray-700 text-sm font-medium">Ult. 12 meses</span>
                <span className={`font-bold text-sm ${(financialData.contestAndBankruptcies12m && parseInt(financialData.contestAndBankruptcies12m) > 0) ? 'text-red-600' : 'text-emerald-600'}`}>
                  {financialData.contestAndBankruptcies12m || '0'}
                </span>
              </div>

              <div className="flex justify-between items-center bg-white rounded-lg px-3 py-2 border border-gray-200">
                <span className="text-gray-700 text-sm font-medium">Ult. 24 meses</span>
                <span className={`font-bold text-sm ${(financialData.contestAndBankruptcies24m && parseInt(financialData.contestAndBankruptcies24m) > 0) ? 'text-red-600' : 'text-emerald-600'}`}>
                  {financialData.contestAndBankruptcies24m || '0'}
                </span>
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between items-center bg-white rounded-lg px-3 py-2 border border-gray-200">
                  <span className="text-gray-700 text-sm font-medium">Deuda Fiscal</span>
                  <span className={`font-bold text-sm ${financialData.hasFiscalDebt === 'true' ? 'text-red-600' : 'text-emerald-600'}`}>
                    {financialData.hasFiscalDebt === 'true' ? 'Si' : 'No'}
                  </span>
                </div>

                <div className="flex justify-between items-center bg-white rounded-lg px-3 py-2 border border-gray-200">
                  <span className="text-gray-700 text-sm font-medium">Pagos Tardios</span>
                  <span className={`font-bold text-sm ${financialData.isLatePayment ? 'text-red-600' : 'text-emerald-600'}`}>
                    {financialData.isLatePayment ? 'Si' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Indicadores Financieros */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">Indicadores Financieros</h4>

              {financialData.bcraWorstSituation12m && (
                <div className="flex justify-between items-center bg-white rounded-lg px-3 py-2 border border-gray-200">
                  <span className="text-gray-700 text-sm font-medium">Peor Situacion BCRA (12m)</span>
                  <span className={`font-bold text-xs px-2.5 py-1 rounded-lg ${getSituationColor(financialData.bcraWorstSituation12m)}`}>
                    {getSituationLabel(financialData.bcraWorstSituation12m)}
                  </span>
                </div>
              )}

              {financialData.entitiesInArrearsCount !== undefined && (
                <div className="flex justify-between items-center bg-white rounded-lg px-3 py-2 border border-gray-200">
                  <span className="text-gray-700 text-sm font-medium">Cant. Entidades en Mora</span>
                  <span className={`font-bold text-sm ${financialData.entitiesInArrearsCount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {financialData.entitiesInArrearsCount}
                  </span>
                </div>
              )}

              {financialData.debtorComplianceProfile && (
                <div className="flex justify-between items-center bg-white rounded-lg px-3 py-2 border border-gray-200">
                  <span className="text-gray-700 text-sm font-medium">Perfil de Cumplimiento</span>
                  <span className="font-bold text-blue-700 text-xs bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200">
                    {financialData.debtorComplianceProfile}
                  </span>
                </div>
              )}

              {financialData.creditCardPaymentAmount && (
                <div className="flex justify-between items-center bg-white rounded-lg px-3 py-2 border border-gray-200">
                  <span className="text-gray-700 text-sm font-medium">Pago Tarjetas de Credito</span>
                  <span className="font-bold text-gray-900 text-sm">
                    {formatCurrency(parseFloat(financialData.creditCardPaymentAmount), 'ARS')}
                  </span>
                </div>
              )}

              {financialData.bankDebtors && financialData.bankDebtors.length > 0 && (
                <div className="flex justify-between items-center bg-white rounded-lg px-3 py-2 border border-gray-200">
                  <span className="text-gray-700 text-sm font-medium">Deudores Bancarios</span>
                  <span className="font-bold text-red-600 text-sm">
                    {financialData.bankDebtors.length}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bancos Operativos */}
      {financialData.operativeBanks && financialData.operativeBanks.length > 0 && (
        <div>
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-base font-medium text-gray-900">Bancos Operativos</h3>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white">
                {financialData.operativeBanks.length}
              </span>
            </div>
            <div className="h-0.5 bg-gradient-to-r from-blue-500 via-blue-400 to-transparent w-16"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {financialData.operativeBanks.map((bank, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                <i className="ki-duotone ki-bank text-2xl text-blue-500 mb-2">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
                <p className="text-sm font-medium text-gray-900">{bank.name || 'Banco'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Informacion BCRA */}
      {financialData.bcraInfo && financialData.bcraInfo.length > 0 && (
        <div>
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-base font-medium text-gray-900">Informacion BCRA</h3>
              <InfoTooltip content="Datos del Banco Central de la Republica Argentina" />
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-600 text-white">
                {financialData.bcraInfo.length} entidades
              </span>
            </div>
            <div className="h-0.5 bg-gradient-to-r from-indigo-500 via-indigo-400 to-transparent w-16"></div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Entidad</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Situacion</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Monto</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Periodo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {financialData.bcraInfo.slice(0, 10).map((info, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">{info.name || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-lg ${getSituationColor(info.situation || '1')}`}>
                          {getSituationLabel(info.situation || '1')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-mono text-right">
                        {info.amount ? formatCurrency(parseFloat(info.amount), 'ARS') : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{info.period ? formatDate(info.period) : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {financialData.bcraInfo.length > 10 && (
              <div className="px-4 py-3 bg-gray-50 text-center">
                <span className="text-sm text-gray-500">Mostrando 10 de {financialData.bcraInfo.length} registros</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
