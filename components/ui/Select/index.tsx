'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

export interface SelectOption {
  value: string
  label: string
  icon?: React.ReactNode
  description?: string
}

export type SelectPlacement = 'top' | 'bottom'
export type SelectSize = 'xs' | 'sm' | 'md' | 'lg'

interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  disabled?: boolean
  className?: string
  buttonClassName?: string
  placeholder?: string
  error?: boolean
  fullWidth?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  placement?: SelectPlacement
  size?: SelectSize
}

export function Select({
  value,
  onChange,
  options,
  disabled = false,
  className = '',
  buttonClassName = '',
  placeholder = 'Seleccionar...',
  error = false,
  fullWidth = true,
  searchable = false,
  searchPlaceholder = 'Buscar...',
  placement = 'bottom',
  size = 'md'
}: SelectProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0, actualPlacement: placement })
  const [searchQuery, setSearchQuery] = useState('')
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const sizeStyles = {
    xs: {
      button: 'px-2 py-1 gap-2 text-xs rounded-lg',
      icon: 'w-2.5 h-2.5',
      dropdown: 'rounded-lg',
      option: 'px-2.5 py-1.5 gap-2 text-xs',
      searchContainer: 'p-2',
      searchInput: 'pl-7 pr-2 py-1 text-xs rounded',
      emptyState: 'px-2.5 py-6 text-xs'
    },
    sm: {
      button: 'px-2.5 py-1.5 gap-2 text-sm rounded-lg',
      icon: 'w-3 h-3',
      dropdown: 'rounded-lg',
      option: 'px-3 py-2 gap-2 text-sm',
      searchContainer: 'p-2',
      searchInput: 'pl-8 pr-2 py-1.5 text-sm rounded-lg',
      emptyState: 'px-3 py-6 text-sm'
    },
    md: {
      button: 'px-3 py-2 gap-3 text-sm rounded-xl',
      icon: 'w-3 h-3',
      dropdown: 'rounded-xl',
      option: 'px-4 py-3 gap-3 text-sm',
      searchContainer: 'p-3',
      searchInput: 'pl-9 pr-3 py-2 text-sm rounded-lg',
      emptyState: 'px-4 py-8 text-sm'
    },
    lg: {
      button: 'px-4 py-3 gap-4 text-base rounded-xl',
      icon: 'w-4 h-4',
      dropdown: 'rounded-xl',
      option: 'px-5 py-4 gap-4 text-sm',
      searchContainer: 'p-4',
      searchInput: 'pl-10 pr-4 py-2.5 text-base rounded-lg',
      emptyState: 'px-5 py-10 text-base'
    }
  }

  const currentSize = sizeStyles[size]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('[data-select]') && !target.closest('[data-select-portal]')) {
        setShowDropdown(false)
      }
    }

    const handleScroll = (event: Event) => {
      const scrollTarget = event.target as HTMLElement
      const isDropdownScroll = dropdownRef.current && dropdownRef.current.contains(scrollTarget)

      if (!isDropdownScroll) {
        setShowDropdown(false)
      }
    }

    if (showDropdown && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const gap = 4
      const dropdownHeight = 300

      let top = 0
      let actualPlacement = placement

      if (placement === 'top') {
        if (rect.top < dropdownHeight && window.innerHeight - rect.bottom > rect.top) {
          actualPlacement = 'bottom'
          top = rect.bottom + gap
        } else {
          top = rect.top - gap
        }
      } else {
        if (window.innerHeight - rect.bottom < dropdownHeight && rect.top > window.innerHeight - rect.bottom) {
          actualPlacement = 'top'
          top = rect.top - gap
        } else {
          top = rect.bottom + gap
        }
      }

      setDropdownPosition({
        top,
        left: rect.left,
        width: rect.width,
        actualPlacement
      })

      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('scroll', handleScroll, true)

      if (searchable) {
        setTimeout(() => {
          searchInputRef.current?.focus()
        }, 50)
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('scroll', handleScroll, true)
      }
    } else {
      if (searchable) {
        setSearchQuery('')
      }
    }
  }, [showDropdown, searchable, placement])

  const selectedOption = options.find(o => o.value === value)

  const filteredOptions = searchable
    ? options.filter(option =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (option.description && option.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    : options

  return (
    <>
      <div className={`relative ${className}`} data-select>
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          className={`
            ${fullWidth ? 'w-full' : ''}
            flex items-center justify-between ${currentSize.button}
            bg-white border ${error ? 'border-red-300' : 'border-gray-200'}
            hover:bg-gray-50 focus:outline-none focus:ring-2
            ${error ? 'focus:ring-red-500/20 focus:border-red-300' : 'focus:ring-primary/20 focus:border-primary'}
            transition-all duration-200 ${buttonClassName}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          disabled={disabled}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {selectedOption ? (
              <>
                {selectedOption.icon && (
                  <span className="flex-shrink-0">{selectedOption.icon}</span>
                )}
                <span className="font-medium text-gray-700 truncate">
                  {selectedOption.label}
                </span>
              </>
            ) : (
              <span className="text-gray-400">{placeholder}</span>
            )}
          </div>
          <svg
            className={`${currentSize.icon} text-gray-400 transition-transform flex-shrink-0 ${showDropdown ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {showDropdown && typeof window !== 'undefined' && createPortal(
        <div
          ref={dropdownRef}
          data-select-portal
          className={`
            fixed bg-white border border-gray-200 ${currentSize.dropdown}
            shadow-xl overflow-hidden z-[99999]
            ${dropdownPosition.actualPlacement === 'top' ? 'origin-bottom' : 'origin-top'}
          `}
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
            transform: dropdownPosition.actualPlacement === 'top' ? 'translateY(-100%)' : ''
          }}
        >
          {searchable && (
            <div className={`${currentSize.searchContainer} border-b border-gray-100 bg-gray-50/50`}>
              <div className="relative">
                <svg
                  className="absolute w-4 h-4 left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className={`w-full ${currentSize.searchInput} bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary`}
                />
              </div>
            </div>
          )}

          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value)
                    setShowDropdown(false)
                  }}
                  className={`
                    w-full flex items-center ${currentSize.option} text-left
                    hover:bg-gray-50 transition-all
                    ${value === option.value ? 'bg-primary/5' : ''}
                  `}
                >
                  {option.icon && (
                    <span className="flex-shrink-0">{option.icon}</span>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{option.label}</div>
                    {option.description && (
                      <div className="text-xs text-gray-500 truncate">{option.description}</div>
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div className={`${currentSize.emptyState} text-center text-gray-500`}>
                {searchable && searchQuery
                  ? 'No se encontraron resultados'
                  : 'No hay opciones disponibles'}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

export default Select
