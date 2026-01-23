import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db/connection'
import State from '@/lib/db/models/State'
import { validateAdminRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { error } = await validateAdminRequest(request)
    if (error) {
      return NextResponse.json({ error }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const countryId = searchParams.get('countryId')

    if (!countryId) {
      return NextResponse.json(
        { error: 'El ID del pais es requerido' },
        { status: 400 }
      )
    }

    await dbConnect()

    const states = await State.find(
      { country: countryId, deletedAt: null },
      'name'
    ).sort({ name: 1 })

    return NextResponse.json(states)
  } catch (error) {
    console.error('Error fetching states:', error)
    return NextResponse.json(
      { error: 'Error al obtener provincias' },
      { status: 500 }
    )
  }
}
