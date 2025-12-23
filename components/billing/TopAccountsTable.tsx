'use client'

import Link from 'next/link'
import { formatCurrency } from '@/lib/utils/currencyUtils'

interface TopAccountStats {
  accountId: string
  accountUid: string
  accountEmail: string
  accountName?: string
  totalRevenue: number
  receiptCount: number
  currency: string
}

interface TopAccountsTableProps {
  data: TopAccountStats[]
  isLoading?: boolean
}

export default function TopAccountsTable({ data, isLoading }: TopAccountsTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!data?.length) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-secondary mb-4">Top 10 Clientes</h3>
        <div className="flex items-center justify-center h-[250px] text-gray-400">
          <div className="text-center">
            <i className="ki-duotone ki-people text-4xl mb-2">
              <span className="path1"></span>
              <span className="path2"></span>
              <span className="path3"></span>
              <span className="path4"></span>
              <span className="path5"></span>
            </i>
            <p>No hay datos disponibles</p>
          </div>
        </div>
      </div>
    )
  }

  // Calculate max revenue for bar width
  const maxRevenue = Math.max(...data.map((a) => a.totalRevenue))

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-secondary">Top 10 Clientes</h3>
        <Link
          href="/accounts"
          className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
        >
          Ver todos
          <i className="ki-duotone ki-arrow-right text-sm">
            <span className="path1"></span>
            <span className="path2"></span>
          </i>
        </Link>
      </div>

      <div className="space-y-3">
        {data.map((account, index) => {
          const barWidth = (account.totalRevenue / maxRevenue) * 100

          return (
            <div
              key={account.accountId}
              className="relative group"
            >
              {/* Background bar */}
              <div
                className="absolute inset-y-0 left-0 bg-primary/5 rounded-lg transition-all group-hover:bg-primary/10"
                style={{ width: `${barWidth}%` }}
              />

              {/* Content */}
              <div className="relative flex items-center gap-3 p-3">
                {/* Rank */}
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  index === 0 ? 'bg-yellow-100 text-yellow-700' :
                  index === 1 ? 'bg-gray-200 text-gray-600' :
                  index === 2 ? 'bg-orange-100 text-orange-700' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {index + 1}
                </div>

                {/* Account info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-secondary truncate">
                    {account.accountName || account.accountEmail}
                  </p>
                  {account.accountName && (
                    <p className="text-xs text-gray-400 truncate">{account.accountEmail}</p>
                  )}
                </div>

                {/* Stats */}
                <div className="text-right">
                  <p className="text-sm font-bold text-secondary">
                    {formatCurrency(account.totalRevenue, account.currency, { showCurrencyCode: false })}
                  </p>
                  <p className="text-xs text-gray-400">{account.receiptCount} compras</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
