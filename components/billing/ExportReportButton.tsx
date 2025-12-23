'use client'

import { useState } from 'react'
import { formatDateTime } from '@/lib/utils/dateUtils'

interface ExportReportButtonProps {
  period: string
  periodLabel: string
}

interface ExportData {
  uid: string
  status: string
  total: number
  subtotal: number
  currency: string
  tokens: number
  paymentProvider: string
  accountEmail: string
  accountName: string
  discountCode: string
  createdAt: string
}

export default function ExportReportButton({ period, periodLabel }: ExportReportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [showOptions, setShowOptions] = useState(false)

  const exportToCSV = async () => {
    setIsExporting(true)
    try {
      const response = await fetch(`/api/billing/export?period=${period}`)
      if (!response.ok) throw new Error('Error al exportar')

      const result = await response.json()
      const data: ExportData[] = result.data

      // Create CSV content
      const headers = [
        'ID',
        'Estado',
        'Total',
        'Subtotal',
        'Moneda',
        'Tokens',
        'Método de Pago',
        'Email Cliente',
        'Nombre Cliente',
        'Código Descuento',
        'Fecha',
      ]

      const rows = data.map((row) => [
        row.uid,
        row.status,
        row.total.toString(),
        row.subtotal.toString(),
        row.currency,
        row.tokens.toString(),
        row.paymentProvider,
        row.accountEmail,
        row.accountName,
        row.discountCode,
        formatDateTime(row.createdAt),
      ])

      const csvContent = [
        headers.join(','),
        ...rows.map((row) =>
          row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')
        ),
      ].join('\n')

      // Download file
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `reporte-billing-${period}-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export error:', error)
      alert('Error al exportar el reporte')
    } finally {
      setIsExporting(false)
      setShowOptions(false)
    }
  }

  const exportToExcel = async () => {
    setIsExporting(true)
    try {
      const response = await fetch(`/api/billing/export?period=${period}`)
      if (!response.ok) throw new Error('Error al exportar')

      const result = await response.json()
      const data: ExportData[] = result.data

      // Create Excel-compatible XML
      const headers = [
        'ID',
        'Estado',
        'Total',
        'Subtotal',
        'Moneda',
        'Tokens',
        'Método de Pago',
        'Email Cliente',
        'Nombre Cliente',
        'Código Descuento',
        'Fecha',
      ]

      let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Worksheet ss:Name="Reporte Billing">
<Table>
<Row>${headers.map((h) => `<Cell><Data ss:Type="String">${h}</Data></Cell>`).join('')}</Row>`

      data.forEach((row) => {
        xmlContent += `<Row>
<Cell><Data ss:Type="String">${row.uid}</Data></Cell>
<Cell><Data ss:Type="String">${row.status}</Data></Cell>
<Cell><Data ss:Type="Number">${row.total}</Data></Cell>
<Cell><Data ss:Type="Number">${row.subtotal}</Data></Cell>
<Cell><Data ss:Type="String">${row.currency}</Data></Cell>
<Cell><Data ss:Type="Number">${row.tokens}</Data></Cell>
<Cell><Data ss:Type="String">${row.paymentProvider}</Data></Cell>
<Cell><Data ss:Type="String">${escapeXml(row.accountEmail)}</Data></Cell>
<Cell><Data ss:Type="String">${escapeXml(row.accountName)}</Data></Cell>
<Cell><Data ss:Type="String">${row.discountCode}</Data></Cell>
<Cell><Data ss:Type="String">${formatDateTime(row.createdAt)}</Data></Cell>
</Row>`
      })

      xmlContent += `</Table></Worksheet></Workbook>`

      // Download file
      const blob = new Blob([xmlContent], { type: 'application/vnd.ms-excel' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `reporte-billing-${period}-${new Date().toISOString().split('T')[0]}.xls`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export error:', error)
      alert('Error al exportar el reporte')
    } finally {
      setIsExporting(false)
      setShowOptions(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        disabled={isExporting}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-secondary hover:bg-gray-50 transition-colors disabled:opacity-50"
      >
        {isExporting ? (
          <>
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            Exportando...
          </>
        ) : (
          <>
            <i className="ki-duotone ki-file-down text-lg">
              <span className="path1"></span>
              <span className="path2"></span>
            </i>
            Exportar
          </>
        )}
      </button>

      {showOptions && !isExporting && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowOptions(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 min-w-[200px]">
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
              <p className="text-xs text-gray-500">Exportar {periodLabel}</p>
            </div>
            <button
              onClick={exportToCSV}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-secondary hover:bg-gray-50 transition-colors"
            >
              <i className="ki-duotone ki-document text-xl text-green-600">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
              <div className="text-left">
                <p className="font-medium">CSV</p>
                <p className="text-xs text-gray-400">Compatible con Excel, Sheets</p>
              </div>
            </button>
            <button
              onClick={exportToExcel}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-secondary hover:bg-gray-50 transition-colors border-t border-gray-100"
            >
              <i className="ki-duotone ki-notepad text-xl text-blue-600">
                <span className="path1"></span>
                <span className="path2"></span>
                <span className="path3"></span>
                <span className="path4"></span>
                <span className="path5"></span>
              </i>
              <div className="text-left">
                <p className="font-medium">Excel</p>
                <p className="text-xs text-gray-400">Formato .xls nativo</p>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
