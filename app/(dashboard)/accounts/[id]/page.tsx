'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'react-toastify'
import { ROUTES } from '@/lib/constants'
import { AccountHeader } from '@/components/account/AccountHeader'
import { AccountTabs } from '@/components/account/AccountTabs'

export default function AccountDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const router = useRouter()

  const [account, setAccount] = useState<any>(null)
  const [tokenBalance, setTokenBalance] = useState<any>(null)
  const [accountApis, setAccountApis] = useState<any[]>([])
  const [webhooks, setWebhooks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [dataLoadedTabs, setDataLoadedTabs] = useState<Set<string>>(new Set(['overview']))

  // Fetch account details
  const fetchAccount = useCallback(async () => {
    try {
      const response = await fetch(`/api/accounts/${id}`)
      if (!response.ok) {
        throw new Error('Error al obtener la cuenta')
      }
      const data = await response.json()
      // El API devuelve { account, tokenBalance, accountApi, ... }
      setAccount(data.account)
      // También podemos obtener el tokenBalance desde aquí
      if (data.tokenBalance) {
        setTokenBalance(data.tokenBalance)
      }
      // Y los API keys si existen
      if (data.accountApi) {
        setAccountApis([data.accountApi])
      }
    } catch (error) {
      console.error('Error fetching account:', error)
      toast.error('Error al cargar la cuenta')
      router.push(ROUTES.ACCOUNTS)
    }
  }, [id, router])

  // Fetch token balance
  const fetchTokenBalance = useCallback(async () => {
    try {
      const response = await fetch(`/api/accounts/${id}/tokens`)
      if (response.ok) {
        const data = await response.json()
        setTokenBalance(data)
      }
    } catch (error) {
      console.error('Error fetching token balance:', error)
    }
  }, [id])

  // Fetch API keys
  const fetchApiKeys = useCallback(async () => {
    try {
      const response = await fetch(`/api/accounts/${id}/api-keys`)
      if (response.ok) {
        const data = await response.json()
        setAccountApis(data.apiKeys || [])
      }
    } catch (error) {
      console.error('Error fetching API keys:', error)
    }
  }, [id])

  // Fetch webhooks
  const fetchWebhooks = useCallback(async () => {
    try {
      const response = await fetch(`/api/accounts/${id}/webhooks`)
      if (response.ok) {
        const data = await response.json()
        setWebhooks(data.webhooks || [])
      }
    } catch (error) {
      console.error('Error fetching webhooks:', error)
    }
  }, [id])

  // Load data based on active tab
  const loadTabData = useCallback(async (tabName: string) => {
    // Skip if already loaded (except for webhooks and api-keys which need fresh data)
    if (dataLoadedTabs.has(tabName) && tabName !== 'webhooks' && tabName !== 'apikeys') {
      return
    }

    switch (tabName) {
      case 'overview':
      case 'users':
        // These tabs only need account data
        if (!account) {
          await fetchAccount()
        }
        break
      case 'balance':
        // Balance tab doesn't need specific data
        break
      case 'tokens':
        await fetchTokenBalance()
        break
      case 'apikeys':
        await fetchApiKeys()
        break
      case 'webhooks':
        await fetchWebhooks()
        break
      case 'reports':
        // Reports are loaded by the ReportsTab component itself
        break
    }

    // Mark tab as loaded
    setDataLoadedTabs(prev => new Set([...prev, tabName]))
  }, [account, fetchAccount, fetchTokenBalance, fetchApiKeys, fetchWebhooks, dataLoadedTabs])

  // Handle tab change
  const handleTabChange = useCallback((newTab: string) => {
    setActiveTab(newTab)
    loadTabData(newTab)
  }, [loadTabData])

  // Initial load - only load account and current tab data
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true)
      await fetchAccount()
      await loadTabData(activeTab)
      setIsLoading(false)
    }
    loadInitialData()
  }, []) // Only run once on mount

  // Refresh functions for child components
  const refreshApiKeys = useCallback(async () => {
    await fetchApiKeys()
  }, [fetchApiKeys])

  const refreshWebhooks = useCallback(async () => {
    await fetchWebhooks()
  }, [fetchWebhooks])

  // Handlers for updates
  const handleTokensGifted = () => {
    fetchTokenBalance()
  }

  const handleStatusChanged = () => {
    fetchAccount()
  }

  const handleBillingUpdated = () => {
    fetchAccount()
  }

  const handleBalanceUpdate = () => {
    fetchTokenBalance()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="text-gray-500">Cargando información de la cuenta...</p>
        </div>
      </div>
    )
  }

  if (!account) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <i className="ki-duotone ki-information-circle text-gray-300 text-5xl mb-3">
            <span className="path1"></span>
            <span className="path2"></span>
            <span className="path3"></span>
          </i>
          <p className="text-gray-500">Cuenta no encontrada</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link href={ROUTES.ACCOUNTS} className="hover:text-primary transition-colors">
          Cuentas
        </Link>
        <i className="ki-duotone ki-right text-xs">
          <span className="path1"></span>
          <span className="path2"></span>
        </i>
        <span className="text-gray-900 font-medium">{account.name}</span>
      </nav>

      <AccountHeader
        account={account}
        tokenBalance={tokenBalance}
        onTokensGifted={handleTokensGifted}
        onStatusChanged={handleStatusChanged}
        onBillingUpdated={handleBillingUpdated}
      />

      <AccountTabs
        account={account}
        tokenBalance={tokenBalance}
        accountApis={accountApis}
        webhooks={webhooks}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onBalanceUpdate={handleBalanceUpdate}
        onApiKeysUpdate={refreshApiKeys}
        onWebhooksUpdate={refreshWebhooks}
      />
    </div>
  )
}