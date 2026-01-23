import { NextRequest, NextResponse } from 'next/server'
import { Types } from 'mongoose'
import { validateAdminRequest } from '@/lib/auth'
import { tokenBalanceRepository } from '@/lib/db/repositories'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST /api/accounts/[id]/tokens
 * Add bonus tokens to an account
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { admin, error } = await validateAdminRequest(request)
    if (error || !admin) {
      return NextResponse.json({ error: error || 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const { amount, description } = body

    // Validate amount
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'La cantidad de tokens debe ser un número positivo' },
        { status: 400 }
      )
    }

    // Validate description
    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return NextResponse.json(
        { error: 'La descripción es requerida' },
        { status: 400 }
      )
    }

    // Add bonus tokens
    const result = await tokenBalanceRepository.addBonusTokens(
      id,
      amount,
      description.trim(),
      admin._id as Types.ObjectId
    )

    return NextResponse.json({
      success: true,
      balance: {
        totalAvailable: result.balance.totalAvailable,
        totalBonus: result.balance.totalBonus
      },
      movement: {
        id: result.movement.id,
        uid: result.movement.uid,
        type: result.movement.type,
        tokenAmount: result.movement.metadata?.tokenAmount
      }
    })
  } catch (error) {
    console.error('Add tokens error:', error)
    return NextResponse.json(
      { error: 'Error al agregar tokens', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

/**
 * GET /api/accounts/[id]/tokens
 * Get token balance for an account
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { error } = await validateAdminRequest(request)
    if (error) {
      return NextResponse.json({ error }, { status: 401 })
    }

    const { id } = await params

    const balance = await tokenBalanceRepository.getByAccountId(id)

    if (!balance) {
      return NextResponse.json({
        totalAvailable: 0,
        totalPurchased: 0,
        totalBonus: 0,
        totalConsumed: 0,
        totalRefunded: 0
      })
    }

    return NextResponse.json({
      totalAvailable: balance.totalAvailable,
      totalPurchased: balance.totalPurchased,
      totalBonus: balance.totalBonus,
      totalConsumed: balance.totalConsumed,
      totalRefunded: balance.totalRefunded
    })
  } catch (error) {
    console.error('Get token balance error:', error)
    return NextResponse.json(
      { error: 'Error al obtener balance de tokens' },
      { status: 500 }
    )
  }
}
