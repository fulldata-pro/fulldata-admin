import { IProxy } from '@/lib/db/models/Proxy'

/**
 * DTO for Proxy prompt
 */
export interface ProxyPromptDTO {
  key: string
  match: string
  type: 'any' | 'number' | 'text'
}

/**
 * DTO for Proxy service
 */
export interface ProxyServiceDTO {
  type: string
  tokenCost: number
  isEnabled: boolean
  hideInSearchForm: boolean
}

/**
 * DTO for Proxy list item
 */
export interface ProxyListItemDTO {
  id: number
  uid: string
  name: string
  countryCode: string
  services: ProxyServiceDTO[]
  createdAt: string
}

/**
 * DTO for Proxy detail (includes prompts)
 */
export interface ProxyDetailDTO extends ProxyListItemDTO {
  services: Array<ProxyServiceDTO & { prompts: ProxyPromptDTO[] }>
}

/**
 * Transform a Proxy document to list item DTO
 */
export function toProxyListItemDTO(proxy: IProxy): ProxyListItemDTO {
  return {
    id: proxy.id,
    uid: proxy.uid,
    name: proxy.name,
    countryCode: proxy.countryCode,
    services: proxy.services.map((service) => ({
      type: service.type,
      tokenCost: service.tokenCost ?? 0,
      isEnabled: service.isEnabled,
      hideInSearchForm: service.hideInSearchForm ?? false,
    })),
    createdAt: proxy.createdAt.toISOString(),
  }
}

/**
 * Transform a Proxy document to detail DTO (includes prompts)
 */
export function toProxyDetailDTO(proxy: IProxy): ProxyDetailDTO {
  return {
    id: proxy.id,
    uid: proxy.uid,
    name: proxy.name,
    countryCode: proxy.countryCode,
    services: proxy.services.map((service) => ({
      type: service.type,
      tokenCost: service.tokenCost ?? 0,
      isEnabled: service.isEnabled,
      hideInSearchForm: service.hideInSearchForm ?? false,
      prompts: (service.prompts || []).map((prompt) => ({
        key: prompt.key,
        match: prompt.match,
        type: prompt.type,
      })),
    })),
    createdAt: proxy.createdAt.toISOString(),
  }
}

/**
 * Transform an array of Proxy documents to list DTOs
 */
export function toProxyListDTO(proxies: IProxy[]): ProxyListItemDTO[] {
  return proxies.map(toProxyListItemDTO)
}
