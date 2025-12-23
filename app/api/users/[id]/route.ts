import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db/connection'
import User from '@/lib/db/models/User'
import Account from '@/lib/db/models/Account'
import { validateAdminRequest } from '@/lib/auth'

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

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Get accounts for this user
    const accounts = await Account.find({
      'users.user': user._id,
      deletedAt: null,
    }).select('_id uid name status users')

    const userAccounts = accounts.map(acc => {
      const userRole = acc.users.find(u => u.user.toString() === user._id.toString())?.role
      return {
        _id: acc._id,
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
    const user = await User.findOne({ _id: id, deletedAt: null })

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
    await User.findByIdAndUpdate(id, {
      deletedAt: new Date(),
      deletedBy: admin._id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { error: 'Error al eliminar usuario' },
      { status: 500 }
    )
  }
}
