'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-toastify'
import { ReportResponse } from '@/lib/types/report.types'
import { ROUTES } from '@/lib/constants'
import ReportHeader from '@/components/reports/ReportHeader'
import ReportViewer from '@/components/reports/ReportViewer'

export default function ReportDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const router = useRouter()
  const [reportData, setReportData] = useState<ReportResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState('summary')

  useEffect(() => {
    const fetchReport = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/reports/${id}`)
        const data = await response.json()

        if (!response.ok) {
          if (response.status === 404) {
            setError('Reporte no encontrado')
          } else if (response.status === 502) {
            // External service error but we may have metadata
            if (data._id) {
              setReportData(data)
              toast.warning('No se pudieron cargar los datos completos del reporte')
            } else {
              setError(data.message || 'Error al obtener el reporte del servicio externo')
            }
          } else {
            setError(data.message || data.error || 'Error al cargar el reporte')
          }
          return
        }

        setReportData(data)
      } catch (err) {
        console.error('Error fetching report:', err)
        setError('Error de conexion al cargar el reporte')
        toast.error('Error al cargar el reporte')
      } finally {
        setIsLoading(false)
      }
    }

    fetchReport()
  }, [id])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando reporte...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="p-6 bg-red-50 rounded-3xl border border-red-200 mb-6 inline-block">
            <i className="ki-duotone ki-cross-circle text-5xl text-red-500">
              <span className="path1"></span>
              <span className="path2"></span>
            </i>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href={ROUTES.REPORTS}
            className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
          >
            Volver al listado
          </Link>
        </div>
      </div>
    )
  }

  if (!reportData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="p-6 bg-gray-50 rounded-3xl border border-gray-200 mb-6 inline-block">
            <i className="ki-duotone ki-search-list text-5xl text-gray-400">
              <span className="path1"></span>
              <span className="path2"></span>
              <span className="path3"></span>
            </i>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Reporte no encontrado</h2>
          <p className="text-gray-600 mb-6">El reporte solicitado no existe</p>
          <Link
            href={ROUTES.REPORTS}
            className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
          >
            Volver al listado
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-8">
      {/* Back Button */}
      <div className="mb-4">
        <button
          onClick={() => router.push(ROUTES.REPORTS)}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <i className="ki-duotone ki-arrow-left text-lg">
            <span className="path1"></span>
            <span className="path2"></span>
          </i>
          <span>Volver a reportes</span>
        </button>
      </div>

      {/* Header */}
      <ReportHeader reportData={reportData} />

      {/* Content */}
      <div className="mt-6">
        <ReportViewer
          reportData={reportData}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
      </div>
    </div>
  )
}
