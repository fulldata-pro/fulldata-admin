'use client'

import { forwardRef, InputHTMLAttributes, ReactNode } from 'react'

export type InputSize = 'xs' | 'sm' | 'md' | 'lg'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: boolean
  errorMessage?: string
  helperText?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  size?: InputSize
  fullWidth?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error = false,
  errorMessage,
  helperText,
  leftIcon,
  rightIcon,
  size = 'md',
  fullWidth = true,
  className = '',
  disabled,
  required,
  ...props
}, ref) => {
  const sizeStyles = {
    xs: {
      input: 'px-2.5 py-1.5 text-xs rounded-lg',
      inputWithLeftIcon: 'pl-7',
      inputWithRightIcon: 'pr-7',
      label: 'text-xs mb-1',
      icon: 'w-3.5 h-3.5',
      iconLeft: 'left-2',
      iconRight: 'right-2',
      helper: 'text-[10px] mt-0.5'
    },
    sm: {
      input: 'px-3 py-2 text-sm rounded-lg',
      inputWithLeftIcon: 'pl-8',
      inputWithRightIcon: 'pr-8',
      label: 'text-xs mb-1',
      icon: 'w-4 h-4',
      iconLeft: 'left-2.5',
      iconRight: 'right-2.5',
      helper: 'text-xs mt-1'
    },
    md: {
      input: 'px-4 py-2.5 text-sm rounded-xl',
      inputWithLeftIcon: 'pl-10',
      inputWithRightIcon: 'pr-10',
      label: 'text-sm mb-1.5',
      icon: 'w-4 h-4',
      iconLeft: 'left-3',
      iconRight: 'right-3',
      helper: 'text-xs mt-1'
    },
    lg: {
      input: 'px-4 py-3 text-base rounded-xl',
      inputWithLeftIcon: 'pl-11',
      inputWithRightIcon: 'pr-11',
      label: 'text-sm mb-1.5',
      icon: 'w-5 h-5',
      iconLeft: 'left-3.5',
      iconRight: 'right-3.5',
      helper: 'text-xs mt-1.5'
    }
  }

  const currentSize = sizeStyles[size]

  const inputClasses = `
    ${fullWidth ? 'w-full' : ''}
    ${currentSize.input}
    ${leftIcon ? currentSize.inputWithLeftIcon : ''}
    ${rightIcon ? currentSize.inputWithRightIcon : ''}
    bg-white border
    ${error ? 'border-red-300' : 'border-gray-200'}
    ${error ? 'focus:ring-red-500/20 focus:border-red-300' : 'focus:ring-primary/20 focus:border-primary'}
    ${!disabled && !error ? 'hover:bg-gray-50 hover:border-gray-300' : ''}
    focus:outline-none focus:ring-2
    transition-all duration-200
    placeholder:text-gray-400
    text-gray-900
    ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ')

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className={`block font-medium text-gray-700 ${currentSize.label}`}>
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className={`absolute ${currentSize.iconLeft} top-1/2 -translate-y-1/2 ${currentSize.icon} ${error ? 'text-red-400' : 'text-gray-400'} pointer-events-none flex items-center justify-center transition-colors duration-200`}>
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          disabled={disabled}
          required={required}
          className={inputClasses}
          {...props}
        />

        {rightIcon && (
          <div className={`absolute ${currentSize.iconRight} top-1/2 -translate-y-1/2 ${currentSize.icon} ${error ? 'text-red-400' : 'text-gray-400'} pointer-events-none flex items-center justify-center transition-colors duration-200`}>
            {rightIcon}
          </div>
        )}
      </div>

      {(errorMessage || helperText) && (
        <p className={`${currentSize.helper} ${error ? 'text-red-500' : 'text-gray-400'}`}>
          {error ? errorMessage : helperText}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
