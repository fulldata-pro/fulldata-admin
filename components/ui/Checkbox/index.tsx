'use client'

import React, { forwardRef, useEffect, useRef } from 'react'

export type CheckboxSize = 'sm' | 'md' | 'lg'

export interface CheckboxProps {
  checked?: boolean
  onChange?: (checked: boolean) => void
  indeterminate?: boolean
  disabled?: boolean
  onClick?: (e: React.MouseEvent) => void
  size?: CheckboxSize
  label?: React.ReactNode
  description?: React.ReactNode
  className?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>((props, ref) => {
  const {
    checked = false,
    onChange,
    indeterminate = false,
    disabled = false,
    onClick,
    size = 'md',
    label,
    description,
    className = '',
  } = props

  const internalRef = useRef<HTMLInputElement>(null)

  // Handle indeterminate state
  useEffect(() => {
    const input = internalRef.current
    if (input) {
      input.indeterminate = indeterminate
    }
  }, [indeterminate])

  // Merge refs
  useEffect(() => {
    if (ref) {
      if (typeof ref === 'function') {
        ref(internalRef.current)
      } else {
        ref.current = internalRef.current
      }
    }
  }, [ref])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.checked)
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClick?.(e)
  }

  const handleBoxClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!disabled) {
      onChange?.(!checked)
    }
  }

  const sizes = {
    sm: 'w-4 h-4 rounded',
    md: 'w-5 h-5 rounded-md',
    lg: 'w-6 h-6 rounded-lg',
  }

  const isActive = checked || indeterminate

  const checkboxElement = (
    <div className={`relative inline-flex items-center ${className}`}>
      <input
        ref={internalRef}
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        onClick={handleClick}
        disabled={disabled}
        className="sr-only"
      />
      <div
        className={`
          relative ${sizes[size]} border-2 transition-all duration-200 cursor-pointer
          ${isActive
            ? 'bg-primary border-primary shadow-sm'
            : 'bg-white border-gray-300 hover:border-primary/60'
          }
          ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:shadow-md'}
        `}
        onClick={handleBoxClick}
      >
        {/* Checkmark */}
        {checked && !indeterminate && (
          <svg
            className="absolute inset-0 w-full h-full text-white p-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}

        {/* Indeterminate state */}
        {indeterminate && !checked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2.5 h-0.5 bg-white rounded-full"></div>
          </div>
        )}
      </div>
    </div>
  )

  if (!label && !description) {
    return checkboxElement
  }

  return (
    <label
      className={`
        inline-flex items-start gap-3
        ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
      `}
    >
      {checkboxElement}
      {(label || description) && (
        <div className="flex flex-col gap-0.5">
          {label && (
            <span className={`text-sm font-medium ${isActive ? 'text-primary' : 'text-gray-900'}`}>
              {label}
            </span>
          )}
          {description && (
            <span className={`text-xs ${isActive ? 'text-primary/70' : 'text-gray-500'}`}>
              {description}
            </span>
          )}
        </div>
      )}
    </label>
  )
})

Checkbox.displayName = 'Checkbox'

export default Checkbox
