'use client'

import React from 'react'
import Image from 'next/image'
import { getCarLogoUrl } from '@/lib/utils/bankUtils'
import { formatDate } from '@/lib/utils/dateUtils'

interface CarData {
  brand?: string
  model?: string
  licensePlate?: string
  inPossession?: boolean
  year?: number | string
  buyed?: number | { $numberLong: string }
  origin?: string
  manufactured?: number | { $numberLong: string }
  type?: string
}

interface CarEmbargoData {
  brand?: string
  debt?: string
  licensePlate?: string
  province?: string
  valuation?: string
}

interface VehiclesSectionProps {
  cars?: CarData[]
  carsEmbargoes?: CarEmbargoData[]
  showTitle?: boolean
  title?: string
}

export default function VehiclesSection({
  cars,
  carsEmbargoes,
  showTitle = true,
  title = 'Vehiculos'
}: VehiclesSectionProps) {

  const formatTimestamp = (timestamp: number | { $numberLong: string } | undefined) => {
    if (!timestamp) return 'N/A'
    const formatted = formatDate(timestamp)
    return formatted === 'No disponible' ? 'N/A' : formatted
  }

  const formatYear = (timestamp: number | { $numberLong: string } | undefined) => {
    if (!timestamp) return 'N/A'

    let date: Date
    if (typeof timestamp === 'object' && '$numberLong' in timestamp) {
      date = new Date(parseInt(timestamp.$numberLong))
    } else if (typeof timestamp === 'number') {
      date = new Date(timestamp)
    } else {
      return 'N/A'
    }

    return date.getFullYear().toString()
  }

  if (!cars || cars.length === 0) {
    return (
      <div>
        {showTitle && (
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-base font-medium text-gray-900">{title}</h3>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-sm bg-gradient-to-r from-cyan-600 to-cyan-500 text-white">
                0
              </span>
            </div>
            <div className="h-0.5 bg-gradient-to-r from-cyan-500 via-cyan-400 to-transparent w-16"></div>
          </div>
        )}
        <div className="text-center py-8">
          <i className="ki-duotone ki-car-2 text-4xl text-gray-300 mb-3">
            <span className="path1"></span>
            <span className="path2"></span>
            <span className="path3"></span>
            <span className="path4"></span>
            <span className="path5"></span>
          </i>
          <p className="text-sm font-medium text-gray-500">No se encontraron vehiculos registrados</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div>
        {showTitle && (
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-base font-medium text-gray-900">{title}</h3>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-sm bg-gradient-to-r from-cyan-600 to-cyan-500 text-white">
                {cars.length}
              </span>
            </div>
            <div className="h-0.5 bg-gradient-to-r from-cyan-500 via-cyan-400 to-transparent w-16"></div>
          </div>
        )}

        <div className="space-y-8">
          {/* AUTOMOTORES ACTUALES */}
          {cars.filter(car => car.inPossession).length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h4 className="text-sm font-bold text-gray-800">Automotores Actuales</h4>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold shadow-sm bg-gradient-to-r from-emerald-600 to-emerald-500 text-white">
                  {cars.filter(car => car.inPossession).length}
                </span>
              </div>
              <div className="space-y-3">
                {cars.filter(car => car.inPossession).map((car, idx) => (
                  <div key={`current-${idx}`} className="bg-gradient-to-br from-emerald-50/30 to-teal-50/20 backdrop-blur-lg rounded-xl border border-emerald-100/30 p-5 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex items-center gap-2">
                            {car.brand && getCarLogoUrl(car.brand) && (
                              <Image
                                src={getCarLogoUrl(car.brand)!}
                                alt={`${car.brand}_logo`}
                                width={24}
                                height={24}
                                className="w-8 h-8 object-contain"
                                unoptimized
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                }}
                              />
                            )}
                            <h4 className="font-bold text-gray-900 text-base">
                              {car.brand} {car.model} ({car.year})
                            </h4>
                          </div>
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100/80 text-emerald-800 border border-emerald-200/50 shadow-sm">
                            En posesion
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                          <div className="bg-white/25 backdrop-blur-lg rounded-lg px-3 py-2 border border-gray-200/30">
                            <span className="text-emerald-700 text-xs font-semibold block mb-1">Patente</span>
                            <span className="text-gray-900 font-bold font-mono text-sm">{car.licensePlate}</span>
                          </div>
                          <div className="bg-white/25 backdrop-blur-lg rounded-lg px-3 py-2 border border-gray-200/30">
                            <span className="text-emerald-700 text-xs font-semibold block mb-1">Tipo</span>
                            <span className="text-gray-900 font-bold text-sm">{car.type || 'N/A'}</span>
                          </div>
                          <div className="bg-white/25 backdrop-blur-lg rounded-lg px-3 py-2 border border-gray-200/30">
                            <span className="text-emerald-700 text-xs font-semibold block mb-1">Origen</span>
                            <span className="text-gray-900 font-bold text-sm">{car.origin || 'N/A'}</span>
                          </div>
                          <div className="bg-white/25 backdrop-blur-lg rounded-lg px-3 py-2 border border-gray-200/30">
                            <span className="text-emerald-700 text-xs font-semibold block mb-1">Compra</span>
                            <span className="text-gray-900 font-bold text-sm">{formatTimestamp(car.buyed)}</span>
                          </div>
                          <div className="bg-white/25 backdrop-blur-lg rounded-lg px-3 py-2 border border-gray-200/30">
                            <span className="text-emerald-700 text-xs font-semibold block mb-1">Fabricacion</span>
                            <span className="text-gray-900 font-bold text-sm">{formatYear(car.manufactured)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HISTORIAL DE AUTOMOTORES */}
          {cars.filter(car => !car.inPossession).length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h4 className="text-sm font-bold text-gray-800">Historial de Automotores</h4>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold shadow-sm bg-gradient-to-r from-gray-500 to-gray-400 text-white">
                  {cars.filter(car => !car.inPossession).length}
                </span>
              </div>
              <div className="space-y-3">
                {cars.filter(car => !car.inPossession).map((car, idx) => (
                  <div key={`history-${idx}`} className="bg-gradient-to-br from-gray-50/50 to-gray-100/30 backdrop-blur-lg rounded-xl border border-gray-200/30 p-5 hover:shadow-md transition-all duration-200 opacity-80">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex items-center gap-2">
                            {car.brand && getCarLogoUrl(car.brand) && (
                              <Image
                                src={getCarLogoUrl(car.brand)!}
                                alt={`${car.brand}_logo`}
                                width={24}
                                height={24}
                                className="w-8 h-8 object-contain grayscale"
                                unoptimized
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                }}
                              />
                            )}
                            <h4 className="font-bold text-gray-700 text-base">
                              {car.brand} {car.model} ({car.year})
                            </h4>
                          </div>
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-200/80 text-gray-700 border border-gray-300/50 shadow-sm">
                            No en posesion
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                          <div className="bg-white/40 backdrop-blur-lg rounded-lg px-3 py-2 border border-gray-200/30">
                            <span className="text-gray-600 text-xs font-semibold block mb-1">Patente</span>
                            <span className="text-gray-800 font-bold font-mono text-sm">{car.licensePlate}</span>
                          </div>
                          <div className="bg-white/40 backdrop-blur-lg rounded-lg px-3 py-2 border border-gray-200/30">
                            <span className="text-gray-600 text-xs font-semibold block mb-1">Tipo</span>
                            <span className="text-gray-800 font-bold text-sm">{car.type || 'N/A'}</span>
                          </div>
                          <div className="bg-white/40 backdrop-blur-lg rounded-lg px-3 py-2 border border-gray-200/30">
                            <span className="text-gray-600 text-xs font-semibold block mb-1">Origen</span>
                            <span className="text-gray-800 font-bold text-sm">{car.origin || 'N/A'}</span>
                          </div>
                          <div className="bg-white/40 backdrop-blur-lg rounded-lg px-3 py-2 border border-gray-200/30">
                            <span className="text-gray-600 text-xs font-semibold block mb-1">Compra</span>
                            <span className="text-gray-800 font-bold text-sm">{formatTimestamp(car.buyed)}</span>
                          </div>
                          <div className="bg-white/40 backdrop-blur-lg rounded-lg px-3 py-2 border border-gray-200/30">
                            <span className="text-gray-600 text-xs font-semibold block mb-1">Fabricacion</span>
                            <span className="text-gray-800 font-bold text-sm">{formatYear(car.manufactured)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* EMBARGOS DE VEHICULOS */}
      {carsEmbargoes && carsEmbargoes.length > 0 && (
        <div className="mt-12">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-base font-medium text-gray-900">Embargos de Vehiculos</h3>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-sm bg-gradient-to-r from-red-600 to-rose-600 text-white">
                {carsEmbargoes.length}
              </span>
            </div>
            <div className="h-0.5 bg-gradient-to-r from-red-500 via-rose-400 to-transparent w-16"></div>
          </div>
          <div className="space-y-4">
            {carsEmbargoes.map((embargo, idx) => (
              <div key={idx} className="bg-gradient-to-br from-red-50/40 to-rose-50/30 backdrop-blur-lg border border-red-200/30 rounded-xl p-5 hover:shadow-lg transition-all duration-200">
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full bg-red-500 opacity-70 mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        {embargo.brand && getCarLogoUrl(embargo.brand) && (
                          <Image
                            src={getCarLogoUrl(embargo.brand)!}
                            alt={`${embargo.brand} logo`}
                            width={24}
                            height={24}
                            className="w-6 h-6 object-contain"
                            unoptimized
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        )}
                        <h4 className="font-bold text-gray-900 text-base">{embargo.brand}</h4>
                      </div>
                      <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-red-100/80 text-red-800 border border-red-200/50 shadow-sm">
                        Embargado
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="bg-white/60 backdrop-blur-lg px-3 py-2 rounded-lg border border-red-200/30">
                        <span className="text-red-700 text-xs font-semibold block mb-1">Patente</span>
                        <span className="text-gray-900 font-bold font-mono text-sm">{embargo.licensePlate}</span>
                      </div>
                      <div className="bg-white/60 backdrop-blur-lg px-3 py-2 rounded-lg border border-red-200/30">
                        <span className="text-red-700 text-xs font-semibold block mb-1">Provincia</span>
                        <span className="text-gray-900 font-bold text-sm">{embargo.province}</span>
                      </div>
                      <div className="bg-white/60 backdrop-blur-lg px-3 py-2 rounded-lg border border-red-200/30">
                        <span className="text-red-700 text-xs font-semibold block mb-1">Deuda</span>
                        <span className="text-red-800 font-bold text-sm">{embargo.debt}</span>
                      </div>
                      <div className="bg-white/60 backdrop-blur-lg px-3 py-2 rounded-lg border border-red-200/30">
                        <span className="text-red-700 text-xs font-semibold block mb-1">Valuacion</span>
                        <span className="text-gray-900 font-bold text-sm">{embargo.valuation}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
