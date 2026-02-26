'use client'

import React from 'react'
import { DiditSession, DiditSessionStatus } from '@/lib/types/report.types'
import StatusChip from './StatusChip'
import { formatDateTime } from '@/lib/utils/dateUtils'

interface IdentityStatusViewProps {
  identityData: DiditSession
}

export default function IdentityStatusView({ identityData }: IdentityStatusViewProps) {
  const getStatusConfig = (status: DiditSessionStatus | string) => {
    const statusLower = status?.toString().toLowerCase().replace(' ', '_')
    switch (statusLower) {
      case 'not_started':
        return {
          icon: 'clock',
          title: 'Validacion no iniciada',
          description: 'La validacion de identidad aun no ha comenzado',
          bgColor: 'bg-gray-50',
          iconColor: 'text-gray-500',
        }
      case 'in_progress':
        return {
          icon: 'timer',
          title: 'Validacion en progreso',
          description: 'Esperando que la validacion termine. Esto puede tomar algunos minutos.',
          bgColor: 'bg-blue-50',
          iconColor: 'text-blue-500',
        }
      case 'in_review':
        return {
          icon: 'search-files',
          title: 'En revision',
          description: 'La validacion esta siendo revisada manualmente por el equipo',
          bgColor: 'bg-yellow-50',
          iconColor: 'text-yellow-600',
        }
      case 'expired':
        return {
          icon: 'time',
          title: 'Sesion expirada',
          description: 'La sesion de validacion ha expirado. Se necesita iniciar una nueva validacion.',
          bgColor: 'bg-orange-50',
          iconColor: 'text-orange-600',
        }
      case 'kyc_expired':
        return {
          icon: 'calendar-remove',
          title: 'KYC expirado',
          description: 'La validacion KYC ha expirado y necesita ser renovada',
          bgColor: 'bg-red-50',
          iconColor: 'text-red-600',
        }
      case 'abandoned':
        return {
          icon: 'exit-right',
          title: 'Validacion abandonada',
          description: 'El proceso de validacion fue abandonado antes de completarse',
          bgColor: 'bg-gray-50',
          iconColor: 'text-gray-500',
        }
      default:
        return {
          icon: 'information',
          title: 'Estado desconocido',
          description: 'El estado de la validacion no es reconocido',
          bgColor: 'bg-gray-50',
          iconColor: 'text-gray-500',
        }
    }
  }

  const config = getStatusConfig(identityData.status)

  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className={`max-w-md w-full ${config.bgColor} rounded-xl border p-8 text-center`}>
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm">
            <i className={`ki-duotone ki-${config.icon} text-2xl ${config.iconColor}`}>
              <span className="path1"></span>
              <span className="path2"></span>
              <span className="path3"></span>
            </i>
          </div>
        </div>

        {/* Status */}
        <div className="mb-4">
          <StatusChip status={identityData.status} />
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold text-gray-900 mb-3">{config.title}</h2>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-6">{config.description}</p>

        {/* Session Info */}
        <div className="bg-white rounded-lg p-4 border">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">ID de Sesion:</span>
              <span className="font-medium text-gray-900 font-mono text-xs">{identityData.session_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Creado:</span>
              <span className="font-medium text-gray-900">{formatDateTime(identityData.created_at)}</span>
            </div>
            {identityData.features && identityData.features.length > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Caracteristicas:</span>
                <span className="font-medium text-gray-900">{identityData.features.join(', ')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress indicator for IN_PROGRESS */}
        {identityData.status?.toString().toUpperCase().replace(' ', '_') === 'IN_PROGRESS' && (
          <div className="mt-6">
            <div className="flex items-center justify-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <p className="text-xs text-blue-600 mt-2">Procesando...</p>
          </div>
        )}
      </div>
    </div>
  )
}
