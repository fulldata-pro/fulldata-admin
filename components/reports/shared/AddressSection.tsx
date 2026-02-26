'use client'

import React from 'react'

interface Address {
  address?: string
  street?: string
  addressNumber?: string | null
  number?: string | null
  floor?: string | null
  appartment?: string | null
  apartment?: string | null
  city?: string
  province?: string
  postalCode?: string
  country?: string
  addressPhone?: string | null
  type?: string
}

interface AddressSectionProps {
  addresses: Address[]
  title: string
  showTitle?: boolean
  colorScheme?: 'emerald' | 'blue' | 'orange'
  showAddressType?: boolean
  sortByType?: boolean
}

export default function AddressSection({
  addresses,
  title,
  showTitle = true,
  colorScheme = 'emerald',
  showAddressType = false,
  sortByType = false
}: AddressSectionProps) {
  // Function to generate Google Maps URL
  const generateMapsUrl = (address: Address) => {
    const parts = []

    if (address.address || address.street) parts.push(address.address || address.street)
    if (address.addressNumber || address.number) parts.push(address.addressNumber || address.number)
    if (address.city) parts.push(address.city)
    if (address.province) parts.push(address.province)

    const query = parts.join(', ')
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
  }

  // Translate address type
  const translateAddressType = (type?: string) => {
    if (!type) return null
    const translations: Record<string, string> = {
      'MAIN': 'Principal',
      'LEGAL': 'Fiscal',
      'TAX': 'Fiscal',
      'OTHER': 'Alternativo',
      'OTHERS': 'Alternativo',
      'ALTERNATE': 'Alternativo',
      'HOME': 'Domicilio',
      'WORK': 'Laboral',
      'COMMERCIAL': 'Comercial',
    }
    return translations[type.toUpperCase()] || type
  }

  // Sort addresses if needed (LEGAL/MAIN first)
  const sortedAddresses = sortByType
    ? [...addresses].sort((a, b) => {
      const priorityTypes = ['LEGAL', 'TAX', 'MAIN']
      const aHasPriority = a.type && priorityTypes.includes(a.type.toUpperCase())
      const bHasPriority = b.type && priorityTypes.includes(b.type.toUpperCase())
      if (aHasPriority && !bHasPriority) return -1
      if (!aHasPriority && bHasPriority) return 1
      return 0
    })
    : addresses

  // Color scheme configuration
  const colors = {
    emerald: {
      gradient: 'from-emerald-500 via-emerald-400',
      badge: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      button: 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200',
      dot: 'bg-emerald-500',
      icon: 'text-emerald-600',
      iconBg: 'bg-emerald-100/50',
      border: 'border-emerald-100/40 hover:border-emerald-200/60'
    },
    blue: {
      gradient: 'from-blue-500 via-blue-400',
      badge: 'text-blue-700 bg-blue-50 border-blue-200',
      button: 'text-blue-700 bg-blue-50 hover:bg-blue-100 border-blue-200',
      dot: 'bg-blue-500',
      icon: 'text-blue-600',
      iconBg: 'bg-blue-100/50',
      border: 'border-blue-100/40 hover:border-blue-200/60'
    },
    orange: {
      gradient: 'from-orange-500 via-orange-400',
      badge: 'text-orange-700 bg-orange-50 border-orange-200',
      button: 'text-orange-700 bg-orange-50 hover:bg-orange-100 border-orange-200',
      dot: 'bg-orange-500',
      icon: 'text-orange-600',
      iconBg: 'bg-orange-100/50',
      border: 'border-orange-100/40 hover:border-orange-200/60'
    }
  }

  const color = colors[colorScheme]

  if (!addresses || addresses.length === 0) {
    return (
      <div>
        {showTitle && (
          <div className="mb-6">
            <h3 className="text-base font-medium text-gray-900 mb-2">
              {title}
            </h3>
            <div className={`h-0.5 bg-gradient-to-r ${color.gradient} to-transparent w-16`}></div>
          </div>
        )}
        <div className="text-center py-8">
          <i className="ki-duotone ki-geolocation text-4xl text-gray-300 mb-3">
            <span className="path1"></span>
            <span className="path2"></span>
          </i>
          <p className="text-sm font-medium text-gray-500">No se encontraron direcciones registradas</p>
        </div>
      </div>
    )
  }

  // Badge gradient based on color scheme
  const badgeGradient = {
    emerald: 'bg-gradient-to-r from-emerald-600 to-emerald-500',
    blue: 'bg-gradient-to-r from-blue-600 to-blue-500',
    orange: 'bg-gradient-to-r from-orange-600 to-orange-500'
  }

  return (
    <div>
      {showTitle && (
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-base font-medium text-gray-900">
              {title}
            </h3>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-sm text-white ${badgeGradient[colorScheme]}`}>
              {addresses.length}
            </span>
          </div>
          <div className={`h-0.5 bg-gradient-to-r ${color.gradient} to-transparent w-16`}></div>
        </div>
      )}

      <div className="space-y-4">
        {sortedAddresses.map((addr, idx) => {
          const addressLine = addr.address || addr.street || ''
          const addressNumber = addr.addressNumber || addr.number || ''
          const apartment = addr.appartment || addr.apartment || ''
          const isLegalType = addr.type && ['LEGAL', 'TAX'].includes(addr.type.toUpperCase())

          return (
            <div key={idx} className={`bg-white/40 backdrop-blur-sm border rounded-xl hover:shadow-md transition-all duration-200 ${
              showAddressType && isLegalType
                ? 'border-blue-100/40 hover:border-blue-200/60'
                : color.border
            }`}>
              {/* Header with address and map link */}
              <div className={`px-6 pt-5 pb-4 border-b ${
                showAddressType && isLegalType
                  ? 'border-blue-100/30'
                  : `border-${colorScheme}-100/30`
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      showAddressType && isLegalType
                        ? 'bg-blue-100/50 text-blue-600'
                        : `${color.iconBg} ${color.icon}`
                    }`}>
                      {showAddressType ? (
                        <i className="ki-duotone ki-home-2">
                          <span className="path1"></span>
                          <span className="path2"></span>
                        </i>
                      ) : (
                        <i className="ki-duotone ki-geolocation">
                          <span className="path1"></span>
                          <span className="path2"></span>
                        </i>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs font-bold uppercase tracking-wider ${
                          showAddressType && isLegalType
                            ? 'text-blue-700'
                            : color.icon
                        }`}>
                          Direccion {idx + 1}
                        </span>
                        {showAddressType && addr.type && (
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg backdrop-blur-lg shadow-sm ${
                            isLegalType
                              ? 'bg-blue-100/80 text-blue-800 border border-blue-200/50'
                              : 'bg-amber-100/80 text-amber-800 border border-amber-200/50'
                          }`}>
                            {translateAddressType(addr.type)}
                          </span>
                        )}
                      </div>
                      <h4 className="text-base font-bold text-gray-900 leading-snug">
                        {addressLine}
                        {addressNumber && ` ${addressNumber}`}
                        {addr.floor && `, Piso ${addr.floor}`}
                        {apartment && `, Depto ${apartment}`}
                      </h4>
                    </div>
                  </div>

                  {(addressLine && addr.city) && (
                    <a
                      href={generateMapsUrl(addr)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 text-xs font-bold border rounded-xl transition-all shadow-sm hover:shadow-md backdrop-blur-lg ${
                        showAddressType && isLegalType
                          ? 'text-blue-700 bg-blue-100/80 hover:bg-blue-200/80 border-blue-200/50'
                          : `${color.button} border-${colorScheme}-200/50`
                      }`}
                      title="Ver en Google Maps"
                    >
                      <i className="ki-duotone ki-map">
                        <span className="path1"></span>
                        <span className="path2"></span>
                        <span className="path3"></span>
                      </i>
                      Ver en mapa
                    </a>
                  )}
                </div>
              </div>

              {/* Address details */}
              <div className="px-6 py-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {addr.city && (
                    <div className="bg-white/30 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-200/30">
                      <span className="text-xs font-semibold text-gray-600 block mb-1">Ciudad</span>
                      <span className="text-sm font-bold text-gray-900">
                        {addr.city}
                      </span>
                    </div>
                  )}

                  {addr.province && (
                    <div className="bg-white/30 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-200/30">
                      <span className="text-xs font-semibold text-gray-600 block mb-1">Provincia</span>
                      <span className="text-sm font-bold text-gray-900">
                        {addr.province}
                      </span>
                    </div>
                  )}

                  {addr.postalCode && (
                    <div className="bg-white/30 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-200/30">
                      <span className="text-xs font-semibold text-gray-600 block mb-1">CP</span>
                      <span className="text-sm font-bold text-gray-900 font-mono">
                        {addr.postalCode}
                      </span>
                    </div>
                  )}

                  {addr.country && (
                    <div className="bg-white/30 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-200/30">
                      <span className="text-xs font-semibold text-gray-600 block mb-1">Pais</span>
                      <span className="text-sm font-bold text-gray-900">
                        {addr.country}
                      </span>
                    </div>
                  )}
                </div>

                {/* Phone number if available */}
                {addr.addressPhone && (
                  <div className="mt-4 pt-4 border-t border-gray-200/30">
                    <div className="flex items-center gap-3 bg-white/30 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-200/30">
                      <i className="ki-duotone ki-phone text-gray-500">
                        <span className="path1"></span>
                        <span className="path2"></span>
                      </i>
                      <span className="text-xs font-semibold text-gray-600 mr-2">Telefono:</span>
                      <span className="text-sm font-bold text-gray-900">{addr.addressPhone}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
