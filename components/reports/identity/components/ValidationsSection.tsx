'use client'

import React from 'react'
import { DiditSession } from '@/lib/types/report.types'

interface ValidationsSectionProps {
  data: DiditSession
}

interface ValidationItem {
  label: string
  status: string
  icon: string
  description?: string
}

export default function ValidationsSection({ data }: ValidationsSectionProps) {
  const translateStatus = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'Aprobado'
      case 'Declined':
        return 'Rechazado'
      case 'In Review':
        return 'En Revision'
      case 'Not Started':
        return 'No Iniciado'
      case 'Expired':
        return 'Expirado'
      case 'Not Finished':
        return 'No Finalizado'
      default:
        return status
    }
  }

  const validations: ValidationItem[] = [
    {
      label: 'Verificacion de Documento',
      status: data.id_verification?.status || 'Not Started',
      icon: 'document',
      description: 'Validacion de autenticidad del documento de identidad',
    },
    {
      label: 'Verificacion Biometrica',
      status: data.face_match?.status || 'Not Started',
      icon: 'profile-user',
      description: 'Comparacion facial entre documento y selfie',
    },
    {
      label: 'Prueba de Vida',
      status: data.liveness?.status || 'Not Started',
      icon: 'eye',
      description: 'Verificacion de que la persona esta presente',
    },
    {
      label: 'Analisis de IP',
      status: data.ip_analysis?.status || 'Not Started',
      icon: 'geolocation',
      description: 'Analisis de ubicacion y dispositivo',
    },
  ]

  if (data.aml) {
    validations.push({
      label: 'Deteccion AML',
      status: data.aml.status,
      icon: 'security-user',
      description: 'Verificacion contra listas de sanciones',
    })
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'Declined':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'In Review':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'Not Started':
        return 'bg-gray-50 border-gray-200 text-gray-800'
      case 'Expired':
        return 'bg-orange-50 border-orange-200 text-orange-800'
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved':
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      case 'Declined':
        return <div className="w-2 h-2 bg-red-500 rounded-full"></div>
      case 'In Review':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
      case 'Not Started':
        return <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
      default:
        return <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
    }
  }

  const getFeatureIcon = (icon: string) => {
    const iconClass = `ki-duotone ki-${icon} text-lg text-gray-600`
    return (
      <i className={iconClass}>
        <span className="path1"></span>
        <span className="path2"></span>
        <span className="path3"></span>
      </i>
    )
  }

  return (
    <div className="space-y-3">
      {validations.map((validation, index) => (
        <div
          key={index}
          className="group relative overflow-hidden bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-md transition-all duration-300"
        >
          {/* Gradient accent based on status */}
          <div
            className={`absolute left-0 top-0 bottom-0 w-1 ${
              validation.status === 'Approved'
                ? 'bg-gradient-to-b from-green-500 to-green-400'
                : validation.status === 'Declined'
                  ? 'bg-gradient-to-b from-red-500 to-red-400'
                  : validation.status === 'In Review'
                    ? 'bg-gradient-to-b from-yellow-500 to-yellow-400'
                    : 'bg-gradient-to-b from-gray-400 to-gray-300'
            }`}
          ></div>

          <div className="flex items-center justify-between pl-3">
            <div className="flex items-center gap-4 flex-1">
              {/* Icon container with background */}
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                  validation.status === 'Approved'
                    ? 'bg-green-50'
                    : validation.status === 'Declined'
                      ? 'bg-red-50'
                      : validation.status === 'In Review'
                        ? 'bg-yellow-50'
                        : 'bg-gray-50'
                }`}
              >
                {getFeatureIcon(validation.icon)}
              </div>

              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900 mb-0.5">{validation.label}</h4>
                {validation.description && <p className="text-xs text-gray-500">{validation.description}</p>}
              </div>
            </div>

            {/* Status badge */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${getStatusStyle(validation.status)}`}>
              {getStatusIcon(validation.status)}
              <span className="text-xs font-semibold whitespace-nowrap">{translateStatus(validation.status)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
