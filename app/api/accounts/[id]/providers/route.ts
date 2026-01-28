import { NextRequest, NextResponse } from 'next/server'
import { validateAdminRequest } from '@/lib/auth'
import { accountRepository, configRepository } from '@/lib/db/repositories'

export const dynamic = 'force-dynamic'

interface ProviderUpdate {
  code: string
  isEnabled: boolean
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
      const providerConfig = serviceConfig[provider.code]
      // If provider is not configured in account, default to disabled
      const isEnabled = providerConfig?.isEnabled === true

      return {
        code: provider.code,
        isEnabled,
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
    const updatedServiceConfig = { ...account.serviceConfig }

    for (const provider of providers) {
      // Preserve existing provider config if any, just update isEnabled
      updatedServiceConfig[provider.code] = {
        ...updatedServiceConfig[provider.code],
        isEnabled: provider.isEnabled,
      }
    }

    await accountRepository.update(id, {
      serviceConfig: updatedServiceConfig,
      updatedBy: admin?._id,
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
