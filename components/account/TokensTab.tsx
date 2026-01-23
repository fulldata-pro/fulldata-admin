'use client'

import { useState, useEffect, useCallback } from 'react'
import { formatDate, formatDateTime, getRelativeTime } from '@/lib/utils/dateUtils'
import { formatNumber } from '@/lib/utils/currencyUtils'
import { MovementType, MovementTypeLabel, MovementStatus, MovementStatusLabel } from '@/lib/constants/movement.constants'
import { ServiceLabels } from '@/lib/constants'

interface Movement {
  _id: string
  id: number
  uid: string
  type: string
  status: string
  metadata?: {
    tokenAmount?: number
    description?: string
    paymentMethod?: string
    transactionId?: string
  }
  createdAt: string
  createdBy?: {
    firstName?: string
    lastName?: string
    email?: string
  }
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

interface TokenBalance {
  totalAvailable: number
  totalPurchased: number
  totalBonus: number
  totalConsumed: number
  totalRefunded: number
  consumptionByService?: {
    [key: string]: {
      tokensUsed: number
      searchCount: number
      lastUsed?: string
    }
  }
}

interface TokensTabProps {
  accountId: string
  tokenBalance: TokenBalance | null
  onBalanceUpdate?: () => void
}

export function TokensTab({ accountId, tokenBalance, onBalanceUpdate }: TokensTabProps) {
  const [movements, setMovements] = useState<Movement[]>([])
  const [isLoadingMovements, setIsLoadingMovements] = useState(false)
  const [movementsPage, setMovementsPage] = useState(1)
  const [movementsPagination, setMovementsPagination] = useState<Pagination | null>(null)
  const [expandedServices, setExpandedServices] = useState(false)

  const fetchMovements = useCallback(async () => {
    if (!accountId) return
    setIsLoadingMovements(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(movementsPage))
      params.set('limit', '10')

      const response = await fetch(`/api/accounts/${accountId}/movements?${params}`)
      if (response.ok) {
        const data = await response.json()
        setMovements(data.movements)
        setMovementsPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching movements:', error)
    } finally {
      setIsLoadingMovements(false)
    }
  }, [accountId, movementsPage])

  useEffect(() => {
    fetchMovements()
  }, [fetchMovements])

  const totalTokens = {
    available: tokenBalance?.totalAvailable || 0,
    purchased: tokenBalance?.totalPurchased || 0,
    bonus: tokenBalance?.totalBonus || 0,
    consumed: tokenBalance?.totalConsumed || 0,
    refunded: tokenBalance?.totalRefunded || 0
  }

  const getMovementTypeStyle = (type: string) => {
    switch (type) {
      case MovementType.TOKENS_PURCHASED:
        return 'badge-success'
      case MovementType.TOKENS_BONUS:
        return 'badge-primary'
      case MovementType.TOKENS_REFUNDED:
        return 'badge-warning'
      default:
        return 'badge-gray'
    }
  }

  const getMovementAmountStyle = (movement: Movement) => {
    if (movement.type === MovementType.TOKENS_REFUNDED) {
      return 'text-orange-600'
    }
    if (movement.type === MovementType.TOKENS_ADJUSTMENT && (movement.metadata?.tokenAmount || 0) < 0) {
      return 'text-red-600'
    }
    return 'text-green-600'
  }

  const getMovementStatusStyle = (status: string) => {
    switch (status) {
      case MovementStatus.APPROVED:
        return 'badge-success'
      case MovementStatus.PENDING:
        return 'badge-warning'
      case MovementStatus.EXPIRED:
        return 'badge-danger'
      default:
        return 'badge-gray'
    }
  }

  return (
    <div className="space-y-6">
      {/* Resumen de Tokens */}
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-secondary mb-1">Resumen de Tokens</h3>
            <p className="text-gray-500">Estado general de los tokens de la cuenta</p>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{formatNumber(totalTokens.available)}</p>
              <p className="text-sm text-gray-500">Disponibles</p>
            </div>
            <div className="h-12 w-px bg-gray-300"></div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-700">{formatNumber(totalTokens.purchased)}</p>
              <p className="text-sm text-gray-500">Comprados</p>
            </div>
            <div className="h-12 w-px bg-gray-300"></div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{formatNumber(totalTokens.bonus)}</p>
              <p className="text-sm text-gray-500">Regalados</p>
            </div>
            <div className="h-12 w-px bg-gray-300"></div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-500">{formatNumber(totalTokens.consumed)}</p>
              <p className="text-sm text-gray-500">Consumidos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Consumo por Servicio */}
      {tokenBalance?.consumptionByService && Object.keys(tokenBalance.consumptionByService).length > 0 && (
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-secondary">Consumo por Servicio</h3>
            {Object.keys(tokenBalance.consumptionByService).length > 3 && (
              <button
                onClick={() => setExpandedServices(!expandedServices)}
                className="text-sm text-primary hover:text-primary-dark transition-colors font-medium"
              >
                {expandedServices ? 'Ver menos' : `Ver todos (${Object.keys(tokenBalance.consumptionByService).length})`}
              </button>
            )}
          </div>

          {/* Grid view for 3 or fewer services, or when expanded */}
          {(Object.keys(tokenBalance.consumptionByService).length <= 3 || expandedServices) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(tokenBalance.consumptionByService).map(([service, data]) => (
                <div key={service} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-800">
                      {ServiceLabels[service as keyof typeof ServiceLabels] || service}
                    </span>
                    <span className="text-xs text-gray-500">
                      {data.lastUsed && getRelativeTime(data.lastUsed)}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Tokens usados</span>
                      <span className="font-semibold text-gray-900">{formatNumber(data.tokensUsed)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Búsquedas realizadas</span>
                      <span className="font-semibold text-gray-900">{formatNumber(data.searchCount)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Compact view for more than 3 services when collapsed */
            <div className="space-y-3">
              {Object.entries(tokenBalance.consumptionByService)
                .slice(0, 3)
                .map(([service, data]) => (
                  <div key={service} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <span className="font-medium text-gray-800">
                        {ServiceLabels[service as keyof typeof ServiceLabels] || service}
                      </span>
                      <span className="text-sm text-gray-500">
                        {data.lastUsed && getRelativeTime(data.lastUsed)}
                      </span>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <span className="text-sm text-gray-600 mr-2">Tokens:</span>
                        <span className="font-semibold text-gray-900">{formatNumber(data.tokensUsed)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-gray-600 mr-2">Búsquedas:</span>
                        <span className="font-semibold text-gray-900">{formatNumber(data.searchCount)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              <div className="text-center pt-2">
                <button
                  onClick={() => setExpandedServices(true)}
                  className="text-sm text-primary hover:text-primary-dark transition-colors font-medium"
                >
                  Ver {Object.keys(tokenBalance.consumptionByService).length - 3} servicios más →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Historial de Movimientos */}
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-secondary">Historial de Movimientos de Tokens</h3>
          <p className="text-gray-500 text-sm mt-1">
            Registro de todos los movimientos de tokens de la cuenta
          </p>
        </div>

        <div className="overflow-x-auto">
          {isLoadingMovements ? (
            <div className="p-12 text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="text-gray-500 mt-3">Cargando movimientos...</p>
            </div>
          ) : movements.length === 0 ? (
            <div className="p-12 text-center">
              <i className="ki-duotone ki-tag text-gray-300 text-5xl mb-3">
                <span className="path1"></span>
                <span className="path2"></span>
                <span className="path3"></span>
              </i>
              <p className="text-gray-500">No hay movimientos de tokens registrados</p>
              <p className="text-gray-400 text-sm mt-1">
                Los movimientos aparecerán aquí cuando se compren, regalen o consuman tokens
              </p>
            </div>
          ) : (
            <>
              <table className="table-auto w-full">
                <thead className="bg-gray-50 border-y border-gray-100">
                  <tr>
                    <th className="table-header">ID</th>
                    <th className="table-header">Tipo</th>
                    <th className="table-header">Tokens</th>
                    <th className="table-header">Descripción</th>
                    <th className="table-header">Estado</th>
                    <th className="table-header">Fecha</th>
                    <th className="table-header">Creado por</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {movements.map((movement) => (
                    <tr key={movement.uid} className="hover:bg-gray-50 transition-colors">
                      <td className="table-cell">
                        <span className="font-mono text-sm text-gray-600">{movement.id}</span>
                      </td>
                      <td className="table-cell">
                        <span className={`badge ${getMovementTypeStyle(movement.type)}`}>
                          {movement.type === MovementType.TOKENS_BONUS ? 'Tokens Regalados' : MovementTypeLabel[movement.type as MovementType] || movement.type}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className={`font-medium ${getMovementAmountStyle(movement)}`}>
                          {(movement.type === MovementType.TOKENS_REFUNDED ||
                            (movement.type === MovementType.TOKENS_ADJUSTMENT && (movement.metadata?.tokenAmount || 0) < 0))
                            ? '-' : '+'}{formatNumber(Math.abs(movement.metadata?.tokenAmount || 0))}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className="text-gray-600 text-sm">
                          {movement.metadata?.description || '-'}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className={`badge ${getMovementStatusStyle(movement.status)}`}>
                          {MovementStatusLabel[movement.status as MovementStatus] || movement.status}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="text-sm">
                          <div className="text-gray-900">{formatDate(movement.createdAt)}</div>
                          <div className="text-gray-500 text-xs">{getRelativeTime(movement.createdAt)}</div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="text-sm">
                          {movement.createdBy ? (
                            <>
                              <div className="text-gray-900">
                                {movement.createdBy.firstName} {movement.createdBy.lastName}
                              </div>
                              <div className="text-gray-500 text-xs">{movement.createdBy.email}</div>
                            </>
                          ) : (
                            <span className="text-gray-400">Sistema</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Paginación */}
              {movementsPagination && movementsPagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Mostrando {((movementsPage - 1) * movementsPagination.limit) + 1} a{' '}
                      {Math.min(movementsPage * movementsPagination.limit, movementsPagination.total)} de{' '}
                      {movementsPagination.total} movimientos
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setMovementsPage(movementsPage - 1)}
                        disabled={movementsPage === 1}
                        className="btn btn-sm btn-light"
                      >
                        <i className="ki-duotone ki-left"></i>
                        Anterior
                      </button>
                      {Array.from({ length: movementsPagination.totalPages }, (_, i) => i + 1)
                        .filter(page => {
                          const distance = Math.abs(page - movementsPage)
                          return distance === 0 || distance === 1 || page === 1 || page === movementsPagination.totalPages
                        })
                        .map((page, index, array) => (
                          <div key={page} className="flex items-center gap-2">
                            {index > 0 && array[index - 1] !== page - 1 && (
                              <span className="text-gray-400">...</span>
                            )}
                            <button
                              onClick={() => setMovementsPage(page)}
                              className={`btn btn-sm ${movementsPage === page ? 'btn-primary' : 'btn-light'}`}
                            >
                              {page}
                            </button>
                          </div>
                        ))}
                      <button
                        onClick={() => setMovementsPage(movementsPage + 1)}
                        disabled={!movementsPagination.hasMore}
                        className="btn btn-sm btn-light"
                      >
                        Siguiente
                        <i className="ki-duotone ki-right"></i>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}