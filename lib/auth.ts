import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import dbConnect from './db/connection'
import Admin, { IAdmin } from './db/models/Admin'

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-me'
const TOKEN_NAME = 'adminToken'
const TOKEN_EXPIRY = '7d'

export interface JWTPayload {
  adminId: string
  email: string
  role: string
}

export function generateToken(admin: IAdmin): string {
  const payload: JWTPayload = {
    adminId: admin._id.toString(),
    email: admin.email,
    role: admin.role,
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export async function getTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(TOKEN_NAME)?.value || null
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const token = request.cookies.get(TOKEN_NAME)?.value
  if (token) return token

  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  return null
}

export async function getCurrentAdmin(): Promise<IAdmin | null> {
  const token = await getTokenFromCookies()
  if (!token) return null

  const payload = verifyToken(token)
  if (!payload) return null

  await dbConnect()
  const admin = await Admin.findById(payload.adminId)
  return admin
}

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

export async function removeAuthCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(TOKEN_NAME)
}

export async function validateAdminRequest(
  request: NextRequest
): Promise<{ admin: IAdmin | null; error: string | null }> {
  const token = getTokenFromRequest(request)
  if (!token) {
    return { admin: null, error: 'No token provided' }
  }

  const payload = verifyToken(token)
  if (!payload) {
    return { admin: null, error: 'Invalid or expired token' }
  }

  await dbConnect()
  const admin = await Admin.findById(payload.adminId)

  if (!admin) {
    return { admin: null, error: 'Admin not found' }
  }

  if (admin.status !== 'ACTIVE') {
    return { admin: null, error: 'Admin account is not active' }
  }

  return { admin, error: null }
}
