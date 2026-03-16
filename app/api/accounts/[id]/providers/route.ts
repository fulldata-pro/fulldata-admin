import { NextRequest, NextResponse } from 'next/server'
import { validateAdminRequest } from '@/lib/auth'
import { accountRepository, configRepository } from '@/lib/db/repositories'
import { PROVIDER_CONFIG, maskSensitiveValue } from '@/lib/constants'

export const dynamic = 'force-dynamic'

interface ProviderUpdate {
  code: string
  isEnabled: boolean
  config?: Record<string, string>
}

/**
 * GET /api/accounts/[id]/providers
 * Obtiene los proveedores configurados para una cuenta
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await validateAdminRequest(request)
    if (error) {
      return NextResponse.json({ error }, { status: 401 })
    }

    const { id } = await params
    const account = await accountRepository.findById(id)

    if (!account) {
      return NextResponse.json({ error: 'Cuenta no encontrada' }, { status: 404 })
    }

    // Get all available providers from config
    const availableProviders = await configRepository.getProviders()

    // Get account's serviceConfig
    const serviceConfig = account.serviceConfig || {}

    // Merge available providers with account settings
    // Check if provider exists as a key in serviceConfig and has isEnabled property
    const mergedProviders = availableProviders.map(provider => {
      const providerConfig = serviceConfig[provider.code] || {}
      // If provider is not configured in account, default to disabled
      const isEnabled = providerConfig?.isEnabled === true

      // Build config object with masked sensitive values
      const providerMeta = PROVIDER_CONFIG[provider.code]
      const config: Record<string, string> = {}

      if (providerMeta?.fields) {
        for (const field of providerMeta.fields) {
          const value = providerConfig[field.key]
          if (field.type === 'password') {
            // Mask sensitive values but indicate if configured
            config[field.key] = value ? maskSensitiveValue(value) : ''
            config[`${field.key}_configured`] = value ? 'true' : 'false'
          } else {
            config[field.key] = value || ''
          }
        }
      }

      return {
        code: provider.code,
        isEnabled,
        config,
      }
    })

    return NextResponse.json({
      providers: mergedProviders,
    })
  } catch (error) {
    console.error('Error fetching account providers:', error)
    return NextResponse.json(
      { error: 'Error al obtener proveedores de la cuenta' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/accounts/[id]/providers
 * Actualiza los proveedores habilitados para una cuenta
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error, admin } = await validateAdminRequest(request)
    if (error) {
      return NextResponse.json({ error }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { providers } = body as { providers: ProviderUpdate[] }

    if (!Array.isArray(providers)) {
      return NextResponse.json(
        { error: 'Se requiere un array de proveedores' },
        { status: 400 }
      )
    }

    const account = await accountRepository.findById(id)
    if (!account) {
      return NextResponse.json({ error: 'Cuenta no encontrada' }, { status: 404 })
    }

    // Validate provider codes against available providers
    const availableProviders = await configRepository.getProviders()
    const validCodes = new Set(availableProviders.map(p => p.code))

    for (const provider of providers) {
      if (!validCodes.has(provider.code)) {
        return NextResponse.json(
          { error: `Proveedor inválido: ${provider.code}` },
          { status: 400 }
        )
      }
    }

    // Build updated serviceConfig with each provider as a direct key
    // Convert Mongoose subdocument to plain object
    const currentServiceConfig = account.serviceConfig?.toObject?.() ?? { ...account.serviceConfig }
    const updatedServiceConfig: Record<string, unknown> = {
      webhookEnabled: currentServiceConfig.webhookEnabled ?? false,
      apiEnabled: currentServiceConfig.apiEnabled ?? false,
    }

    for (const provider of providers) {
      // Get existing config as plain object
      const existingRaw = currentServiceConfig[provider.code]
      const existingConfig = existingRaw?.toObject?.() ?? existingRaw ?? {}
      const providerMeta = PROVIDER_CONFIG[provider.code]

      // Start with existing config
      const newConfig: Record<string, unknown> = {
        ...existingConfig,
        isEnabled: provider.isEnabled,
      }

      // Update additional config fields if provided
      if (provider.config && providerMeta?.fields) {
        for (const field of providerMeta.fields) {
          const newValue = provider.config[field.key]
          // Only update if a new value is provided (not empty string)
          // This allows keeping existing values when user doesn't change them
          if (newValue !== undefined && newValue !== '') {
            newConfig[field.key] = newValue
          }
          // If empty string is passed, remove the field (reset to default)
          else if (newValue === '') {
            delete newConfig[field.key]
          }
        }
      }

      updatedServiceConfig[provider.code] = newConfig
    }

    await accountRepository.update(account._id, {
      $set: {
        serviceConfig: updatedServiceConfig,
        updatedBy: admin?._id,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      message: 'Proveedores actualizados correctamente',
      providers,
    })
  } catch (error) {
    console.error('Error updating account providers:', error)
    return NextResponse.json(
      { error: 'Error al actualizar proveedores de la cuenta' },
      { status: 500 }
    )
  }
}
