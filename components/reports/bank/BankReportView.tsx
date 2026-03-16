'use client'

import React from 'react'
import { ReportResponse, BankReportData } from '@/lib/types/report.types'
import BankOwners from './components/BankOwners'
import BankAccountSummary from './components/BankAccountSummary'

interface BankReportViewProps {
  reportData: ReportResponse
  bankData: BankReportData
  activeSection?: string
  onSectionChange?: (section: string) => void
}

export default function BankReportView({
  reportData,
  bankData
}: BankReportViewProps) {
  if (!bankData) return null

  return (
    <div className="w-full space-y-6">
      <BankOwners owners={bankData.owners || []} />
      <BankAccountSummary data={bankData} />
    </div>
  )
}
