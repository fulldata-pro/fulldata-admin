'use client'

import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

interface Config {
  searches: {
    expirations: {
      time: number
      isEnabled: boolean
    }
  }
  referrals: {
    isEnabled: boolean
    type: 'PERCENTAGE' | 'FIXED'
    amount: number
    maxAmountPerAccount?: number
    maxAmountPerReferred?: number
  }
  benefits: {
    firstPurchase: {
      isEnabled: boolean
      benefitId?: string
    }
  }
}

export default function SettingsPage() {
  const [config, setConfig] = useState<Config | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/settings')
        if (response.ok) {
          const data = await response.json()
          setConfig(data.config)
        }
      } catch (error) {
        console.error('Error fetching config:', error)
        toast.error('Error al cargar configuración')
      } finally {
        setIsLoading(false)
      }
    }

    fetchConfig()
  }, [])

  const handleSave = async () => {
    if (!config) return

    setIsSaving(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })

      if (response.ok) {
        toast.success('Configuración guardada')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Error al guardar')
      }
    } catch {
      toast.error('Error al guardar configuración')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!config) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Error al cargar configuración</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Configuración General</h1>
          <p className="text-gray-500 mt-1">Ajustes globales de la plataforma</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn-primary flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Guardando...
            </>
          ) : (
            <>
              <i className="ki-duotone ki-check text-xl">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
              Guardar Cambios
            </>
          )}
        </button>
      </div>

      {/* Search Settings */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <i className="ki-duotone ki-magnifier text-xl text-blue-600">
              <span className="path1"></span>
              <span className="path2"></span>
            </i>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-secondary">Búsquedas</h2>
            <p className="text-sm text-gray-500">Configuración de expiración de créditos</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="font-medium text-secondary">Expiración de Créditos</p>
              <p className="text-sm text-gray-500">
                Los créditos expirarán después del tiempo configurado
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.searches.expirations.isEnabled}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    searches: {
                      ...config.searches,
                      expirations: {
                        ...config.searches.expirations,
                        isEnabled: e.target.checked,
                      },
                    },
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {config.searches.expirations.isEnabled && (
            <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl">
              <div className="flex-1">
                <label className="label">Días hasta expiración</label>
                <input
                  type="number"
                  value={config.searches.expirations.time}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      searches: {
                        ...config.searches,
                        expirations: {
                          ...config.searches.expirations,
                          time: parseInt(e.target.value) || 30,
                        },
                      },
                    })
                  }
                  className="input-field"
                  min="1"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Referrals Settings */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <i className="ki-duotone ki-people text-xl text-green-600">
              <span className="path1"></span>
              <span className="path2"></span>
              <span className="path3"></span>
              <span className="path4"></span>
              <span className="path5"></span>
            </i>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-secondary">Sistema de Referidos</h2>
            <p className="text-sm text-gray-500">Configuración de comisiones por referidos</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="font-medium text-secondary">Programa de Referidos</p>
              <p className="text-sm text-gray-500">
                Permitir que usuarios ganen comisiones por referir nuevos clientes
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.referrals.isEnabled}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    referrals: {
                      ...config.referrals,
                      isEnabled: e.target.checked,
                    },
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {config.referrals.isEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-gray-200 rounded-xl">
              <div>
                <label className="label">Tipo de Comisión</label>
                <select
                  value={config.referrals.type}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      referrals: {
                        ...config.referrals,
                        type: e.target.value as 'PERCENTAGE' | 'FIXED',
                      },
                    })
                  }
                  className="input-field"
                >
                  <option value="PERCENTAGE">Porcentaje</option>
                  <option value="FIXED">Monto Fijo</option>
                </select>
              </div>
              <div>
                <label className="label">
                  {config.referrals.type === 'PERCENTAGE' ? 'Porcentaje (%)' : 'Monto ($)'}
                </label>
                <input
                  type="number"
                  value={config.referrals.amount}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      referrals: {
                        ...config.referrals,
                        amount: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  className="input-field"
                  min="0"
                  step={config.referrals.type === 'PERCENTAGE' ? '1' : '0.01'}
                />
              </div>
              <div>
                <label className="label">Máx. por Cuenta (opcional)</label>
                <input
                  type="number"
                  value={config.referrals.maxAmountPerAccount || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      referrals: {
                        ...config.referrals,
                        maxAmountPerAccount: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      },
                    })
                  }
                  className="input-field"
                  min="0"
                  placeholder="Sin límite"
                />
              </div>
              <div>
                <label className="label">Máx. por Referido (opcional)</label>
                <input
                  type="number"
                  value={config.referrals.maxAmountPerReferred || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      referrals: {
                        ...config.referrals,
                        maxAmountPerReferred: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      },
                    })
                  }
                  className="input-field"
                  min="0"
                  placeholder="Sin límite"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* First Purchase Benefit */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <i className="ki-duotone ki-gift text-xl text-purple-600">
              <span className="path1"></span>
              <span className="path2"></span>
              <span className="path3"></span>
              <span className="path4"></span>
            </i>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-secondary">Beneficio Primera Compra</h2>
            <p className="text-sm text-gray-500">
              Beneficio automático para nuevos clientes
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="font-medium text-secondary">Beneficio Automático</p>
              <p className="text-sm text-gray-500">
                Aplicar un beneficio automáticamente en la primera compra
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.benefits.firstPurchase.isEnabled}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    benefits: {
                      ...config.benefits,
                      firstPurchase: {
                        ...config.benefits.firstPurchase,
                        isEnabled: e.target.checked,
                      },
                    },
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {config.benefits.firstPurchase.isEnabled && (
            <div className="p-4 border border-gray-200 rounded-xl">
              <label className="label">ID del Beneficio</label>
              <input
                type="text"
                value={config.benefits.firstPurchase.benefitId || ''}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    benefits: {
                      ...config.benefits,
                      firstPurchase: {
                        ...config.benefits.firstPurchase,
                        benefitId: e.target.value,
                      },
                    },
                  })
                }
                className="input-field"
                placeholder="ID del beneficio a aplicar"
              />
              <p className="text-xs text-gray-500 mt-2">
                Puedes obtener el ID desde la sección de Beneficios
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Save button (mobile) */}
      <div className="lg:hidden">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Guardando...
            </>
          ) : (
            <>
              <i className="ki-duotone ki-check text-xl">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
              Guardar Cambios
            </>
          )}
        </button>
      </div>
    </div>
  )
}
