import { NextRequest, NextResponse } from 'next/server'
import { validateAdminRequest } from '@/lib/auth'
import { discountCodeRepository } from '@/lib/db/repositories'
import { toDiscountCodeDetailDTO } from '@/lib/dto/discount-code.dto'

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
    const discountCode = await discountCodeRepository.findByUid(id)

    if (!discountCode) {
      return NextResponse.json(
        { error: 'Código de descuento no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      discountCode: toDiscountCodeDetailDTO(discountCode),
    })
  } catch (error) {
    console.error('Get discount code error:', error)
    return NextResponse.json(
      { error: 'Error al obtener código de descuento' },
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

    const discountCode = await discountCodeRepository.findByUid(id)
    if (!discountCode) {
      return NextResponse.json(
        { error: 'Código de descuento no encontrado' },
        { status: 404 }
      )
    }

    // If code is being changed, check it doesn't already exist
    if (body.code && body.code.toUpperCase() !== discountCode.code) {
      const codeExists = await discountCodeRepository.codeExists(body.code, discountCode._id)
      if (codeExists) {
        return NextResponse.json(
          { error: `El código ${body.code.toUpperCase()} ya existe` },
          { status: 400 }
        )
      }
    }

    // Build update data
    const updateData: Record<string, unknown> = {}

    if (body.code !== undefined) updateData.code = body.code
    if (body.name !== undefined) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description
    if (body.type !== undefined) updateData.type = body.type
    if (body.value !== undefined) updateData.value = body.value
    if (body.applicableCurrencies !== undefined) updateData.applicableCurrencies = body.applicableCurrencies
    if (body.minimumPurchase !== undefined) updateData.minimumPurchase = body.minimumPurchase
    if (body.maximumDiscount !== undefined) updateData.maximumDiscount = body.maximumDiscount
    if (body.maxUses !== undefined) updateData.maxUses = body.maxUses
    if (body.maxUsesPerAccount !== undefined) updateData.maxUsesPerAccount = body.maxUsesPerAccount
    if (body.validFrom !== undefined) updateData.validFrom = body.validFrom ? new Date(body.validFrom) : null
    if (body.validUntil !== undefined) updateData.validUntil = body.validUntil ? new Date(body.validUntil) : null
    if (body.requiresVerification !== undefined) updateData.requiresVerification = body.requiresVerification
    if (body.firstPurchaseOnly !== undefined) updateData.firstPurchaseOnly = body.firstPurchaseOnly
    if (body.isEnabled !== undefined) updateData.isEnabled = body.isEnabled
    if (body.termsAndConditions !== undefined) updateData.termsAndConditions = body.termsAndConditions

    const updatedDiscountCode = await discountCodeRepository.updateDiscountCode(
      discountCode._id,
      updateData,
      admin._id
    )

    if (!updatedDiscountCode) {
      return NextResponse.json(
        { error: 'Error al actualizar' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      discountCode: toDiscountCodeDetailDTO(updatedDiscountCode),
    })
  } catch (error) {
    console.error('Update discount code error:', error)
    return NextResponse.json(
      { error: 'Error al actualizar código de descuento' },
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
    const discountCode = await discountCodeRepository.findByUid(id)

    if (!discountCode) {
      return NextResponse.json(
        { error: 'Código de descuento no encontrado' },
        { status: 404 }
      )
    }

    // Soft delete
    await discountCodeRepository.softDelete(discountCode._id, admin._id)

    return NextResponse.json({
      message: 'Código de descuento eliminado',
    })
  } catch (error) {
    console.error('Delete discount code error:', error)
    return NextResponse.json(
      { error: 'Error al eliminar código de descuento' },
      { status: 500 }
    )
  }
}
