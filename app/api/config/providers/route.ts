import { NextRequest, NextResponse } from 'next/server'
import { validateAdminRequest } from '@/lib/auth'
import { configRepository } from '@/lib/db/repositories'

export const dynamic = 'force-dynamic'

/**
 * GET /api/config/providers
 * Obtiene la lista de proveedores disponibles
 */
export async function GET(request: NextRequest) {
  try {
    const { error } = await validateAdminRequest(request)
    if (error) {
      return NextResponse.json({ error }, { status: 401 })
    }

    const providers = await configRepository.getProviders()

    return NextResponse.json({
      providers,
    })
  } catch (error) {
    console.error('Error fetching providers:', error)
    return NextResponse.json(
      { error: 'Error al obtener proveedores' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/config/providers
 * Crea un nuevo proveedor
 */
export async function POST(request: NextRequest) {
  try {
    const { error } = await validateAdminRequest(request)
    if (error) {
      return NextResponse.json({ error }, { status: 401 })
    }

    const body = await request.json()
    const { code, isEnabled } = body

    if (!code) {
      return NextResponse.json(
        { error: 'Código es requerido' },
        { status: 400 }
      )
    }

    // Check if provider code already exists
    const existingProviders = await configRepository.getProviders()
    if (existingProviders.some(p => p.code === code)) {
      return NextResponse.json(
        { error: 'Ya existe un proveedor con ese código' },
        { status: 400 }
      )
    }

    await configRepository.addProvider({
      code,
      isEnabled: isEnabled ?? true,
    })

    const providers = await configRepository.getProviders()

    return NextResponse.json({
      message: 'Proveedor creado correctamente',
      providers,
    })
  } catch (error) {
    console.error('Error creating provider:', error)
    return NextResponse.json(
      { error: 'Error al crear proveedor' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/config/providers
 * Actualiza la lista completa de proveedores
 */
export async function PUT(request: NextRequest) {
  try {
    const { error } = await validateAdminRequest(request)
    if (error) {
      return NextResponse.json({ error }, { status: 401 })
    }

    const body = await request.json()
    const { providers } = body

    if (!Array.isArray(providers)) {
      return NextResponse.json(
        { error: 'Se requiere un array de proveedores' },
        { status: 400 }
      )
    }

    await configRepository.updateProviders(providers)

    return NextResponse.json({
      message: 'Proveedores actualizados correctamente',
      providers,
    })
  } catch (error) {
    console.error('Error updating providers:', error)
    return NextResponse.json(
      { error: 'Error al actualizar proveedores' },
      { status: 500 }
    )
  }
}
