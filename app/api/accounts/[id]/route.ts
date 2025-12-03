import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db/connection'
import Account from '@/lib/db/models/Account'
import AccountBalance from '@/lib/db/models/AccountBalance'
import AccountApi from '@/lib/db/models/AccountApi'
// Import models to register them for populate
import '@/lib/db/models/User'
import '@/lib/db/models/Benefit'
import { validateAdminRequest } from '@/lib/auth'

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
    await dbConnect()

    const [account, balance, accountApi] = await Promise.all([
      Account.findById(id)
        .populate({
          path: 'users.user',
          select: 'uid firstName lastName email phone avatar emailVerifiedAt phoneVerifiedAt',
        })
        .populate('benefits', 'name code advantage isEnabled'),
      AccountBalance.findOne({ accountId: id }),
      AccountApi.findOne({ accountId: id, deletedAt: null }),
    ])

    if (!account) {
      return NextResponse.json({ error: 'Cuenta no encontrada' }, { status: 404 })
    }

    return NextResponse.json({ account, balance, accountApi })
  } catch (error) {
    console.error('Get account error:', error instanceof Error ? error.message : error)
    console.error('Stack:', error instanceof Error ? error.stack : '')
    return NextResponse.json(
      { error: 'Error al obtener cuenta', details: error instanceof Error ? error.message : String(error) },
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

    await dbConnect()

    const account = await Account.findById(id)
    if (!account) {
      return NextResponse.json({ error: 'Cuenta no encontrada' }, { status: 404 })
    }

    // Update fields
    if (body.email !== undefined) account.email = body.email
    if (body.phone !== undefined) account.phone = body.phone
    if (body.status !== undefined) account.status = body.status
    if (body.billing !== undefined) {
      account.billing = { ...account.billing, ...body.billing }
    }
    if (body.maxRequestsPerDay !== undefined) account.maxRequestsPerDay = body.maxRequestsPerDay
    if (body.maxRequestsPerMonth !== undefined) account.maxRequestsPerMonth = body.maxRequestsPerMonth
    if (body.webhookEnabled !== undefined) account.webhookEnabled = body.webhookEnabled
    if (body.apiEnabled !== undefined) account.apiEnabled = body.apiEnabled

    await account.save()

    return NextResponse.json({ account })
  } catch (error) {
    console.error('Update account error:', error)
    return NextResponse.json(
      { error: 'Error al actualizar cuenta' },
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
    await dbConnect()

    const account = await Account.findById(id)
    if (!account) {
      return NextResponse.json({ error: 'Cuenta no encontrada' }, { status: 404 })
    }

    // Soft delete account
    account.deletedAt = new Date()
    account.deletedBy = admin._id
    await account.save()

    // Soft delete AccountApi
    const accountApi = await AccountApi.findOne({ accountId: id, deletedAt: null })
    if (accountApi) {
      accountApi.deletedAt = new Date()
      accountApi.deletedBy = admin._id
      await accountApi.save()
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete account error:', error)
    return NextResponse.json(
      { error: 'Error al eliminar cuenta' },
      { status: 500 }
    )
  }
}
