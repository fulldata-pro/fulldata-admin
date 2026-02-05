'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-toastify'

interface Provider {
  code: string
  isEnabled: boolean
}

interface ProviderWithMeta extends Provider {
  name: string
}

interface ProvidersTabProps {
  accountId: string
  onProvidersUpdate?: () => void
}

// Metadatos de proveedores (code → name)
const PROVIDERS_META: Record<string, string> = {
  nosis: 'Nosis',
  agildata: 'Agildata',
  osint: 'OSINT',
  didit: 'Didit',
  bind: 'Bind',
}

export function ProvidersTab({ accountId, onProvidersUpdate }: ProvidersTabProps) {
  const [providers, setProviders] = useState<ProviderWithMeta[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [originalProviders, setOriginalProviders] = useState<ProviderWithMeta[]>([])

  // Enriquecer providers con metadatos
  const enrichProviders = (rawProviders: Provider[]): ProviderWithMeta[] => {
    return rawProviders.map(p => ({
      ...p,
      name: PROVIDERS_META[p.code] || p.code,
    }))
  }

  const fetchProviders = useCallback(async () => {
    if (!accountId) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/accounts/${accountId}/providers`)
      if (response.ok) {
        const data = await response.json()
        const enriched = enrichProviders(data.providers)
        setProviders(enriched)
        setOriginalProviders(enriched)
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

  const handleToggleProvider = (code: string) => {
    setProviders(prev => {
      const updated = prev.map(p =>
        p.code === code ? { ...p, isEnabled: !p.isEnabled } : p
      )
      // Check if there are changes
      const hasChanges = updated.some((p, i) => p.isEnabled !== originalProviders[i]?.isEnabled)
      setHasChanges(hasChanges)
      return updated
    })
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const providersToSave = providers.map(p => ({
        code: p.code,
        isEnabled: p.isEnabled,
      }))

      const response = await fetch(`/api/accounts/${accountId}/providers`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providers: providersToSave }),
      })

      if (response.ok) {
        toast.success('Proveedores actualizados correctamente')
        setOriginalProviders(providers)
        setHasChanges(false)
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
    setHasChanges(false)
  }

  const handleEnableAll = () => {
    setProviders(prev => prev.map(p => ({ ...p, isEnabled: true })))
    setHasChanges(true)
  }

  const handleDisableAll = () => {
    setProviders(prev => prev.map(p => ({ ...p, isEnabled: false })))
    setHasChanges(true)
  }

  const enabledCount = providers.filter(p => p.isEnabled).length
  const totalCount = providers.length

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-xl"></div>
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
      {/* Header with summary and actions */}
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Proveedores de Datos</h3>
            <p className="text-gray-500 text-sm mt-1">
              Configura qué proveedores puede usar esta cuenta para realizar búsquedas
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              <span className="font-semibold text-gray-800">{enabledCount}</span> de {totalCount} habilitados
            </span>
            <div className="h-8 w-px bg-gray-200"></div>
            <button
              onClick={handleEnableAll}
              className="btn btn-sm btn-light"
              disabled={isSaving}
            >
              Habilitar todos
            </button>
            <button
              onClick={handleDisableAll}
              className="btn btn-sm btn-light"
              disabled={isSaving}
            >
              Deshabilitar todos
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300"
            style={{ width: `${totalCount > 0 ? (enabledCount / totalCount) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Providers grid */}
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {providers.map(provider => (
            <div
              key={provider.code}
              onClick={() => handleToggleProvider(provider.code)}
              className={`
                relative flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
                ${provider.isEnabled
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-gray-50 border-gray-200 opacity-60'
                }
                hover:shadow-sm
              `}
            >
              <div className={`
                w-10 h-10 rounded-lg flex items-center justify-center
                ${provider.isEnabled ? 'bg-white shadow-sm' : 'bg-gray-100'}
              `}>
                <span className={`text-lg font-bold ${provider.isEnabled ? 'text-emerald-600' : 'text-gray-400'}`}>
                  {provider.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-medium ${provider.isEnabled ? 'text-gray-800' : 'text-gray-500'}`}>
                  {provider.name}
                </p>
                <p className="text-xs text-gray-500">{provider.code}</p>
              </div>
              <div className={`
                w-6 h-6 rounded-full flex items-center justify-center
                ${provider.isEnabled ? 'bg-green-500' : 'bg-gray-300'}
              `}>
                {provider.isEnabled ? (
                  <i className="ki-solid ki-check text-white text-xs"></i>
                ) : (
                  <i className="ki-solid ki-cross text-white text-xs"></i>
                )}
              </div>
            </div>
          ))}
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
