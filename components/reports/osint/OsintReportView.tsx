'use client'

import React, { useState, useMemo } from 'react'
import { ReportResponse, OsintData } from '@/lib/types/report.types'
import Image from 'next/image'
import OsintMap from './OsintMap'

interface OsintReportViewProps {
  reportData: ReportResponse
  osintData: OsintData[]
  activeSection?: string
  onSectionChange?: (section: string) => void
}

// Utility: Clickable URL component
const ClickableUrl = ({ url, children, className = "" }: { url: string, children: React.ReactNode, className?: string }) => {
  const isValidUrl = (str: string): boolean => {
    try {
      new URL(str)
      return true
    } catch {
      return false
    }
  }

  if (!url || !isValidUrl(url)) {
    return <span className={className}>{children}</span>
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`text-blue-600 hover:text-blue-700 hover:underline transition-colors ${className}`}
    >
      {children}
    </a>
  )
}

// Data Field Component
const DataField = ({
  label,
  value,
  icon,
  isUrl = false,
  className = ""
}: {
  label: string
  value: any
  icon?: string
  isUrl?: boolean
  className?: string
}) => {
  if (!value || value === '' || value === 'N/A') return null

  const displayValue = typeof value === 'object' ? JSON.stringify(value) : String(value)

  return (
    <div className={`flex items-center justify-between py-2 px-3 bg-white bg-opacity-50 rounded-lg hover:bg-opacity-80 transition-all duration-200 ${className}`}>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {icon && <span className="text-sm">{icon}</span>}
        <span className="text-sm text-gray-700 font-medium truncate">
          {label}
        </span>
      </div>
      <div className="text-sm text-gray-900 font-semibold ml-3 max-w-48 truncate text-right">
        {isUrl ? (
          <ClickableUrl url={displayValue}>
            <span className="flex items-center gap-1">
              <span className="truncate">{displayValue.replace(/^https?:\/\//, '')}</span>
            </span>
          </ClickableUrl>
        ) : (
          displayValue
        )}
      </div>
    </div>
  )
}

export default function OsintReportView({
  reportData,
  osintData
}: OsintReportViewProps) {

  // Search state
  const [searchTerm, setSearchTerm] = useState('')

  const getModuleSize = (module: any): 'small' | 'medium' | 'large' | 'wide' | 'tall' | 'featured' => {
    if (module.status !== 'found') return 'small'

    const hasData = module.data && Object.keys(module.data).length > 0
    const hasSchemas = module.front_schemas && module.front_schemas.length > 0
    const hasSpecFormat = module.spec_format && module.spec_format.length > 0
    const hasImage = module.front_schemas && module.front_schemas.some((schema: any) => schema.image)
    const moduleName = module.module?.toLowerCase() || ''

    if (!hasData && !hasSchemas && !hasSpecFormat) return 'small'

    const dataCount = hasData ? Object.keys(module.data).length : 0
    const schemasCount = hasSchemas ? module.front_schemas.length : 0
    const specCount = hasSpecFormat ? module.spec_format.length : 0
    const totalItems = dataCount + schemasCount + specCount

    // Featured modules (full width) - most important platforms
    if (moduleName.includes('github') || moduleName.includes('linkedin') ||
      moduleName.includes('facebook') || moduleName.includes('twitter')) {
      return 'featured'
    }

    // Wide modules (2 columns) - platforms with rich content
    if (totalItems >= 10 || moduleName.includes('maps') || moduleName.includes('google') ||
      moduleName.includes('instagram') || moduleName.includes('youtube')) {
      return 'wide'
    }

    // Tall modules (extra height) - visual content
    if (hasImage && totalItems >= 6) {
      return 'tall'
    }

    // Large modules (standard size)
    if (totalItems >= 8) {
      return 'large'
    }

    // Medium modules
    if (totalItems >= 4) {
      return 'medium'
    }

    // Small modules
    return 'small'
  }

  const getBrandImage = (moduleName: string) => {
    try {
      // Special handling for Google services
      if (moduleName.toLowerCase().includes('google') || moduleName.toLowerCase().includes('maps')) {
        return '/images/brands/google.png'
      }
      return `/images/brands/${moduleName.toLowerCase()}.png`
    } catch {
      return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'found': return 'emerald'
      case 'not_found': return 'gray'
      default: return 'gray'
    }
  }

  const isUrl = (str: string): boolean => {
    if (typeof str !== 'string') return false
    return /^https?:\/\/.+/.test(str) || /^www\..+/.test(str) || str.includes('.com') || str.includes('.org') || str.includes('.net')
  }

  const formatValue = (value: any): { display: string, isUrl: boolean } => {
    if (typeof value === 'boolean') return { display: value ? 'Si' : 'No', isUrl: false }
    if (typeof value === 'number') return { display: value.toLocaleString(), isUrl: false }
    if (typeof value === 'string') {
      return { display: value, isUrl: isUrl(value) }
    }
    if (Array.isArray(value)) {
      if (value.length === 0) return { display: 'Sin datos', isUrl: false }
      if (value.length <= 3) return { display: value.join(', '), isUrl: false }
      return { display: `${value.slice(0, 3).join(', ')} y ${value.length - 3} mas`, isUrl: false }
    }
    if (typeof value === 'object' && value !== null) {
      const entries = Object.entries(value)
      if (entries.length === 0) return { display: 'Sin datos', isUrl: false }
      if (entries.length === 1) return { display: String(entries[0][1]), isUrl: false }
      return { display: `${entries.length} campos`, isUrl: false }
    }
    return { display: String(value), isUrl: false }
  }

  const formatFieldName = (key: string): string => {
    const fieldMappings: Record<string, string> = {
      'username': 'Usuario',
      'email': 'Correo Electronico',
      'name': 'Nombre',
      'displayName': 'Nombre Mostrado',
      'firstName': 'Nombre',
      'lastName': 'Apellido',
      'fullName': 'Nombre Completo',
      'phone': 'Telefono',
      'phoneNumber': 'Numero de Telefono',
      'address': 'Direccion',
      'location': 'Ubicacion',
      'city': 'Ciudad',
      'country': 'Pais',
      'company': 'Empresa',
      'jobTitle': 'Cargo',
      'title': 'Titulo',
      'headline': 'Descripcion',
      'bio': 'Biografia',
      'description': 'Descripcion',
      'website': 'Sitio Web',
      'url': 'URL',
      'avatar': 'Avatar',
      'profilePicture': 'Foto de Perfil',
      'followers': 'Seguidores',
      'following': 'Siguiendo',
      'posts': 'Publicaciones',
      'connections': 'Conexiones',
      'connectionCount': 'Conexiones',
      'verified': 'Verificado',
      'public': 'Publico',
      'private': 'Privado',
      'active': 'Activo',
      'createdAt': 'Fecha de Creacion',
      'updatedAt': 'Ultima Actualizacion',
      'lastSeen': 'Ultima Vez Visto',
      'joinDate': 'Fecha de Registro',
      'dateJoined': 'Fecha de Registro',
      'birthday': 'Fecha de Nacimiento',
      'age': 'Edad',
      'gender': 'Genero',
      'education': 'Educacion',
      'work': 'Trabajo',
      'skills': 'Habilidades',
      'languages': 'Idiomas',
      'interests': 'Intereses',
      'socialMedia': 'Redes Sociales',
      'linkedinUrl': 'LinkedIn',
      'twitterUrl': 'Twitter',
      'facebookUrl': 'Facebook',
      'instagramUrl': 'Instagram',
      'githubUrl': 'GitHub',
      'profileUrl': 'URL de Perfil',
      'profile_url': 'URL de Perfil',
      'pictureUrl': 'Foto de Perfil',
      'picture_url': 'Foto de Perfil',
      'creation_date': 'Fecha de Creacion',
      'last_seen': 'Ultima Vez Visto',
      'platform': 'Plataforma',
      'id': 'ID',
      'membershipNumber': 'Numero de Membresia',
      'membership_number': 'Numero de Membresia',
      'phoneHint': 'Pista de Telefono',
      'phone_hint': 'Pista de Telefono',
      'topLanguage': 'Lenguaje Principal',
      'top_language': 'Lenguaje Principal',
      'Top Language': 'Lenguaje Principal',
      'externalContributions': 'Contribuciones Externas',
      'external_contributions': 'Contribuciones Externas',
      'External Contributions': 'Contribuciones Externas',
      'extractedNames': 'Nombres Extraidos',
      'extracted_names': 'Nombres Extraidos',
      'Extracted Names': 'Nombres Extraidos',
      'gists': 'Gists',
      'Gists': 'Gists',
      'starredGists': 'Gists Destacados',
      'starred_gists': 'Gists Destacados',
      'Starred Gists': 'Gists Destacados',
    }

    if (fieldMappings[key]) {
      return fieldMappings[key]
    }

    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim()
  }

  const getFieldIcon = (key: string) => {
    const iconMappings: Record<string, any> = {
      'email': '📧',
      'phone': '📱',
      'phoneNumber': '📱',
      'location': '📍',
      'address': '📍',
      'city': '🏙️',
      'country': '🌍',
      'company': '🏢',
      'website': '🌐',
      'url': '🔗',
      'verified': '✅',
      'birthday': '🎂',
      'education': '🎓',
      'work': '💼',
      'skills': '⚡',
      'languages': '🗣️',
      'followers': '👥',
      'following': '👥',
      'connections': '🤝',
      'profileUrl': '🔗',
      'profile_url': '🔗',
      'pictureUrl': '📷',
      'picture_url': '📷',
      'id': '🆔',
      'creation_date': '📅',
      'last_seen': '👁️',
      'membershipNumber': '🎫',
      'membership_number': '🎫',
      'phoneHint': '📱',
      'phone_hint': '📱',
    }

    return iconMappings[key] || null
  }

  const renderSpecFormatData = (specData: any) => {
    if (!specData || !Array.isArray(specData) || specData.length === 0) return null

    const mainData = specData[0] || {}
    const dataEntries = Object.entries(mainData).filter(([key]) =>
      key !== 'platform_variables' && key !== 'registered'
    )

    const platformVariables = mainData.platform_variables || []
    const allEntries = [...dataEntries, ...platformVariables]

    if (allEntries.length === 0) return null

    const priorityFields = ['name', 'first_name', 'last_name', 'username', 'email', 'phone_hint', 'location', 'bio', 'headline', 'profile_url', 'picture_url']

    const sortedEntries = allEntries.sort((a, b) => {
      const keyA = a.key || a[0]
      const keyB = b.key || b[0]
      const priorityA = priorityFields.indexOf(keyA)
      const priorityB = priorityFields.indexOf(keyB)

      if (priorityA !== -1 && priorityB !== -1) return priorityA - priorityB
      if (priorityA !== -1) return -1
      if (priorityB !== -1) return 1
      return 0
    })

    return (
      <div className="space-y-3">
        <div className="text-sm font-semibold text-gray-900 mb-3">
          Informacion Verificada
        </div>
        <div className="grid grid-cols-1 gap-2">
          {sortedEntries.slice(0, 12).map((entry, idx) => {
            const isVariable = 'key' in entry
            const key = isVariable ? entry.key : entry[0]
            const value = isVariable ? entry.value : entry[1]?.value || entry[1]
            const properKey = isVariable ? entry.proper_key : entry[1]?.proper_key || formatFieldName(key)

            if (!value || (typeof value === 'object' && Object.keys(value).length === 0)) return null

            const icon = getFieldIcon(key)
            const formatted = formatValue(value)

            return (
              <div key={`spec-${idx}`} className="flex items-center justify-between py-2 px-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {icon && <span className="text-sm">{icon}</span>}
                  <span className="text-sm text-blue-800 font-medium truncate">
                    {properKey}
                  </span>
                </div>
                <span className="text-sm text-blue-900 font-semibold ml-3 max-w-48 truncate text-right">
                  {formatted.isUrl ? (
                    <ClickableUrl url={formatted.display}>
                      <span className="flex items-center gap-1">
                        <span className="truncate">{formatted.display.replace(/^https?:\/\//, '')}</span>
                      </span>
                    </ClickableUrl>
                  ) : (
                    formatted.display
                  )}
                </span>
              </div>
            )
          }).filter(Boolean)}
        </div>
        {sortedEntries.length > 12 && (
          <details className="mt-3">
            <summary className="cursor-pointer text-xs text-blue-600 hover:text-blue-700 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200 hover:border-blue-300 transition-all duration-200">
              <span>Ver {sortedEntries.length - 12} campos adicionales</span>
            </summary>
            <div className="mt-2 grid grid-cols-1 gap-2">
              {sortedEntries.slice(12).map((entry, idx) => {
                const isVariable = 'key' in entry
                const key = isVariable ? entry.key : entry[0]
                const value = isVariable ? entry.value : entry[1]?.value || entry[1]
                const properKey = isVariable ? entry.proper_key : entry[1]?.proper_key || formatFieldName(key)

                if (!value || (typeof value === 'object' && Object.keys(value).length === 0)) return null

                const icon = getFieldIcon(key)
                const formatted = formatValue(value)

                return (
                  <div key={`spec-extra-${idx}`} className="flex items-center justify-between py-2 px-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {icon && <span className="text-sm">{icon}</span>}
                      <span className="text-sm text-blue-800 font-medium truncate">
                        {properKey}
                      </span>
                    </div>
                    <span className="text-sm text-blue-900 font-semibold ml-3 max-w-48 truncate text-right">
                      {formatted.isUrl ? (
                        <ClickableUrl url={formatted.display}>
                          <span className="flex items-center gap-1">
                            <span className="truncate">{formatted.display.replace(/^https?:\/\//, '')}</span>
                          </span>
                        </ClickableUrl>
                      ) : (
                        formatted.display
                      )}
                    </span>
                  </div>
                )
              }).filter(Boolean)}
            </div>
          </details>
        )}
      </div>
    )
  }

  const renderModuleContent = (module: any) => {
    const content = []

    // Render spec_format data first (most reliable)
    const specContent = renderSpecFormatData(module.spec_format)
    if (specContent) {
      content.push(specContent)
    }

    // Add category information
    if (module.category) {
      content.push(
        <div key="category" className="space-y-2">
          <div className="text-sm font-semibold text-gray-900 mb-2">
            Categoria de Plataforma
          </div>
          <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-purple-700 font-semibold text-sm">{module.category.name}</span>
            </div>
            <p className="text-xs text-purple-600">{module.category.description}</p>
          </div>
        </div>
      )
    }

    // Add query information
    if (module.query && module.from) {
      content.push(
        <div key="query" className="space-y-2">
          <div className="text-sm font-semibold text-gray-900 mb-2">
            Informacion de Busqueda
          </div>
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 font-medium">Consulta realizada:</span>
              <span className="text-xs text-gray-900 font-semibold">{module.query}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 font-medium">Fuente:</span>
              <span className="text-xs text-gray-900 font-semibold">{module.from}</span>
            </div>
          </div>
        </div>
      )
    }

    // Add front_schemas if available
    if (module.front_schemas && module.front_schemas.length > 0) {
      const schemas = module.front_schemas.filter((schema: any) =>
        (schema.body && Object.keys(schema.body).length > 0) ||
        (schema.tags && schema.tags.length > 0) ||
        schema.image
      )

      if (schemas.length > 0) {
        content.push(
          <div key="schemas" className="space-y-3">
            <div className="text-sm font-semibold text-gray-900 mb-3">
              Informacion Adicional
            </div>
            {schemas.map((schema: any, idx: number) => (
              <div key={idx} className="bg-gradient-to-br from-green-50/50 to-emerald-50/30 rounded-xl p-4 space-y-3 border border-green-100/50">
                {schema.image && (
                  <div className="flex items-center gap-3">
                    <img
                      src={schema.image}
                      alt={schema.module}
                      className="w-8 h-8 rounded-lg object-cover"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                    <span className="text-sm font-medium text-green-800">{schema.module}</span>
                  </div>
                )}
                {schema.body && typeof schema.body === 'object' && Object.keys(schema.body).length > 0 && (
                  <div className="space-y-2">
                    {Object.entries(schema.body as Record<string, any>).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between py-1.5 px-2 bg-green-50 rounded">
                        <span className="text-xs text-green-700 font-medium">{formatFieldName(key)}</span>
                        <span className="text-xs text-green-900 font-semibold">{formatValue(value).display}</span>
                      </div>
                    ))}
                  </div>
                )}
                {schema.tags && schema.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {schema.tags.map((tag: any, tagIdx: number) => (
                      <span key={tagIdx} className="text-xs bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-2 py-1 rounded-md border border-green-200 font-medium">
                        {tag.tag}
                      </span>
                    ))}
                  </div>
                )}
                {schema.timeline && (
                  <div className="space-y-1 pt-2 border-t border-green-100">
                    <div className="text-xs font-medium text-green-800 mb-1">Cronologia</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {schema.timeline.registered && (
                        <div className="text-green-700">
                          <span className="font-medium">Registrado:</span> <span className="text-green-600">Si</span>
                        </div>
                      )}
                      {schema.timeline.last_seen && (
                        <div className="text-green-700">
                          <span className="font-medium">Ultima actividad:</span> <span className="text-green-600">Detectada</span>
                        </div>
                      )}
                      {schema.timeline.registered_date && (
                        <div className="text-green-700 col-span-2">
                          <span className="font-medium">Fecha de registro:</span> <span className="text-green-600">{formatValue(schema.timeline.registered_date).display}</span>
                        </div>
                      )}
                      {schema.timeline.last_seen_date && (
                        <div className="text-green-700 col-span-2">
                          <span className="font-medium">Ultima vez visto:</span> <span className="text-green-600">{formatValue(schema.timeline.last_seen_date).display}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      }
    }

    return content
  }

  const renderHibpModule = (module: any) => {
    const brandImage = getBrandImage(module.module)
    const statusColor = getStatusColor(module.status)

    // Extract HIBP specific data
    const hibpData = module.front_schemas || []
    const breaches = hibpData.filter((schema: any) => schema.tags && schema.tags.length > 0)

    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-rose-200/50 hover:border-rose-300/60 hover:shadow-xl transition-all duration-300 overflow-hidden shadow-lg shadow-slate-900/5">
        {/* Header */}
        <div className="p-5 border-b border-rose-100/50 bg-gradient-to-r from-rose-50/30 to-rose-100/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-rose-50/50 to-rose-100/50 rounded-xl flex items-center justify-center overflow-hidden border border-rose-200/30 flex-shrink-0 shadow-sm">
              {brandImage ? (
                <Image
                  src={brandImage}
                  alt={module.module}
                  width={32}
                  height={32}
                  className="object-contain"
                  unoptimized
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement
                    target.style.display = 'none'
                    const nextElement = target.nextElementSibling as HTMLElement
                    if (nextElement) nextElement.style.display = 'flex'
                  }}
                />
              ) : null}
              <div className={`w-7 h-7 ${brandImage ? 'hidden' : 'flex'} items-center justify-center`}>
                <i className="ki-duotone ki-shield-cross text-xl text-red-600">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-gray-900 capitalize">
                  {module.module}
                </h3>
                <div className={`w-2.5 h-2.5 rounded-full ${statusColor === 'emerald' ? 'bg-emerald-500' : 'bg-gray-400'} shadow-sm`} />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-rose-700 mt-1">
                <i className="ki-duotone ki-shield-cross text-sm">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
                <span className="font-medium">
                  {breaches.length > 0
                    ? `${breaches.length} filtracion${breaches.length !== 1 ? 'es' : ''} encontrada${breaches.length !== 1 ? 's' : ''}`
                    : 'Verificacion de seguridad'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 bg-gradient-to-b from-white/50 to-slate-50/20">
          {breaches.length > 0 ? (
            <div className="space-y-3">
              <div className="text-sm font-semibold text-gray-900 mb-3">
                Filtraciones Detectadas
              </div>

              {breaches.map((breach: any, idx: number) => (
                <div key={idx} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-rose-200/30 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left: Service Info */}
                    <div className="lg:col-span-4">
                      <div className="flex items-start gap-4">
                        {breach.image && typeof breach.image === 'string' ? (
                          <img
                            src={breach.image}
                            alt={breach.module || 'Breach'}
                            width={40}
                            height={40}
                            className="object-contain rounded-lg flex-shrink-0 bg-gray-50 p-1"
                            onError={(e) => {
                              const target = e.currentTarget as HTMLImageElement
                              target.style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <i className="ki-duotone ki-bank text-xl text-red-600">
                              <span className="path1"></span>
                              <span className="path2"></span>
                            </i>
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-red-900 text-lg mb-2">
                            {breach.body?.Title || breach.body?.title || (typeof breach.module === 'string' ? breach.module : 'Servicio Comprometido')}
                          </h4>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {breach.body?.Description ?
                              breach.body.Description :
                              breach.body?.Domain ?
                                `Dominio: ${breach.body.Domain}` :
                                'Informacion comprometida detectada'
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Center: Breach Details */}
                    <div className="lg:col-span-5">
                      {breach.body && typeof breach.body === 'object' && Object.keys(breach.body).length > 0 && (
                        <div className="space-y-3">
                          <h5 className="font-medium text-gray-900 text-sm mb-3">Detalles de la Filtracion</h5>
                          {Object.entries(breach.body as Record<string, any>)
                            .filter(([key]) => key !== 'Title' && key !== 'title' && key !== 'Description')
                            .map(([key, value]) => (
                              <div key={key} className="flex justify-between items-start py-2 px-3 bg-gray-50 rounded-lg">
                                <span className="text-sm text-gray-600 font-medium">
                                  {key === 'Title' ? 'Nombre del Servicio' :
                                    key === 'BreachDate' ? 'Fecha de la Filtracion' :
                                      key === 'DataClasses' ? 'Tipos de Datos Comprometidos' :
                                        key === 'PwnCount' ? 'Total de Cuentas Afectadas' :
                                          key === 'Description' ? 'Descripcion' :
                                            key === 'Domain' ? 'Dominio' :
                                              key === 'AddedDate' ? 'Fecha de Adicion' :
                                                key === 'ModifiedDate' ? 'Fecha de Modificacion' :
                                                  key === 'LogoPath' ? 'Logo' :
                                                    key === 'IsVerified' ? 'Verificado' :
                                                      key === 'IsFabricated' ? 'Fabricado' :
                                                        key === 'IsSensitive' ? 'Sensible' :
                                                          key === 'IsRetired' ? 'Retirado' :
                                                            key === 'IsSpamList' ? 'Lista de Spam' :
                                                              key === 'IsMalware' ? 'Malware' :
                                                                key === 'IsSubscriptionFree' ? 'Gratuito' :
                                                                  key.replace(/([A-Z])/g, ' $1')}
                                </span>
                                <span className="text-sm text-gray-900 font-semibold text-right ml-4 max-w-xs">
                                  {key === 'PwnCount' && typeof value === 'number'
                                    ? value.toLocaleString() + ' cuentas'
                                    : key === 'DataClasses' && Array.isArray(value)
                                      ? value.join(', ')
                                      : formatValue(value).display}
                                </span>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>

                    {/* Right: Tags and Status */}
                    <div className="lg:col-span-3">
                      {breach.tags && breach.tags.length > 0 && (
                        <div>
                          <h5 className="font-medium text-gray-900 text-sm mb-3">Categorias</h5>
                          <div className="flex flex-wrap gap-2">
                            {breach.tags.map((tag: any, tagIdx: number) => (
                              <span key={tagIdx} className="text-xs bg-gradient-to-r from-red-100 to-red-200 text-red-800 px-3 py-2 rounded-full border border-red-200 font-medium">
                                {tag.tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="flex items-center justify-center gap-2 text-sm text-green-700">
                <i className="ki-duotone ki-shield-tick text-base">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
                <span>No se encontraron filtraciones</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">Tu informacion no aparece en bases de datos comprometidas</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderModule = (module: any, size: string, isHibp: boolean = false) => {
    // Use special HIBP renderer if it's a HIBP module
    if (isHibp) {
      return renderHibpModule(module)
    }

    const brandImage = getBrandImage(module.module)
    const statusColor = getStatusColor(module.status)
    const content = renderModuleContent(module)
    const hasContent = content.length > 0

    const sizeClasses: Record<string, string> = {
      small: 'col-span-1',
      medium: 'col-span-1',
      large: 'col-span-1',
      wide: 'col-span-1 lg:col-span-2',
      tall: 'col-span-1 row-span-2',
      featured: 'col-span-1 lg:col-span-3'
    }

    return (
      <div className={`${sizeClasses[size]} bg-white/95 backdrop-blur-sm rounded-2xl border border-gray-200/50 hover:border-gray-300/60 hover:shadow-xl transition-all duration-300 overflow-hidden group shadow-lg shadow-slate-900/5`}>
        {/* Header */}
        <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-slate-50/30 to-gray-50/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-50/50 to-gray-100/50 rounded-xl flex items-center justify-center overflow-hidden border border-gray-200/30 flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow duration-300">
              {brandImage ? (
                <Image
                  src={brandImage}
                  alt={module.module}
                  width={32}
                  height={32}
                  className="object-contain"
                  unoptimized
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement
                    target.style.display = 'none'
                    const nextElement = target.nextElementSibling as HTMLElement
                    if (nextElement) nextElement.style.display = 'flex'
                  }}
                />
              ) : null}
              <div className={`w-7 h-7 ${brandImage ? 'hidden' : 'flex'} items-center justify-center`}>
                <i className="ki-duotone ki-globe text-xl text-gray-400">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-gray-900 capitalize truncate">
                  {module.module}
                </h3>
                <div className={`flex items-center gap-1.5`}>
                  <div className={`w-2.5 h-2.5 rounded-full ${statusColor === 'emerald' ? 'bg-emerald-500' : 'bg-gray-400'} shadow-sm`} />
                  {module.reliable_source && (
                    <div className="flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-full">
                      <i className="ki-duotone ki-shield-tick text-xs text-emerald-600">
                        <span className="path1"></span>
                        <span className="path2"></span>
                      </i>
                      <span className="text-xs font-medium text-emerald-700">Verificado</span>
                    </div>
                  )}
                </div>
              </div>
              {module.status === 'found' && hasContent && (
                <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-2">
                  <i className="ki-duotone ki-data text-sm">
                    <span className="path1"></span>
                    <span className="path2"></span>
                    <span className="path3"></span>
                    <span className="path4"></span>
                    <span className="path5"></span>
                  </i>
                  <span className="font-medium">{content.length} fuente{content.length !== 1 ? 's' : ''} de informacion</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        {hasContent ? (
          <div className="p-5 space-y-5 bg-gradient-to-b from-white/50 to-slate-50/20">
            {content}
          </div>
        ) : (
          <div className="p-5 text-center bg-gradient-to-b from-white/50 to-slate-50/20">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <i className="ki-duotone ki-magnifier text-base">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
              <span>{module.status === 'found' ? 'Sin datos disponibles' : 'No encontrado'}</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Group modules by type
  const isHibpModule = (module: any) => {
    return module.module?.toLowerCase().includes('hibp') ||
      module.module?.toLowerCase().includes('haveibeenpwned') ||
      (module.front_schemas && module.front_schemas.some((schema: any) =>
        schema.image && typeof schema.image === 'string' && schema.image.includes('haveibeenpwned')))
  }

  const isLinkedInModule = (module: any) => {
    return module.module?.toLowerCase().includes('linkedin')
  }

  const isMapModule = (module: any) => {
    return module.module?.toLowerCase().includes('maps') ||
      module.module?.toLowerCase().includes('google') ||
      (module.front_schemas && module.front_schemas.some((schema: any) => schema.map && schema.map.length > 0))
  }

  // Extract location data from modules
  const extractLocationData = () => {
    const locations: any[] = []

    ; (osintData || []).forEach((module, moduleIndex) => {
      // Check for map data in front_schemas
      if (module.front_schemas) {
        module.front_schemas.forEach((schema: any, schemaIndex) => {
          if (schema.map && Array.isArray(schema.map)) {
            schema.map.forEach((mapData: any, mapIndex: number) => {
              if (mapData.type === 'lat_lng' && mapData.lat_lng && mapData.lat_lng.length === 2) {
                locations.push({
                  id: `${moduleIndex}-${schemaIndex}-${mapIndex}`,
                  name: mapData.popup?.title || schema.module || module.module || 'Ubicacion',
                  address: mapData.popup?.address || 'Direccion no disponible',
                  position: {
                    lat: mapData.lat_lng[0],
                    lng: mapData.lat_lng[1]
                  },
                  date: mapData.popup?.date,
                  comment: mapData.popup?.subtitle,
                  type: module.module,
                  tags: schema.tags?.map((tag: any) => tag.tag) || []
                })
              }
            })
          }
        })
      }

      // Check for Google Maps reviews data
      if (module.module?.toLowerCase().includes('maps') && module.data && typeof module.data === 'object') {
        const mapsData = module.data as any
        if (mapsData.reviews && Array.isArray(mapsData.reviews)) {
          mapsData.reviews.forEach((review: any, reviewIndex: number) => {
            if (review.location && review.location.position) {
              locations.push({
                id: `maps-${moduleIndex}-${reviewIndex}`,
                name: review.location.name || 'Lugar visitado',
                address: review.location.address || 'Direccion no disponible',
                position: {
                  lat: review.location.position.latitude,
                  lng: review.location.position.longitude
                },
                rating: review.rating,
                date: review.approximative_date,
                comment: review.comment,
                type: 'Google Maps',
                tags: review.location.tags || []
              })
            }
          })
        }
      }
    })

    return locations
  }

  // Ensure data is an array before filtering
  const dataArray = Array.isArray(osintData) ? osintData : []

  // Filter modules by search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return dataArray

    const lowerSearch = searchTerm.toLowerCase().trim()
    return dataArray.filter(module => {
      const moduleName = module.module?.toLowerCase() || ''
      return moduleName.includes(lowerSearch)
    })
  }, [dataArray, searchTerm])

  const regularModules = filteredData.filter(m => !isHibpModule(m) && !isLinkedInModule(m) && !isMapModule(m))
  const hibpModules = filteredData.filter(m => isHibpModule(m))
  const linkedinModules = filteredData.filter(m => isLinkedInModule(m))
  const mapModules = filteredData.filter(m => isMapModule(m))

  // Extract location data
  const locationData = extractLocationData()

  const modulesBySize = {
    featured: regularModules.filter(m => getModuleSize(m) === 'featured'),
    wide: regularModules.filter(m => getModuleSize(m) === 'wide'),
    tall: regularModules.filter(m => getModuleSize(m) === 'tall'),
    large: regularModules.filter(m => getModuleSize(m) === 'large'),
    medium: regularModules.filter(m => getModuleSize(m) === 'medium'),
    small: regularModules.filter(m => getModuleSize(m) === 'small')
  }

  // Calculate total filtered modules count
  const totalFilteredModules = regularModules.length + hibpModules.length + linkedinModules.length + mapModules.length

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      {osintData && osintData.length > 0 && (
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg shadow-slate-900/5 p-5">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <i className="ki-duotone ki-magnifier text-xl text-gray-400">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar modulos por nombre (ej: LinkedIn, Google, Twitter...)"
                className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <i className="ki-duotone ki-cross text-xl">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                <i className="ki-duotone ki-data text-gray-500">
                  <span className="path1"></span>
                  <span className="path2"></span>
                  <span className="path3"></span>
                  <span className="path4"></span>
                  <span className="path5"></span>
                </i>
                <span className="font-medium">
                  {searchTerm ? (
                    <>
                      <span className="text-rose-600 font-semibold">{totalFilteredModules}</span>
                      <span className="text-gray-400 mx-1">/</span>
                      <span>{dataArray.length}</span>
                    </>
                  ) : (
                    <span>{dataArray.length}</span>
                  )}
                </span>
                <span className="text-gray-500">modulos</span>
              </div>
            </div>
          </div>
          {searchTerm && totalFilteredModules === 0 && (
            <div className="mt-4 text-center py-6 bg-gray-50 rounded-xl border border-gray-200">
              <i className="ki-duotone ki-magnifier text-3xl text-gray-300 mx-auto mb-2">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
              <p className="text-sm text-gray-600">
                No se encontraron modulos que coincidan con <span className="font-semibold text-gray-900">&ldquo;{searchTerm}&rdquo;</span>
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className="mt-3 text-sm text-rose-600 hover:text-rose-700 font-medium transition-colors"
              >
                Limpiar busqueda
              </button>
            </div>
          )}
        </div>
      )}

      {/* Module Grid */}
      {osintData && osintData.length > 0 ? (
        <div className="space-y-12">
          {/* Section 1: Maps and Locations */}
          {(locationData.length > 0 || mapModules.length > 0) && (
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-slate-50/50 to-gray-100/50 border border-gray-200/30 rounded-lg flex items-center justify-center shadow-sm">
                  <i className="ki-duotone ki-geolocation text-lg text-gray-600">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Ubicaciones y Mapas</h2>
                <div className="flex-1 h-0.5 bg-gradient-to-r from-rose-500 via-rose-400 to-transparent" />
              </div>

              {/* Interactive Map */}
              {locationData.length > 0 && (
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-gray-200/50 hover:border-gray-300/60 hover:shadow-xl transition-all duration-300 overflow-hidden shadow-lg shadow-slate-900/5">
                  <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-slate-50/30 to-gray-50/20">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-slate-50/50 to-gray-100/50 rounded-xl flex items-center justify-center overflow-hidden border border-gray-200/30 flex-shrink-0 shadow-sm">
                        <Image
                          src="/images/brands/google.png"
                          alt="Google Maps"
                          width={32}
                          height={32}
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-bold text-gray-900">
                            Mapa Interactivo de Ubicaciones
                          </h3>
                          <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
                            <div className="flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-full">
                              <i className="ki-duotone ki-shield-tick text-xs text-emerald-600">
                                <span className="path1"></span>
                                <span className="path2"></span>
                              </i>
                              <span className="text-xs font-medium text-emerald-700">Verificado</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-2">
                          <i className="ki-duotone ki-geolocation text-sm">
                            <span className="path1"></span>
                            <span className="path2"></span>
                          </i>
                          <span className="font-medium">{locationData.length} ubicacion{locationData.length !== 1 ? 'es' : ''} encontrada{locationData.length !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 bg-gradient-to-b from-white/50 to-slate-50/20">
                    <div className="h-96 rounded-xl overflow-hidden border border-gray-200/30 shadow-sm">
                      <OsintMap locations={locationData} className="h-full w-full" />
                    </div>
                  </div>
                </div>
              )}

              {/* Map Modules Detail */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {mapModules.map((module, index) => (
                  <div key={`map-module-${index}`} className="bg-white/95 backdrop-blur-sm rounded-2xl border border-gray-200/50 hover:border-gray-300/60 hover:shadow-xl transition-all duration-300 overflow-hidden shadow-lg shadow-slate-900/5">
                    <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-slate-50/30 to-gray-50/20">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-slate-50/50 to-gray-100/50 rounded-xl flex items-center justify-center overflow-hidden border border-gray-200/30 flex-shrink-0 shadow-sm">
                          <Image
                            src={getBrandImage(module.module) || '/images/brands/google.png'}
                            alt={module.module}
                            width={32}
                            height={32}
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-bold text-gray-900 capitalize">
                              {module.module === 'maps' ? 'Google Maps' : module.module}
                            </h3>
                            <div className="flex items-center gap-1.5">
                              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
                              {module.reliable_source && (
                                <div className="flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-full">
                                  <i className="ki-duotone ki-shield-tick text-xs text-emerald-600">
                                    <span className="path1"></span>
                                    <span className="path2"></span>
                                  </i>
                                  <span className="text-xs font-medium text-emerald-700">Verificado</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-2">
                            <i className="ki-duotone ki-geolocation text-sm">
                              <span className="path1"></span>
                              <span className="path2"></span>
                            </i>
                            <span className="font-medium">Datos de ubicacion y actividad</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 space-y-5 bg-gradient-to-b from-white/50 to-slate-50/20">
                      {renderModuleContent(module).length > 0 ? (
                        renderModuleContent(module)
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <i className="ki-duotone ki-geolocation">
                            <span className="path1"></span>
                            <span className="path2"></span>
                          </i>
                          <span>Datos de ubicacion disponibles en el mapa interactivo</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Section 2: Platforms and Social Networks */}
          {(modulesBySize.featured.length > 0 || modulesBySize.wide.length > 0 || modulesBySize.tall.length > 0 || modulesBySize.large.length > 0 || modulesBySize.medium.length > 0 || modulesBySize.small.length > 0 || linkedinModules.length > 0) && (
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-slate-50/50 to-gray-100/50 border border-gray-200/30 rounded-lg flex items-center justify-center shadow-sm">
                  <i className="ki-duotone ki-globe text-lg text-gray-600">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Plataformas y Redes Sociales</h2>
                <div className="flex-1 h-0.5 bg-gradient-to-r from-rose-500 via-rose-400 to-transparent" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LinkedIn Modules - Featured */}
                {linkedinModules.map((module, index) => (
                  <div key={`linkedin-${index}`} className="lg:col-span-3">
                    {renderModule(module, 'featured')}
                  </div>
                ))}

                {/* Featured Modules - Full Width */}
                {modulesBySize.featured.map((module, index) => (
                  <div key={`featured-${index}`} className="lg:col-span-3">
                    {renderModule(module, 'featured')}
                  </div>
                ))}

                {/* Wide Modules - 2 Columns */}
                {modulesBySize.wide.map((module, index) => (
                  <div key={`wide-${index}`} className="lg:col-span-2">
                    {renderModule(module, 'wide')}
                  </div>
                ))}

                {/* Tall Modules - Extra Height */}
                {modulesBySize.tall.map((module, index) => (
                  <div key={`tall-${index}`} className="lg:row-span-2">
                    {renderModule(module, 'tall')}
                  </div>
                ))}

                {/* Large Modules */}
                {modulesBySize.large.map((module, index) => (
                  <div key={`large-${index}`}>
                    {renderModule(module, 'large')}
                  </div>
                ))}

                {/* Medium Modules */}
                {modulesBySize.medium.map((module, index) => (
                  <div key={`medium-${index}`}>
                    {renderModule(module, 'medium')}
                  </div>
                ))}

                {/* Small Modules */}
                {modulesBySize.small.map((module, index) => (
                  <div key={`small-${index}`}>
                    {renderModule(module, 'small')}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Section 3: Data Breaches */}
          {hibpModules.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-rose-50/50 to-rose-100/50 border border-rose-200/30 rounded-lg flex items-center justify-center shadow-sm">
                  <i className="ki-duotone ki-shield-cross text-lg text-rose-600">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Filtraciones de Datos</h2>
                <div className="flex-1 h-0.5 bg-gradient-to-r from-rose-500 via-rose-400 to-transparent" />
              </div>

              <div className="space-y-6">
                {hibpModules.map((module, index) => (
                  <div key={`hibp-${index}`}>
                    {renderModule(module, 'wide', true)}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        <div className="bg-gradient-to-br from-white via-gray-50/30 to-white rounded-2xl border border-gray-100 p-16 text-center shadow-lg">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <i className="ki-duotone ki-magnifier text-4xl text-gray-400">
              <span className="path1"></span>
              <span className="path2"></span>
            </i>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">No hay datos OSINT disponibles</h3>
          <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
            La investigacion no encontro informacion en las fuentes consultadas.
            <br />
            <span className="text-sm text-gray-500 mt-2 inline-block">Esto puede indicar que la informacion no esta disponible publicamente.</span>
          </p>
        </div>
      )}
    </div>
  )
}
