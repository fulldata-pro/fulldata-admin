import { NextRequest, NextResponse } from 'next/server'
import { validateAdminRequest } from '@/lib/auth'
import { bulkDiscountRepository } from '@/lib/db/repositories'
import { toBulkDiscountDetailDTO } from '@/lib/dto/bulk-discount.dto'

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
    const bulkDiscount = await bulkDiscountRepository.findByUid(id)

    if (!bulkDiscount) {
      return NextResponse.json(
        { error: 'Descuento por cantidad no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      bulkDiscount: toBulkDiscountDetailDTO(bulkDiscount),
    })
  } catch (error) {
    console.error('Get bulk discount error:', error)
    return NextResponse.json(
      { error: 'Error al obtener descuento por cantidad' },
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

    const bulkDiscount = await bulkDiscountRepository.findByUid(id)
    if (!bulkDiscount) {
      return NextResponse.json(
        { error: 'Descuento por cantidad no encontrado' },
        { status: 404 }
      )
    }

    // If name is being changed, check it doesn't already exist
    if (body.name && body.name !== bulkDiscount.name) {
      const nameExists = await bulkDiscountRepository.nameExists(body.name, bulkDiscount._id)
      if (nameExists) {
        return NextResponse.json(
          { error: `El nombre "${body.name}" ya existe` },
          { status: 400 }
        )
      }
    }

    // Validate tiers if provided
    if (body.tiers) {
      for (const tier of body.tiers) {
        if (tier.minTokens === undefined || tier.discountPercentage === undefined) {
          return NextResponse.json(
            { error: 'Cada nivel debe tener cantidad mínima y porcentaje de descuento' },
            { status: 400 }
          )
        }
        if (tier.discountPercentage < 0 || tier.discountPercentage > 100) {
          return NextResponse.json(
            { error: 'El porcentaje de descuento debe estar entre 0 y 100' },
            { status: 400 }
          )
        }
      }
    }

    // Build update data
    const updateData: Record<string, unknown> = {}

    if (body.name !== undefined) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description
    if (body.tiers !== undefined) updateData.tiers = body.tiers
    if (body.applicableCurrencies !== undefined) updateData.applicableCurrencies = body.applicableCurrencies
    if (body.applicableCountries !== undefined) updateData.applicableCountries = body.applicableCountries
    if (body.requiresVerification !== undefined) updateData.requiresVerification = body.requiresVerification
    if (body.minAccountAge !== undefined) updateData.minAccountAge = body.minAccountAge
    if (body.validFrom !== undefined) updateData.validFrom = body.validFrom ? new Date(body.validFrom) : null
    if (body.validUntil !== undefined) updateData.validUntil = body.validUntil ? new Date(body.validUntil) : null
    if (body.isEnabled !== undefined) updateData.isEnabled = body.isEnabled
    if (body.priority !== undefined) updateData.priority = body.priority

    // Handle isDefault separately
    if (body.isDefault === true && !bulkDiscount.isDefault) {
      await bulkDiscountRepository.setAsDefault(bulkDiscount._id, admin._id)
    } else if (body.isDefault === false && bulkDiscount.isDefault) {
      updateData.isDefault = false
    }

    const updatedBulkDiscount = await bulkDiscountRepository.updateBulkDiscount(
      bulkDiscount._id,
      updateData,
      admin._id
    )

    if (!updatedBulkDiscount) {
      return NextResponse.json(
        { error: 'Error al actualizar' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      bulkDiscount: toBulkDiscountDetailDTO(updatedBulkDiscount),
    })
  } catch (error) {
    console.error('Update bulk discount error:', error)
    return NextResponse.json(
      { error: 'Error al actualizar descuento por cantidad' },
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
    const bulkDiscount = await bulkDiscountRepository.findByUid(id)

    if (!bulkDiscount) {
      return NextResponse.json(
        { error: 'Descuento por cantidad no encontrado' },
        { status: 404 }
      )
    }

    // Don't allow deleting the default discount
    if (bulkDiscount.isDefault) {
      return NextResponse.json(
        { error: 'No se puede eliminar el descuento predeterminado' },
        { status: 400 }
      )
    }

    // Soft delete
    await bulkDiscountRepository.softDelete(bulkDiscount._id, admin._id)

    return NextResponse.json({
      message: 'Descuento por cantidad eliminado',
    })
  } catch (error) {
    console.error('Delete bulk discount error:', error)
    return NextResponse.json(
      { error: 'Error al eliminar descuento por cantidad' },
      { status: 500 }
    )
  }
}
