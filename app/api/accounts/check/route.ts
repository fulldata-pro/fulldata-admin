import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db/connection'
import Account from '@/lib/db/models/Account'
import { validateAdminRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { error } = await validateAdminRequest(request)
    if (error) {
      return NextResponse.json({ error }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get('email')
    const phone = searchParams.get('phone')
    const excludeId = searchParams.get('excludeId')

    await dbConnect()

    const result: { emailExists: boolean; phoneExists: boolean } = {
      emailExists: false,
      phoneExists: false,
    }

    if (email) {
      const query: Record<string, unknown> = {
        email: email.toLowerCase(),
        deletedAt: null,
      }
      if (excludeId) {
        query._id = { $ne: excludeId }
      }
      const existingEmail = await Account.findOne(query).select('_id')
      result.emailExists = !!existingEmail
    }

    if (phone) {
      const query: Record<string, unknown> = {
        phone,
        deletedAt: null,
      }
      if (excludeId) {
        query._id = { $ne: excludeId }
      }
      const existingPhone = await Account.findOne(query).select('_id')
      result.phoneExists = !!existingPhone
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Check account error:', error)
    return NextResponse.json(
      { error: 'Error al verificar cuenta' },
      { status: 500 }
    )
  }
}
