'use client'

import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import { DiditIPAnalysis, DiditParsedAddress, DiditLocationsInfo } from '@/lib/types/report.types'
import StatusChip from './StatusChip'

// Dynamic import for the map component to avoid SSR issues with amcharts
const LocationMapSection = dynamic(() => import('./LocationMapSection'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
      <span className="text-gray-400">Cargando mapa...</span>
    </div>
  )
})

interface LocationInfoSectionProps {
  ip_analysis: DiditIPAnalysis | null
  parsed_address?: DiditParsedAddress | null
  locations_info?: DiditLocationsInfo | null
}

export default function LocationInfoSection({ ip_analysis, parsed_address, locations_info }: LocationInfoSectionProps) {
  const [copied, setCopied] = useState(false)

  if (!ip_analysis) return null

  const handleCopyIP = () => {
    navigator.clipboard.writeText(ip_analysis.ip_address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getFlagEmoji = (countryCode: string) => {
    const flags: { [key: string]: string } = {
      AR: 'AR',
      US: 'US',
      BR: 'BR',
      CL: 'CL',
      CO: 'CO',
      MX: 'MX',
      PE: 'PE',
      UY: 'UY',
      PY: 'PY',
      EC: 'EC',
      BO: 'BO',
      VE: 'VE',
    }
    return flags[countryCode] || countryCode
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg font-medium bg-gray-100 px-2 py-1 rounded">
            {getFlagEmoji(ip_analysis.ip_country_code)}
          </span>
          <div>
            <h3 className="text-sm font-medium text-gray-900">Analisis de IP</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">IP: {ip_analysis.ip_address}</span>
              <button
                onClick={handleCopyIP}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Copiar IP"
              >
                {copied ? (
                  <i className="ki-duotone ki-check text-lg text-green-600">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                ) : (
                  <i className="ki-duotone ki-copy text-lg">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                )}
              </button>
            </div>
          </div>
        </div>
        <StatusChip status={ip_analysis.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Location and Device Info */}
        <div className="space-y-6">
          {/* Location Information */}
          <div>
            <div className="mb-6">
              <h3 className="text-base font-medium text-gray-900 mb-2">Informacion de Ubicacion</h3>
              <div className="h-0.5 bg-gradient-to-r from-lime-500 via-lime-400 to-transparent w-16"></div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-600">Pais:</span>
                <span className="text-sm text-gray-900 font-medium">{ip_analysis.ip_country}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-600">Estado/Region:</span>
                <span className="text-sm text-gray-900 font-medium">{ip_analysis.ip_state}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-600">Ciudad:</span>
                <span className="text-sm text-gray-900 font-medium">{ip_analysis.ip_city}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-600">ISP:</span>
                <span className="text-sm text-gray-900 font-medium">{ip_analysis.isp}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-600">Zona Horaria:</span>
                <span className="text-sm text-gray-900 font-medium">{ip_analysis.time_zone}</span>
              </div>
            </div>
          </div>

          {/* Device Information */}
          <div>
            <div className="mb-6">
              <h3 className="text-base font-medium text-gray-900 mb-2">Informacion del Dispositivo</h3>
              <div className="h-0.5 bg-gradient-to-r from-purple-500 via-purple-400 to-transparent w-16"></div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-600">Plataforma:</span>
                <span className="text-sm text-gray-900 font-medium">
                  {ip_analysis.platform === 'desktop'
                    ? 'Escritorio'
                    : ip_analysis.platform === 'mobile'
                      ? 'Movil'
                      : ip_analysis.platform === 'tablet'
                        ? 'Tablet'
                        : ip_analysis.platform}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-600">Sistema Operativo:</span>
                <span className="text-sm text-gray-900 font-medium">{ip_analysis.os_family}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-600">Marca:</span>
                <span className="text-sm text-gray-900 font-medium">{ip_analysis.device_brand}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-600">Modelo:</span>
                <span className="text-sm text-gray-900 font-medium">{ip_analysis.device_model}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-600">Navegador:</span>
                <span className="text-sm text-gray-900 font-medium">{ip_analysis.browser_family}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security Indicators */}
        <div className="space-y-6">
          <div>
            <div className="mb-6">
              <h3 className="text-base font-medium text-gray-900 mb-2">Indicadores de Seguridad</h3>
              <div className="h-0.5 bg-gradient-to-r from-orange-500 via-orange-400 to-transparent w-16"></div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">VPN/Proxy/Tor:</span>
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                    ip_analysis.is_vpn_or_tor
                      ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                      : 'bg-green-100 text-green-800 border border-green-200'
                  }`}
                >
                  {ip_analysis.is_vpn_or_tor ? (
                    <>
                      <i className="ki-duotone ki-shield-cross text-lg">
                        <span className="path1"></span>
                        <span className="path2"></span>
                        <span className="path3"></span>
                      </i>
                      Detectado
                    </>
                  ) : (
                    <>
                      <i className="ki-duotone ki-shield-tick text-lg">
                        <span className="path1"></span>
                        <span className="path2"></span>
                        <span className="path3"></span>
                      </i>
                      No detectado
                    </>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Centro de Datos:</span>
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                    ip_analysis.is_data_center
                      ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                      : 'bg-green-100 text-green-800 border border-green-200'
                  }`}
                >
                  {ip_analysis.is_data_center ? 'Si' : 'No'}
                </span>
              </div>
            </div>
          </div>

          {/* Coordinates */}
          {ip_analysis.latitude && ip_analysis.longitude && (
            <div>
              <div className="mb-6">
                <h3 className="text-base font-medium text-gray-900 mb-2">Coordenadas</h3>
                <div className="h-0.5 bg-gradient-to-r from-emerald-500 via-emerald-400 to-transparent w-16"></div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-gray-500">Latitud</span>
                    <p className="text-sm font-mono text-gray-900">{ip_analysis.latitude.toFixed(6)}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Longitud</span>
                    <p className="text-sm font-mono text-gray-900">{ip_analysis.longitude.toFixed(6)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Map Section */}
      {locations_info && (
        <div className="mt-6">
          <div className="mb-4">
            <h3 className="text-base font-medium text-gray-900 mb-2">Mapa de Ubicaciones</h3>
            <div className="h-0.5 bg-gradient-to-r from-blue-500 via-blue-400 to-transparent w-16"></div>
          </div>
          <LocationMapSection
            locations_info={locations_info}
            parsed_address={parsed_address || undefined}
            ip_analysis={ip_analysis}
          />
        </div>
      )}
    </div>
  )
}
