import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db/connection'
import User from '@/lib/db/models/User'
import Account from '@/lib/db/models/Account'
import { validateAdminRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { admin, error } = await validateAdminRequest(request)
    if (error || !admin) {
      return NextResponse.json({ error: error || 'No autorizado' }, { status: 401 })
    }

    await dbConnect()

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const provider = searchParams.get('provider') || ''

    const query: Record<string, unknown> = { deletedAt: null }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ]
    }

    if (provider) {
      query.provider = provider
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      User.countDocuments(query),
    ])

    // Get accounts for each user
    const userIds = users.map(u => u._id)
    const accounts = await Account.find({
      'users.user': { $in: userIds },
      deletedAt: null,
    }).select('_id uid name status users')

    // Map accounts to each user
    const usersWithAccounts = users.map(user => {
      const userAccounts = accounts
        .filter(acc => acc.users.some(u => u.user.toString() === user._id.toString()))
        .map(acc => {
          const userRole = acc.users.find(u => u.user.toString() === user._id.toString())?.role
          return {
            _id: acc._id,
            uid: acc.uid,
            name: acc.name,
            status: acc.status,
            role: userRole,
          }
        })

      return {
        ...user.toObject(),
        accounts: userAccounts,
      }
    })

    return NextResponse.json({
      users: usersWithAccounts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: 'Error al obtener usuarios' },
      { status: 500 }
    )
  }
}
