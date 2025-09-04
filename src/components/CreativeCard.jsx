import React, { useState } from 'react'
import { Copy, Download, Share2, MoreVertical, Eye } from 'lucide-react'
import { toast } from 'react-toastify'

const CreativeCard = ({ variation, onPost, variant = 'generated' }) => {
  const [isPosting, setIsPosting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const handleCopyText = () => {
    navigator.clipboard.writeText(variation.copy)
    toast.success('Ad copy copied to clipboard!')
  }

  const handlePost = async () => {
    setIsPosting(true)
    try {
      await onPost(variation.id)
      toast.success('Posted successfully!')
    } catch (error) {
      toast.error('Failed to post')
    } finally {
      setIsPosting(false)
    }
  }

  const formatPlatform = (platform) => {
    return platform.charAt(0).toUpperCase() + platform.slice(1)
  }

  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{variation.platform === 'instagram' ? '📷' : '🎵'}</span>
          <span className="font-medium text-text-primary">{formatPlatform(variation.platform)}</span>
          <span className="px-2 py-1 bg-bg rounded text-xs text-text-secondary">
            {variation.tone}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {variation.postStatus && (
            <span className={`px-2 py-1 rounded text-xs ${
              variation.postStatus === 'posted' 
                ? 'bg-green-500/20 text-green-400'
                : variation.postStatus === 'failed'
                ? 'bg-red-500/20 text-red-400'
                : 'bg-yellow-500/20 text-yellow-400'
            }`}>
              {variation.postStatus}
            </span>
          )}
          <button className="p-1 hover:bg-bg rounded">
            <MoreVertical className="w-4 h-4 text-text-secondary" />
          </button>
        </div>
      </div>

      {variation.imageUrl && (
        <div className="aspect-square rounded-lg overflow-hidden bg-bg">
          <img
            src={variation.imageUrl}
            alt="Generated ad visual"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-text-secondary">Ad Copy</label>
          <div className="mt-1 p-3 bg-bg rounded-md">
            <p className="text-text-primary whitespace-pre-wrap">{variation.copy}</p>
          </div>
        </div>

        {variation.hashtags && (
          <div>
            <label className="text-sm font-medium text-text-secondary">Hashtags</label>
            <div className="mt-1 p-3 bg-bg rounded-md">
              <p className="text-secondary">{variation.hashtags}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-800">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopyText}
            className="flex items-center space-x-2 px-3 py-1 bg-bg hover:bg-gray-700 rounded text-sm text-text-secondary hover:text-text-primary transition-colors duration-200"
          >
            <Copy className="w-4 h-4" />
            <span>Copy</span>
          </button>
          
          <button className="flex items-center space-x-2 px-3 py-1 bg-bg hover:bg-gray-700 rounded text-sm text-text-secondary hover:text-text-primary transition-colors duration-200">
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
          
          <button 
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center space-x-2 px-3 py-1 bg-bg hover:bg-gray-700 rounded text-sm text-text-secondary hover:text-text-primary transition-colors duration-200"
          >
            <Eye className="w-4 h-4" />
            <span>Preview</span>
          </button>
        </div>

        <button
          onClick={handlePost}
          disabled={isPosting || variation.postStatus === 'posted'}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPosting ? 'Posting...' : variation.postStatus === 'posted' ? 'Posted' : 'Post Now'}
        </button>
      </div>
    </div>
  )
}

export default CreativeCard