'use client'

import { forwardRef, TextareaHTMLAttributes } from 'react'

export type TextareaSize = 'xs' | 'sm' | 'md' | 'lg'

interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  label?: string
  error?: boolean
  errorMessage?: string
  helperText?: string
  size?: TextareaSize
  fullWidth?: boolean
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error = false,
  errorMessage,
  helperText,
  size = 'md',
  fullWidth = true,
  resize = 'vertical',
  className = '',
  disabled,
  required,
  rows = 3,
  ...props
}, ref) => {
  const sizeStyles = {
    xs: {
      textarea: 'px-2.5 py-1.5 text-xs rounded-lg',
      label: 'text-xs mb-1',
      helper: 'text-[10px] mt-0.5'
    },
    sm: {
      textarea: 'px-3 py-2 text-sm rounded-lg',
      label: 'text-xs mb-1',
      helper: 'text-xs mt-1'
    },
    md: {
      textarea: 'px-4 py-2.5 text-sm rounded-xl',
      label: 'text-sm mb-1.5',
      helper: 'text-xs mt-1'
    },
    lg: {
      textarea: 'px-4 py-3 text-base rounded-xl',
      label: 'text-sm mb-1.5',
      helper: 'text-xs mt-1.5'
    }
  }

  const resizeStyles = {
    none: 'resize-none',
    vertical: 'resize-y',
    horizontal: 'resize-x',
    both: 'resize'
  }

  const currentSize = sizeStyles[size]

  const textareaClasses = `
    ${fullWidth ? 'w-full' : ''}
    ${currentSize.textarea}
    ${resizeStyles[resize]}
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

      <textarea
        ref={ref}
        disabled={disabled}
        required={required}
        rows={rows}
        className={textareaClasses}
        {...props}
      />

      {(errorMessage || helperText) && (
        <p className={`${currentSize.helper} ${error ? 'text-red-500' : 'text-gray-400'}`}>
          {error ? errorMessage : helperText}
        </p>
      )}
    </div>
  )
})

Textarea.displayName = 'Textarea'

export default Textarea
