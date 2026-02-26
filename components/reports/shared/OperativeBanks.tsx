'use client'

import React from 'react'
import Image from 'next/image'
import { getBankImage, translateBankType, getSituationColor, getSituationLabel } from '@/lib/utils/bankUtils'
import { formatCurrency } from '@/lib/utils/currencyUtils'

export interface BankItem {
  name: string
  situation: string
  amount?: string | number
  type?: string
}

interface OperativeBanksProps {
  banks: BankItem[]
  title?: string
}

export default function OperativeBanks({ banks, title = 'Bancos Operativos' }: OperativeBanksProps) {
  if (!banks || banks.length === 0) {
    return (
      <div>
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-2">
            <h3 className="text-base font-medium text-gray-900">{title}</h3>
            <div className="flex-1"></div>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              0
            </span>
          </div>
          <div className="h-0.5 bg-gradient-to-r from-emerald-500 via-emerald-400 to-transparent w-16"></div>
        </div>
        <div className="text-center py-8">
          <i className="ki-duotone ki-bank text-4xl text-gray-300 mb-3">
            <span className="path1"></span>
            <span className="path2"></span>
          </i>
          <p className="text-sm font-medium text-gray-500">No se encontraron bancos operativos</p>
        </div>
      </div>
    )
  }

  // Ordenar bancos de mayor a menor por monto de deuda
  const sortedBanks = [...banks].sort((a, b) => {
    const amountA = a.amount ? (typeof a.amount === 'string' ? parseFloat(a.amount) : a.amount) : 0
    const amountB = b.amount ? (typeof b.amount === 'string' ? parseFloat(b.amount) : b.amount) : 0
    return amountB - amountA // Mayor a menor
  })

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-base font-medium text-gray-900">{title}</h3>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-sm bg-gradient-to-r from-emerald-600 to-emerald-500 text-white">
            {banks.length}
          </span>
        </div>
        <div className="h-0.5 bg-gradient-to-r from-emerald-500 via-emerald-400 to-transparent w-16"></div>
      </div>

      <div className="space-y-3">
        {sortedBanks.map((bank: BankItem, idx: number) => {
          const bankImage = getBankImage(bank.name)
          return (
            <div key={idx} className="bg-gradient-to-br from-emerald-50/30 to-teal-50/20 backdrop-blur-lg rounded-xl border border-emerald-100/30 p-4 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center gap-4">
                {/* Logo/Icon */}
                {bankImage ? (
                  <div className="w-16 h-10 flex items-center justify-center flex-shrink-0 bg-white/50 rounded-lg p-1.5">
                    <Image
                      src={bankImage}
                      alt={bank.name}
                      width={64}
                      height={40}
                      className="max-w-full max-h-full object-contain"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-gray-100/60 flex items-center justify-center flex-shrink-0">
                    <i className="ki-duotone ki-bank text-gray-400">
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                  </div>
                )}

                {/* Bank Name */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 text-base mb-1">{bank.name}</h4>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${getSituationColor(bank.situation)}`}>
                    {getSituationLabel(bank.situation)}
                  </span>
                </div>

                {/* Amount and Type */}
                <div className="flex items-center gap-6 flex-shrink-0">
                  {bank.amount && (
                    <div className="text-right">
                      <span className="text-emerald-700 text-xs font-medium block mb-1">Monto</span>
                      <span className="text-gray-900 font-bold text-sm">{formatCurrency(bank.amount, 'ARS')}</span>
                    </div>
                  )}
                  {bank.type && (
                    <div className="text-right min-w-[120px]">
                      <span className="text-emerald-700 text-xs font-medium block mb-1">Tipo</span>
                      <span className="text-gray-900 font-semibold text-xs">{translateBankType(bank.type)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
