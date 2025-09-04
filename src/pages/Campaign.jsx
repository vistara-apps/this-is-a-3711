import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Share2, Download, BarChart3 } from 'lucide-react'
import { useCampaignStore } from '../store/useStore'
import CreativeCard from '../components/CreativeCard'

const Campaign = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { campaigns, adVariations, currentCampaign, setCurrentCampaign } = useCampaignStore()
  
  const [selectedVariation, setSelectedVariation] = useState(null)

  useEffect(() => {
    const campaign = campaigns.find(c => c.id === id)
    if (campaign) {
      setCurrentCampaign(campaign)
    }
  }, [id, campaigns, setCurrentCampaign])

  const handlePostVariation = async (variationId) => {
    // Simulate posting
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve()
      }, 2000)
    })
  }

  if (!currentCampaign) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-text-primary mb-2">Campaign not found</h3>
          <p className="text-text-secondary mb-4">The campaign you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/app')}
            className="btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const campaignVariations = adVariations.filter(v => v.campaignId === currentCampaign.id || v.campaignId === 'current')

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={() => navigate('/app')}
            className="p-2 hover:bg-surface rounded-md transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 text-text-secondary" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Campaign Details</h1>
            <p className="text-text-secondary">Created on {new Date(currentCampaign.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6">
            <h3 className="text-lg font-medium text-text-primary mb-2">Product Image</h3>
            <div className="aspect-video rounded-md overflow-hidden bg-bg">
              <img
                src={currentCampaign.productImage}
                alt="Product"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          <div className="card p-6">
            <h3 className="text-lg font-medium text-text-primary mb-4">Campaign Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-text-secondary">Variations</span>
                <span className="text-text-primary">{campaignVariations.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Platforms</span>
                <span className="text-text-primary">{currentCampaign.platforms?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Posted</span>
                <span className="text-text-primary">
                  {campaignVariations.filter(v => v.postStatus === 'posted').length}
                </span>
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <h3 className="text-lg font-medium text-text-primary mb-4">Actions</h3>
            <div className="space-y-3">
              <button className="btn-secondary w-full">
                <Share2 className="w-4 h-4 mr-2" />
                Share Campaign
              </button>
              <button className="btn-secondary w-full">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </button>
              <button className="btn-secondary w-full">
                <BarChart3 className="w-4 h-4 mr-2" />
                View Analytics
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-text-primary mb-4">Ad Variations</h2>
        
        {campaignVariations.length > 0 ? (
          <div className="grid lg:grid-cols-3 gap-6">
            {campaignVariations.map((variation) => (
              <CreativeCard
                key={variation.id}
                variation={variation}
                onPost={handlePostVariation}
                variant="preview"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BarChart3 className="w-12 h-12 text-text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">No variations found</h3>
            <p className="text-text-secondary">This campaign doesn't have any generated variations yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Campaign