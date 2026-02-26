'use client'

import React from 'react'
import Image from 'next/image'
import InfoCard from './InfoCard'

interface VehicleRefDetails {
  brand: string
  model: string
  version?: string
  yearMin?: number
  yearMax?: number
  fullName?: string
  imageUrl?: string
}

interface VehicleImageCardProps {
  vehicleRefDetails?: VehicleRefDetails
}

export default function VehicleImageCard({ vehicleRefDetails }: VehicleImageCardProps) {
  if (!vehicleRefDetails) {
    return (
      <InfoCard
        title="Detalles de Referencia"
        headerColor="slate"
        icon={<i className="ki-duotone ki-information-3 text-lg text-gray-600"><span className="path1"></span><span className="path2"></span><span className="path3"></span></i>}
      >
        <div className="space-y-4">
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gradient-to-br from-zinc-50 to-slate-100/50 border border-slate-200/30 shadow-inner">
            <div className="w-full h-full flex items-center justify-center p-6">
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-200/50 mb-2">
                  <i className="ki-duotone ki-information-2 text-4xl text-gray-400">
                    <span className="path1"></span>
                    <span className="path2"></span>
                    <span className="path3"></span>
                  </i>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Detalles no disponibles
                  </p>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    No existen detalles disponibles para el vehiculo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </InfoCard>
    )
  }

  return (
    <InfoCard
      title="Detalles de Referencia"
      headerColor="slate"
      icon={<i className="ki-duotone ki-information-3 text-lg text-gray-600"><span className="path1"></span><span className="path2"></span><span className="path3"></span></i>}
    >
      <div className="space-y-4">
        {/* Vehicle Reference Image */}
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 shadow-md">
          {vehicleRefDetails.imageUrl ? (
            <Image
              src={vehicleRefDetails.imageUrl}
              alt={vehicleRefDetails.fullName || `${vehicleRefDetails.brand} ${vehicleRefDetails.model}`}
              fill
              className="object-contain p-2"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <i className="ki-duotone ki-car text-4xl text-gray-400">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
            </div>
          )}
        </div>

        {/* Vehicle Info */}
        <div className="text-center space-y-2">
          <p className="text-sm font-semibold text-slate-800">
            {vehicleRefDetails.brand} {vehicleRefDetails.model}
          </p>
          {vehicleRefDetails.version && (
            <p className="text-xs text-slate-500">
              {vehicleRefDetails.version}
            </p>
          )}
          {(vehicleRefDetails.yearMin || vehicleRefDetails.yearMax) && (
            <div className="flex items-center justify-center gap-2 text-xs text-slate-600">
              <span className="px-2 py-1 bg-slate-100 rounded">
                {vehicleRefDetails.yearMin} - {vehicleRefDetails.yearMax}
              </span>
            </div>
          )}
        </div>
      </div>
    </InfoCard>
  )
}
