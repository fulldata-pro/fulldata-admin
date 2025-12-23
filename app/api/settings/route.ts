import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db/connection'
import Config, { ConfigReferralType } from '@/lib/db/models/Config'
import { validateAdminRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic';

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
            time: 90,
            isEnabled: true,
          },
        },
        referrals: {
          account: {
            isEnabled: true,
            type: ConfigReferralType.PERCENTAGE,
            amount: 0.05,
            maxAmount: 25,
          },
          referred: {
            isEnabled: true,
            type: ConfigReferralType.AMOUNT,
            amount: 25,
            maxAmount: 0,
          },
          limits: {
            referrals: 2,
            referred: 0,
          },
          minAmount: 10,
        },
        benefit: {
          firstPurchase: {
            isEnabled: true,
            type: ConfigReferralType.AMOUNT,
            amount: 50,
            maxAmount: 50,
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
      if (body.referrals.account) {
        config.referrals.account = {
          ...config.referrals.account,
          ...body.referrals.account,
        }
      }
      if (body.referrals.referred) {
        config.referrals.referred = {
          ...config.referrals.referred,
          ...body.referrals.referred,
        }
      }
      if (body.referrals.limits) {
        config.referrals.limits = {
          ...config.referrals.limits,
          ...body.referrals.limits,
        }
      }
      if (body.referrals.minAmount !== undefined) {
        config.referrals.minAmount = body.referrals.minAmount
      }
    }

    // Update benefit config
    if (body.benefit) {
      if (body.benefit.firstPurchase) {
        config.benefit.firstPurchase = {
          ...config.benefit.firstPurchase,
          ...body.benefit.firstPurchase,
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
