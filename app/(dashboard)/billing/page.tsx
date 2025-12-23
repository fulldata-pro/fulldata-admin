'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  RevenueChart,
  PaymentMethodsChart,
  TopAccountsTable,
  DiscountAnalysis,
  FinancialSummaryCards,
  ExportReportButton,
} from '@/components/billing'

type PeriodType = 'today' | 'week' | 'month' | 'year'

interface RevenueDataPoint {
  date: string
  revenue: number
  count: number
  currency: string
}

interface PaymentMethodStats {
  provider: string
  count: number
  total: number
  percentage: number
}

interface TopAccountStats {
  accountId: string
  accountUid: string
  accountEmail: string
  accountName?: string
  totalRevenue: number
  receiptCount: number
  currency: string
}

interface DiscountStats {
  totalDiscountAmount: number
  discountCodeUsage: number
  bulkDiscountUsage: number
  averageDiscountPercentage: number
  topDiscountCodes: Array<{
    code: string
    usageCount: number
    totalDiscounted: number
  }>
}

interface TokenSalesStats {
  totalTokensSold: number
  averageTokensPerPurchase: number
  averagePricePerToken: number
}

interface FinancialReport {
  totalReceipts: number
  completedReceipts: number
  pendingReceipts: number
  failedReceipts: number
  refundedReceipts: number
  totalRevenue: Record<string, number>
  averageOrderValue: Record<string, number>
  revenueOverTime: RevenueDataPoint[]
  paymentMethodDistribution: PaymentMethodStats[]
  topAccounts: TopAccountStats[]
  discountStats: DiscountStats
  tokenStats: TokenSalesStats
  period: {
    type: PeriodType
    start: string
    end: string
  }
}

const periodLabels: Record<PeriodType, string> = {
  today: 'Hoy',
  week: 'Esta semana',
  month: 'Este mes',
  year: 'Este año',
}

export default function BillingPage() {
  const [report, setReport] = useState<FinancialReport | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState<PeriodType>('month')

  const fetchReport = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/billing/report?period=${period}`)
      if (response.ok) {
        const data = await response.json()
        setReport(data)
      }
    } catch (error) {
      console.error('Error fetching financial report:', error)
    } finally {
      setIsLoading(false)
    }
  }, [period])

  useEffect(() => {
    fetchReport()
  }, [fetchReport])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Dashboard Financiero</h1>
          <p className="text-gray-500 mt-1">Análisis completo de ingresos y transacciones</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Export button */}
          <ExportReportButton period={period} periodLabel={periodLabels[period]} />

          {/* Period filter */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {(Object.keys(periodLabels) as PeriodType[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  period === p
                    ? 'bg-white text-secondary shadow-sm'
                    : 'text-gray-500 hover:text-secondary'
                }`}
              >
                {periodLabels[p]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <FinancialSummaryCards
        totalReceipts={report?.totalReceipts || 0}
        completedReceipts={report?.completedReceipts || 0}
        pendingReceipts={report?.pendingReceipts || 0}
        failedReceipts={report?.failedReceipts || 0}
        refundedReceipts={report?.refundedReceipts || 0}
        totalRevenue={report?.totalRevenue || {}}
        averageOrderValue={report?.averageOrderValue || {}}
        tokenStats={report?.tokenStats || { totalTokensSold: 0, averageTokensPerPurchase: 0, averagePricePerToken: 0 }}
        isLoading={isLoading}
      />

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart
            data={report?.revenueOverTime || []}
            isLoading={isLoading}
          />
        </div>
        <div>
          <PaymentMethodsChart
            data={report?.paymentMethodDistribution || []}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Analysis row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopAccountsTable
          data={report?.topAccounts || []}
          isLoading={isLoading}
        />
        <DiscountAnalysis
          data={report?.discountStats || {
            totalDiscountAmount: 0,
            discountCodeUsage: 0,
            bulkDiscountUsage: 0,
            averageDiscountPercentage: 0,
            topDiscountCodes: [],
          }}
          isLoading={isLoading}
        />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/billing/receipts" className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <i className="ki-duotone ki-document text-2xl text-blue-600">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-secondary">Recibos</h3>
              <p className="text-sm text-gray-500">Ver todos los recibos de pago</p>
            </div>
            <i className="ki-duotone ki-arrow-right text-xl text-gray-300 group-hover:text-primary transition-colors">
              <span className="path1"></span>
              <span className="path2"></span>
            </i>
          </div>
        </Link>

        <Link href="/billing/invoices" className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <i className="ki-duotone ki-file-sheet text-2xl text-green-600">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-secondary">Facturas</h3>
              <p className="text-sm text-gray-500">Gestionar facturas AFIP</p>
            </div>
            <i className="ki-duotone ki-arrow-right text-xl text-gray-300 group-hover:text-primary transition-colors">
              <span className="path1"></span>
              <span className="path2"></span>
            </i>
          </div>
        </Link>

        <Link href="/accounts" className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <i className="ki-duotone ki-people text-2xl text-purple-600">
                <span className="path1"></span>
                <span className="path2"></span>
                <span className="path3"></span>
                <span className="path4"></span>
                <span className="path5"></span>
              </i>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-secondary">Clientes</h3>
              <p className="text-sm text-gray-500">Ver todas las cuentas</p>
            </div>
            <i className="ki-duotone ki-arrow-right text-xl text-gray-300 group-hover:text-primary transition-colors">
              <span className="path1"></span>
              <span className="path2"></span>
            </i>
          </div>
        </Link>
      </div>
    </div>
  )
}
