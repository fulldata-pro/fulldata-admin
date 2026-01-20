'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { WebhookModal } from '@/components/modals/WebhookModal'
import { ConfirmDeleteModal } from '@/components/modals/ConfirmDeleteModal'

interface WebhookConfig {
  type: string
  url: string
  events: string[]
  headers?: Record<string, string>
  isEnabled: boolean
}

interface WebhooksTabProps {
  webhooks: WebhookConfig[]
  accountId: string
  webhookEnabled?: boolean
  onWebhookToggle?: (webhookId: string, enabled: boolean) => void
  onWebhooksUpdate?: () => void
}

export function WebhooksTab({
  webhooks,
  accountId,
  webhookEnabled,
  onWebhookToggle,
  onWebhooksUpdate
}: WebhooksTabProps) {
  const [webhooksList, setWebhooksList] = useState<WebhookConfig[]>(webhooks)

  // Update webhooksList when webhooks prop changes
  useEffect(() => {
    setWebhooksList(webhooks)
  }, [webhooks])
  const [showWebhookModal, setShowWebhookModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookConfig | null>(null)
  const [webhookToDelete, setWebhookToDelete] = useState<WebhookConfig | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  return (
    <div className="space-y-6">
      {/* Webhooks Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Webhooks configurados</h3>
            <p className="text-gray-600 text-sm mt-1">Configura endpoints para recibir notificaciones</p>
          </div>
          <button
            onClick={() => {
              setSelectedWebhook(null)
              setModalMode('create')
              setShowWebhookModal(true)
            }}
            className="btn btn-danger"
          >
            <i className="ki-duotone ki-plus me-2">
              <span className="path1"></span>
              <span className="path2"></span>
            </i>
            Agregar Webhook
          </button>
        </div>

        {webhooksList.length === 0 ? (
          <div className="text-center py-12">
            <i className="ki-duotone ki-notification-status text-gray-300 text-5xl mb-3">
              <span className="path1"></span>
              <span className="path2"></span>
              <span className="path3"></span>
              <span className="path4"></span>
            </i>
            <p className="text-gray-500">No hay webhooks configurados</p>
            <p className="text-gray-400 text-sm mt-1">Agrega un webhook para empezar a recibir notificaciones</p>
          </div>
        ) : (
          <div className="space-y-6">
            {webhooksList.map((webhook, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                {/* Webhook Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="size-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                      <i className="ki-duotone ki-notification-bing text-green-600 text-lg">
                        <span className="path1"></span>
                        <span className="path2"></span>
                        <span className="path3"></span>
                      </i>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{webhook.type || 'Identidad'}</h4>
                        <span className="text-sm text-gray-500">Servicio: {webhook.type || 'IDENTITY'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={webhook.isEnabled}
                          onChange={() => handleToggleWebhook(index, !webhook.isEnabled)}
                          disabled={isUpdating === `${index}`}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                      </label>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedWebhook(webhook)
                        setModalMode('edit')
                        setShowWebhookModal(true)
                      }}
                      className="btn btn-sm btn-light"
                      title="Editar"
                    >
                      <i className="ki-duotone ki-pencil">
                        <span className="path1"></span>
                        <span className="path2"></span>
                      </i>
                    </button>
                    <button
                      onClick={() => {
                        setWebhookToDelete(webhook)
                        setShowDeleteModal(true)
                      }}
                      className="btn btn-sm btn-light-danger"
                      title="Eliminar"
                    >
                      <i className="ki-duotone ki-trash">
                        <span className="path1"></span>
                        <span className="path2"></span>
                        <span className="path3"></span>
                        <span className="path4"></span>
                        <span className="path5"></span>
                      </i>
                    </button>
                  </div>
                </div>

                {/* URL */}
                <div className="mb-4">
                  <label className="text-sm text-gray-600 mb-2 block">URL</label>
                  <div className="p-3 bg-white rounded-lg font-mono text-sm text-gray-700 break-all">
                    {webhook.url}
                  </div>
                </div>

                {/* Events */}
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Eventos suscritos</label>
                  <div className="flex flex-wrap gap-2">
                    {webhook.events.map((event) => (
                      <span key={event} className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium">
                        {event}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Webhook Modal */}
      <WebhookModal
        isOpen={showWebhookModal}
        onClose={() => {
          setShowWebhookModal(false)
          setSelectedWebhook(null)
        }}
        onConfirm={handleSaveWebhook}
        webhook={selectedWebhook}
        mode={modalMode}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setWebhookToDelete(null)
        }}
        onConfirm={handleDeleteWebhook}
        title="Eliminar Webhook"
        message="¿Estás seguro de que deseas eliminar este webhook?"
        itemName={webhookToDelete?.url}
      />
    </div>
  )

  // Handler functions
  async function handleSaveWebhook(webhookData: any) {
    try {
      const url = modalMode === 'create'
        ? `/api/accounts/${accountId}/webhooks`
        : `/api/accounts/${accountId}/webhooks/${selectedWebhook?.type}`

      const method = modalMode === 'create' ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookData)
      })

      if (response.ok) {
        const data = await response.json()

        if (modalMode === 'create') {
          setWebhooksList([...webhooksList, data.webhook])
          toast.success('Webhook agregado exitosamente')
        } else {
          setWebhooksList(webhooksList.map((w, i) =>
            i === webhooksList.indexOf(selectedWebhook!)
              ? { ...w, ...webhookData }
              : w
          ))
          toast.success('Webhook actualizado exitosamente')
        }
        // Refresh webhooks data
        onWebhooksUpdate?.()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al guardar webhook')
      }
    } catch (error) {
      console.error('Error saving webhook:', error)
      toast.error('Error al guardar webhook')
    }
  }

  async function handleToggleWebhook(index: number, enabled: boolean) {
    const webhook = webhooksList[index]
    setIsUpdating(`${index}`)

    try {
      const response = await fetch(`/api/accounts/${accountId}/webhooks/${webhook.type}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      })

      if (response.ok) {
        setWebhooksList(webhooksList.map((w, i) =>
          i === index ? { ...w, isEnabled: enabled } : w
        ))
        toast.success(enabled ? 'Webhook habilitado' : 'Webhook deshabilitado')
        // Refresh webhooks data
        onWebhooksUpdate?.()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al actualizar estado del webhook')
      }
    } catch (error) {
      console.error('Error toggling webhook:', error)
      toast.error('Error al actualizar estado del webhook')
    } finally {
      setIsUpdating(null)
    }
  }

  async function handleDeleteWebhook() {
    if (!webhookToDelete) return

    try {
      const response = await fetch(
        `/api/accounts/${accountId}/webhooks/${webhookToDelete.type}`,
        { method: 'DELETE' }
      )

      if (response.ok) {
        setWebhooksList(webhooksList.filter(w => w !== webhookToDelete))
        toast.success('Webhook eliminado exitosamente')
        // Refresh webhooks data
        onWebhooksUpdate?.()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al eliminar webhook')
      }
    } catch (error) {
      console.error('Error deleting webhook:', error)
      toast.error('Error al eliminar webhook')
    }
  }
}