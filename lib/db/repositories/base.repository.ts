import { Document, FilterQuery, UpdateQuery, QueryOptions, Types, PopulateOptions } from 'mongoose'
import dbConnect from '../connection'
import { ExtendedModel } from '@/lib/db/types/model.types'

export interface PaginationResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface PaginateOptions {
  page?: number
  limit?: number
  sort?: Record<string, 1 | -1>
  populate?: PopulateOptions | PopulateOptions[]
  select?: string
}

export abstract class BaseRepository<T extends Document> {
  protected model: ExtendedModel<T>

  constructor(model: ExtendedModel<T>) {
    this.model = model
  }

  protected async ensureConnection(): Promise<void> {
    await dbConnect()
  }

  async create(data: Partial<T>): Promise<T> {
    await this.ensureConnection()
    const document = new this.model(data)
    return await document.save()
  }

  async findById(
    id: string | Types.ObjectId,
    options?: { populate?: PopulateOptions | PopulateOptions[]; select?: string }
  ): Promise<T | null> {
    await this.ensureConnection()
    let query = this.model.findById(id)
    if (options?.populate) {
      query = query.populate(options.populate)
    }
    if (options?.select) {
      query = query.select(options.select)
    }
    return await query.exec()
  }

  async findOne(
    filter: FilterQuery<T>,
    options?: { populate?: PopulateOptions | PopulateOptions[]; select?: string }
  ): Promise<T | null> {
    await this.ensureConnection()
    let query = this.model.findOne(filter)
    if (options?.populate) {
      query = query.populate(options.populate)
    }
    if (options?.select) {
      query = query.select(options.select)
    }
    return await query.exec()
  }

  async find(
    filter: FilterQuery<T> = {},
    options?: QueryOptions & { populate?: PopulateOptions | PopulateOptions[]; select?: string }
  ): Promise<T[]> {
    await this.ensureConnection()
    let query = this.model.find(filter, null, options)
    if (options?.populate) {
      query = query.populate(options.populate)
    }
    if (options?.select) {
      query = query.select(options.select)
    }
    return await query.exec()
  }

  async update(id: string | Types.ObjectId, update: UpdateQuery<T>): Promise<T | null> {
    await this.ensureConnection()
    return await this.model.findByIdAndUpdate(id, update, { new: true }).exec()
  }

  async updateOne(filter: FilterQuery<T>, update: UpdateQuery<T>): Promise<T | null> {
    await this.ensureConnection()
    return await this.model.findOneAndUpdate(filter, update, { new: true }).exec()
  }

  async updateMany(filter: FilterQuery<T>, update: UpdateQuery<T>): Promise<{ modifiedCount: number }> {
    await this.ensureConnection()
    const result = await this.model.updateMany(filter, update).exec()
    return { modifiedCount: result.modifiedCount }
  }

  async delete(id: string | Types.ObjectId): Promise<T | null> {
    await this.ensureConnection()
    return await this.model.findByIdAndDelete(id).exec()
  }

  async deleteMany(filter: FilterQuery<T>): Promise<{ deletedCount: number }> {
    await this.ensureConnection()
    const result = await this.model.deleteMany(filter).exec()
    return { deletedCount: result.deletedCount }
  }

  async count(filter: FilterQuery<T> = {}): Promise<number> {
    await this.ensureConnection()
    return await this.model.countDocuments(filter).exec()
  }

  async exists(filter: FilterQuery<T>): Promise<boolean> {
    await this.ensureConnection()
    const count = await this.model.countDocuments(filter).exec()
    return count > 0
  }

  async paginate(
    filter: FilterQuery<T> = {},
    options: PaginateOptions = {}
  ): Promise<PaginationResult<T>> {
    await this.ensureConnection()

    const {
      page = 1,
      limit = 10,
      sort = { createdAt: -1 },
      populate,
      select,
    } = options

    const skip = (page - 1) * limit

    let query = this.model.find(filter).sort(sort).skip(skip).limit(limit)

    if (populate) {
      query = query.populate(populate)
    }
    if (select) {
      query = query.select(select)
    }

    const [data, total] = await Promise.all([
      query.lean().exec() as Promise<T[]>,
      this.model.countDocuments(filter).exec(),
    ])

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }

  async getNextId(): Promise<number> {
    await this.ensureConnection()
    if (typeof this.model.getNextId === 'function') {
      return await this.model.getNextId()
    }
    // Fallback: find max id and increment
    const lastDoc = await this.model.findOne().sort({ id: -1 }).select('id').lean().exec()
    return ((lastDoc as unknown as { id?: number })?.id || 0) + 1
  }

  async softDelete(id: string | Types.ObjectId, deletedBy?: Types.ObjectId): Promise<T | null> {
    await this.ensureConnection()
    const update: UpdateQuery<T> = {
      deletedAt: new Date(),
      ...(deletedBy && { deletedBy }),
    } as UpdateQuery<T>
    return await this.model.findByIdAndUpdate(id, update, { new: true }).exec()
  }

  async restore(id: string | Types.ObjectId): Promise<T | null> {
    await this.ensureConnection()
    return await this.model.findByIdAndUpdate(
      id,
      { $unset: { deletedAt: 1, deletedBy: 1 } },
      { new: true }
    ).exec()
  }
}
