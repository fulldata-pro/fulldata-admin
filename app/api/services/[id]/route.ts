import { NextRequest, NextResponse } from 'next/server'
import { validateAdminRequest } from '@/lib/auth'
import { proxyRepository } from '@/lib/db/repositories'
import { toProxyDetailDTO } from '@/lib/dto/proxy.dto'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { error } = await validateAdminRequest(request)
    if (error) {
      return NextResponse.json({ error }, { status: 401 })
    }

    const { id } = await params

    // Try to find by uid first, then by _id
    let proxy = await proxyRepository.findByUid(id)
    if (!proxy) {
      proxy = await proxyRepository.findById(id)
    }

    if (!proxy || proxy.deletedAt) {
      return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ proxy: toProxyDetailDTO(proxy) })
  } catch (error) {
    console.error('Get service error:', error)
    return NextResponse.json(
      { error: 'Error al obtener servicio' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { admin, error } = await validateAdminRequest(request)
    if (error || !admin) {
      return NextResponse.json({ error: error || 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Try to find by uid first, then by _id
    let proxy = await proxyRepository.findByUid(id)
    if (!proxy) {
      proxy = await proxyRepository.findById(id)
    }

    if (!proxy || proxy.deletedAt) {
      return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 })
    }

    // Build update object
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    }

    if (body.name !== undefined) {
      updateData.name = body.name
    }
    if (body.countryCode !== undefined) {
      updateData.countryCode = body.countryCode.toUpperCase()
    }
    if (body.services !== undefined) {
      // Merge services: keep existing prompts, update editable fields
      updateData.services = body.services.map((newService: Record<string, unknown>) => {
        const existingService = proxy.services.find(s => s.type === newService.type)

        // Use frontend value if it's a valid number, otherwise keep existing
        const tokenCost = typeof newService.tokenCost === 'number'
          ? newService.tokenCost
          : (existingService?.tokenCost ?? 0)

        return {
          type: newService.type,
          tokenCost,
          isEnabled: newService.isEnabled ?? existingService?.isEnabled ?? true,
          hideInSearchForm: newService.hideInSearchForm ?? existingService?.hideInSearchForm ?? false,
          prompts: existingService?.prompts || [], // Always preserve existing prompts
          updatedBy: admin._id,
          updatedAt: new Date(),
        }
      })
    }

    const updatedProxy = await proxyRepository.update(proxy._id, updateData)

    if (!updatedProxy) {
      return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
    }

    return NextResponse.json({ proxy: toProxyDetailDTO(updatedProxy) })
  } catch (error) {
    console.error('Update service error:', error)
    return NextResponse.json(
      { error: 'Error al actualizar servicio' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { admin, error } = await validateAdminRequest(request)
    if (error || !admin) {
      return NextResponse.json({ error: error || 'No autorizado' }, { status: 401 })
    }

    const { id } = await params

    // Try to find by uid first, then by _id
    let proxy = await proxyRepository.findByUid(id)
    if (!proxy) {
      proxy = await proxyRepository.findById(id)
    }

    if (!proxy || proxy.deletedAt) {
      return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 })
    }

    await proxyRepository.softDelete(proxy._id, admin._id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete service error:', error)
    return NextResponse.json(
      { error: 'Error al eliminar servicio' },
      { status: 500 }
    )
  }
}
