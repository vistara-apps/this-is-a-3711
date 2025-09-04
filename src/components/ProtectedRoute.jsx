import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/useStore'
import LoadingSpinner from './LoadingSpinner'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthStore()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute