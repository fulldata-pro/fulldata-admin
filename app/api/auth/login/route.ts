import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db/connection'
import Admin from '@/lib/db/models/Admin'
import { generateToken, setAuthCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      )
    }

    await dbConnect()

    const admin = await Admin.findByEmail(email)

    if (!admin) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    const isValidPassword = await admin.comparePassword(password)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    if (admin.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Tu cuenta está suspendida o inactiva' },
        { status: 403 }
      )
    }

    // Update last login
    admin.lastLoginAt = new Date()
    await admin.save()

    // Generate token and set cookie
    const token = generateToken(admin)
    await setAuthCookie(token)

    return NextResponse.json({
      success: true,
      admin: {
        id: admin._id.toString(),
        uid: admin.uid,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        avatar: admin.avatar,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
