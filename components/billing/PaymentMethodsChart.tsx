'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { formatCurrency } from '@/lib/utils/currencyUtils'

interface PaymentMethodStats {
  provider: string
  count: number
  total: number
  percentage: number
}

interface PaymentMethodsChartProps {
  data: PaymentMethodStats[]
  isLoading?: boolean
}

const PROVIDER_COLORS: Record<string, string> = {
  MERCADO_PAGO: '#00BCFF',
  STRIPE: '#635BFF',
  UNKNOWN: '#9CA3AF',
}

const PROVIDER_LABELS: Record<string, string> = {
  MERCADO_PAGO: 'MercadoPago',
  STRIPE: 'Stripe',
  UNKNOWN: 'Otro',
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{
    payload: PaymentMethodStats & { fill: string }
  }>
}) => {
  if (!active || !payload?.[0]) return null

  const data = payload[0].payload

  return (
    <div className="bg-white/90 backdrop-blur-xl border border-white/20 rounded-xl shadow-xl p-4 min-w-[180px]">
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: data.fill }}
        />
        <span className="font-semibold text-secondary">
          {PROVIDER_LABELS[data.provider] || data.provider}
        </span>
      </div>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Transacciones:</span>
          <span className="font-medium">{data.count}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Total:</span>
          <span className="font-medium">{formatCurrency(data.total, 'ARS', { showCurrencyCode: false })}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Porcentaje:</span>
          <span className="font-medium">{data.percentage}%</span>
        </div>
      </div>
    </div>
  )
}

const CustomLegend = ({ payload }: { payload?: Array<{ value: string; color: string }> }) => {
  if (!payload) return null

  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-gray-600">
            {PROVIDER_LABELS[entry.value] || entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function PaymentMethodsChart({ data, isLoading }: PaymentMethodsChartProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="h-[250px] bg-gray-100 rounded-xl"></div>
        </div>
      </div>
    )
  }

  if (!data?.length) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-secondary mb-4">Métodos de Pago</h3>
        <div className="flex items-center justify-center h-[250px] text-gray-400">
          <div className="text-center">
            <i className="ki-duotone ki-credit-cart text-4xl mb-2">
              <span className="path1"></span>
              <span className="path2"></span>
            </i>
            <p>No hay datos disponibles</p>
          </div>
        </div>
      </div>
    )
  }

  const chartData = data.map((item) => ({
    ...item,
    name: PROVIDER_LABELS[item.provider] || item.provider,
    fill: PROVIDER_COLORS[item.provider] || '#6B7280',
  }))

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-secondary mb-4">Métodos de Pago</h3>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="count"
              nameKey="provider"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Stats below chart */}
      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
        {chartData.map((item) => (
          <div key={item.provider} className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: item.fill }}
              />
              <span className="text-xs text-gray-500">{item.name}</span>
            </div>
            <p className="text-lg font-bold text-secondary">{item.percentage}%</p>
          </div>
        ))}
      </div>
    </div>
  )
}
