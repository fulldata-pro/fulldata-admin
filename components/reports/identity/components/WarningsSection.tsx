'use client'

import React from 'react'
import { DiditWarning } from '@/lib/types/report.types'

interface WarningSectionProps {
  warnings: DiditWarning[]
}

export default function WarningsSection({ warnings }: WarningSectionProps) {
  if (!warnings || warnings.length === 0) {
    return (
      <div className="text-center p-6 text-gray-500">
        <i className="ki-duotone ki-shield-tick text-lg text-green-600 mb-2">
          <span className="path1"></span>
          <span className="path2"></span>
          <span className="path3"></span>
        </i>
        <p className="text-sm">No se encontraron alertas</p>
      </div>
    )
  }

  const getRiskStyle = (risk: string, logType: string) => {
    if (logType === 'error') {
      return 'bg-red-50 border-red-200 text-red-800'
    }
    if (logType === 'warning') {
      return 'bg-yellow-50 border-yellow-200 text-yellow-800'
    }
    return 'bg-blue-50 border-blue-200 text-blue-800'
  }

  const getRiskIcon = (risk: string, logType: string) => {
    if (logType === 'error') {
      return <div className="w-2 h-2 bg-red-500 rounded-full"></div>
    }
    if (logType === 'warning') {
      return <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
    }
    return <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
  }

  const getFeatureLabel = (feature?: string) => {
    const featureMap: { [key: string]: string } = {
      ID_VERIFICATION: 'Verificacion de Documento',
      LIVENESS: 'Prueba de Vida',
      FACE_MATCH: 'Comparacion Facial',
      IP_ANALYSIS: 'Analisis de IP',
      AML: 'Deteccion AML',
    }
    return feature ? featureMap[feature] || feature : 'General'
  }

  const getRiskLabel = (risk: string) => {
    const riskMap: { [key: string]: string } = {
      POSSIBLE_DUPLICATED_USER: 'Posible Usuario Duplicado',
      DUPLICATED_FACE: 'Rostro Duplicado',
      BARCODE_NOT_DETECTED: 'Codigo de Barras No Detectado',
      DOCUMENT_QUALITY: 'Calidad del Documento',
      FACE_QUALITY: 'Calidad Facial',
      LIVENESS_QUALITY: 'Calidad de Prueba de Vida',
      IP_SUSPICIOUS: 'IP Sospechosa',
    }
    const translatedRisk = riskMap[risk]
    if (translatedRisk) return translatedRisk

    return risk
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/quality/g, 'calidad')
      .replace(/suspicious/g, 'sospechoso')
      .replace(/detected/g, 'detectado')
      .replace(/duplicated/g, 'duplicado')
      .replace(/possible/g, 'posible')
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h3 className="text-base font-medium text-gray-900 mb-2">Alertas y Advertencias</h3>
        <div className="h-0.5 bg-gradient-to-r from-rose-500 via-rose-400 to-transparent w-16"></div>
      </div>

      <div className="space-y-2">
        {warnings.map((warning, index) => (
          <div key={index} className={`border rounded-lg p-3 ${getRiskStyle(warning.risk, warning.log_type)}`}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">{getRiskIcon(warning.risk, warning.log_type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-sm font-medium">{getRiskLabel(warning.risk)}</h4>
                  {warning.feature && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-white/50 border">
                      {getFeatureLabel(warning.feature)}
                    </span>
                  )}
                </div>

                <p className="text-xs mb-2 opacity-90">{warning.short_description}</p>

                {warning.long_description && warning.long_description !== warning.short_description && (
                  <p className="text-xs opacity-75">{warning.long_description}</p>
                )}

                {warning.additional_data && (
                  <div className="mt-2 p-2 bg-white/30 rounded-md">
                    <h5 className="text-xs font-medium mb-1">Informacion Adicional:</h5>
                    <div className="text-xs space-y-1">
                      {Object.entries(warning.additional_data).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="opacity-75">
                            {key
                              .replace(/_/g, ' ')
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                            :
                          </span>
                          <span className="font-medium">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Total de alertas:</span>
          <span className="text-xs font-medium text-gray-900">{warnings.length}</span>
        </div>
      </div>
    </div>
  )
}
