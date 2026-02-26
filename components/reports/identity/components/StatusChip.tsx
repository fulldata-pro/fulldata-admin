'use client'

import React from 'react'
import { DiditSessionStatus } from '@/lib/types/report.types'

interface StatusChipProps {
  status: string
}

const getStatusStyle = (status: string) => {
  switch (status.toUpperCase()) {
    case DiditSessionStatus.APPROVED:
      return 'bg-green-50 text-green-700 border-green-200'
    case DiditSessionStatus.DECLINED:
      return 'bg-red-50 text-red-700 border-red-200'
    case DiditSessionStatus.IN_REVIEW:
      return 'bg-amber-50 text-amber-700 border-amber-200'
    case DiditSessionStatus.ABANDONED:
      return 'bg-gray-50 text-gray-700 border-gray-200'
    case DiditSessionStatus.EXPIRED:
      return 'bg-orange-50 text-orange-700 border-orange-200'
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200'
  }
}

const getStatusIcon = (status: string) => {
  switch (status.toUpperCase()) {
    case DiditSessionStatus.APPROVED:
      return <div className="w-2 h-2 bg-green-500 rounded-full"></div>
    case DiditSessionStatus.DECLINED:
      return <div className="w-2 h-2 bg-red-500 rounded-full"></div>
    case DiditSessionStatus.IN_REVIEW:
      return <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
    case DiditSessionStatus.ABANDONED:
      return <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
    case DiditSessionStatus.EXPIRED:
      return <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
    default:
      return <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
  }
}

export default function StatusChip({ status }: StatusChipProps) {
  const translateStatus = (status: string) => {
    switch (status.toUpperCase()) {
      case DiditSessionStatus.APPROVED:
        return 'Aprobado'
      case DiditSessionStatus.DECLINED:
        return 'Rechazado'
      case DiditSessionStatus.IN_REVIEW:
        return 'En Revision'
      case DiditSessionStatus.ABANDONED:
        return 'No Finalizado'
      case DiditSessionStatus.EXPIRED:
        return 'Expirado'
      case DiditSessionStatus.NOT_STARTED:
        return 'No Iniciado'
      default:
        return status
    }
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-medium border ${getStatusStyle(status)}`}
    >
      {getStatusIcon(status)}
      {translateStatus(status)}
    </div>
  )
}
