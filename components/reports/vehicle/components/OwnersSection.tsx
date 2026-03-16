'use client'

import React from 'react'
import OwnerCard from './OwnerCard'
import { VehicleOwnerData } from '@/lib/types/report.types'

interface OwnersSectionProps {
  ownersData: VehicleOwnerData[]
}

export default function OwnersSection({ ownersData }: OwnersSectionProps) {
  if (!ownersData || ownersData.length === 0) return null

  return (
    <div className="space-y-6">
      <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
        <div className="mb-6">
          <h2 className="text-2xl font-medium text-gray-900 mb-2">
            Propietarios
          </h2>
          <div className="h-0.5 bg-gradient-to-r from-rose-500 via-rose-400 to-transparent w-24"></div>
        </div>
        <span className="text-xs font-semibold text-gray-700 bg-slate-50 px-3 py-1.5 rounded-full border border-gray-200">
          {ownersData.length} propietario{ownersData.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className={`grid grid-cols-1 ${ownersData.length > 1 ? 'lg:grid-cols-2' : ''} gap-6`}>
        {ownersData.map((owner: VehicleOwnerData, index: number) => (
          <OwnerCard
            key={index}
            owner={owner}
            index={index}
          />
        ))}
      </div>
    </div>
  )
}
