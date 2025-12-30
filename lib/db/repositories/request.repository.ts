import { FilterQuery, Types } from 'mongoose'
import { BaseRepository, PaginationResult } from './base.repository'
import Request, { IRequest } from '../models/Request'

export interface RequestListOptions {
  page?: number
  limit?: number
  search?: string
  status?: string
  type?: string
  accountId?: string
  countryCode?: string
}

class RequestRepository extends BaseRepository<IRequest> {
  constructor() {
    super(Request as any)
  }

  private buildSearchQuery(options: RequestListOptions): FilterQuery<IRequest> {
    const query: FilterQuery<IRequest> = {
      deletedAt: { $exists: false },
    }

    if (options.search) {
      const searchRegex = new RegExp(options.search, 'i')
      query.$or = [
        { uid: searchRegex },
        { 'metadata.searchQuery': searchRegex },
        { 'metadata.fullName': searchRegex },
        { 'metadata.taxId': searchRegex },
        { 'metadata.nationalId': searchRegex },
      ]
    }

    if (options.status) {
      query.status = options.status
    }

    if (options.type) {
      query.type = options.type
    }

    if (options.accountId) {
      query.accountId = new Types.ObjectId(options.accountId)
    }

    if (options.countryCode) {
      query.countryCode = options.countryCode
    }

    return query
  }

  async list(options: RequestListOptions = {}): Promise<PaginationResult<IRequest>> {
    const { page = 1, limit = 10 } = options
    const query = this.buildSearchQuery(options)

    return this.paginate(query, {
      page,
      limit,
      sort: { createdAt: -1 },
      populate: [
        { path: 'accountId', select: 'uid email name billing.name' },
        { path: 'userId', select: 'uid firstName lastName email' },
      ],
    })
  }

  async findByUid(uid: string): Promise<IRequest | null> {
    return this.findOne(
      { uid, deletedAt: { $exists: false } },
      {
        populate: [
          { path: 'accountId', select: 'uid email name billing.name' },
          { path: 'userId', select: 'uid firstName lastName email' },
        ],
      }
    )
  }

  async getDistinctTypes(): Promise<string[]> {
    await this.ensureConnection()
    return Request.distinct('type', { deletedAt: { $exists: false } })
  }

  async getDistinctCountries(): Promise<string[]> {
    await this.ensureConnection()
    return Request.distinct('countryCode', { deletedAt: { $exists: false } })
  }
}

export const requestRepository = new RequestRepository()
