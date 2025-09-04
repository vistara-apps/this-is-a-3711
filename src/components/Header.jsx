import React from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, User, Crown } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useAuthStore } from '../store/useStore'

const Header = () => {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const { user, subscriptionTier } = useAuthStore()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const getTierColor = (tier) => {
    switch (tier) {
      case 'pro': return 'text-accent'
      case 'premium': return 'text-yellow-400'
      default: return 'text-text-secondary'
    }
  }

  const getTierLabel = (tier) => {
    switch (tier) {
      case 'pro': return 'Pro'
      case 'premium': return 'Premium'
      default: return 'Free'
    }
  }

  return (
    <header className="h-16 bg-surface border-b border-gray-800 flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold text-text-primary">AdSpark AI</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 bg-bg px-3 py-1 rounded-md">
          <Crown className={`w-4 h-4 ${getTierColor(subscriptionTier)}`} />
          <span className={`text-sm font-medium ${getTierColor(subscriptionTier)}`}>
            {getTierLabel(subscriptionTier)}
          </span>
        </div>
        
        <div className="flex items-center space-x-2 text-text-secondary">
          <User className="w-4 h-4" />
          <span className="text-sm">{user?.email}</span>
        </div>
        
        <button
          onClick={handleSignOut}
          className="flex items-center space-x-2 text-text-secondary hover:text-text-primary transition-colors duration-200 px-3 py-1 rounded-md hover:bg-bg"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Sign Out</span>
        </button>
      </div>
    </header>
  )
}

export default Header