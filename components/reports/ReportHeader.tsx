'use client'

import Link from 'next/link'
import { ReportResponse } from '@/lib/types/report.types'
import { formatDateTime } from '@/lib/utils/dateUtils'
import ReportAvatar from './ReportAvatar'
import { ServicesType, ServiceLabels, RequestStatus, ROUTES } from '@/lib/constants'
import { Badge } from '@/components/ui/DataTable'

interface ReportHeaderProps {
  reportData: ReportResponse
}

const statusLabels: Record<string, string> = {
  PENDING: 'Pendiente',
  REVIEW_NEEDED: 'Rev. necesaria',
  PROCESSING: 'Procesando',
  PARTIAL: 'Parcial',
  NOT_FOUND: 'No encontrado',
  COMPLETED: 'Completado',
  FAILED: 'Fallido',
  EXPIRED: 'Expirado',
}

const statusVariants: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'gray' | 'purple'> = {
  PENDING: 'gray',
  REVIEW_NEEDED: 'warning',
  PROCESSING: 'info',
  PARTIAL: 'purple',
  NOT_FOUND: 'gray',
  COMPLETED: 'success',
  FAILED: 'danger',
  EXPIRED: 'gray',
}

function getMetadata(reportData: ReportResponse) {
  const type = reportData.type?.toUpperCase()
  let name = 'Sin nombre'
  let initials = 'NN'
  let subtitle = ''

  switch (type) {
    case ServicesType.PEOPLE: {
      const firstName = reportData.metadata?.firstName || reportData.data?.summary?.firstName || ''
      const lastName = reportData.metadata?.lastName || reportData.data?.summary?.lastName || ''
      const fullName = reportData.metadata?.fullName || `${firstName} ${lastName}`.trim()
      name = fullName || 'Sin nombre'
      initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'NN'
      const taxId = reportData.metadata?.taxId || reportData.data?.summary?.taxId
      subtitle = taxId ? `CUIT: ${taxId}` : ''
      break
    }
    case ServicesType.COMPANIES: {
      name = reportData.metadata?.legalName || reportData.data?.summary?.rz || 'Sin nombre'
      initials = name.split(' ').slice(0, 2).map((w: string) => w.charAt(0)).join('').toUpperCase() || 'NN'
      const taxId = reportData.metadata?.taxId || reportData.data?.summary?.taxId
      subtitle = taxId ? `CUIT: ${taxId}` : ''
      break
    }
    case ServicesType.VEHICLES: {
      const licensePlate = reportData.metadata?.licensePlate || reportData.data?.summary?.licensePlate || ''
      name = licensePlate || 'Sin patente'
      initials = licensePlate.slice(0, 2).toUpperCase() || 'VH'
      const model = reportData.data?.summary?.model
      const brand = reportData.data?.summary?.brand
      subtitle = model && brand ? `${brand} ${model}` : ''
      break
    }
    case ServicesType.PHONES: {
      const phoneNumber = reportData.metadata?.phoneNumber || ''
      name = phoneNumber || 'Sin numero'
      initials = 'PH'
      const ownerName = reportData.metadata?.fullName
      subtitle = ownerName || ''
      break
    }
    case ServicesType.BANKS: {
      name = reportData.metadata?.bankName || reportData.data?.bankRouting?.bankNameDisplay || 'Sin banco'
      initials = 'BK'
      const alias = reportData.metadata?.alias
      subtitle = alias || ''
      break
    }
    case ServicesType.OSINT: {
      const email = reportData.metadata?.emails?.[0] || reportData.metadata?.searchQuery || ''
      name = email || 'Sin email'
      initials = 'OS'
      break
    }
    case ServicesType.IDENTITY: {
      const fullName = reportData.metadata?.fullName || reportData.data?.decision?.id_verification?.full_name || ''
      name = fullName || 'Sin nombre'
      const nameParts = fullName.split(' ')
      initials = nameParts.length >= 2
        ? `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`.toUpperCase()
        : fullName.slice(0, 2).toUpperCase() || 'ID'
      const vendorData = reportData.data?.vendor_data
      subtitle = vendorData ? `Vendor: ${vendorData}` : ''
      break
    }
    default:
      name = reportData.metadata?.fullName || reportData.metadata?.searchQuery || 'Sin datos'
      initials = name.slice(0, 2).toUpperCase() || 'NN'
  }

  return { name, initials, subtitle }
}

export default function ReportHeader({ reportData }: ReportHeaderProps) {
  const metadata = getMetadata(reportData)

  return (
    <header className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Entity Information */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <ReportAvatar
                initials={metadata.initials}
                name={metadata.name}
                size="lg"
                currentAvatar={reportData.metadata?.avatar}
              />
            </div>

            {/* Entity Information */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-semibold text-gray-900 truncate">
                  {metadata.name}
                </h1>
                <Badge variant={statusVariants[reportData.status] || 'gray'}>
                  {statusLabels[reportData.status] || reportData.status}
                </Badge>
              </div>

              {/* Subtitle with key info */}
              <div className="mt-1 flex items-center gap-3 text-sm text-gray-600">
                {metadata.subtitle && (
                  <span>{metadata.subtitle}</span>
                )}
                <span className="text-gray-300">|</span>
                <Badge variant="info">
                  {ServiceLabels[reportData.type as keyof typeof ServiceLabels] || reportData.type}
                </Badge>
              </div>
            </div>
          </div>

          {/* Right Section - Date and Links */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Report Date */}
            {reportData.createdAt && (
              <div className="hidden lg:flex flex-col items-end">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Fecha
                </span>
                <div className="flex items-center gap-2">
                  <i className="ki-duotone ki-calendar text-sm text-gray-400">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                  <span className="text-sm font-medium text-gray-700">
                    {formatDateTime(reportData.createdAt)}
                  </span>
                </div>
              </div>
            )}

            {/* Admin Links */}
            <div className="flex items-center gap-2">
              {reportData.accountId && (
                <Link
                  href={ROUTES.ACCOUNT_DETAIL(reportData.accountId.uid || reportData.accountId._id || reportData.accountId)}
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Ver cuenta"
                >
                  <i className="ki-duotone ki-briefcase mr-1">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                  Cuenta
                </Link>
              )}
              {reportData.userId && (
                <Link
                  href={ROUTES.USER_DETAIL(reportData.userId.uid || reportData.userId._id || reportData.userId)}
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Ver usuario"
                >
                  <i className="ki-duotone ki-user mr-1">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </i>
                  Usuario
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
