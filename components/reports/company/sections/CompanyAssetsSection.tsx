'use client'

import React from 'react'
import { CompanyAssetsData } from '@/lib/types/report.types'
import { formatCurrency } from '@/lib/utils/currencyUtils'

interface CompanyAssetsSectionProps {
  assetsData: CompanyAssetsData | null
}

export default function CompanyAssetsSection({ assetsData }: CompanyAssetsSectionProps) {
  if (!assetsData) {
    return (
      <div className="text-center py-8">
        <i className="ki-duotone ki-home-2 text-4xl text-gray-300 mb-3">
          <span className="path1"></span>
          <span className="path2"></span>
        </i>
        <p className="text-sm font-medium text-gray-500">No se encontraron datos de bienes patrimoniales</p>
      </div>
    )
  }

  const hasCars = assetsData.cars && assetsData.cars.length > 0
  const hasEmbargoes = assetsData.carsEmbargoes && assetsData.carsEmbargoes.length > 0
  const hasBuildings = assetsData.buildings && assetsData.buildings.length > 0

  if (!hasCars && !hasEmbargoes && !hasBuildings) {
    return (
      <div className="text-center py-8">
        <i className="ki-duotone ki-home-2 text-4xl text-gray-300 mb-3">
          <span className="path1"></span>
          <span className="path2"></span>
        </i>
        <p className="text-sm font-medium text-gray-500">No se encontraron bienes patrimoniales registrados</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Vehiculos */}
      {hasCars && (
        <div>
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-base font-medium text-gray-900">Vehiculos</h3>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white">
                {assetsData.cars.length}
              </span>
            </div>
            <div className="h-0.5 bg-gradient-to-r from-blue-500 via-blue-400 to-transparent w-16"></div>
          </div>

          <div className="space-y-4">
            {assetsData.cars.map((car, idx) => (
              <div key={idx} className="bg-blue-50 border border-blue-100 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <i className="ki-duotone ki-car-2 text-2xl text-white">
                      <span className="path1"></span>
                      <span className="path2"></span>
                      <span className="path3"></span>
                      <span className="path4"></span>
                      <span className="path5"></span>
                    </i>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h4 className="font-bold text-gray-900 text-lg">
                        {car.brand} {car.model}
                      </h4>
                      {car.licensePlate && (
                        <span className="font-mono text-sm font-bold px-3 py-1 bg-white text-blue-700 rounded-lg border border-blue-200">
                          {car.licensePlate}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {car.year && (
                        <div className="bg-white rounded-lg px-3 py-2 border border-blue-100">
                          <span className="text-blue-700 text-xs font-semibold uppercase tracking-wide block mb-1">Ano</span>
                          <span className="text-gray-900 font-bold text-sm">{car.year}</span>
                        </div>
                      )}
                      {car.type && (
                        <div className="bg-white rounded-lg px-3 py-2 border border-blue-100">
                          <span className="text-blue-700 text-xs font-semibold uppercase tracking-wide block mb-1">Tipo</span>
                          <span className="text-gray-900 font-bold text-sm">{car.type}</span>
                        </div>
                      )}
                      {car.origin && (
                        <div className="bg-white rounded-lg px-3 py-2 border border-blue-100">
                          <span className="text-blue-700 text-xs font-semibold uppercase tracking-wide block mb-1">Origen</span>
                          <span className="text-gray-900 font-bold text-sm">{car.origin}</span>
                        </div>
                      )}
                      {car.manufactured && (
                        <div className="bg-white rounded-lg px-3 py-2 border border-blue-100">
                          <span className="text-blue-700 text-xs font-semibold uppercase tracking-wide block mb-1">Fabricacion</span>
                          <span className="text-gray-900 font-bold text-sm">{car.manufactured}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Embargos de Vehiculos */}
      {hasEmbargoes && (
        <div>
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-base font-medium text-gray-900">Embargos de Vehiculos</h3>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-600 text-white">
                {assetsData.carsEmbargoes.length}
              </span>
            </div>
            <div className="h-0.5 bg-gradient-to-r from-red-500 via-red-400 to-transparent w-16"></div>
          </div>

          <div className="space-y-4">
            {assetsData.carsEmbargoes.map((embargo, idx) => (
              <div key={idx} className="bg-red-50 border border-red-100 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center flex-shrink-0">
                    <i className="ki-duotone ki-information-2 text-2xl text-white">
                      <span className="path1"></span>
                      <span className="path2"></span>
                      <span className="path3"></span>
                    </i>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h4 className="font-bold text-gray-900 text-lg">
                        {embargo.brand}
                      </h4>
                      {embargo.licensePlate && (
                        <span className="font-mono text-sm font-bold px-3 py-1 bg-white text-red-700 rounded-lg border border-red-200">
                          {embargo.licensePlate}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {embargo.debt && (
                        <div className="bg-white rounded-lg px-3 py-2 border border-red-100">
                          <span className="text-red-700 text-xs font-semibold uppercase tracking-wide block mb-1">Deuda</span>
                          <span className="text-red-700 font-bold text-sm">{embargo.debt}</span>
                        </div>
                      )}
                      {embargo.valuation && (
                        <div className="bg-white rounded-lg px-3 py-2 border border-red-100">
                          <span className="text-red-700 text-xs font-semibold uppercase tracking-wide block mb-1">Valuacion</span>
                          <span className="text-gray-900 font-bold text-sm">{embargo.valuation}</span>
                        </div>
                      )}
                      {embargo.province && (
                        <div className="bg-white rounded-lg px-3 py-2 border border-red-100">
                          <span className="text-red-700 text-xs font-semibold uppercase tracking-wide block mb-1">Provincia</span>
                          <span className="text-gray-900 font-bold text-sm">{embargo.province}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inmuebles */}
      {hasBuildings && (
        <div>
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-base font-medium text-gray-900">Inmuebles</h3>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-teal-600 text-white">
                {assetsData.buildings.length}
              </span>
            </div>
            <div className="h-0.5 bg-gradient-to-r from-teal-500 via-teal-400 to-transparent w-16"></div>
          </div>

          <div className="space-y-4">
            {assetsData.buildings.map((building, idx) => (
              <div key={idx} className="bg-teal-50 border border-teal-100 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center flex-shrink-0">
                    <i className="ki-duotone ki-home-2 text-2xl text-white">
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-base mb-4">
                      {building.address || 'Inmueble'}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {building.buildingSurface && (
                        <div className="bg-white rounded-lg px-3 py-2 border border-teal-100">
                          <span className="text-teal-700 text-xs font-semibold uppercase tracking-wide block mb-1">Superficie Edificada</span>
                          <span className="text-gray-900 font-bold text-sm">{building.buildingSurface}</span>
                        </div>
                      )}
                      {building.landSurface && (
                        <div className="bg-white rounded-lg px-3 py-2 border border-teal-100">
                          <span className="text-teal-700 text-xs font-semibold uppercase tracking-wide block mb-1">Superficie Terreno</span>
                          <span className="text-gray-900 font-bold text-sm">{building.landSurface}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
