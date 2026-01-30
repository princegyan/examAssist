import React from 'react'

export function Button({ className = '', variant = 'primary', size = 'md', href, children, disabled, ...props }) {
  const base = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const sizes = {
    sm: 'px-3.5 py-2 text-sm rounded-lg',
    md: 'px-5 py-2.5 text-sm rounded-xl',
    lg: 'px-6 py-3 text-base rounded-xl',
  }

  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md focus:ring-blue-500/30 disabled:bg-gray-300 disabled:cursor-not-allowed',
    secondary: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-blue-200 shadow-sm focus:ring-blue-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed',
    ghost: 'bg-transparent text-gray-600 hover:bg-blue-50 hover:text-blue-600 disabled:text-gray-400 disabled:cursor-not-allowed',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500/30 disabled:bg-gray-300 disabled:cursor-not-allowed',
    success: 'bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-500/30 disabled:bg-gray-300 disabled:cursor-not-allowed',
    accent: 'bg-cyan-500 text-white hover:bg-cyan-600 focus:ring-cyan-500/30 disabled:bg-gray-300 disabled:cursor-not-allowed',
    outline: 'bg-transparent text-blue-600 border-2 border-blue-600 hover:bg-blue-50 focus:ring-blue-500/30',
    blockchain: 'text-white shadow-lg hover:shadow-xl focus:ring-blue-500/30 disabled:bg-gray-300 disabled:cursor-not-allowed',
    // Legacy variants for backward compatibility
    solid: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-sm',
    'primary-salient': 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md focus:ring-blue-500/30 disabled:bg-gray-300 disabled:cursor-not-allowed',
  }

  const classes = `${base} ${sizes[size] || sizes.md} ${variants[variant] || variants.primary} ${className}`.trim()

  if (typeof href !== 'undefined') {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    )
  }

  return (
    <button className={classes} disabled={disabled} {...props}>
      {children}
    </button>
  )
}

export default Button
