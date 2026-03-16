'use client'

import React from 'react'
import VehiclesSection from '@/components/reports/shared/VehiclesSection'
import InfoTooltip from '@/components/reports/shared/InfoTooltip'

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

interface BuildingData {
  address: string
  landSurface?: number
  buildingSurface?: number
}

interface TrademarkData {
  name: string
}

interface PersonalPropertyData {
  cars?: CarData[]
  carsEmbargoes?: CarEmbargoData[]
  buildings?: BuildingData[]
  registeredTrademarks?: TrademarkData[]
  registeredTrademarksCount?: number
}

interface PersonalPropertySectionProps {
  propertyData: PersonalPropertyData
}

export default function PersonalPropertySection({ propertyData }: PersonalPropertySectionProps) {
  return (
    <div className="space-y-12">
      {/* INMUEBLES */}
      <div>
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-base font-medium text-gray-900">Inmuebles</h3>
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
              {propertyData.buildings?.length || 0}
            </span>
          </div>
          <div className="h-0.5 bg-gradient-to-r from-amber-500 via-amber-400 to-transparent w-16"></div>
        </div>
        {!propertyData.buildings || propertyData.buildings.length === 0 ? (
          <div className="text-center py-8">
            <i className="ki-duotone ki-home-2 text-4xl text-gray-300 mb-3">
              <span className="path1"></span>
              <span className="path2"></span>
            </i>
            <p className="text-sm font-medium text-gray-500">No se encontraron inmuebles registrados</p>
          </div>
        ) : (
          <div className="space-y-4">
            {propertyData.buildings.map((building, idx) => (
              <div key={idx} className="bg-gradient-to-br from-amber-50/30 to-amber-50/20 backdrop-blur-lg border border-amber-100/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 opacity-70 mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-4 text-base">{building.address}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-500 text-xs font-medium block mb-1">Superficie del terreno</span>
                        <span className="text-gray-800 font-semibold">{building.landSurface || 'N/A'} m2</span>
                      </div>
                      <div>
                        <span className="text-gray-500 text-xs font-medium block mb-1">Superficie construida</span>
                        <span className="text-gray-800 font-semibold">{building.buildingSurface || 'N/A'} m2</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* VEHICULOS */}
      <VehiclesSection
        cars={propertyData.cars}
        carsEmbargoes={propertyData.carsEmbargoes}
        showTitle={true}
        title="Vehiculos"
      />

      {/* MARCAS REGISTRADAS */}
      {((propertyData.registeredTrademarks && propertyData.registeredTrademarks.length > 0) || propertyData.registeredTrademarksCount) && (
        <div>
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-base font-medium text-gray-900">Marcas Registradas</h3>
              <InfoTooltip content="Marcas comerciales registradas oficialmente que otorgan derechos de propiedad intelectual" />
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
                {propertyData.registeredTrademarksCount || propertyData.registeredTrademarks?.length || 0}
              </span>
            </div>
            <div className="h-0.5 bg-gradient-to-r from-lime-500 via-lime-400 to-transparent w-16"></div>
          </div>

          {/* Si tenemos el numero pero no la lista detallada */}
          {propertyData.registeredTrademarksCount && (!propertyData.registeredTrademarks || propertyData.registeredTrademarks.length === 0) && (
            <div className="bg-gradient-to-br from-emerald-50/30 to-emerald-50/20 backdrop-blur-lg border border-emerald-100/30 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-900 mb-2">
                  {propertyData.registeredTrademarksCount}
                </div>
                <div className="text-sm text-emerald-700">
                  Marcas registradas a nombre de la persona
                </div>
                <div className="text-xs text-emerald-600 mt-2">
                  Fuente: Registro de Propiedad Intelectual
                </div>
              </div>
            </div>
          )}

          {/* Si tenemos la lista detallada */}
          {propertyData.registeredTrademarks && propertyData.registeredTrademarks.length > 0 && (
            <div className="space-y-3">
              {propertyData.registeredTrademarks.map((trademark, idx) => (
                <div key={idx} className="bg-gradient-to-br from-emerald-50/30 to-emerald-50/20 backdrop-blur-lg border border-emerald-100/30 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 opacity-70"></div>
                    <span className="text-gray-800 font-semibold">{trademark.name}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
