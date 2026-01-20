import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db/connection'
import CountrySettings from '@/lib/db/models/CountrySettings'
import Country from '@/lib/db/models/Country'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const countryId = searchParams.get('countryId')
    const countryName = searchParams.get('countryName')

    let query: any = { deletedAt: null }

    if (countryId) {
      query.country = countryId
    } else if (countryName) {
      // Find country by name first
      const country = await Country.findOne({ name: countryName, deletedAt: null })
      if (country) {
        query.country = country._id
      } else {
        return NextResponse.json({ data: null })
      }
    }

    const settings = await CountrySettings.findOne(query)
      .populate('country', 'name')
      .select('-deletedAt -deletedBy -__v')

    return NextResponse.json({
      data: settings || null
    })
  } catch (error) {
    console.error('Get country settings error:', error)
    return NextResponse.json(
      { error: 'Error al obtener configuración del país' },
      { status: 500 }
    )
  }
}