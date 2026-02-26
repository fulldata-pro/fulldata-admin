'use client'

import React from 'react'
import { formatDate, calculateAge } from '@/lib/utils/dateUtils'
import {
  translateRelationship,
  translateSex,
  getRelationshipStyle
} from '@/lib/constants/relationshipConstants'
import InfoTooltip from '@/components/reports/shared/InfoTooltip'

interface BondItem {
  name: string
  taxId: number | { $numberLong: string } | string
  relation: string
  sex: string
  age?: number | null
  birthDate?: number | { $numberLong: string } | { $date: string } | null
}

interface BondsData {
  main?: BondItem[]
  others?: BondItem[]
}

interface BondsSectionProps {
  bondsData: BondsData
}

export default function BondsSection({ bondsData }: BondsSectionProps) {
  const formatLocalDate = (timestamp: number | { $numberLong: string } | { $date: string } | null | undefined) => {
    const formatted = formatDate(timestamp)
    return formatted === 'No disponible' ? 'N/A' : formatted
  }

  const formatTaxId = (taxId: number | { $numberLong: string } | string) => {
    if (typeof taxId === 'object' && '$numberLong' in taxId) {
      return taxId.$numberLong
    }
    return String(taxId)
  }

  const getAge = (ageFromData: number | null | undefined, birthDate: number | { $numberLong: string } | { $date: string } | null | undefined): string => {
    // Use provided age if available
    if (ageFromData !== null && ageFromData !== undefined) {
      return `${ageFromData} años`
    }

    // Calculate age from birth date if available
    if (birthDate) {
      const calculatedAge = calculateAge(birthDate)
      if (calculatedAge !== null) {
        return `${calculatedAge} años`
      }
    }

    return 'N/A'
  }

  // Combinar todos los vinculos en un solo array
  const allBonds = [
    ...(bondsData.main || []),
    ...(bondsData.others || [])
  ]

  const isEmpty = allBonds.length === 0

  if (isEmpty) {
    return (
      <div>
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-base font-medium text-gray-900">Vinculos Familiares</h3>
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
              0
            </span>
          </div>
          <div className="h-0.5 bg-gradient-to-r from-lime-500 via-lime-400 to-transparent w-16"></div>
        </div>
        <div className="text-center py-8">
          <i className="ki-duotone ki-people text-4xl text-gray-300 mb-3">
            <span className="path1"></span>
            <span className="path2"></span>
            <span className="path3"></span>
            <span className="path4"></span>
            <span className="path5"></span>
          </i>
          <p className="text-sm font-medium text-gray-500">No se encontraron vinculos registrados</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Vinculos Familiares Unificados */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-base font-medium text-gray-900">Vinculos Familiares</h3>
          <InfoTooltip content="Relaciones familiares registradas oficialmente" />
          <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
            {allBonds.length}
          </span>
        </div>
        <div className="h-0.5 bg-gradient-to-r from-lime-500 via-lime-400 to-transparent w-16"></div>
      </div>
      <div className="space-y-4">
        {allBonds.map((bond, idx) => {
          const relationshipStyle = getRelationshipStyle(bond.relation, bond.sex)
          const translatedRelation = translateRelationship(bond.relation, bond.sex)

          return (
            <div key={idx} className="bg-gradient-to-br from-pink-50/30 to-pink-50/20 backdrop-blur-lg border border-pink-100/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  relationshipStyle.icon === 'heart' ? 'bg-pink-100' : 'bg-blue-100'
                }`}>
                  {relationshipStyle.icon === 'heart' ? (
                    <i className="ki-duotone ki-heart text-xl text-pink-600">
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                  ) : (
                    <i className="ki-duotone ki-profile-user text-xl text-blue-600">
                      <span className="path1"></span>
                      <span className="path2"></span>
                      <span className="path3"></span>
                      <span className="path4"></span>
                    </i>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-4">
                    <h4 className="font-semibold text-gray-800 text-base">
                      {bond.name}
                    </h4>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${relationshipStyle.colorClasses}`}>
                      {translatedRelation}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-gray-500 text-xs block mb-1">DNI/CUIL</span>
                      <span className="text-gray-800 font-medium font-mono">{formatTaxId(bond.taxId)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs block mb-1">Sexo</span>
                      <span className="text-gray-800 font-medium">{translateSex(bond.sex)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs block mb-1">Edad</span>
                      <span className="text-gray-800 font-medium">{getAge(bond.age, bond.birthDate)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs block mb-1">Fecha de nacimiento</span>
                      <span className="text-gray-800 font-medium">{formatLocalDate(bond.birthDate)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
