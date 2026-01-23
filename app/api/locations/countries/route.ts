import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db/connection'
import Country from '@/lib/db/models/Country'
import { validateAdminRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { error } = await validateAdminRequest(request)
    if (error) {
      return NextResponse.json({ error }, { status: 401 })
    }

    await dbConnect()

    const countries = await Country.find(
      { deletedAt: null },
      'name alpha2Code'
    ).sort({ name: 1 })

    return NextResponse.json(countries)
  } catch (error) {
    console.error('Error fetching countries:', error)
    return NextResponse.json(
      { error: 'Error al obtener paises' },
      { status: 500 }
    )
  }
}
