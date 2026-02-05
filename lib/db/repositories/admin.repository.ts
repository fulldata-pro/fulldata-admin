import { Types } from 'mongoose'
import bcrypt from 'bcryptjs'
import { BaseRepository } from './base.repository'
import Admin, { IAdmin } from '../models/Admin'
import { ExtendedModel } from '@/lib/db/types/model.types'

interface CreateAdminData {
  name: string
  email: string
  password: string
  phone?: string
  role?: string
  status?: string
  createdBy?: Types.ObjectId
}

interface ListAdminsFilter {
  search?: string
  role?: string
  status?: string
}

class AdminRepository extends BaseRepository<IAdmin> {
  constructor() {
    super(Admin as unknown as ExtendedModel<IAdmin>)
  }

  async findByEmail(email: string): Promise<IAdmin | null> {
    await this.ensureConnection()
    return this.model.findOne({ email, deletedAt: null }).select('+password').exec()
  }

  async list(
    filter: ListAdminsFilter = {},
    page: number = 1,
    limit: number = 10
  ) {
    await this.ensureConnection()

    const query: Record<string, unknown> = { deletedAt: null }

    if (filter.search) {
      query.$or = [
        { name: { $regex: filter.search, $options: 'i' } },
        { email: { $regex: filter.search, $options: 'i' } },
      ]
    }

    if (filter.role) {
      query.role = filter.role
    }

    if (filter.status) {
      query.status = filter.status
    }

    return this.paginate(query, {
      page,
      limit,
      sort: { createdAt: -1 },
      select: '-password',
    })
  }

  async createAdmin(data: CreateAdminData): Promise<IAdmin> {
    await this.ensureConnection()

    const nextId = await this.getNextId()

    const admin = new this.model({
      id: nextId,
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone,
      role: data.role || 'ADMIN',
      status: data.status || 'ACTIVE',
      createdBy: data.createdBy,
    })

    return await admin.save()
  }

  async updateAdmin(
    id: string | Types.ObjectId,
    data: Partial<CreateAdminData>,
    updatedBy?: Types.ObjectId
  ): Promise<IAdmin | null> {
    await this.ensureConnection()

    const updateData: Record<string, unknown> = { ...data }
    if (updatedBy) {
      updateData.updatedBy = updatedBy
    }

    // If password is empty or not provided, remove it from update
    // Otherwise hash it (findByIdAndUpdate doesn't trigger pre-save hooks)
    if (!updateData.password) {
      delete updateData.password
    } else {
      const salt = await bcrypt.genSalt(12)
      updateData.password = await bcrypt.hash(updateData.password as string, salt)
    }

    return this.model.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).select('-password').exec()
  }

  async updateLastLogin(id: string | Types.ObjectId): Promise<IAdmin | null> {
    await this.ensureConnection()
    return this.model.findByIdAndUpdate(
      id,
      { lastLoginAt: new Date() },
      { new: true }
    ).exec()
  }

  async emailExists(email: string, excludeId?: string): Promise<boolean> {
    await this.ensureConnection()
    const query: Record<string, unknown> = { email, deletedAt: null }
    if (excludeId) {
      query._id = { $ne: excludeId }
    }
    return this.exists(query)
  }
}

export const adminRepository = new AdminRepository()
