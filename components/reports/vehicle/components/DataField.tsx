'use client'

import React from 'react'

interface DataFieldProps {
  label: string
  value: any
  icon?: string
  className?: string
}

export default function DataField({
  label,
  value,
  icon,
  className = ""
}: DataFieldProps) {
  if (!value || value === '' || value === 'N/A') return null

  const displayValue = typeof value === 'object' ? value : String(value)

  return (
    <div className={`flex items-center justify-between py-3 px-4 bg-gradient-to-r from-zinc-50/40 to-slate-50/30 border border-slate-200/30 rounded-xl hover:from-zinc-50/60 hover:to-slate-50/50 hover:border-slate-300/50 transition-all duration-300 ${className}`}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {icon && <span className="text-sm opacity-70">{icon}</span>}
        <span className="text-sm text-slate-700 font-medium truncate">
          {label}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-sm text-slate-800 font-semibold text-right flex-shrink-0">
          {displayValue}
        </div>
      </div>
    </div>
  )
}
