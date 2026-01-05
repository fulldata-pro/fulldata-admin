import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db/connection'
import Account from '@/lib/db/models/Account'
import User from '@/lib/db/models/User'
import { validateAdminRequest } from '@/lib/auth'
import { UserStatus, AccountInvitationRole } from '@/lib/constants'

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
      'id uid firstName lastName email phone avatar emailVerifiedAt phoneVerifiedAt status'
    )

    return NextResponse.json({ user: { user: populatedUser, role: 'MEMBER', addedAt: new Date() } }, { status: 201 })
  } catch (error) {
    console.error('Add user to account error:', error)
    return NextResponse.json(
      { error: 'Error al agregar usuario' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { admin, error } = await validateAdminRequest(request)
    if (error || !admin) {
      return NextResponse.json({ error: error || 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { userId, action, value } = body

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'userId y action son requeridos' },
        { status: 400 }
      )
    }

    await dbConnect()

    const account = await Account.findById(id)
    if (!account) {
      return NextResponse.json({ error: 'Cuenta no encontrada' }, { status: 404 })
    }

    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Check if user belongs to this account
    const accountUser = account.users.find(
      (u: { user: { toString: () => string } }) => u.user.toString() === userId
    )
    if (!accountUser) {
      return NextResponse.json(
        { error: 'El usuario no pertenece a esta cuenta' },
        { status: 400 }
      )
    }

    let message = ''

    switch (action) {
      case 'changeRole':
        if (!value || !Object.values(AccountInvitationRole).includes(value)) {
          return NextResponse.json(
            { error: 'Rol inválido. Valores permitidos: OWNER, ADMIN, MEMBER' },
            { status: 400 }
          )
        }
        accountUser.role = value
        await account.save()
        message = `Rol cambiado a ${value}`
        break

      case 'verifyEmail':
        if (user.emailVerifiedAt) {
          return NextResponse.json(
            { error: 'El email ya está verificado' },
            { status: 400 }
          )
        }
        user.emailVerifiedAt = new Date()
        await user.save()
        message = 'Email verificado manualmente'
        break

      case 'verifyPhone':
        if (!user.phone) {
          return NextResponse.json(
            { error: 'El usuario no tiene teléfono registrado' },
            { status: 400 }
          )
        }
        if (user.phoneVerifiedAt) {
          return NextResponse.json(
            { error: 'El teléfono ya está verificado' },
            { status: 400 }
          )
        }
        user.phoneVerifiedAt = new Date()
        await user.save()
        message = 'Teléfono verificado manualmente'
        break

      case 'changeStatus':
        if (!value || !Object.values(UserStatus).includes(value)) {
          return NextResponse.json(
            { error: 'Estado inválido. Valores permitidos: ACTIVE, SUSPENDED, BANNED' },
            { status: 400 }
          )
        }
        user.status = value
        await user.save()
        message = `Estado cambiado a ${value}`
        break

      case 'unverifyEmail':
        user.emailVerifiedAt = undefined
        await user.save()
        message = 'Verificación de email removida'
        break

      case 'unverifyPhone':
        user.phoneVerifiedAt = undefined
        await user.save()
        message = 'Verificación de teléfono removida'
        break

      case 'addPhone':
        if (!value || value.trim() === '') {
          return NextResponse.json(
            { error: 'El número de teléfono es requerido' },
            { status: 400 }
          )
        }
        user.phone = value.trim()
        await user.save()
        message = 'Teléfono agregado correctamente'
        break

      case 'addPhoneAndVerify':
        if (!value || value.trim() === '') {
          return NextResponse.json(
            { error: 'El número de teléfono es requerido' },
            { status: 400 }
          )
        }
        user.phone = value.trim()
        user.phoneVerifiedAt = new Date()
        await user.save()
        message = 'Teléfono agregado y verificado'
        break

      default:
        return NextResponse.json(
          { error: 'Acción no válida' },
          { status: 400 }
        )
    }

    // Return updated user data
    const updatedUser = await User.findById(userId).select(
      'id uid firstName lastName email phone avatar emailVerifiedAt phoneVerifiedAt status provider'
    )

    return NextResponse.json({
      success: true,
      message,
      user: updatedUser,
      role: accountUser.role,
    })
  } catch (error) {
    console.error('User action error:', error)
    return NextResponse.json(
      { error: 'Error al ejecutar acción' },
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
