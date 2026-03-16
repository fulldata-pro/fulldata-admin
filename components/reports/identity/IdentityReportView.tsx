'use client'

import React from 'react'
import { ReportResponse, DiditSession, DiditSessionStatus, DiditWarning } from '@/lib/types/report.types'
import DocumentValidationSection from './components/DocumentValidationSection'
import BiometricControlSection from './components/BiometricControlSection'
import LocationInfoSection from './components/LocationInfoSection'
import ValidationsSection from './components/ValidationsSection'
import WarningsSection from './components/WarningsSection'
import AMLSection from './components/AMLSection'
import IdentityStatusView from './components/IdentityStatusView'

interface IdentityReportViewProps {
  reportData: ReportResponse
  identityData: DiditSession
  activeSection: string
  onSectionChange?: (section: string) => void
}

export default function IdentityReportView({
  reportData,
  identityData,
  activeSection,
  onSectionChange,
}: IdentityReportViewProps) {
  if (!identityData) return null

  const data = identityData

  // Show status view for non-completed validations (APPROVED, DECLINED, and IN_REVIEW show full report)
  const shouldShowStatusView =
    data.status &&
    data.status.toUpperCase() !== DiditSessionStatus.APPROVED &&
    data.status.toUpperCase() !== DiditSessionStatus.DECLINED &&
    data.status.toUpperCase() !== DiditSessionStatus.IN_REVIEW

  if (shouldShowStatusView) {
    return <IdentityStatusView identityData={data} />
  }

  const warnings = (): DiditWarning[] => {
    const w: DiditWarning[] = []
    if (data.id_verification?.warnings) w.push(...data.id_verification.warnings)
    if (data.ip_analysis?.warnings) w.push(...data.ip_analysis.warnings)
    if (data.liveness?.warnings) w.push(...data.liveness.warnings)
    if (data.face_match && data.face_match.warnings) w.push(...data.face_match.warnings)
    if (data.aml && data.aml.warnings) w.push(...data.aml.warnings)

    // Filter out certain warnings
    return w.filter((warning) => {
      return (
        warning.risk !== 'POSSIBLE_DUPLICATED_FACE' &&
        warning.risk !== 'POSSIBLE_DUPLICATED_USER' &&
        warning.risk !== 'BARCODE_NOT_DETECTED' &&
        warning.risk !== 'DUPLICATED_FACE'
      )
    })
  }

  return (
    <div className="space-y-6">
      {/* Document Validation Section */}
        <section
          id="documento"
          className="bg-white border border-gray-200 rounded-xl shadow-sm"
        >
          <div className="px-8 py-6 border-b border-gray-100">
            <h2 className="text-2xl font-medium text-gray-900 mb-2">Validacion de Documento</h2>
            <div className="h-0.5 bg-gradient-to-r from-rose-500 via-rose-400 to-transparent w-24"></div>
          </div>
          <div className="p-6">
            <DocumentValidationSection id_verification={data.id_verification} />
          </div>
        </section>

        {/* Biometric Control Section */}
        <section
          id="biometrico"
          className="bg-white border border-gray-200 rounded-xl shadow-sm"
        >
          <div className="px-8 py-6 border-b border-gray-100">
            <h2 className="text-2xl font-medium text-gray-900 mb-2">Control Biometrico</h2>
            <div className="h-0.5 bg-gradient-to-r from-rose-500 via-rose-400 to-transparent w-24"></div>
          </div>
          <div className="p-6">
            <BiometricControlSection face={data.face_match} liveness={data.liveness} />
          </div>
        </section>

        {/* Location Info Section */}
        <section
          id="ubicacion"
          className="bg-white border border-gray-200 rounded-xl shadow-sm"
        >
          <div className="px-8 py-6 border-b border-gray-100">
            <h2 className="text-2xl font-medium text-gray-900 mb-2">Analisis de Ubicacion</h2>
            <div className="h-0.5 bg-gradient-to-r from-rose-500 via-rose-400 to-transparent w-24"></div>
          </div>
          <div className="p-6">
            <LocationInfoSection
              ip_analysis={data.ip_analysis}
              parsed_address={data.id_verification?.parsed_address}
              locations_info={data.ip_analysis?.locations_info}
            />
          </div>
        </section>

        {/* Warnings Section */}
        {warnings() && warnings().length > 0 && (
          <section
            id="alertas"
            className="bg-white border border-rose-200 rounded-xl shadow-sm"
          >
            <div className="px-8 py-6 border-b border-rose-100">
              <h2 className="text-2xl font-medium text-gray-900 mb-2">Alertas</h2>
              <div className="h-0.5 bg-gradient-to-r from-rose-500 via-rose-400 to-transparent w-24"></div>
            </div>
            <div className="p-6">
              <WarningsSection warnings={warnings()} />
            </div>
          </section>
        )}

        {/* Validations Section */}
        <section
          id="validaciones"
          className="bg-white border border-gray-200 rounded-xl shadow-sm"
        >
          <div className="px-8 py-6 border-b border-gray-100">
            <h2 className="text-2xl font-medium text-gray-900 mb-2">Estado de Validaciones</h2>
            <div className="h-0.5 bg-gradient-to-r from-rose-500 via-rose-400 to-transparent w-24"></div>
          </div>
          <div className="p-6">
            <ValidationsSection data={data} />
          </div>
        </section>

        {/* AML Section */}
        {data.aml && (
          <section
            id="aml"
            className="bg-white border border-gray-200 rounded-xl shadow-sm"
          >
            <div className="px-8 py-6 border-b border-gray-100">
              <h2 className="text-2xl font-medium text-gray-900 mb-2">Deteccion AML</h2>
              <div className="h-0.5 bg-gradient-to-r from-rose-500 via-rose-400 to-transparent w-24"></div>
            </div>
            <div className="p-6">
              <AMLSection aml={data.aml} />
            </div>
          </section>
        )}
    </div>
  )
}
