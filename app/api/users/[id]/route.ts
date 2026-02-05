import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db/connection'
import Account from '@/lib/db/models/Account'
import User from '@/lib/db/models/User'
import { validateAdminRequest } from '@/lib/auth'
import { userRepository } from '@/lib/db/repositories'

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { admin, error } = await validateAdminRequest(request)
    if (error || !admin) {
      return NextResponse.json({ error: error || 'No autorizado' }, { status: 401 })
    }

    await dbConnect()

    const { id } = await params
    const user = await User.findOne({ _id: id, deletedAt: null })
      .populate('emailVerifiedBy', 'name email')
      .populate('phoneVerifiedBy', 'name email')

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Get accounts for this user
    const accounts = await Account.find({
      'users.user': user._id,
      deletedAt: null,
    }).select('_id id uid name status users')

    const userAccounts = accounts.map(acc => {
      const userRole = acc.users.find(u => u.user.toString() === user._id.toString())?.role
      return {
        _id: acc._id,
        id: acc.id,
        uid: acc.uid,
        name: acc.name,
        status: acc.status,
        role: userRole,
      }
    })

    return NextResponse.json({
      user: {
        ...user.toObject(),
        accounts: userAccounts,
      },
    })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Error al obtener usuario' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { admin, error } = await validateAdminRequest(request)
    if (error || !admin) {
      return NextResponse.json({ error: error || 'No autorizado' }, { status: 401 })
    }

    await dbConnect()

    const { id } = await params
    const body = await request.json()
    const { action, value, phoneCountryCode } = body

    const user = await userRepository.findById(id)
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    switch (action) {
      case 'verify_email': {
        if (!value || typeof value !== 'string') {
          return NextResponse.json({ error: 'El email es requerido' }, { status: 400 })
        }

        const normalizedEmail = value.toLowerCase().trim()

        // Check if email changed and if new email is already in use
        if (normalizedEmail !== user.email) {
          const emailExists = await userRepository.emailExists(normalizedEmail, id)
          if (emailExists) {
            return NextResponse.json({ error: 'Este email ya esta registrado por otro usuario' }, { status: 400 })
          }
        }

        // Update email and verify (with admin reference)
        await userRepository.update(id, {
          email: normalizedEmail,
          emailVerifiedAt: new Date(),
          emailVerifiedBy: admin._id,
          updatedAt: new Date(),
        })
        break
      }

      case 'verify_phone': {
        if (!value || typeof value !== 'string') {
          return NextResponse.json({ error: 'El telefono es requerido' }, { status: 400 })
        }

        const normalizedPhone = value.trim()

        // Update phone and verify (with admin reference)
        await userRepository.update(id, {
          phone: normalizedPhone,
          phoneCountryCode: phoneCountryCode || user.phoneCountryCode || '+54',
          phoneVerifiedBy: admin._id,
          phoneVerifiedAt: new Date(),
          updatedAt: new Date(),
        })
        break
      }

      default:
        return NextResponse.json({ error: 'Accion no valida' }, { status: 400 })
    }

    // Fetch updated user with populated admin references
    const populatedUser = await User.findById(id)
      .populate('emailVerifiedBy', 'name email')
      .populate('phoneVerifiedBy', 'name email')

    return NextResponse.json({ success: true, user: populatedUser })
  } catch (error) {
    console.error('Patch user error:', error)
    return NextResponse.json(
      { error: 'Error al actualizar usuario' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { admin, error } = await validateAdminRequest(request)
    if (error || !admin) {
      return NextResponse.json({ error: error || 'No autorizado' }, { status: 401 })
    }

    await dbConnect()

    const { id } = await params
    const user = await userRepository.findById(id)

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Check if user is OWNER of any account
    const ownerAccounts = await Account.find({
      'users.user': user._id,
      'users.role': 'OWNER',
      deletedAt: null,
    }).select('_id name users')

    // Filter to only get accounts where this user is actually the owner
    const actualOwnerAccounts = ownerAccounts.filter(acc =>
      acc.users.some(u => u.user.toString() === user._id.toString() && u.role === 'OWNER')
    )

    if (actualOwnerAccounts.length > 0) {
      const accountNames = actualOwnerAccounts.map(a => a.name).join(', ')
      return NextResponse.json(
        {
          error: 'No se puede eliminar el usuario porque es dueño de las siguientes cuentas',
          accounts: actualOwnerAccounts,
          message: `El usuario es OWNER de: ${accountNames}. Debe transferir la propiedad antes de eliminarlo.`,
        },
        { status: 400 }
      )
    }

    // Remove user from all accounts where they are a member (not owner)
    await Account.updateMany(
      { 'users.user': user._id, deletedAt: null },
      { $pull: { users: { user: user._id } } }
    )

    // Soft delete the user
    await userRepository.softDelete(id, admin._id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { error: 'Error al eliminar usuario' },
      { status: 500 }
    )
  }
}
