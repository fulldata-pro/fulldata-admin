'use client'

import React from 'react'

interface AccountRouting {
  scheme: string
  value: string
}

interface BankRouting {
  bankCode: string
  bankNameDisplay: string
}

interface BankData {
  isActive: boolean
  type: string
  currency: string[]
  accountRouting: AccountRouting[]
  bankRouting: BankRouting
}

interface BankAccountSummaryProps {
  data: BankData
}

export default function BankAccountSummary({ data }: BankAccountSummaryProps) {
  const cvuAccount = data.accountRouting.find(route => route.scheme === 'CVU' || route.scheme === 'CBU')
  const aliasAccount = data.accountRouting.find(route => route.scheme === 'ALIAS')

  return (
    <div className="bg-white/95 backdrop-blur-sm border border-gray-200/50 hover:border-gray-300/60 hover:shadow-xl rounded-2xl p-8 shadow-lg shadow-slate-900/5 transition-all duration-300">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Informacion de la Cuenta</h3>
          <div className="h-0.5 bg-gradient-to-r from-rose-500 via-rose-400 to-transparent w-24"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full shadow-sm ${data.isActive ? 'bg-green-500' : 'bg-rose-500'}`}></div>
          <span className="text-sm font-medium text-gray-700">
            {data.isActive ? 'Cuenta Activa' : 'Cuenta Inactiva'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* CVU/CBU */}
        <div className="bg-gradient-to-br from-slate-50/30 to-gray-50/20 backdrop-blur-sm rounded-xl p-6 border border-gray-200/30 hover:border-gray-300/60 hover:shadow-md transition-all duration-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-slate-50/50 to-gray-100/50 border border-gray-200/30 rounded-lg flex items-center justify-center shadow-sm">
              <i className="ki-duotone ki-credit-cart text-lg text-gray-600">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
            </div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {cvuAccount?.scheme || 'CVU/CBU'}
            </div>
          </div>
          <div className="text-base font-mono text-gray-900 tracking-wider font-medium break-all">
            {cvuAccount?.value || 'No disponible'}
          </div>
        </div>

        {/* Alias */}
        <div className="bg-gradient-to-br from-slate-50/30 to-gray-50/20 backdrop-blur-sm rounded-xl p-6 border border-gray-200/30 hover:border-gray-300/60 hover:shadow-md transition-all duration-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-slate-50/50 to-gray-100/50 border border-gray-200/30 rounded-lg flex items-center justify-center shadow-sm">
              <i className="ki-duotone ki-abstract-39 text-lg text-gray-600">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
            </div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Alias
            </div>
          </div>
          <div className="text-base font-semibold text-gray-900">
            {aliasAccount?.value || 'No disponible'}
          </div>
        </div>

        {/* Entidad Bancaria */}
        <div className="bg-gradient-to-br from-slate-50/30 to-gray-50/20 backdrop-blur-sm rounded-xl p-6 border border-gray-200/30 hover:border-gray-300/60 hover:shadow-md transition-all duration-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-slate-50/50 to-gray-100/50 border border-gray-200/30 rounded-lg flex items-center justify-center shadow-sm">
              <i className="ki-duotone ki-bank text-lg text-gray-600">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
            </div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Entidad Bancaria
            </div>
          </div>
          <div className="text-base font-semibold text-gray-900">
            {data.bankRouting.bankNameDisplay}
          </div>
          <div className="text-sm text-gray-500 mt-2">
            Codigo: <span className="font-mono">{data.bankRouting.bankCode}</span>
          </div>
        </div>

        {/* Tipo de Cuenta */}
        <div className="bg-gradient-to-br from-slate-50/30 to-gray-50/20 backdrop-blur-sm rounded-xl p-6 border border-gray-200/30 hover:border-gray-300/60 hover:shadow-md transition-all duration-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-slate-50/50 to-gray-100/50 border border-gray-200/30 rounded-lg flex items-center justify-center shadow-sm">
              <i className="ki-duotone ki-category text-lg text-gray-600">
                <span className="path1"></span>
                <span className="path2"></span>
                <span className="path3"></span>
                <span className="path4"></span>
              </i>
            </div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Tipo de Cuenta
            </div>
          </div>
          <div className="text-base font-semibold text-gray-900">
            {data.type}
          </div>
        </div>

        {/* Moneda */}
        <div className="bg-gradient-to-br from-slate-50/30 to-gray-50/20 backdrop-blur-sm rounded-xl p-6 border border-gray-200/30 hover:border-gray-300/60 hover:shadow-md transition-all duration-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-slate-50/50 to-gray-100/50 border border-gray-200/30 rounded-lg flex items-center justify-center shadow-sm">
              <i className="ki-duotone ki-dollar text-lg text-gray-600">
                <span className="path1"></span>
                <span className="path2"></span>
                <span className="path3"></span>
              </i>
            </div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Moneda
            </div>
          </div>
          <div className="text-base font-semibold text-gray-900">
            {data.currency.join(', ')}
          </div>
        </div>

        {/* Todos los Account Routings adicionales */}
        {data.accountRouting.filter(route => route.scheme !== 'CVU' && route.scheme !== 'CBU' && route.scheme !== 'ALIAS').map((route, index) => (
          <div key={index} className="bg-gradient-to-br from-slate-50/30 to-gray-50/20 backdrop-blur-sm rounded-xl p-6 border border-gray-200/30 hover:border-gray-300/60 hover:shadow-md transition-all duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-slate-50/50 to-gray-100/50 border border-gray-200/30 rounded-lg flex items-center justify-center shadow-sm">
                <i className="ki-duotone ki-note-2 text-lg text-gray-600">
                  <span className="path1"></span>
                  <span className="path2"></span>
                  <span className="path3"></span>
                  <span className="path4"></span>
                </i>
              </div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {route.scheme}
              </div>
            </div>
            <div className="text-base font-mono text-gray-900 tracking-wider break-all">
              {route.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
