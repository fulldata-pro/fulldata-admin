'use client'

import { useState, useEffect, useRef } from 'react'
import { toast } from 'react-toastify'
import { ServicesType, ServiceLabels, ServiceType } from '@/lib/constants'

interface WebhookModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (data: any) => void
  webhook?: any
  mode?: 'create' | 'edit'
}

const WEBHOOK_EVENTS = [
  { id: 'SEARCH_COMPLETED', label: 'SEARCH_COMPLETED' },
]

// Excluir IDENTITY de los tipos de webhook disponibles para crear
const WEBHOOK_TYPES = Object.values(ServicesType)
  .filter(type => type !== 'IDENTITY')
  .map(type => ({
    id: type,
    label: ServiceLabels[type as ServiceType]
  }))

export function WebhookModal({
  isOpen,
  onClose,
  onConfirm,
  webhook,
  mode = 'create'
}: WebhookModalProps) {
  const [formData, setFormData] = useState({
    type: '',
    url: '',
    events: ['SEARCH_COMPLETED'] as string[],
    headers: {} as Record<string, string>,
    isEnabled: true,
    description: ''
  })
  const [newHeaderKey, setNewHeaderKey] = useState('')
  const [newHeaderValue, setNewHeaderValue] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      if (webhook && mode === 'edit') {
        setFormData({
          type: webhook.type || '',
          url: webhook.url || '',
          events: webhook.events || ['SEARCH_COMPLETED'],
          headers: webhook.headers || {},
          isEnabled: webhook.isEnabled !== false,
          description: webhook.description || ''
        })
      } else if (mode === 'create') {
        setFormData({
          type: '',
          url: '',
          events: ['SEARCH_COMPLETED'],
          headers: {},
          isEnabled: true,
          description: ''
        })
        // Also clear the header input fields
        setNewHeaderKey('')
        setNewHeaderValue('')
      }
      // Reset dropdown state
      setShowDropdown(false)
    }
  }, [webhook, mode, isOpen])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.type) {
      toast.error('El servicio es requerido')
      return
    }

    if (!formData.url) {
      toast.error('La URL es requerida')
      return
    }

    // Validate URL
    try {
      new URL(formData.url)
    } catch {
      toast.error('La URL no es válida')
      return
    }

    setIsSubmitting(true)
    try {
      await onConfirm(formData)
      handleClose()
    } catch (error) {
      console.error('Error saving webhook:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    // Reset all form data
    setFormData({
      type: '',
      url: '',
      events: ['SEARCH_COMPLETED'],
      headers: {},
      isEnabled: true,
      description: ''
    })
    setNewHeaderKey('')
    setNewHeaderValue('')
    setShowDropdown(false)
    onClose()
  }

  const toggleEvent = (eventId: string) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.includes(eventId)
        ? prev.events.filter(e => e !== eventId)
        : [...prev.events, eventId]
    }))
  }

  const addHeader = () => {
    if (newHeaderKey && newHeaderValue) {
      setFormData(prev => ({
        ...prev,
        headers: {
          ...prev.headers,
          [newHeaderKey]: newHeaderValue
        }
      }))
      setNewHeaderKey('')
      setNewHeaderValue('')
    }
  }

  const removeHeader = (key: string) => {
    setFormData(prev => {
      const newHeaders = { ...prev.headers }
      delete newHeaders[key]
      return {
        ...prev,
        headers: newHeaders
      }
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleClose}></div>

        <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden">
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-900">
                  {mode === 'create' ? 'Agregar Webhook' : 'Editar Webhook'}
                </h2>
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="px-8 py-6 space-y-6">
              {/* Service Type - Custom Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Servicio <span className="text-red-500">*</span>
                </label>
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-left flex items-center justify-between hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  >
                    <span className={formData.type ? 'text-gray-900' : 'text-gray-400'}>
                      {formData.type
                        ? WEBHOOK_TYPES.find(t => t.id === formData.type)?.label
                        : '✓ Seleccionar servicio'}
                    </span>
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {showDropdown && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                      {WEBHOOK_TYPES.map(type => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, type: type.id }))
                            setShowDropdown(false)
                          }}
                          className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-2 ${
                            formData.type === type.id ? 'bg-red-50 text-red-600' : 'text-gray-700'
                          }`}
                        >
                          {formData.type === type.id && (
                            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                          <span className={formData.type === type.id ? 'font-medium' : ''}>
                            {type.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1.5">
                  El webhook se activará para búsquedas de este servicio
                </p>
              </div>

              {/* URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL del endpoint <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://api.ejemplo.com/webhook"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                />
              </div>


              {/* Events */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Eventos
                </label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.events.includes('SEARCH_COMPLETED')}
                      onChange={() => toggleEvent('SEARCH_COMPLETED')}
                      className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-gray-700">SEARCH_COMPLETED</span>
                  </label>
                </div>
              </div>

              {/* Headers */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Headers personalizados
                </label>

                {/* Existing headers */}
                {Object.entries(formData.headers).length > 0 && (
                  <div className="mb-3 space-y-2">
                    {Object.entries(formData.headers).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <span className="font-mono text-sm text-gray-700 flex-1">
                          {key}: {value}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeHeader(key)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add new header */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newHeaderKey}
                    onChange={(e) => setNewHeaderKey(e.target.value)}
                    placeholder="Header-Name"
                    className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                  <input
                    type="text"
                    value={newHeaderValue}
                    onChange={(e) => setNewHeaderValue(e.target.value)}
                    placeholder="valor"
                    className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={addHeader}
                    disabled={!newHeaderKey || !newHeaderValue}
                    className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Webhook activo</h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Recibir notificaciones cuando ocurran eventos
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isEnabled}
                    onChange={(e) => setFormData(prev => ({ ...prev, isEnabled: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 border-t border-gray-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2.5 text-gray-700 font-medium hover:bg-gray-50 rounded-xl transition-colors"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium rounded-xl hover:from-red-600 hover:to-pink-600 transition-all shadow-lg shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                    {mode === 'create' ? 'Creando...' : 'Guardando...'}
                  </>
                ) : (
                  mode === 'create' ? 'Crear webhook' : 'Guardar cambios'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}