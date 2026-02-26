'use client'

import React, { useState } from 'react'

interface InfoTooltipProps {
  content: string
}

export default function InfoTooltip({ content }: InfoTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        className="text-gray-400 hover:text-gray-600 transition-colors"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
      >
        <i className="ki-duotone ki-information-2 text-base">
          <span className="path1"></span>
          <span className="path2"></span>
          <span className="path3"></span>
        </i>
      </button>
      {isVisible && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg max-w-xs whitespace-normal">
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  )
}
