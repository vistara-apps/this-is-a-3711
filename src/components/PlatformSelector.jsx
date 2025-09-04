import React from 'react'
import { Check } from 'lucide-react'

const platforms = [
  {
    id: 'instagram',
    name: 'Instagram',
    icon: '📷',
    description: 'Stories, Feed Posts, Reels',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: '🎵',
    description: 'Short-form videos',
    color: 'from-black to-gray-800'
  }
]

const PlatformSelector = ({ selectedPlatforms, onPlatformToggle }) => {
  return (
    <div className="card p-6">
      <h3 className="text-lg font-medium text-text-primary mb-4">Select Platforms</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {platforms.map((platform) => {
          const isSelected = selectedPlatforms.includes(platform.id)
          
          return (
            <button
              key={platform.id}
              onClick={() => onPlatformToggle(platform.id)}
              className={`relative p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${platform.color} flex items-center justify-center text-lg`}>
                    {platform.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-text-primary">{platform.name}</h4>
                    <p className="text-sm text-text-secondary">{platform.description}</p>
                  </div>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default PlatformSelector