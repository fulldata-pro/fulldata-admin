'use client'

import { useState, useEffect } from 'react'
import { UsersTab } from './UsersTab'
import { BalanceTab } from './BalanceTab'
import { TokensTab } from './TokensTab'
import { ReportsTab } from './ReportsTab'
import { ApiKeysTab } from './ApiKeysTab'
import { WebhooksTab } from './WebhooksTab'
import { ProvidersTab } from './ProvidersTab'
import { EditBillingModal } from '@/components/modals/EditBillingModal'
import { toast } from 'react-toastify'

interface TabProps {
  account: any
  tokenBalance: any
  accountApis: any[]
  webhooks: any[]
  activeTab?: string
  onTabChange?: (tab: string) => void
  onBalanceUpdate?: () => void
  onApiKeysUpdate?: () => void
  onWebhooksUpdate?: () => void
}

export function AccountTabs({
  account,
  tokenBalance,
  accountApis,
  webhooks,
  activeTab: activeTabProp,
  onTabChange,
  onBalanceUpdate,
  onApiKeysUpdate,
  onWebhooksUpdate
}: TabProps) {
  const [activeTab, setActiveTab] = useState(activeTabProp || 'overview')
  const [showEditBillingModal, setShowEditBillingModal] = useState(false)
  const [countrySettings, setCountrySettings] = useState<any>(null)

  // Use prop for activeTab if provided, otherwise use local state
  useEffect(() => {
    if (activeTabProp) {
      setActiveTab(activeTabProp)
    }
  }, [activeTabProp])

  // Handle tab change
  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId)
    onTabChange?.(tabId)
  }

  // Load country settings when component mounts or country changes
  useEffect(() => {
    if (account?.billing?.countryId || account?.billing?.country?._id) {
      loadCountrySettings(account.billing.countryId || account.billing.country._id)
    } else if (account?.billing?.country?.name) {
      loadCountrySettings(account.billing.country.name)
    } else {
      // Default to Argentina if no country is set
      loadCountrySettings('Argentina')
    }
  }, [account?.billing?.countryId, account?.billing?.country])

  const loadCountrySettings = async (countryIdOrName: string) => {
    try {
      const isId = countryIdOrName.match(/^[a-f0-9]{24}$/i)
      const param = isId ? `countryId=${countryIdOrName}` : `countryName=${countryIdOrName}`
      const response = await fetch(`/api/country-settings?${param}`)
      if (response.ok) {
        const result = await response.json()
        setCountrySettings(result.data)
      }
    } catch (error) {
      console.error('Error loading country settings:', error)
    }
  }

  const handleUpdateBilling = async (billingData: any) => {
    const response = await fetch(`/api/accounts/${account._id}/billing`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(billingData)
    })

    if (response.ok) {
      toast.success('Datos de facturación actualizados')
      setShowEditBillingModal(false)
      // Recargar la página para mostrar los cambios
      window.location.reload()
    } else {
      toast.error('Error al actualizar datos de facturación')
    }
  }

  const tabs = [
    { id: 'overview', label: 'Información', icon: 'ki-home-2', count: null },
    { id: 'users', label: 'Usuarios', icon: 'ki-people', count: account?.users?.length || 0 },
    { id: 'balance', label: 'Balance', icon: 'ki-wallet', count: null },
    { id: 'tokens', label: 'Tokens', icon: 'ki-tag', count: null },
    { id: 'reports', label: 'Reportes', icon: 'ki-chart-line', count: null },
    { id: 'apikeys', label: 'API Keys', icon: 'ki-key', count: accountApis?.length || 0 },
    { id: 'webhooks', label: 'Webhooks', icon: 'ki-notification', count: webhooks?.length || 0 },
    { id: 'providers', label: 'Proveedores', icon: 'ki-setting-2', count: null }
  ]

  const getTabClasses = (isActive: boolean) => {
    if (isActive) {
      return 'bg-white text-primary shadow-md border-gray-100 scale-[1.02]'
    }
    return 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-white/60 hover:shadow-sm'
  }

  const getIconClasses = (isActive: boolean) => {
    if (isActive) {
      return 'text-primary'
    }
    return 'text-gray-400 group-hover:text-gray-600'
  }

  return (
    <div>
      {/* Tab Navigation */}
      <div className="bg-gray-100/80 backdrop-blur-sm rounded-2xl p-1.5 mb-6 overflow-x-auto">
        <div className="flex items-center gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`
                group flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 whitespace-nowrap border
                ${getTabClasses(activeTab === tab.id)}
              `}
            >
              <i className={`ki-duotone ${tab.icon} text-base transition-colors duration-200 ${getIconClasses(activeTab === tab.id)}`}>
                <span className="path1"></span>
                <span className="path2"></span>
                <span className="path3"></span>
                <span className="path4"></span>
                <span className="path5"></span>
              </i>
              <span>{tab.label}</span>
              {tab.count !== null && tab.count > 0 && (
                <span className={`
                  min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold flex items-center justify-center transition-colors duration-200
                  ${activeTab === tab.id
                    ? 'bg-primary text-white'
                    : 'bg-gray-300/80 text-gray-600 group-hover:bg-gray-300'
                  }
                `}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Información General */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <i className="ki-duotone ki-information-circle text-primary text-xl">
                  <span className="path1"></span>
                  <span className="path2"></span>
                  <span className="path3"></span>
                </i>
                <h3 className="text-lg font-semibold text-gray-800">Información General</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <dl className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <dt className="text-sm text-gray-600">ID</dt>
                      <dd className="font-mono text-sm font-medium text-gray-900">{account?.id || '-'}</dd>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <dt className="text-sm text-gray-600">Código de Referido</dt>
                      <dd className="font-medium text-gray-900">{account?.referralCode || 'Sin código'}</dd>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <dt className="text-sm text-gray-600">Balance Referidos</dt>
                      <dd className="font-medium text-green-600">${account?.referralBalance || 0}</dd>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <dt className="text-sm text-gray-600">Fecha de Creación</dt>
                      <dd className="font-medium text-gray-900">
                        {account?.createdAt ? new Date(account.createdAt).toLocaleDateString('es-AR') : '-'}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <dl className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <dt className="text-sm text-gray-600">Nombre/Razón Social</dt>
                      <dd className="font-medium text-gray-900">{account?.billing?.name || account?.name || '-'}</dd>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <dt className="text-sm text-gray-600">CUIT/DNI</dt>
                      <dd className="font-medium text-gray-900">{account?.billing?.taxId || '-'}</dd>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <dt className="text-sm text-gray-600">Tipo</dt>
                      <dd className="font-medium text-gray-900">{account?.billing?.type || '-'}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>

            {/* Datos de Facturación */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <i className="ki-duotone ki-bill text-primary text-xl">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                  <h3 className="text-lg font-semibold text-gray-800">Datos de Facturación</h3>
                </div>
                <div className="flex items-center gap-2">
                  {account?.billing?.verifiedAt && (
                    <span className="badge badge-light-success">
                      <i className="ki-solid ki-check-circle text-xs me-1"></i>
                      Verificado
                    </span>
                  )}
                  <button
                    onClick={() => setShowEditBillingModal(true)}
                    className="btn btn-sm btn-light"
                    title="Editar datos de facturación"
                  >
                    <i className="ki-duotone ki-pencil">
                      <span className="path1"></span>
                      <span className="path2"></span>
                    </i>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Dirección</label>
                  <p className="font-medium text-gray-900">{account?.billing?.address || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Ciudad</label>
                  <p className="font-medium text-gray-900">{account?.billing?.city || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Provincia</label>
                  <p className="font-medium text-gray-900">
                    {account?.billing?.state?.name || account?.billing?.state || '-'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">País</label>
                  <p className="font-medium text-gray-900">
                    {account?.billing?.country?.name || account?.billing?.country || '-'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Código Postal</label>
                  <p className="font-medium text-gray-900">{account?.billing?.zip || '-'}</p>
                </div>
                {/* VAT Type - Only show for businesses */}
                {account?.billing?.type?.toUpperCase() === 'BUSINESS' && (
                  <div>
                    <label className="text-sm text-gray-600">Tipo IVA</label>
                    <p className="font-medium text-gray-900">
                      {(() => {
                        const vatType = account?.billing?.vatType
                        if (!vatType) return '-'

                        // Try to find the name from country settings
                        const vatTypeName = countrySettings?.vatType?.find(
                          (v: any) => v.id === vatType
                        )?.name

                        if (vatTypeName) return vatTypeName

                        // Mapeo de valores comunes como fallback
                        const vatTypeMap: { [key: string]: string } = {
                          'consumidor_final': 'Consumidor Final',
                          'responsable_inscripto': 'Responsable Inscripto',
                          'monotributo': 'Monotributo',
                          'exento': 'Exento',
                          'responsable_no_inscripto': 'Responsable No Inscripto',
                          'sujeto_no_categorizado': 'Sujeto No Categorizado',
                          'CONSUMIDOR_FINAL': 'Consumidor Final',
                          'RESPONSABLE_INSCRIPTO': 'Responsable Inscripto',
                          'MONOTRIBUTO': 'Monotributo',
                          'EXENTO': 'Exento'
                        }

                        return vatTypeMap[vatType] || vatType
                      })()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Configuración de Servicios */}
            {account?.serviceConfig && (
              <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <i className="ki-duotone ki-setting-2 text-primary text-xl">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                  <h3 className="text-lg font-semibold text-gray-800">Configuración de Servicios</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <span className={`badge ${account.serviceConfig.webhookEnabled ? 'badge-success' : 'badge-danger'}`}>
                      Webhooks {account.serviceConfig.webhookEnabled ? 'ON' : 'OFF'}
                    </span>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <span className={`badge ${account.serviceConfig.apiEnabled ? 'badge-success' : 'badge-danger'}`}>
                      API {account.serviceConfig.apiEnabled ? 'ON' : 'OFF'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <UsersTab users={account?.users || []} />
        )}

        {activeTab === 'balance' && (
          <BalanceTab referralBalance={account?.referralBalance} />
        )}

        {activeTab === 'tokens' && (
          <TokensTab
            accountId={account?._id}
            tokenBalance={tokenBalance}
            onBalanceUpdate={onBalanceUpdate}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsTab accountId={account?._id} />
        )}

        {activeTab === 'apikeys' && (
          <ApiKeysTab
            accountApis={accountApis}
            accountId={account?._id}
            apiEnabled={account?.serviceConfig?.apiEnabled}
            onApiKeysUpdate={onApiKeysUpdate}
          />
        )}

        {activeTab === 'webhooks' && (
          <WebhooksTab
            webhooks={webhooks}
            accountId={account?._id}
            webhookEnabled={account?.serviceConfig?.webhookEnabled}
            onWebhooksUpdate={onWebhooksUpdate}
          />
        )}

        {activeTab === 'providers' && (
          <ProvidersTab
            accountId={account?._id}
          />
        )}
      </div>

      <EditBillingModal
        isOpen={showEditBillingModal}
        onClose={() => setShowEditBillingModal(false)}
        onConfirm={handleUpdateBilling}
        accountName={account?.billing?.name || account?.name || 'Sin Nombre'}
        initialData={account?.billing}
      />
    </div>
  )
}