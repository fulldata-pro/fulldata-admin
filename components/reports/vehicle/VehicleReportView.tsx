'use client'

import React from 'react'
import { ReportResponse, VehicleData } from '@/lib/types/report.types'
import {
  VehicleSummaryCard,
  OwnersSection,
  OwnersHistorySection,
} from './components'

interface VehicleReportViewProps {
  reportData: ReportResponse
  vehicleData: VehicleData
}

export default function VehicleReportView({
  reportData,
  vehicleData
}: VehicleReportViewProps) {
  if (!vehicleData) return null

  const summaryData = vehicleData.summary
  const vehicleRefDetails = vehicleData.vehicleRefDetails
  const ownersData = vehicleData.owners || []
  const ownersHistoryData = vehicleData.ownersHistory || []

  return (
    <div className="space-y-8">
      {/* Vehicle Summary Card */}
      {summaryData && (
        <VehicleSummaryCard
          summaryData={summaryData}
          vehicleRefDetails={vehicleRefDetails}
        />
      )}

      {/* Current Owners Section */}
      <OwnersSection ownersData={ownersData} />

      {/* Owners History Section */}
      <OwnersHistorySection ownersHistoryData={ownersHistoryData} />
    </div>
  )
}
