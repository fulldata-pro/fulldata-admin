'use client'

import { formatNumber } from '@/lib/utils/currencyUtils'

interface BalanceTabProps {
  referralBalance?: number
}

export function BalanceTab({ referralBalance }: BalanceTabProps) {
  return (
    <div className="rounded-2xl bg-white shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-secondary">Balance de Referidos</h3>
        <p className="text-gray-500 text-sm mt-1">
          Comisiones acumuladas por referidos
        </p>
      </div>

      <div className="p-6">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-8 text-center">
          <i className="ki-duotone ki-wallet text-primary text-5xl mb-4">
            <span className="path1"></span>
            <span className="path2"></span>
            <span className="path3"></span>
            <span className="path4"></span>
          </i>
          <p className="text-gray-600 mb-2">Balance Disponible</p>
          <p className="text-4xl font-bold text-primary">
            ${formatNumber(referralBalance || 0)} ARS
          </p>
          <p className="text-gray-500 text-sm mt-4">
            Este balance corresponde a las comisiones por referidos
          </p>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <i className="ki-duotone ki-information-circle text-blue-500 text-xl">
              <span className="path1"></span>
              <span className="path2"></span>
              <span className="path3"></span>
            </i>
            <p className="text-sm text-blue-700">
              El sistema de referidos estará disponible próximamente
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}