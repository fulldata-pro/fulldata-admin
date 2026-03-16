'use client'

import Image from 'next/image'

interface ReportAvatarProps {
  initials: string
  name: string
  size?: 'sm' | 'md' | 'lg'
  currentAvatar?: string
}

export default function ReportAvatar({
  initials,
  name,
  size = 'md',
  currentAvatar,
}: ReportAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  return (
    <div className="relative">
      <div
        className={`${sizeClasses[size]} rounded-lg bg-gray-50 overflow-hidden border border-gray-200`}
        title={name}
      >
        {currentAvatar ? (
          <Image
            height={300}
            width={300}
            src={currentAvatar}
            alt={`Foto de ${name}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className={`${textSizeClasses[size]} font-semibold text-gray-600`}>
              {initials}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
