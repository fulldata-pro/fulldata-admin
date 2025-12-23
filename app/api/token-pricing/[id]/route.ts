import { NextRequest, NextResponse } from 'next/server'
import { validateAdminRequest } from '@/lib/auth'
import { tokenPricingRepository } from '@/lib/db/repositories'
import { toTokenPricingDetailDTO } from '@/lib/dto/token-pricing.dto'

export const dynamic = 'force-dynamic';

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
    const pricing = await tokenPricingRepository.findByUid(id)

    if (!pricing) {
      return NextResponse.json(
        { error: 'Configuración de precios no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      pricing: toTokenPricingDetailDTO(pricing),
    })
  } catch (error) {
    console.error('Get token pricing error:', error)
    return NextResponse.json(
      { error: 'Error al obtener configuración de precios' },
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

    const pricing = await tokenPricingRepository.findByUid(id)
    if (!pricing) {
      return NextResponse.json(
        { error: 'Configuración de precios no encontrada' },
        { status: 404 }
      )
    }

    // Build update data
    const updateData: Record<string, unknown> = {
      updatedBy: admin._id,
      updatedAt: new Date(),
    }

    // If price changed, use the updatePrice method for history tracking
    if (body.price !== undefined && body.price !== pricing.price) {
      await tokenPricingRepository.updatePrice(
        pricing._id,
        body.price,
        admin._id,
        body.priceChangeReason
      )
    }

    // Update other fields
    if (body.minPurchase !== undefined) {
      updateData.minPurchase = body.minPurchase
    }
    if (body.maxPurchase !== undefined) {
      updateData.maxPurchase = body.maxPurchase
    }
    if (body.isEnabled !== undefined) {
      updateData.isEnabled = body.isEnabled
      updateData.updatedStatusAt = new Date()
    }

    const updatedPricing = await tokenPricingRepository.update(pricing._id, updateData)

    if (!updatedPricing) {
      return NextResponse.json(
        { error: 'Error al actualizar' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      pricing: toTokenPricingDetailDTO(updatedPricing),
    })
  } catch (error) {
    console.error('Update token pricing error:', error)
    return NextResponse.json(
      { error: 'Error al actualizar configuración de precios' },
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
    const pricing = await tokenPricingRepository.findByUid(id)

    if (!pricing) {
      return NextResponse.json(
        { error: 'Configuración de precios no encontrada' },
        { status: 404 }
      )
    }

    // Soft delete
    await tokenPricingRepository.softDelete(pricing._id, admin._id)

    return NextResponse.json({
      message: 'Configuración de precios eliminada',
    })
  } catch (error) {
    console.error('Delete token pricing error:', error)
    return NextResponse.json(
      { error: 'Error al eliminar configuración de precios' },
      { status: 500 }
    )
  }
}
