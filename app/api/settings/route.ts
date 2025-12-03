import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db/connection'
import Config from '@/lib/db/models/Config'
import { validateAdminRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { error } = await validateAdminRequest(request)
    if (error) {
      return NextResponse.json({ error }, { status: 401 })
    }

    await dbConnect()

    // Get or create config
    let config = await Config.findOne()
    if (!config) {
      config = new Config({
        searches: {
          expirations: {
            time: 30,
            isEnabled: true,
          },
        },
        referrals: {
          isEnabled: false,
          type: 'PERCENTAGE',
          amount: 10,
        },
        benefits: {
          firstPurchase: {
            isEnabled: false,
          },
        },
      })
      await config.save()
    }

    return NextResponse.json({ config })
  } catch (error) {
    console.error('Get config error:', error)
    return NextResponse.json(
      { error: 'Error al obtener configuración' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { admin, error } = await validateAdminRequest(request)
    if (error || !admin) {
      return NextResponse.json({ error: error || 'No autorizado' }, { status: 401 })
    }

    // Only SUPER_ADMIN and ADMIN can modify config
    if (!['SUPER_ADMIN', 'ADMIN'].includes(admin.role)) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const body = await request.json()

    await dbConnect()

    let config = await Config.findOne()
    if (!config) {
      config = new Config({})
    }

    // Update searches config
    if (body.searches) {
      if (body.searches.expirations) {
        config.searches.expirations = {
          ...config.searches.expirations,
          ...body.searches.expirations,
        }
      }
    }

    // Update referrals config
    if (body.referrals) {
      config.referrals = {
        ...config.referrals,
        ...body.referrals,
      }
    }

    // Update benefits config
    if (body.benefits) {
      if (body.benefits.firstPurchase) {
        config.benefits.firstPurchase = {
          ...config.benefits.firstPurchase,
          ...body.benefits.firstPurchase,
        }
      }
    }

    await config.save()

    return NextResponse.json({ config })
  } catch (error) {
    console.error('Update config error:', error)
    return NextResponse.json(
      { error: 'Error al actualizar configuración' },
      { status: 500 }
    )
  }
}
