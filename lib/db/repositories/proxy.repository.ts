import { Types } from 'mongoose'
import { BaseRepository, PaginationResult, PaginateOptions } from './base.repository'
import Proxy, { IProxy } from '@/lib/db/models/Proxy'
import { ExtendedModel } from '@/lib/db/types/model.types'

export interface ProxySearchFilters {
  countryCode?: string
  currency?: string
  serviceType?: string
}

export interface ProxyListOptions extends PaginateOptions {
  filters?: ProxySearchFilters
}

class ProxyRepository extends BaseRepository<IProxy> {
  constructor() {
    super(Proxy as ExtendedModel<IProxy>)
  }

  /**
   * Build search query from filters
   */
  private buildSearchQuery(filters: ProxySearchFilters): Record<string, unknown> {
    const query: Record<string, unknown> = {
      deletedAt: null,
    }

    if (filters.countryCode) {
      query.countryCode = filters.countryCode.toUpperCase()
    }

    if (filters.currency) {
      query.currency = filters.currency.toUpperCase()
    }

    if (filters.serviceType) {
      query['services.type'] = filters.serviceType
    }

    return query
  }

  /**
   * List proxies with pagination and filters
   */
  async list(options: ProxyListOptions = {}): Promise<PaginationResult<IProxy>> {
    const { filters = {}, ...paginateOptions } = options

    const query = this.buildSearchQuery(filters)

    return this.paginate(query, {
      ...paginateOptions,
      select: paginateOptions.select || '-__v',
      sort: paginateOptions.sort || { countryCode: 1, name: 1 },
    })
  }

  /**
   * Find proxy by UID
   */
  async findByUid(uid: string): Promise<IProxy | null> {
    return this.findOne({ uid, deletedAt: null })
  }

  /**
   * Find proxy by numeric ID
   */
  async findByNumericId(id: number): Promise<IProxy | null> {
    return this.findOne({ id, deletedAt: null })
  }

  /**
   * Find proxies by country code
   */
  async findByCountry(countryCode: string): Promise<IProxy[]> {
    return this.find(
      { countryCode: countryCode.toUpperCase(), deletedAt: null },
      { sort: { name: 1 } }
    )
  }

  /**
   * Create a new proxy with auto-generated ID
   */
  async createProxy(data: {
    name: string
    countryCode: string
    services?: IProxy['services']
  }): Promise<IProxy> {
    await this.ensureConnection()

    const nextId = await this.getNextId()

    const proxy = new Proxy({
      id: nextId,
      name: data.name,
      countryCode: data.countryCode.toUpperCase(),
      services: data.services || [],
    })

    return proxy.save()
  }

  /**
   * Update proxy services
   */
  async updateServices(
    proxyId: string | Types.ObjectId,
    services: IProxy['services'],
    adminId?: Types.ObjectId
  ): Promise<IProxy | null> {
    // Add updatedBy and updatedAt to each service
    const servicesWithMeta = services.map((service) => ({
      ...service,
      updatedBy: adminId,
      updatedAt: new Date(),
    }))

    return this.update(proxyId, {
      services: servicesWithMeta,
      updatedAt: new Date(),
    })
  }

  /**
   * Toggle service enabled status
   */
  async toggleService(
    proxyId: string | Types.ObjectId,
    serviceType: string,
    isEnabled: boolean,
    adminId?: Types.ObjectId
  ): Promise<IProxy | null> {
    await this.ensureConnection()

    return Proxy.findOneAndUpdate(
      {
        _id: proxyId,
        'services.type': serviceType,
        deletedAt: null,
      },
      {
        $set: {
          'services.$.isEnabled': isEnabled,
          'services.$.updatedBy': adminId,
          'services.$.updatedAt': new Date(),
          updatedAt: new Date(),
        },
      },
      { new: true }
    )
  }

  /**
   * Get all enabled services across all proxies
   */
  async getEnabledServices(): Promise<
    Array<{
      proxyUid: string
      proxyName: string
      countryCode: string
      serviceType: string
      tokenCost: number
    }>
  > {
    await this.ensureConnection()

    const proxies = await Proxy.find({
      deletedAt: null,
      'services.isEnabled': true,
    })
      .select('uid name countryCode services')
      .lean()

    const result: Array<{
      proxyUid: string
      proxyName: string
      countryCode: string
      serviceType: string
      tokenCost: number
    }> = []

    for (const proxy of proxies) {
      for (const service of proxy.services) {
        if (service.isEnabled) {
          result.push({
            proxyUid: proxy.uid,
            proxyName: proxy.name,
            countryCode: proxy.countryCode,
            serviceType: service.type,
            tokenCost: service.tokenCost ?? 0,
          })
        }
      }
    }

    return result
  }
}

export const proxyRepository = new ProxyRepository()
