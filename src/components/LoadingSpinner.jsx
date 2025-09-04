import React from 'react'

const LoadingSpinner = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-600 border-t-primary ${sizeClasses[size]}`} />
  )
}

export default LoadingSpinner