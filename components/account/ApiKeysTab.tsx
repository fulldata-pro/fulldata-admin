'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { formatDate, getRelativeTime } from '@/lib/utils/dateUtils'

interface AccountApi {
  _id: string
  id: number
  uid: string
  isEnabled: boolean
  apiKey: string
  createdAt: string
  updatedAt?: string
  lastUsedAt?: string
  usage?: {
    totalRequests: number
    todayRequests: number
    monthRequests: number
  }
}

interface ApiKeysTabProps {
  accountApis: AccountApi[]
  accountId: string
  apiEnabled?: boolean
  onApiToggle?: (apiId: string, enabled: boolean) => void
  onApiKeysUpdate?: () => void
}

export function ApiKeysTab({
  accountApis,
  accountId,
  apiEnabled,
  onApiToggle,
  onApiKeysUpdate
}: ApiKeysTabProps) {
  // Determine API status from the first API key's isEnabled field
  const [actualApiEnabled, setActualApiEnabled] = useState(
    accountApis.length > 0 ? accountApis[0].isEnabled : false
  )
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [showKey, setShowKey] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  // Update state when props change
  useEffect(() => {
    if (accountApis.length > 0) {
      setActualApiEnabled(accountApis[0].isEnabled)
    }
  }, [accountApis])

  const copyApiKey = (key: string, apiId: string) => {
    navigator.clipboard.writeText(key)
    setCopiedKey(apiId)
    toast.success('API Key copiada al portapapeles')
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const toggleKeyVisibility = (apiId: string) => {
    setShowKey(showKey === apiId ? null : apiId)
  }

  const handleApiToggle = async (enabled: boolean) => {
    if (accountApis.length === 0) return

    // Update UI optimistically
    setActualApiEnabled(enabled)
    setIsUpdating(true)

    try {
      const response = await fetch(`/api/accounts/${accountId}/api-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(data.message || `API ${enabled ? 'habilitada' : 'deshabilitada'}`)
        // Refresh API keys data
        onApiKeysUpdate?.()
      } else {
        // Revert on error
        setActualApiEnabled(!enabled)
        const error = await response.json()
        toast.error(error.error || 'Error al actualizar estado de API')
      }
    } catch (error) {
      // Revert on error
      setActualApiEnabled(!enabled)
      console.error('Error toggling API:', error)
      toast.error('Error al actualizar estado de API')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* API Key Card */}
      <div className="rounded-2xl bg-purple-50 border border-purple-200 p-6">
        <div className="flex items-start gap-4">
          <div className="size-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
            <i className="ki-duotone ki-key text-purple-600 text-xl">
              <span className="path1"></span>
              <span className="path2"></span>
              <span className="path3"></span>
            </i>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">API Key</h3>
            <p className="text-gray-600 text-sm">Clave de autenticación para la API</p>
          </div>
        </div>

        {/* API Status */}
        <div className="mt-6 p-4 bg-white rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`size-2 rounded-full ${actualApiEnabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium text-gray-700">Estado de la API</span>
            </div>
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={actualApiEnabled}
                  onChange={() => handleApiToggle(!actualApiEnabled)}
                  disabled={accountApis.length === 0 || isUpdating}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
              <span className={`badge ${actualApiEnabled ? 'badge-success' : 'badge-danger'}`}>
                {actualApiEnabled ? 'Habilitada' : 'Deshabilitada'}
              </span>
            </div>
          </div>
          {accountApis.length > 0 && accountApis[0].updatedAt && (
            <div className="text-xs text-gray-500">
              Última actualización: {formatDate(accountApis[0].updatedAt)} • {getRelativeTime(accountApis[0].updatedAt)}
            </div>
          )}
        </div>

        {/* API Keys List */}
        <div className="mt-6">
          {accountApis.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-xl">
              <i className="ki-duotone ki-key text-gray-300 text-4xl mb-3">
                <span className="path1"></span>
                <span className="path2"></span>
                <span className="path3"></span>
              </i>
              <p className="text-gray-500">No hay API Keys generadas</p>
              <button
                className="btn btn-primary mt-4"
                onClick={() => {
                  if (confirm('¿Deseas generar una nueva API Key?')) {
                    alert('Funcionalidad para generar API Key próximamente')
                  }
                }}
              >
                <i className="ki-duotone ki-plus-circle me-2">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
                Generar API Key
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {accountApis.map((api) => (
                <div key={api.uid} className="bg-white rounded-xl">
                  {/* API Key Display */}
                  <div className="p-4 border-b border-gray-100">
                    <label className="text-sm text-gray-600 mb-2 block">API Key</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={showKey === api.uid ? api.apiKey : '•'.repeat(40)}
                        readOnly
                        className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm"
                      />
                      <button
                        onClick={() => toggleKeyVisibility(api.uid)}
                        className="btn btn-sm btn-light"
                        title={showKey === api.uid ? 'Ocultar' : 'Mostrar'}
                      >
                        <i className={`ki-duotone ki-${showKey === api.uid ? 'eye-slash' : 'eye'}`}>
                          <span className="path1"></span>
                          <span className="path2"></span>
                          <span className="path3"></span>
                        </i>
                      </button>
                      <button
                        onClick={() => copyApiKey(api.apiKey, api.uid)}
                        className="btn btn-sm btn-light"
                        title="Copiar"
                      >
                        <i className="ki-duotone ki-copy">
                          <span className="path1"></span>
                          <span className="path2"></span>
                        </i>
                      </button>
                    </div>
                  </div>

                  {/* API Info */}
                  <div className="p-4 grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">ID de API</label>
                      <p className="font-medium text-gray-900">{api.id}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">UID</label>
                      <p className="font-medium text-gray-900 font-mono text-sm">{api.uid}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Fecha de Creación</label>
                      <p className="font-medium text-gray-900">{formatDate(api.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* How to use section */}
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <div className="size-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <i className="ki-duotone ki-information-5 text-blue-600 text-lg">
                      <span className="path1"></span>
                      <span className="path2"></span>
                      <span className="path3"></span>
                    </i>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">Cómo usar la API Key</h4>
                    <p className="text-sm text-gray-700 mb-3">
                      Incluye la API Key en el header de autenticación de tus requests:
                    </p>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <code className="text-green-400 text-sm font-mono">
                        Authorization: Bearer fd_{accountApis[0]?.apiKey ? 'x'.repeat(20) + '...' : 'xxxxxxxxxxxxxxxx...'}
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}