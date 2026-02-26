'use client'

import React from 'react'
import InfoCard from './InfoCard'
import DataField from './DataField'
import VehicleImageCard from './VehicleImageCard'
import { formatTimestamp } from '@/lib/utils/dateUtils'
import { getCarLogoUrl } from '@/lib/utils/bankUtils'
import Image from 'next/image'

interface SummaryData {
  licensePlate?: string
  brand?: string
  model?: string
  type?: string
  year?: number | string
  manufactured?: number | { $numberLong: string }
  buyed?: number | { $numberLong: string }
  origin?: string
}

interface VehicleRefDetails {
  brand: string
  model: string
  version?: string
  yearMin?: number
  yearMax?: number
  fullName?: string
  imageUrl?: string
}

interface VehicleSummaryCardProps {
  summaryData: SummaryData
  vehicleRefDetails?: VehicleRefDetails
}

export default function VehicleSummaryCard({ summaryData, vehicleRefDetails }: VehicleSummaryCardProps) {
  const formatDate = (timestamp: number | { $numberLong: string } | undefined) => {
    if (!timestamp) return null
    return formatTimestamp(timestamp)
  }

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-slate-200/50 hover:border-slate-300/60 hover:shadow-xl shadow-lg shadow-slate-900/5 transition-all duration-300 overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-100">
        <div className="mb-6">
          <h2 className="text-2xl font-medium text-gray-900 mb-2">
            Informacion del Vehiculo
          </h2>
          <div className="h-0.5 bg-gradient-to-r from-rose-500 via-rose-400 to-transparent w-24"></div>
        </div>
      </div>

      {/* Vehicle Details */}
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Vehicle Information */}
          <div className="lg:col-span-8">
            <InfoCard
              title="Datos del Vehiculo"
              headerColor="slate"
              icon={<i className="ki-duotone ki-car text-lg text-gray-600"><span className="path1"></span><span className="path2"></span></i>}
            >
              <div className="space-y-2">
                <DataField label="Patente" value={summaryData.licensePlate} icon="🚗" />
                <DataField
                  label="Marca"
                  value={
                    <div className='flex items-center gap-2'>
                      {summaryData.brand && getCarLogoUrl(summaryData.brand) && (
                        <Image
                          src={getCarLogoUrl(summaryData.brand)!}
                          alt={`${summaryData.brand}_logo`}
                          width={24}
                          height={24}
                          className="w-7 h-7 object-contain"
                          unoptimized
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      )}
                      <span>{summaryData.brand}</span>
                    </div>
                  }
                  icon="🏭"
                />
                <DataField label="Modelo" value={summaryData.model} icon="📝" />
                <DataField label="Tipo" value={summaryData.type} icon="🚙" />
                <DataField label="Año" value={summaryData.year} icon="📅" />
                <DataField label="Fabricacion" value={formatDate(summaryData.manufactured)} icon="🏭" />
                <DataField label="Compra" value={formatDate(summaryData.buyed)} icon="💰" />
                <DataField label="Origen" value={summaryData.origin} icon="🌍" />
              </div>
            </InfoCard>
          </div>

          {/* Vehicle Reference Details */}
          <div className="lg:col-span-4">
            <VehicleImageCard vehicleRefDetails={vehicleRefDetails} />
          </div>
        </div>
      </div>
    </div>
  )
}
