'use client'

import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

type ReferralType = 'PERCENTAGE' | 'AMOUNT'

interface Config {
  searches: {
    expirations: {
      time: number
      isEnabled: boolean
    }
  }
  referrals: {
    account: {
      isEnabled: boolean
      type: ReferralType
      amount: number
      maxAmount: number
    }
    referred: {
      isEnabled: boolean
      type: ReferralType
      amount: number
      maxAmount: number
    }
    limits: {
      referrals: number
      referred: number
    }
    minAmount: number
  }
  benefit: {
    firstPurchase: {
      isEnabled: boolean
      type: ReferralType
      amount: number
      maxAmount: number
    }
  }
}

const defaultConfig: Config = {
  searches: {
    expirations: {
      time: 90,
      isEnabled: true,
    },
  },
  referrals: {
    account: {
      isEnabled: true,
      type: 'PERCENTAGE',
      amount: 0.05,
      maxAmount: 25,
    },
    referred: {
      isEnabled: true,
      type: 'AMOUNT',
      amount: 25,
      maxAmount: 0,
    },
    limits: {
      referrals: 2,
      referred: 0,
    },
    minAmount: 10,
  },
  benefit: {
    firstPurchase: {
      isEnabled: true,
      type: 'AMOUNT',
      amount: 50,
      maxAmount: 50,
    },
  },
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
          // Merge with defaults to ensure all fields exist
          setConfig({
            ...defaultConfig,
            ...data.config,
            searches: {
              ...defaultConfig.searches,
              ...data.config?.searches,
              expirations: {
                ...defaultConfig.searches.expirations,
                ...data.config?.searches?.expirations,
              },
            },
            referrals: {
              ...defaultConfig.referrals,
              ...data.config?.referrals,
              account: {
                ...defaultConfig.referrals.account,
                ...data.config?.referrals?.account,
              },
              referred: {
                ...defaultConfig.referrals.referred,
                ...data.config?.referrals?.referred,
              },
              limits: {
                ...defaultConfig.referrals.limits,
                ...data.config?.referrals?.limits,
              },
            },
            benefit: {
              ...defaultConfig.benefit,
              ...data.config?.benefit,
              firstPurchase: {
                ...defaultConfig.benefit.firstPurchase,
                ...data.config?.benefit?.firstPurchase,
              },
            },
          })
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
            <p className="text-sm text-gray-500">Configuración de expiración de tokens</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="font-medium text-secondary">Expiración de Tokens</p>
              <p className="text-sm text-gray-500">
                Los tokens expirarán después del tiempo configurado
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

      {/* Referrals Settings - Account (Referrer) */}
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
            <h2 className="text-lg font-semibold text-secondary">Referidos - Beneficio al Referente</h2>
            <p className="text-sm text-gray-500">Comisión para quien refiere nuevos clientes</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="font-medium text-secondary">Beneficio al Referente</p>
              <p className="text-sm text-gray-500">
                La cuenta que refiere recibe un beneficio
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.referrals.account.isEnabled}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    referrals: {
                      ...config.referrals,
                      account: {
                        ...config.referrals.account,
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

          {config.referrals.account.isEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-gray-200 rounded-xl">
              <div>
                <label className="label">Tipo de Beneficio</label>
                <select
                  value={config.referrals.account.type}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      referrals: {
                        ...config.referrals,
                        account: {
                          ...config.referrals.account,
                          type: e.target.value as ReferralType,
                        },
                      },
                    })
                  }
                  className="input-field"
                >
                  <option value="PERCENTAGE">Porcentaje</option>
                  <option value="AMOUNT">Monto Fijo</option>
                </select>
              </div>
              <div>
                <label className="label">
                  {config.referrals.account.type === 'PERCENTAGE' ? 'Porcentaje (0.05 = 5%)' : 'Monto (tokens)'}
                </label>
                <input
                  type="number"
                  value={config.referrals.account.amount}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      referrals: {
                        ...config.referrals,
                        account: {
                          ...config.referrals.account,
                          amount: parseFloat(e.target.value) || 0,
                        },
                      },
                    })
                  }
                  className="input-field"
                  min="0"
                  step={config.referrals.account.type === 'PERCENTAGE' ? '0.01' : '1'}
                />
              </div>
              <div>
                <label className="label">Monto Máximo (tokens)</label>
                <input
                  type="number"
                  value={config.referrals.account.maxAmount}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      referrals: {
                        ...config.referrals,
                        account: {
                          ...config.referrals.account,
                          maxAmount: parseFloat(e.target.value) || 0,
                        },
                      },
                    })
                  }
                  className="input-field"
                  min="0"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Referrals Settings - Referred */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
            <i className="ki-duotone ki-user-tick text-xl text-teal-600">
              <span className="path1"></span>
              <span className="path2"></span>
              <span className="path3"></span>
            </i>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-secondary">Referidos - Beneficio al Referido</h2>
            <p className="text-sm text-gray-500">Beneficio para el nuevo cliente referido</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="font-medium text-secondary">Beneficio al Referido</p>
              <p className="text-sm text-gray-500">
                El nuevo cliente referido recibe un beneficio
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.referrals.referred.isEnabled}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    referrals: {
                      ...config.referrals,
                      referred: {
                        ...config.referrals.referred,
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

          {config.referrals.referred.isEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-gray-200 rounded-xl">
              <div>
                <label className="label">Tipo de Beneficio</label>
                <select
                  value={config.referrals.referred.type}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      referrals: {
                        ...config.referrals,
                        referred: {
                          ...config.referrals.referred,
                          type: e.target.value as ReferralType,
                        },
                      },
                    })
                  }
                  className="input-field"
                >
                  <option value="PERCENTAGE">Porcentaje</option>
                  <option value="AMOUNT">Monto Fijo</option>
                </select>
              </div>
              <div>
                <label className="label">
                  {config.referrals.referred.type === 'PERCENTAGE' ? 'Porcentaje (0.05 = 5%)' : 'Monto (tokens)'}
                </label>
                <input
                  type="number"
                  value={config.referrals.referred.amount}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      referrals: {
                        ...config.referrals,
                        referred: {
                          ...config.referrals.referred,
                          amount: parseFloat(e.target.value) || 0,
                        },
                      },
                    })
                  }
                  className="input-field"
                  min="0"
                  step={config.referrals.referred.type === 'PERCENTAGE' ? '0.01' : '1'}
                />
              </div>
              <div>
                <label className="label">Monto Máximo (tokens)</label>
                <input
                  type="number"
                  value={config.referrals.referred.maxAmount}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      referrals: {
                        ...config.referrals,
                        referred: {
                          ...config.referrals.referred,
                          maxAmount: parseFloat(e.target.value) || 0,
                        },
                      },
                    })
                  }
                  className="input-field"
                  min="0"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Referrals Limits */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
            <i className="ki-duotone ki-shield-tick text-xl text-orange-600">
              <span className="path1"></span>
              <span className="path2"></span>
            </i>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-secondary">Límites de Referidos</h2>
            <p className="text-sm text-gray-500">Restricciones del programa de referidos</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-200 rounded-xl">
          <div>
            <label className="label">Máx. referidos por cuenta</label>
            <input
              type="number"
              value={config.referrals.limits.referrals}
              onChange={(e) =>
                setConfig({
                  ...config,
                  referrals: {
                    ...config.referrals,
                    limits: {
                      ...config.referrals.limits,
                      referrals: parseInt(e.target.value) || 0,
                    },
                  },
                })
              }
              className="input-field"
              min="0"
            />
            <p className="text-xs text-gray-500 mt-1">0 = sin límite</p>
          </div>
          <div>
            <label className="label">Máx. veces como referido</label>
            <input
              type="number"
              value={config.referrals.limits.referred}
              onChange={(e) =>
                setConfig({
                  ...config,
                  referrals: {
                    ...config.referrals,
                    limits: {
                      ...config.referrals.limits,
                      referred: parseInt(e.target.value) || 0,
                    },
                  },
                })
              }
              className="input-field"
              min="0"
            />
            <p className="text-xs text-gray-500 mt-1">0 = sin límite</p>
          </div>
          <div>
            <label className="label">Compra mínima (tokens)</label>
            <input
              type="number"
              value={config.referrals.minAmount}
              onChange={(e) =>
                setConfig({
                  ...config,
                  referrals: {
                    ...config.referrals,
                    minAmount: parseInt(e.target.value) || 0,
                  },
                })
              }
              className="input-field"
              min="0"
            />
            <p className="text-xs text-gray-500 mt-1">Mínimo para activar beneficio</p>
          </div>
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
                checked={config.benefit.firstPurchase.isEnabled}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    benefit: {
                      ...config.benefit,
                      firstPurchase: {
                        ...config.benefit.firstPurchase,
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

          {config.benefit.firstPurchase.isEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-gray-200 rounded-xl">
              <div>
                <label className="label">Tipo de Beneficio</label>
                <select
                  value={config.benefit.firstPurchase.type}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      benefit: {
                        ...config.benefit,
                        firstPurchase: {
                          ...config.benefit.firstPurchase,
                          type: e.target.value as ReferralType,
                        },
                      },
                    })
                  }
                  className="input-field"
                >
                  <option value="PERCENTAGE">Porcentaje</option>
                  <option value="AMOUNT">Monto Fijo</option>
                </select>
              </div>
              <div>
                <label className="label">
                  {config.benefit.firstPurchase.type === 'PERCENTAGE' ? 'Porcentaje (0.05 = 5%)' : 'Monto (tokens)'}
                </label>
                <input
                  type="number"
                  value={config.benefit.firstPurchase.amount}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      benefit: {
                        ...config.benefit,
                        firstPurchase: {
                          ...config.benefit.firstPurchase,
                          amount: parseFloat(e.target.value) || 0,
                        },
                      },
                    })
                  }
                  className="input-field"
                  min="0"
                  step={config.benefit.firstPurchase.type === 'PERCENTAGE' ? '0.01' : '1'}
                />
              </div>
              <div>
                <label className="label">Monto Máximo (tokens)</label>
                <input
                  type="number"
                  value={config.benefit.firstPurchase.maxAmount}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      benefit: {
                        ...config.benefit,
                        firstPurchase: {
                          ...config.benefit.firstPurchase,
                          maxAmount: parseFloat(e.target.value) || 0,
                        },
                      },
                    })
                  }
                  className="input-field"
                  min="0"
                />
              </div>
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
