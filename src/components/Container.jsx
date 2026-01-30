import React from 'react'

export function Container({ className = '', children, ...props }) {
  const base = 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'
  return (
    <div className={`${base} ${className}`} {...props}>
      {children}
    </div>
  )
}

export default Container
