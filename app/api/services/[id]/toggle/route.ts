import { NextRequest, NextResponse } from 'next/server'
import { validateAdminRequest } from '@/lib/auth'
import { proxyRepository } from '@/lib/db/repositories'

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * Toggle a specific service's isEnabled status
 * This endpoint only updates isEnabled without touching other fields
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { admin, error } = await validateAdminRequest(request)
    if (error || !admin) {
      return NextResponse.json({ error: error || 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const { serviceType, isEnabled } = body

    if (!serviceType || typeof isEnabled !== 'boolean') {
      return NextResponse.json(
        { error: 'serviceType e isEnabled son requeridos' },
        { status: 400 }
      )
    }

    // Try to find by uid first, then by _id
    let proxy = await proxyRepository.findByUid(id)
    if (!proxy) {
      proxy = await proxyRepository.findById(id)
    }

    if (!proxy || proxy.deletedAt) {
      return NextResponse.json({ error: 'Proxy no encontrado' }, { status: 404 })
    }

    // Use the repository method that only updates the specific service
    const updatedProxy = await proxyRepository.toggleService(
      proxy._id,
      serviceType,
      isEnabled,
      admin._id
    )

    if (!updatedProxy) {
      return NextResponse.json(
        { error: 'Servicio no encontrado en el proxy' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Toggle service error:', error)
    return NextResponse.json(
      { error: 'Error al actualizar servicio' },
      { status: 500 }
    )
  }
}
