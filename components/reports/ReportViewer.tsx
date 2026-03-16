'use client'

import React, { lazy, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { ReportResponse } from '@/lib/types/report.types'
import { ServicesType, RequestStatus, ROUTES } from '@/lib/constants'

// Lazy load report components
const PeopleReportView = lazy(() => import('./people/PeopleReportView'))
const CompanyReportView = lazy(() => import('./company/CompanyReportView'))
const VehicleReportView = lazy(() => import('./vehicle/VehicleReportView'))
const PhoneReportView = lazy(() => import('./phone/PhoneReportView'))
const BankReportView = lazy(() => import('./bank/BankReportView'))
const OsintReportView = lazy(() => import('./osint/OsintReportView'))
const IdentityReportView = lazy(() => import('./identity/IdentityReportView'))

interface ReportViewerProps {
  reportData: ReportResponse
  activeSection: string
  onSectionChange: (section: string) => void
}

export default function ReportViewer({
  reportData,
  activeSection,
  onSectionChange,
}: ReportViewerProps) {
  const router = useRouter()

  // Loading component for Suspense fallback
  const LoadingComponent = () => (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )

  // If report status is NOT_FOUND
  if (reportData.status === RequestStatus.NOT_FOUND) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-200/30 mb-8">
          <i className="ki-duotone ki-search-list text-5xl text-slate-500/80">
            <span className="path1"></span>
            <span className="path2"></span>
            <span className="path3"></span>
          </i>
        </div>
        <div className="text-center space-y-3 mb-6">
          <p className="text-slate-700 font-semibold text-lg">
            No se encontraron resultados
          </p>
          <p className="text-slate-500/70 max-w-md">
            No hay datos disponibles para esta busqueda en nuestras fuentes.
          </p>
        </div>
        <button
          onClick={() => router.push(ROUTES.REPORTS)}
          className="px-6 py-3 bg-slate-100 text-slate-700 rounded-2xl font-medium hover:bg-slate-200 transition-all duration-300"
        >
          Volver al listado
        </button>
      </div>
    )
  }

  // If report status is FAILED
  if (reportData.status === RequestStatus.FAILED) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="p-6 bg-orange-50/50 rounded-3xl border border-orange-200/30 mb-8">
          <i className="ki-duotone ki-information-2 text-5xl text-orange-500/80">
            <span className="path1"></span>
            <span className="path2"></span>
            <span className="path3"></span>
          </i>
        </div>
        <div className="text-center space-y-3 mb-6">
          <p className="text-slate-700 font-semibold text-lg">
            Hubo un problema con la busqueda
          </p>
          <p className="text-slate-500/70 max-w-md">
            No se pudo completar la busqueda debido a un error tecnico.
          </p>
        </div>
        {reportData.responseId && (
          <p className="text-xs text-slate-400 mb-6">
            Codigo de referencia: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono">{reportData.responseId}</code>
          </p>
        )}
        <button
          onClick={() => router.push(ROUTES.REPORTS)}
          className="px-6 py-3 bg-slate-100 text-slate-700 rounded-2xl font-medium hover:bg-slate-200 transition-all duration-300"
        >
          Volver al listado
        </button>
      </div>
    )
  }

  // If report status is REVIEW_NEEDED
  if (reportData.status === RequestStatus.REVIEW_NEEDED) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="p-6 bg-amber-50/50 rounded-3xl border border-amber-200/30 mb-8">
          <i className="ki-duotone ki-user-tick text-5xl text-amber-600/80">
            <span className="path1"></span>
            <span className="path2"></span>
            <span className="path3"></span>
          </i>
        </div>
        <div className="text-center space-y-3 mb-8">
          <p className="text-slate-700 font-semibold text-lg">
            Seleccion de resultado requerida
          </p>
          <p className="text-slate-500/70 max-w-md">
            Se encontraron multiples coincidencias para esta busqueda.
            El usuario debe seleccionar el resultado correcto.
          </p>
        </div>
        <button
          onClick={() => router.push(ROUTES.REPORTS)}
          className="px-6 py-3 bg-slate-100 text-slate-700 rounded-2xl font-medium hover:bg-slate-200 transition-all duration-300"
        >
          Volver al listado
        </button>
      </div>
    )
  }

  // If report is PENDING or PROCESSING
  if (reportData.status === RequestStatus.PENDING || reportData.status === RequestStatus.PROCESSING) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-200/30 mb-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        </div>
        <div className="text-center space-y-3 mb-8">
          <p className="text-slate-700 font-semibold text-lg">
            Procesando reporte
          </p>
          <p className="text-slate-500/70 max-w-md">
            El reporte aun esta siendo procesado. Intenta de nuevo en unos momentos.
          </p>
        </div>
        <button
          onClick={() => router.push(ROUTES.REPORTS)}
          className="px-6 py-3 bg-slate-100 text-slate-700 rounded-2xl font-medium hover:bg-slate-200 transition-all duration-300"
        >
          Volver al listado
        </button>
      </div>
    )
  }

  // Render appropriate component based on report type
  switch (reportData.type?.toUpperCase()) {
    case ServicesType.PEOPLE:
      if (!reportData.data) {
        return <NoDataView type="personas" />
      }
      return (
        <Suspense fallback={<LoadingComponent />}>
          <PeopleReportView
            reportData={reportData}
            peopleData={reportData.data}
            activeSection={activeSection}
            onSectionChange={onSectionChange}
          />
        </Suspense>
      )

    case ServicesType.COMPANIES:
      if (!reportData.data) {
        return <NoDataView type="empresa" />
      }
      return (
        <Suspense fallback={<LoadingComponent />}>
          <CompanyReportView
            reportData={reportData}
            companyData={reportData.data}
            activeSection={activeSection}
            onSectionChange={onSectionChange}
          />
        </Suspense>
      )

    case ServicesType.VEHICLES:
      if (!reportData.data) {
        return <NoDataView type="vehiculo" />
      }
      return (
        <Suspense fallback={<LoadingComponent />}>
          <VehicleReportView
            reportData={reportData}
            vehicleData={reportData.data}
          />
        </Suspense>
      )

    case ServicesType.PHONES:
      if (!reportData.data) {
        return <NoDataView type="telefono" />
      }
      return (
        <Suspense fallback={<LoadingComponent />}>
          <PhoneReportView
            reportData={reportData}
            phoneData={reportData.data}
          />
        </Suspense>
      )

    case ServicesType.BANKS:
      if (!reportData.data) {
        return <NoDataView type="banco" />
      }
      return (
        <Suspense fallback={<LoadingComponent />}>
          <BankReportView
            reportData={reportData}
            bankData={reportData.data}
            activeSection={activeSection}
            onSectionChange={onSectionChange}
          />
        </Suspense>
      )

    case ServicesType.OSINT:
      return (
        <Suspense fallback={<LoadingComponent />}>
          <OsintReportView
            reportData={reportData}
            osintData={reportData.data || { data: [] }}
            activeSection={activeSection}
            onSectionChange={onSectionChange}
          />
        </Suspense>
      )

    case ServicesType.IDENTITY:
      return (
        <Suspense fallback={<LoadingComponent />}>
          <IdentityReportView
            reportData={reportData}
            identityData={reportData.data?.decision}
            activeSection={activeSection}
            onSectionChange={onSectionChange}
          />
        </Suspense>
      )

    default:
      return <UnsupportedReportView feature={reportData.type} />
  }
}

function NoDataView({ type }: { type: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="p-6 bg-amber-50/50 rounded-3xl border border-amber-200/30 mb-8">
        <i className="ki-duotone ki-information-2 text-5xl text-amber-600/80">
          <span className="path1"></span>
          <span className="path2"></span>
          <span className="path3"></span>
        </i>
      </div>
      <div className="text-center space-y-3">
        <p className="text-slate-700 font-semibold text-lg">
          No hay datos de {type}
        </p>
        <p className="text-slate-500/70">
          El reporte no contiene informacion de {type}
        </p>
      </div>
    </div>
  )
}

function UnsupportedReportView({ feature }: { feature?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="p-6 bg-rose-50/60 rounded-2xl border border-rose-200/40 mb-8 inline-block">
        <i className="ki-duotone ki-information-2 text-5xl text-rose-500/80">
          <span className="path1"></span>
          <span className="path2"></span>
          <span className="path3"></span>
        </i>
      </div>
      <div className="text-center space-y-4">
        <p className="text-slate-800 font-semibold text-lg">
          Tipo de reporte no soportado
        </p>
        <p className="text-slate-600/70">
          {feature ? `El tipo de reporte "${feature}" no esta implementado aun` : 'Tipo de reporte desconocido'}
        </p>
      </div>
    </div>
  )
}
