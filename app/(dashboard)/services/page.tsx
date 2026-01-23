'use client'

import { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'react-toastify'
import { ServiceLabels, ServiceColors, ServiceType } from '@/lib/constants'

interface ProxyService {
  type: ServiceType
  tokenCost?: number
  isEnabled: boolean
  hideInSearchForm?: boolean
}

interface Proxy {
  id: number
  uid: string
  name: string
  countryCode: string
  services: ProxyService[]
  createdAt: string
}

const countryFlags: Record<string, string> = {
  AR: '🇦🇷',
  US: '🇺🇸',
  BR: '🇧🇷',
  MX: '🇲🇽',
  CL: '🇨🇱',
  CO: '🇨🇴',
  PE: '🇵🇪',
  UY: '🇺🇾',
  ES: '🇪🇸',
  GLOBAL: '🌍',
}

export default function ServicesPage() {
  const [proxies, setProxies] = useState<Proxy[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingProxy, setEditingProxy] = useState<Proxy | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<number | null>(null)
  const dropdownRefs = useRef<Map<number, HTMLDivElement>>(new Map())

  const fetchData = async () => {
    try {
      const response = await fetch('/api/services')
      if (response.ok) {
        const data = await response.json()
        setProxies(data.proxies)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Error al cargar datos')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown !== null) {
        const dropdown = dropdownRefs.current.get(openDropdown)
        if (dropdown && !dropdown.contains(event.target as Node)) {
          setOpenDropdown(null)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openDropdown])

  const handleSave = async () => {
    if (!editingProxy) return

    if (!editingProxy.name || !editingProxy.countryCode) {
      toast.error('Nombre y código de país son requeridos')
      return
    }

    try {
      const isNew = !editingProxy.uid
      const method = isNew ? 'POST' : 'PUT'
      const url = isNew ? '/api/services' : `/api/services/${editingProxy.uid}`

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProxy),
      })

      if (response.ok) {
        toast.success(isNew ? 'Proxy creado' : 'Proxy actualizado')
        setShowModal(false)
        setEditingProxy(null)
        fetchData()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Error al guardar proxy')
      }
    } catch {
      toast.error('Error al guardar proxy')
    }
  }

  const handleDelete = async (uid: string) => {
    if (!confirm('¿Estás seguro de eliminar este proxy?')) return

    try {
      const response = await fetch(`/api/services/${uid}`, { method: 'DELETE' })
      if (response.ok) {
        toast.success('Proxy eliminado')
        fetchData()
      } else {
        toast.error('Error al eliminar proxy')
      }
    } catch {
      toast.error('Error al eliminar proxy')
    }
  }

  const handleServiceToggle = async (proxy: Proxy, serviceType: ServiceType, enabled: boolean) => {
    try {
      const response = await fetch(`/api/services/${proxy.uid}/toggle`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceType, isEnabled: enabled }),
      })

      if (response.ok) {
        toast.success('Servicio actualizado')
        fetchData()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Error al actualizar servicio')
      }
    } catch {
      toast.error('Error al actualizar servicio')
    }
  }

  const openNewModal = () => {
    setEditingProxy({
      id: 0,
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
        <button onClick={openNewModal} className="btn btn-primary flex items-center gap-2">
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
          <div key={proxy.uid} className="card">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{countryFlags[proxy.countryCode] || '🌍'}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-secondary">{proxy.name}</h3>
                    <p className="text-sm text-gray-500">
                      ID: {proxy.id} • {proxy.countryCode}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingProxy(proxy)
                    setShowModal(true)
                  }}
                  className="btn btn-light btn-sm"
                >
                  <i className="ki-duotone ki-pencil text-lg">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                </button>
                <button
                  onClick={() => handleDelete(proxy.uid)}
                  className="btn btn-light btn-sm text-red-500 hover:bg-red-50 hover:border-red-300"
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
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Costo en tokens</span>
                    <span className="font-semibold text-secondary">
                      {(service.tokenCost ?? 0).toLocaleString()}
                    </span>
                  </div>
                  {service.hideInSearchForm && (
                    <div className="mt-2">
                      <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                        Oculto en búsqueda
                      </span>
                    </div>
                  )}
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
            <button onClick={openNewModal} className="btn btn-primary">
              Crear primer proxy
            </button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showModal && editingProxy && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => {
              setShowModal(false)
              setEditingProxy(null)
            }}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <i className="ki-duotone ki-setting-2 text-xl text-primary">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editingProxy.uid ? 'Editar Proxy' : 'Nuevo Proxy'}
                  </h3>
                  <p className="text-sm text-gray-500">Configura el proxy y sus servicios disponibles</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingProxy(null)
                }}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <i className="ki-duotone ki-cross text-xl text-gray-500">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
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
                    onChange={(e) =>
                      setEditingProxy({ ...editingProxy, countryCode: e.target.value.toUpperCase() })
                    }
                    className="input-field"
                    placeholder="AR"
                    maxLength={2}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="label">Servicios Configurados</label>
                  <button
                    type="button"
                    onClick={() => {
                      // Find the first service type not already in use
                      const usedTypes = editingProxy.services.map(s => s.type)
                      const availableTypes = Object.keys(ServiceLabels) as ServiceType[]
                      const nextType = availableTypes.find(t => !usedTypes.includes(t))

                      if (nextType) {
                        const services = [...editingProxy.services]
                        services.push({
                          type: nextType,
                          isEnabled: true,
                          tokenCost: 1,
                          hideInSearchForm: false,
                        })
                        setEditingProxy({ ...editingProxy, services })
                      } else {
                        toast.warning('Todos los servicios ya están configurados')
                      }
                    }}
                    className="btn btn-sm btn-light flex items-center gap-2"
                  >
                    <i className="ki-duotone ki-plus-circle">
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                    Agregar Servicio
                  </button>
                </div>

                {editingProxy.services.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-xl">
                    <i className="ki-duotone ki-information-5 text-4xl text-gray-300 mb-3">
                      <span className="path1"></span>
                      <span className="path2"></span>
                      <span className="path3"></span>
                    </i>
                    <p className="text-gray-500 text-sm">No hay servicios configurados</p>
                    <p className="text-gray-400 text-xs mt-1">Haz clic en "Agregar Servicio" para comenzar</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {editingProxy.services.map((service, index) => {
                      const availableTypes = Object.keys(ServiceLabels) as ServiceType[]
                      const usedTypes = editingProxy.services.map(s => s.type).filter((t, i) => i !== index)

                      return (
                        <div key={index} className="p-4 border border-gray-200 rounded-xl bg-gray-50">
                          <div className="grid grid-cols-12 gap-4 items-center">
                            {/* Service Dropdown */}
                            <div className="col-span-4 relative">
                              <label className="text-xs text-gray-500 mb-1 block">Servicio</label>
                              <div
                                ref={(el) => {
                                  if (el) dropdownRefs.current.set(index, el)
                                }}
                                className="relative"
                              >
                                <button
                                  type="button"
                                  onClick={() => setOpenDropdown(openDropdown === index ? null : index)}
                                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-left flex items-center justify-between hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                  <span className="flex items-center gap-2">
                                    <div
                                      className="w-3 h-3 rounded-full"
                                      style={{ backgroundColor: ServiceColors[service.type] }}
                                    ></div>
                                    {ServiceLabels[service.type]}
                                  </span>
                                  <i className="ki-duotone ki-down text-gray-400">
                                    <span className="path1"></span>
                                    <span className="path2"></span>
                                  </i>
                                </button>

                                {openDropdown === index && typeof window !== 'undefined' && createPortal(
                                  (() => {
                                    const buttonRect = dropdownRefs.current.get(index)?.getBoundingClientRect()
                                    if (!buttonRect) return null

                                    const spaceBelow = window.innerHeight - buttonRect.bottom - 20
                                    const spaceAbove = buttonRect.top - 20
                                    const dropdownHeight = Math.min(240, availableTypes.length * 40)
                                    const shouldShowAbove = spaceBelow < dropdownHeight && spaceAbove > spaceBelow

                                    return (
                                      <div
                                        className="fixed z-[10000] bg-white border border-gray-200 rounded-lg shadow-lg overflow-auto"
                                        style={{
                                          left: `${buttonRect.left}px`,
                                          width: `${buttonRect.width}px`,
                                          ...(shouldShowAbove
                                            ? {
                                                bottom: `${window.innerHeight - buttonRect.top + 4}px`,
                                                maxHeight: Math.min(240, spaceAbove)
                                              }
                                            : {
                                                top: `${buttonRect.bottom + 4}px`,
                                                maxHeight: Math.min(240, spaceBelow)
                                              }
                                          )
                                        }}
                                      >
                                        {availableTypes.map(type => (
                                          <button
                                            key={type}
                                            type="button"
                                            disabled={usedTypes.includes(type)}
                                            onClick={() => {
                                              if (!usedTypes.includes(type)) {
                                                const services = [...editingProxy.services]
                                                services[index].type = type
                                                setEditingProxy({ ...editingProxy, services })
                                                setOpenDropdown(null)
                                              }
                                            }}
                                            className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-50 ${
                                              usedTypes.includes(type) ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
                                          >
                                            <div
                                              className="w-3 h-3 rounded-full"
                                              style={{ backgroundColor: ServiceColors[type] }}
                                            ></div>
                                            {ServiceLabels[type]}
                                            {usedTypes.includes(type) && (
                                              <span className="text-xs text-gray-400 ml-auto">(En uso)</span>
                                            )}
                                          </button>
                                        ))}
                                      </div>
                                    )
                                  })(),
                                  document.body
                                )}
                              </div>
                            </div>

                            {/* Token Cost */}
                            <div className="col-span-2">
                              <label className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                Tokens
                                <div className="relative group">
                                  <i className="ki-duotone ki-information-5 text-gray-400 cursor-help">
                                    <span className="path1"></span>
                                    <span className="path2"></span>
                                    <span className="path3"></span>
                                  </i>
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 pointer-events-none">
                                    Costo en tokens para usar este servicio
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                  </div>
                                </div>
                              </label>
                              <input
                                type="number"
                                value={service.tokenCost || 0}
                                onChange={(e) => {
                                  const services = [...editingProxy.services]
                                  services[index].tokenCost = parseInt(e.target.value) || 0
                                  setEditingProxy({ ...editingProxy, services })
                                }}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="1"
                                min="0"
                              />
                            </div>

                            {/* Enabled Switch */}
                            <div className="col-span-2 text-center">
                              <label className="text-xs text-gray-500 mb-1 block">Habilitado</label>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={service.isEnabled}
                                  onChange={(e) => {
                                    const services = [...editingProxy.services]
                                    services[index].isEnabled = e.target.checked
                                    setEditingProxy({ ...editingProxy, services })
                                  }}
                                  className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                              </label>
                            </div>

                            {/* Hide in Search Form */}
                            <div className="col-span-3 text-center">
                              <label className="text-xs text-gray-500 mb-1 flex items-center gap-1 justify-center">
                                Ocultar
                                <div className="relative group">
                                  <i className="ki-duotone ki-information-5 text-gray-400 cursor-help">
                                    <span className="path1"></span>
                                    <span className="path2"></span>
                                    <span className="path3"></span>
                                  </i>
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 pointer-events-none">
                                    Ocultar este servicio en el formulario de búsqueda
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                  </div>
                                </div>
                              </label>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={service.hideInSearchForm || false}
                                  onChange={(e) => {
                                    const services = [...editingProxy.services]
                                    services[index].hideInSearchForm = e.target.checked
                                    setEditingProxy({ ...editingProxy, services })
                                  }}
                                  className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
                              </label>
                            </div>

                            {/* Remove Button */}
                            <div className="col-span-1 text-end">
                              <button
                                type="button"
                                onClick={() => {
                                  const services = editingProxy.services.filter((_, i) => i !== index)
                                  setEditingProxy({ ...editingProxy, services })
                                }}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Eliminar servicio"
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
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingProxy(null)
                }}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button onClick={handleSave} className="btn btn-primary flex items-center gap-2">
                <i className="ki-duotone ki-check text-lg">
                  <span className="path1"></span>
                  <span className="path2"></span>
                </i>
                {editingProxy.uid ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
