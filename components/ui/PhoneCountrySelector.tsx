'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

export interface Country {
  code: string
  flag: string
  name: string
}

export type PhoneCountrySelectorSize = 'xs' | 'md' | 'lg'

export const defaultCountryCodes: Country[] = [
  { code: '+54', flag: '🇦🇷', name: 'Argentina' },
  { code: '+1', flag: '🇺🇸', name: 'Estados Unidos' },
  { code: '+52', flag: '🇲🇽', name: 'Mexico' },
  { code: '+34', flag: '🇪🇸', name: 'España' },
  { code: '+55', flag: '🇧🇷', name: 'Brasil' },
  { code: '+56', flag: '🇨🇱', name: 'Chile' },
  { code: '+57', flag: '🇨🇴', name: 'Colombia' },
  { code: '+58', flag: '🇻🇪', name: 'Venezuela' },
  { code: '+51', flag: '🇵🇪', name: 'Peru' },
  { code: '+598', flag: '🇺🇾', name: 'Uruguay' },
  { code: '+595', flag: '🇵🇾', name: 'Paraguay' },
  { code: '+591', flag: '🇧🇴', name: 'Bolivia' },
  { code: '+593', flag: '🇪🇨', name: 'Ecuador' }
]

interface PhoneCountrySelectorProps {
  value: string
  onChange: (value: string) => void
  countries?: Country[]
  disabled?: boolean
  className?: string
  buttonClassName?: string
  size?: PhoneCountrySelectorSize
}

export function PhoneCountrySelector({
  value,
  onChange,
  countries = defaultCountryCodes,
  disabled = false,
  className = '',
  buttonClassName = '',
  size = 'md'
}: PhoneCountrySelectorProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, openUpwards: false })
  const [searchQuery, setSearchQuery] = useState('')
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Size-based styles
  const sizeStyles = {
    xs: {
      button: 'px-2 py-1 gap-1.5 text-xs rounded-l-lg',
      flag: 'text-sm',
      code: 'text-xs',
      icon: 'w-2.5 h-2.5',
      dropdown: 'rounded-lg w-56',
      option: 'px-2.5 py-1.5 gap-2 text-xs',
      optionFlag: 'text-base',
      searchContainer: 'p-2',
      searchIcon: 'w-3 h-3 left-2',
      searchInput: 'pl-7 pr-2 py-1 text-xs rounded',
      emptyState: 'px-2.5 py-6 text-xs'
    },
    md: {
      button: 'px-3 py-3 gap-2 text-sm rounded-l-xl',
      flag: 'text-lg',
      code: 'text-sm',
      icon: 'w-3 h-3',
      dropdown: 'rounded-xl w-64',
      option: 'px-4 py-3 gap-3 text-sm',
      optionFlag: 'text-xl',
      searchContainer: 'p-3',
      searchIcon: 'w-4 h-4 left-3',
      searchInput: 'pl-9 pr-3 py-2 text-sm rounded-lg',
      emptyState: 'px-4 py-8 text-sm'
    },
    lg: {
      button: 'px-4 py-4 gap-3 text-base rounded-l-xl',
      flag: 'text-xl',
      code: 'text-base',
      icon: 'w-4 h-4',
      dropdown: 'rounded-xl w-72',
      option: 'px-5 py-4 gap-4 text-base',
      optionFlag: 'text-2xl',
      searchContainer: 'p-4',
      searchIcon: 'w-5 h-5 left-3',
      searchInput: 'pl-10 pr-4 py-2.5 text-base rounded-lg',
      emptyState: 'px-5 py-10 text-base'
    }
  }

  const currentSize = sizeStyles[size]

  // Click outside handler to close dropdown and calculate position
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('[data-country-selector]') && !target.closest('[data-country-selector-portal]')) {
        setShowDropdown(false)
      }
    }

    const handleScroll = (event: Event) => {
      // Only close if scroll is NOT inside the dropdown
      const scrollTarget = event.target as HTMLElement
      const isDropdownScroll = dropdownRef.current && dropdownRef.current.contains(scrollTarget)

      if (!isDropdownScroll) {
        // Close dropdown only if scrolling outside
        setShowDropdown(false)
      }
    }

    if (showDropdown && buttonRef.current) {
      // Calculate position and determine if dropdown should open upwards
      const rect = buttonRef.current.getBoundingClientRect()
      const gap = 8
      const dropdownHeight = 300 // Approximate max height of dropdown
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top

      // Open upwards if not enough space below but more space above
      const shouldOpenUpwards = spaceBelow < dropdownHeight && spaceAbove > spaceBelow

      setDropdownPosition({
        top: shouldOpenUpwards ? rect.top - gap : rect.bottom + gap,
        left: rect.left,
        openUpwards: shouldOpenUpwards
      })

      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('scroll', handleScroll, true)

      // Focus search input when dropdown opens
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 50)

      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('scroll', handleScroll, true)
      }
    } else {
      // Reset search when dropdown closes
      setSearchQuery('')
    }
  }, [showDropdown])

  const selectedCountry = countries.find(c => c.code === value) || countries[0]

  // Filter countries based on search query (search by name or code)
  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className={`relative ${className}`} data-country-selector>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        className={`flex items-center ${currentSize.button} bg-transparent hover:bg-gray-50 transition-colors ${buttonClassName}`}
        disabled={disabled}
      >
        <span className={currentSize.flag}>{selectedCountry.flag}</span>
        <span className={`${currentSize.code} font-medium text-gray-700`}>{selectedCountry.code}</span>
        <svg
          className={`${currentSize.icon} text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showDropdown && typeof window !== 'undefined' && createPortal(
        <div
          ref={dropdownRef}
          data-country-selector-portal
          className={`fixed bg-white border border-gray-200 ${currentSize.dropdown} shadow-2xl overflow-hidden z-[99999] ${
            dropdownPosition.openUpwards ? 'origin-bottom' : 'origin-top'
          }`}
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            transform: dropdownPosition.openUpwards ? 'translateY(-100%)' : ''
          }}
        >
          {/* Search Input */}
          <div className={`${currentSize.searchContainer} border-b border-gray-100 bg-gray-50/50`}>
            <div className="relative">
              <svg
                className={`absolute ${currentSize.searchIcon} top-1/2 transform -translate-y-1/2 text-gray-400`}
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
                placeholder="Buscar pais..."
                className={`w-full ${currentSize.searchInput} bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary`}
              />
            </div>
          </div>

          {/* Countries List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => {
                    onChange(country.code)
                    setShowDropdown(false)
                  }}
                  className={`w-full flex items-center ${currentSize.option} text-left hover:bg-slate-50 transition-all ${
                    value === country.code ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                  }`}
                >
                  <span className={currentSize.optionFlag}>{country.flag}</span>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{country.name}</div>
                    <div className="text-xs text-gray-500">{country.code}</div>
                  </div>
                </button>
              ))
            ) : (
              <div className={`${currentSize.emptyState} text-center text-gray-500`}>
                No se encontraron paises
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
