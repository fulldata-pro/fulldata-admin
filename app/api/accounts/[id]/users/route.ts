import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db/connection'
import Account from '@/lib/db/models/Account'
import User from '@/lib/db/models/User'
import { validateAdminRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { admin, error } = await validateAdminRequest(request)
    if (error || !admin) {
      return NextResponse.json({ error: error || 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const { firstName, lastName, email, phone } = body

    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'Nombre, apellido y email son requeridos' },
        { status: 400 }
      )
    }

    await dbConnect()

    const account = await Account.findById(id)
    if (!account) {
      return NextResponse.json({ error: 'Cuenta no encontrada' }, { status: 404 })
    }

    // Check if user with email already exists
    let user = await User.findOne({ email: email.toLowerCase(), deletedAt: null })

    if (user) {
      // Check if user is already in this account
      const userExists = account.users.some(
        (u: { user: { toString: () => string } }) => u.user.toString() === user!._id.toString()
      )
      if (userExists) {
        return NextResponse.json(
          { error: 'El usuario ya pertenece a esta cuenta' },
          { status: 400 }
        )
      }
    } else {
      // Create new user
      user = new User({
        firstName,
        lastName,
        email: email.toLowerCase(),
        phone,
        authMethod: 'LOCAL',
      })
      await user.save()
    }

    // Add user to account with role MEMBER
    account.users.push({ user: user._id, role: 'MEMBER', addedAt: new Date() })
    await account.save()

    // Return populated user
    const populatedUser = await User.findById(user._id).select(
      'uid firstName lastName email phone avatar emailVerifiedAt phoneVerifiedAt'
    )

    return NextResponse.json({ user: populatedUser }, { status: 201 })
  } catch (error) {
    console.error('Add user to account error:', error)
    return NextResponse.json(
      { error: 'Error al agregar usuario' },
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
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId es requerido' }, { status: 400 })
    }

    await dbConnect()

    const account = await Account.findById(id)
    if (!account) {
      return NextResponse.json({ error: 'Cuenta no encontrada' }, { status: 404 })
    }

    // Remove user from account
    account.users = account.users.filter(
      (u: { user: { toString: () => string } }) => u.user.toString() !== userId
    )
    await account.save()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Remove user from account error:', error)
    return NextResponse.json(
      { error: 'Error al remover usuario' },
      { status: 500 }
    )
  }
}
