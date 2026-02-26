'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-toastify'
import { PROVIDER_CONFIG } from '@/lib/constants'
import { Input } from '@/components/ui/Input'

interface ProviderData {
  code: string
  isEnabled: boolean
  config?: Record<string, string>
}

interface ProviderWithMeta extends ProviderData {
  name: string
  description?: string
  requiresConfig: boolean
}

interface ProvidersTabProps {
  accountId: string
  onProvidersUpdate?: () => void
}

// Estado local de configuración por provider (valores editables)
interface ProviderConfigState {
  [providerCode: string]: {
    [fieldKey: string]: string
  }
}

export function ProvidersTab({ accountId, onProvidersUpdate }: ProvidersTabProps) {
  const [providers, setProviders] = useState<ProviderWithMeta[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [originalProviders, setOriginalProviders] = useState<ProviderWithMeta[]>([])
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null)
  const [configState, setConfigState] = useState<ProviderConfigState>({})
  const [originalConfigState, setOriginalConfigState] = useState<ProviderConfigState>({})

  // Enriquecer providers con metadatos
  const enrichProviders = (rawProviders: ProviderData[]): ProviderWithMeta[] => {
    return rawProviders.map(p => {
      const meta = PROVIDER_CONFIG[p.code]
      return {
        ...p,
        name: meta?.name || p.code,
        description: meta?.description,
        requiresConfig: meta?.requiresConfig ?? false,
      }
    })
  }

  // Extraer estado de config de los providers
  const extractConfigState = (rawProviders: ProviderData[]): ProviderConfigState => {
    const state: ProviderConfigState = {}
    for (const provider of rawProviders) {
      const meta = PROVIDER_CONFIG[provider.code]
      if (meta?.fields && provider.config) {
        state[provider.code] = {}
        for (const field of meta.fields) {
          // Para campos password, guardamos vacío (el valor real está enmascarado)
          if (field.type === 'password') {
            state[provider.code][field.key] = ''
          } else {
            state[provider.code][field.key] = provider.config[field.key] || ''
          }
        }
      }
    }
    return state
  }

  const fetchProviders = useCallback(async () => {
    if (!accountId) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/accounts/${accountId}/providers`)
      if (response.ok) {
        const data = await response.json()
        const enriched = enrichProviders(data.providers)
        const configState = extractConfigState(data.providers)

        setProviders(enriched)
        setOriginalProviders(enriched)
        setConfigState(configState)
        setOriginalConfigState(configState)
        setHasChanges(false)
      }
    } catch (error) {
      console.error('Error fetching providers:', error)
      toast.error('Error al cargar proveedores')
    } finally {
      setIsLoading(false)
    }
  }, [accountId])

  useEffect(() => {
    fetchProviders()
  }, [fetchProviders])

  const checkForChanges = useCallback((
    currentProviders: ProviderWithMeta[],
    currentConfig: ProviderConfigState
  ) => {
    // Check provider enable/disable changes
    const providerChanges = currentProviders.some((p, i) =>
      p.isEnabled !== originalProviders[i]?.isEnabled
    )

    // Check config field changes
    let configChanges = false
    for (const code in currentConfig) {
      for (const key in currentConfig[code]) {
        if (currentConfig[code][key] !== '' &&
          currentConfig[code][key] !== originalConfigState[code]?.[key]) {
          configChanges = true
          break
        }
      }
      if (configChanges) break
    }

    setHasChanges(providerChanges || configChanges)
  }, [originalProviders, originalConfigState])

  const handleToggleProvider = (code: string) => {
    setProviders(prev => {
      const updated = prev.map(p =>
        p.code === code ? { ...p, isEnabled: !p.isEnabled } : p
      )
      checkForChanges(updated, configState)
      return updated
    })
  }

  const handleConfigChange = (providerCode: string, fieldKey: string, value: string) => {
    setConfigState(prev => {
      const updated = {
        ...prev,
        [providerCode]: {
          ...prev[providerCode],
          [fieldKey]: value,
        },
      }
      checkForChanges(providers, updated)
      return updated
    })
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const providersToSave = providers.map(p => {
        const result: {
          code: string
          isEnabled: boolean
          config?: Record<string, string>
        } = {
          code: p.code,
          isEnabled: p.isEnabled,
        }

        // Include config if provider has configurable fields
        const meta = PROVIDER_CONFIG[p.code]
        if (meta?.fields && configState[p.code]) {
          const config: Record<string, string> = {}
          for (const field of meta.fields) {
            const value = configState[p.code][field.key]
            // Only include non-empty values
            if (value !== undefined) {
              config[field.key] = value
            }
          }
          if (Object.keys(config).length > 0) {
            result.config = config
          }
        }

        return result
      })

      const response = await fetch(`/api/accounts/${accountId}/providers`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providers: providersToSave }),
      })

      if (response.ok) {
        toast.success('Proveedores actualizados correctamente')
        // Refresh to get updated masked values
        await fetchProviders()
        onProvidersUpdate?.()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Error al guardar')
      }
    } catch (error) {
      console.error('Error saving providers:', error)
      toast.error('Error al guardar proveedores')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setProviders(originalProviders)
    setConfigState(originalConfigState)
    setHasChanges(false)
    setExpandedProvider(null)
  }

  const toggleExpanded = (code: string) => {
    setExpandedProvider(prev => prev === code ? null : code)
  }

  // Verificar si un provider tiene configuración guardada
  const hasConfigured = (provider: ProviderWithMeta): boolean => {
    if (!provider.config) return false
    const meta = PROVIDER_CONFIG[provider.code]
    if (!meta?.fields) return false

    return meta.fields.some(field => {
      if (field.type === 'password') {
        return provider.config?.[`${field.key}_configured`] === 'true'
      }
      return !!provider.config?.[field.key]
    })
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-48"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (providers.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-12 shadow-sm border border-gray-100 text-center">
        <i className="ki-duotone ki-setting-2 text-gray-300 text-5xl mb-4">
          <span className="path1"></span>
          <span className="path2"></span>
        </i>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Sin proveedores configurados</h3>
        <p className="text-gray-500">
          No hay proveedores de datos disponibles.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Providers list */}
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {providers.map(provider => {
            const meta = PROVIDER_CONFIG[provider.code]
            const isExpanded = expandedProvider === provider.code
            const isConfigured = hasConfigured(provider)

            return (
              <div
                key={provider.code}
                className={`transition-colors ${provider.isEnabled ? 'bg-white' : 'bg-gray-50'}`}
              >
                {/* Provider row */}
                <div className="flex items-center gap-4 p-4">
                  {/* Provider icon */}
                  <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center
                    ${provider.isEnabled ? 'bg-emerald-100' : 'bg-gray-100'}
                  `}>
                    <span className={`text-lg font-bold ${provider.isEnabled ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {provider.name.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Provider info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`font-medium ${provider.isEnabled ? 'text-gray-800' : 'text-gray-500'}`}>
                        {provider.name}
                      </p>
                      {isConfigured && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                          Configurado
                        </span>
                      )}
                    </div>
                    {provider.description && (
                      <p className="text-sm text-gray-500">{provider.description}</p>
                    )}
                  </div>

                  {/* Config button & Switch */}
                  <div className="flex items-center gap-3">
                    {meta?.requiresConfig && (
                      <button
                        onClick={() => toggleExpanded(provider.code)}
                        className={`
                          btn btn-sm
                          ${isExpanded ? 'btn-primary' : 'btn-light'}
                        `}
                      >
                        <i className={`ki-solid ki-setting-2 text-sm ${isExpanded ? '' : 'me-1'}`}></i>
                        {!isExpanded && 'Configurar'}
                      </button>
                    )}

                    {/* Toggle switch */}
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={provider.isEnabled}
                        onChange={() => handleToggleProvider(provider.code)}
                        disabled={isSaving}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                    </label>
                  </div>
                </div>

                {/* Expandable config section */}
                {meta?.requiresConfig && isExpanded && (
                  <div className="px-4 pb-4">
                    <div className="ml-14 pl-4 border-l-2 border-gray-200">
                      <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                        <h4 className="text-sm font-medium text-gray-700">Configuración de {provider.name}</h4>

                        {/* Config fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {meta.fields?.map(field => {
                            const currentValue = configState[provider.code]?.[field.key] || ''
                            const isPassword = field.type === 'password'
                            const isFieldConfigured = provider.config?.[`${field.key}_configured`] === 'true'
                            const maskedValue = provider.config?.[field.key] || ''

                            return (
                              <div key={field.key}>
                                <Input
                                  type={isPassword ? 'password' : 'text'}
                                  label={
                                    isPassword && isFieldConfigured
                                      ? `${field.label} (configurado)`
                                      : field.label
                                  }
                                  value={currentValue}
                                  onChange={(e) => handleConfigChange(provider.code, field.key, e.target.value)}
                                  placeholder={
                                    isPassword && isFieldConfigured
                                      ? maskedValue
                                      : field.placeholder
                                  }
                                  size="sm"
                                  helperText={
                                    isPassword && isFieldConfigured && currentValue === ''
                                      ? 'Dejar vacío para mantener el valor actual'
                                      : undefined
                                  }
                                />
                              </div>
                            )
                          })}
                        </div>

                        {/* Hint */}
                        {meta.hint && (
                          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                            <i className="ki-solid ki-information-2 text-blue-500 mt-0.5"></i>
                            <p className="text-sm text-blue-700">{meta.hint}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Save/Cancel buttons */}
      {hasChanges && (
        <div className="sticky bottom-4 flex justify-end gap-3">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-3 flex items-center gap-3">
            <span className="text-sm text-gray-600">Tienes cambios sin guardar</span>
            <button
              onClick={handleCancel}
              className="btn btn-sm btn-light"
              disabled={isSaving}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="btn btn-sm btn-primary"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Guardando...
                </>
              ) : (
                'Guardar cambios'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
