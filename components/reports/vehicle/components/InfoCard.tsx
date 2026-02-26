'use client'

import React from 'react'

interface InfoCardProps {
  title: string
  children: React.ReactNode
  className?: string
  headerColor?: 'blue' | 'green' | 'purple' | 'gray' | 'red' | 'slate' | 'emerald' | 'amber'
  icon?: React.ReactNode
}

export default function InfoCard({
  title,
  children,
  className = "",
  headerColor = "blue",
  icon
}: InfoCardProps) {
  const colorClasses = {
    blue: "bg-gradient-to-br from-slate-50/30 to-gray-50/20 text-slate-800 border-gray-200/30",
    green: "bg-gradient-to-br from-slate-50/30 to-gray-50/20 text-slate-800 border-gray-200/30",
    purple: "bg-gradient-to-br from-slate-50/30 to-gray-50/20 text-slate-800 border-gray-200/30",
    gray: "bg-gradient-to-br from-slate-50/30 to-gray-50/20 text-slate-800 border-gray-200/30",
    red: "bg-gradient-to-br from-rose-50/30 to-rose-100/20 text-slate-800 border-rose-200/30",
    slate: "bg-gradient-to-br from-slate-50/30 to-gray-50/20 text-slate-800 border-gray-200/30",
    emerald: "bg-gradient-to-br from-slate-50/30 to-gray-50/20 text-slate-800 border-gray-200/30",
    amber: "bg-gradient-to-br from-slate-50/30 to-gray-50/20 text-slate-800 border-gray-200/30"
  }

  const gradientColors = {
    blue: "from-gray-500 via-gray-400",
    green: "from-gray-500 via-gray-400",
    purple: "from-gray-500 via-gray-400",
    gray: "from-gray-500 via-gray-400",
    red: "from-rose-500 via-rose-400",
    slate: "from-gray-500 via-gray-400",
    emerald: "from-gray-500 via-gray-400",
    amber: "from-gray-500 via-gray-400"
  }

  return (
    <div className={`rounded-xl border ${colorClasses[headerColor]} ${className}`}>
      <div className="p-4 border-b border-current border-opacity-20">
        <div className="mb-2">
          <h3 className="text-base font-medium text-gray-900 mb-2">
            {title}
          </h3>
          <div className={`h-0.5 bg-gradient-to-r ${gradientColors[headerColor]} to-transparent w-16`}></div>
        </div>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  )
}
