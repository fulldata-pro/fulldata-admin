import { BaseRepository } from './base.repository'
import Config, { IConfig, IProvider } from '@/lib/db/models/Config'
import { ExtendedModel } from '@/lib/db/types/model.types'

class ConfigRepository extends BaseRepository<IConfig> {
  constructor() {
    super(Config as unknown as ExtendedModel<IConfig>)
  }

  /**
   * Get the singleton config document
   */
  async getConfig(): Promise<IConfig | null> {
    await this.ensureConnection()
    return this.findOne({ deletedAt: null })
  }

  /**
   * Get all providers
   */
  async getProviders(): Promise<IProvider[]> {
    const config = await this.getConfig()
    return config?.providers || []
  }

  /**
   * Get enabled providers only
   */
  async getEnabledProviders(): Promise<IProvider[]> {
    const providers = await this.getProviders()
    return providers.filter(p => p.isEnabled)
  }

  /**
   * Update providers list
   */
  async updateProviders(providers: IProvider[]): Promise<IConfig | null> {
    const config = await this.getConfig()
    if (!config) return null

    return this.update(config._id, { providers })
  }

  /**
   * Add a new provider
   */
  async addProvider(provider: IProvider): Promise<IConfig | null> {
    const config = await this.getConfig()
    if (!config) return null

    const providers = config.providers || []
    providers.push(provider)

    return this.update(config._id, { providers })
  }

  /**
   * Update a specific provider
   */
  async updateProvider(code: string, updates: Partial<IProvider>): Promise<IConfig | null> {
    const config = await this.getConfig()
    if (!config) return null

    const providers = config.providers || []
    const index = providers.findIndex(p => p.code === code)
    if (index === -1) return null

    providers[index] = { ...providers[index], ...updates }

    return this.update(config._id, { providers })
  }

  /**
   * Delete a provider
   */
  async deleteProvider(code: string): Promise<IConfig | null> {
    const config = await this.getConfig()
    if (!config) return null

    const providers = (config.providers || []).filter(p => p.code !== code)

    return this.update(config._id, { providers })
  }
}

export const configRepository = new ConfigRepository()
