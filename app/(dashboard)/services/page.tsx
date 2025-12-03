'use client'

import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { ServiceLabels, ServiceColors, ServiceType, Currencies } from '@/lib/constants'

interface Price {
  amount: number
  currency: string
}

interface ProxyService {
  type: ServiceType
  prices: Price[]
  isEnabled: boolean
  hideInSearchForm: boolean
}

interface Proxy {
  _id: string
  uid: string
  name: string
  countryCode: string
  services: ProxyService[]
  createdAt: string
}

export default function ServicesPage() {
  const [proxies, setProxies] = useState<Proxy[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingProxy, setEditingProxy] = useState<Proxy | null>(null)
  const [showModal, setShowModal] = useState(false)

  const fetchProxies = async () => {
    try {
      const response = await fetch('/api/services')
      if (response.ok) {
        const data = await response.json()
        setProxies(data.proxies)
      }
    } catch (error) {
      console.error('Error fetching services:', error)
      toast.error('Error al cargar servicios')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProxies()
  }, [])

  const handleSave = async () => {
    if (!editingProxy) return

    try {
      const method = editingProxy._id ? 'PUT' : 'POST'
      const url = editingProxy._id ? `/api/services/${editingProxy._id}` : '/api/services'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProxy),
      })

      if (response.ok) {
        toast.success(editingProxy._id ? 'Servicio actualizado' : 'Servicio creado')
        setShowModal(false)
        setEditingProxy(null)
        fetchProxies()
      } else {
        toast.error('Error al guardar servicio')
      }
    } catch {
      toast.error('Error al guardar servicio')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este servicio?')) return

    try {
      const response = await fetch(`/api/services/${id}`, { method: 'DELETE' })
      if (response.ok) {
        toast.success('Servicio eliminado')
        fetchProxies()
      } else {
        toast.error('Error al eliminar servicio')
      }
    } catch {
      toast.error('Error al eliminar servicio')
    }
  }

  const handleServiceToggle = async (proxy: Proxy, serviceType: ServiceType, enabled: boolean) => {
    const updatedServices = proxy.services.map((s) =>
      s.type === serviceType ? { ...s, isEnabled: enabled } : s
    )

    try {
      const response = await fetch(`/api/services/${proxy._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ services: updatedServices }),
      })

      if (response.ok) {
        toast.success('Servicio actualizado')
        fetchProxies()
      }
    } catch {
      toast.error('Error al actualizar servicio')
    }
  }

  const openNewModal = () => {
    setEditingProxy({
      _id: '',
      uid: '',
      name: '',
      countryCode: 'AR',
      services: [],
      createdAt: '',
    })
    setShowModal(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Servicios</h1>
          <p className="text-gray-500 mt-1">Gestiona los proxies y sus servicios disponibles</p>
        </div>
        <button onClick={openNewModal} className="btn-primary flex items-center gap-2">
          <i className="ki-duotone ki-plus text-xl">
            <span className="path1"></span>
            <span className="path2"></span>
          </i>
          Nuevo Proxy
        </button>
      </div>

      {/* Proxies list */}
      <div className="grid grid-cols-1 gap-6">
        {proxies.map((proxy) => (
          <div key={proxy._id} className="card">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{proxy.countryCode === 'AR' ? '🇦🇷' : proxy.countryCode === 'US' ? '🇺🇸' : '🌍'}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-secondary">{proxy.name}</h3>
                    <p className="text-sm text-gray-500">{proxy.uid} • {proxy.countryCode}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingProxy(proxy)
                    setShowModal(true)
                  }}
                  className="btn-outline px-3 py-1.5"
                >
                  <i className="ki-duotone ki-pencil text-lg">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                </button>
                <button
                  onClick={() => handleDelete(proxy._id)}
                  className="btn-outline px-3 py-1.5 text-red-500 hover:bg-red-50 hover:border-red-300"
                >
                  <i className="ki-duotone ki-trash text-lg">
                    <span className="path1"></span>
                    <span className="path2"></span>
                    <span className="path3"></span>
                    <span className="path4"></span>
                    <span className="path5"></span>
                  </i>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {proxy.services.map((service) => (
                <div
                  key={service.type}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    service.isEnabled
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 bg-gray-50 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: ServiceColors[service.type] }}
                      ></div>
                      <span className="font-medium text-secondary">{ServiceLabels[service.type]}</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={service.isEnabled}
                        onChange={(e) => handleServiceToggle(proxy, service.type, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                  </div>
                  <div className="space-y-1">
                    {service.prices.map((price, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-gray-500">{price.currency}</span>
                        <span className="font-medium">${price.amount}</span>
                      </div>
                    ))}
                    {service.prices.length === 0 && (
                      <p className="text-sm text-gray-400">Sin precios configurados</p>
                    )}
                  </div>
                </div>
              ))}
              {proxy.services.length === 0 && (
                <p className="col-span-full text-center text-gray-500 py-4">
                  Sin servicios configurados
                </p>
              )}
            </div>
          </div>
        ))}

        {proxies.length === 0 && (
          <div className="card text-center py-12">
            <i className="ki-duotone ki-setting-2 text-5xl text-gray-300 mb-4">
              <span className="path1"></span>
              <span className="path2"></span>
            </i>
            <p className="text-gray-500 mb-4">No hay proxies configurados</p>
            <button onClick={openNewModal} className="btn-primary">
              Crear primer proxy
            </button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showModal && editingProxy && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-secondary">
                {editingProxy._id ? 'Editar Proxy' : 'Nuevo Proxy'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Nombre</label>
                  <input
                    type="text"
                    value={editingProxy.name}
                    onChange={(e) => setEditingProxy({ ...editingProxy, name: e.target.value })}
                    className="input-field"
                    placeholder="Argentina Principal"
                  />
                </div>
                <div>
                  <label className="label">Código de País</label>
                  <input
                    type="text"
                    value={editingProxy.countryCode}
                    onChange={(e) => setEditingProxy({ ...editingProxy, countryCode: e.target.value.toUpperCase() })}
                    className="input-field"
                    placeholder="AR"
                    maxLength={2}
                  />
                </div>
              </div>

              <div>
                <label className="label mb-3">Servicios</label>
                <div className="space-y-3">
                  {Object.entries(ServiceLabels).map(([type, label]) => {
                    const existingService = editingProxy.services.find((s) => s.type === type)
                    const isEnabled = existingService?.isEnabled ?? false
                    const prices = existingService?.prices || []

                    return (
                      <div key={type} className="p-4 border border-gray-200 rounded-xl">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: ServiceColors[type as ServiceType] }}
                            ></div>
                            <span className="font-medium">{label}</span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isEnabled}
                              onChange={(e) => {
                                const services = [...editingProxy.services]
                                const idx = services.findIndex((s) => s.type === type)
                                if (idx >= 0) {
                                  services[idx].isEnabled = e.target.checked
                                } else {
                                  services.push({
                                    type: type as ServiceType,
                                    isEnabled: e.target.checked,
                                    hideInSearchForm: false,
                                    prices: [{ amount: 0, currency: 'USD' }],
                                  })
                                }
                                setEditingProxy({ ...editingProxy, services })
                              }}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                          </label>
                        </div>
                        {isEnabled && (
                          <div className="grid grid-cols-2 gap-2">
                            {Object.values(Currencies).map((currency) => {
                              const price = prices.find((p) => p.currency === currency)
                              return (
                                <div key={currency} className="flex items-center gap-2">
                                  <span className="text-sm text-gray-500 w-10">{currency}</span>
                                  <input
                                    type="number"
                                    value={price?.amount || ''}
                                    onChange={(e) => {
                                      const services = [...editingProxy.services]
                                      const sIdx = services.findIndex((s) => s.type === type)
                                      if (sIdx >= 0) {
                                        const pIdx = services[sIdx].prices.findIndex(
                                          (p) => p.currency === currency
                                        )
                                        if (pIdx >= 0) {
                                          services[sIdx].prices[pIdx].amount = parseFloat(e.target.value) || 0
                                        } else {
                                          services[sIdx].prices.push({
                                            currency,
                                            amount: parseFloat(e.target.value) || 0,
                                          })
                                        }
                                        setEditingProxy({ ...editingProxy, services })
                                      }
                                    }}
                                    className="input-field py-1 text-sm"
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                  />
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingProxy(null)
                }}
                className="btn-outline"
              >
                Cancelar
              </button>
              <button onClick={handleSave} className="btn-primary">
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
