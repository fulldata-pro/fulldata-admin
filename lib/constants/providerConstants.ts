/**
 * Provider Constants
 * Configuración centralizada de proveedores de datos
 */

export interface ProviderField {
  key: string
  label: string
  type: 'text' | 'password'
  placeholder?: string
}

export interface ProviderConfig {
  name: string
  description?: string
  requiresConfig: boolean
  fields?: ProviderField[]
  hint?: string
}

/**
 * Metadata de configuración para cada proveedor
 */
export const PROVIDER_CONFIG: Record<string, ProviderConfig> = {
  nosis: {
    name: 'Nosis',
    description: 'Información crediticia y financiera',
    requiresConfig: false,
  },
  didit: {
    name: 'Didit',
    description: 'Verificación de identidad',
    requiresConfig: true,
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'dk_live_...' },
      { key: 'workflowId', label: 'Workflow ID', type: 'text', placeholder: 'wf_...' },
    ],
    hint: 'Si no se configuran, se usarán las credenciales de Fulldata',
  },
  agildata: {
    name: 'Agildata',
    description: 'Datos de personas y empresas',
    requiresConfig: false,
  },
  osint: {
    name: 'OSINT',
    description: 'Inteligencia de fuentes abiertas',
    requiresConfig: false,
  },
  bind: {
    name: 'Bind',
    description: 'Verificación bancaria',
    requiresConfig: false,
  },
}

/**
 * Lista de códigos de proveedores disponibles
 */
export const PROVIDER_CODES = Object.keys(PROVIDER_CONFIG) as (keyof typeof PROVIDER_CONFIG)[]

/**
 * Obtiene el nombre de un proveedor por su código
 */
export function getProviderName(code: string): string {
  return PROVIDER_CONFIG[code]?.name || code
}

/**
 * Verifica si un proveedor requiere configuración adicional
 */
export function providerRequiresConfig(code: string): boolean {
  return PROVIDER_CONFIG[code]?.requiresConfig ?? false
}

/**
 * Obtiene los campos de configuración de un proveedor
 */
export function getProviderFields(code: string): ProviderField[] {
  return PROVIDER_CONFIG[code]?.fields ?? []
}

/**
 * Enmascara un valor sensible (ej: API Key)
 * Muestra los últimos 4 caracteres
 */
export function maskSensitiveValue(value: string | undefined | null): string {
  if (!value || value.length < 8) return '••••••••'
  return `••••••••${value.slice(-4)}`
}
