import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  Sparkles, 
  LayoutDashboard, 
  Image, 
  Target, 
  BarChart3, 
  Settings, 
  Crown 
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/app', icon: LayoutDashboard },
  { name: 'Campaigns', href: '/app/campaigns', icon: Target },
  { name: 'Analytics', href: '/app/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/app/settings', icon: Settings },
]

const Sidebar = () => {
  return (
    <div className="w-64 bg-surface border-r border-gray-800 flex flex-col">
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-8 h-8 text-primary" />
          <span className="text-xl font-bold text-text-primary">AdSpark AI</span>
        </div>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === '/app'}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4">
        <NavLink
          to="/pricing"
          className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20 transition-colors duration-200"
        >
          <Crown className="w-5 h-5" />
          <span>Upgrade Plan</span>
        </NavLink>
      </div>
    </div>
  )
}

export default Sidebar