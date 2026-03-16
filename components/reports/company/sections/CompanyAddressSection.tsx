'use client'

import React from 'react'
import { CompanyAddressData } from '@/lib/types/report.types'

interface CompanyAddressSectionProps {
  addresses: CompanyAddressData[]
}

export default function CompanyAddressSection({ addresses }: CompanyAddressSectionProps) {
  if (!addresses || addresses.length === 0) {
    return (
      <div className="text-center py-8">
        <i className="ki-duotone ki-geolocation text-4xl text-gray-300 mb-3">
          <span className="path1"></span>
          <span className="path2"></span>
        </i>
        <p className="text-sm font-medium text-gray-500">No hay direcciones registradas</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {addresses.map((address, index) => (
        <div
          key={index}
          className="bg-gray-50 border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0">
              <i className="ki-duotone ki-geolocation text-xl text-white">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold text-gray-900">
                  {address.address}
                  {address.addressNumber && ` ${address.addressNumber}`}
                  {address.floor && `, Piso ${address.floor}`}
                  {address.appartment && `, Depto ${address.appartment}`}
                </h4>
                {address.type && (
                  <span className="text-xs font-medium px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                    {address.type}
                  </span>
                )}
                {address.alternative && (
                  <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                    Alternativa
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                {address.city && (
                  <div>
                    <span className="text-gray-500 text-xs uppercase tracking-wide">Ciudad</span>
                    <p className="font-medium text-gray-900">{address.city}</p>
                  </div>
                )}
                {address.province && (
                  <div>
                    <span className="text-gray-500 text-xs uppercase tracking-wide">Provincia</span>
                    <p className="font-medium text-gray-900">{address.province}</p>
                  </div>
                )}
                {address.postalCode && (
                  <div>
                    <span className="text-gray-500 text-xs uppercase tracking-wide">Codigo Postal</span>
                    <p className="font-medium text-gray-900">{address.postalCode}</p>
                  </div>
                )}
                {address.country && (
                  <div>
                    <span className="text-gray-500 text-xs uppercase tracking-wide">Pais</span>
                    <p className="font-medium text-gray-900">{address.country}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
