import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Upload, Zap, BarChart3, Sparkles, Settings } from 'lucide-react'
import { useCampaignStore, useAuthStore } from '../store/useStore'
import ImageUploader from '../components/ImageUploader'
import PlatformSelector from '../components/PlatformSelector'
import ProgressIndicator from '../components/ProgressIndicator'
import CreativeCard from '../components/CreativeCard'
import AnalyticsDashboard from '../components/AnalyticsDashboard'
import AuthModal from '../components/AuthModal'
import { generateAdVariations } from '../lib/openai'
import { campaignAPI, variationAPI, userAPI, uploadAPI } from '../lib/api'
import { subscriptionUtils } from '../lib/stripe'
import { toast } from 'react-toastify'

const Dashboard = () => {
  const navigate = useNavigate()
  const { campaigns, addCampaign, setAdVariations, adVariations } = useCampaignStore()
  const { user, subscriptionTier } = useAuthStore()
  
  const [activeTab, setActiveTab] = useState('create') // 'create', 'campaigns', 'analytics'
  const [step, setStep] = useState(1)
  const [uploadedImage, setUploadedImage] = useState(null)
  const [productDescription, setProductDescription] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState(['instagram'])
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentGenerationStep, setCurrentGenerationStep] = useState(1)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [usageStats, setUsageStats] = useState({ generations: 0, posts: 0 })
  const [userCampaigns, setUserCampaigns] = useState([])
  const [loading, setLoading] = useState(false)

  const generationSteps = [
    {
      id: 1,
      title: 'Analyzing Product',
      description: 'AI is analyzing your product image and description'
    },
    {
      id: 2,
      title: 'Generating Copy',
      description: 'Creating compelling ad copy variations'
    },
    {
      id: 3,
      title: 'Creating Visuals',
      description: 'Generating platform-optimized visuals'
    },
    {
      id: 4,
      title: 'Optimizing for Platforms',
      description: 'Tailoring content for each selected platform'
    }
  ]

  // Load user data and campaigns on mount
  useEffect(() => {
    if (user) {
      loadUserData()
    }
  }, [user])

  const loadUserData = async () => {
    setLoading(true)
    try {
      // Load usage stats
      const stats = await userAPI.getUsageStats()
      setUsageStats(stats)

      // Load campaigns
      const campaignsData = await campaignAPI.getCampaigns()
      setUserCampaigns(campaignsData)
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (imageData) => {
    setUploadedImage(imageData)
    setStep(2)
  }

  const handleRemoveImage = () => {
    setUploadedImage(null)
    setStep(1)
  }

  const handlePlatformToggle = (platformId) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    )
  }

  const handleGenerate = async () => {
    // Check if user is authenticated
    if (!user) {
      setShowAuthModal(true)
      return
    }

    if (!uploadedImage || !productDescription.trim()) {
      toast.error('Please upload an image and provide a product description')
      return
    }

    if (selectedPlatforms.length === 0) {
      toast.error('Please select at least one platform')
      return
    }

    // Check usage limits
    const canGenerate = subscriptionUtils.canPerformAction(
      subscriptionTier, 
      'generation', 
      usageStats.generations
    )

    if (!canGenerate) {
      toast.error('You have reached your generation limit. Please upgrade your plan.')
      return
    }

    setIsGenerating(true)
    setStep(3)
    setCurrentGenerationStep(1)

    try {
      // Upload image to storage first
      let imageUrl = uploadedImage.preview
      if (uploadedImage.file) {
        const uploadResult = await uploadAPI.uploadImage(uploadedImage.file)
        imageUrl = uploadResult.url
      }

      // Simulate step progression
      const stepInterval = setInterval(() => {
        setCurrentGenerationStep(prev => {
          if (prev < 4) return prev + 1
          clearInterval(stepInterval)
          return prev
        })
      }, 2000)

      // Create campaign first
      const campaignData = {
        product_image: imageUrl,
        product_description: productDescription,
        platforms: selectedPlatforms
      }

      const campaign = await campaignAPI.createCampaign(campaignData)

      // Generate variations for each platform
      const allVariations = []
      
      for (const platform of selectedPlatforms) {
        try {
          const platformVariations = await generateAdVariations(
            productDescription,
            platform,
            imageUrl
          )

          // Add campaign ID to each variation
          const variationsWithCampaign = platformVariations.map(variation => ({
            ...variation,
            campaign_id: campaign.id
          }))

          allVariations.push(...variationsWithCampaign)
        } catch (error) {
          console.warn(`Failed to generate variations for ${platform}:`, error)
        }
      }

      // Save variations to database
      if (allVariations.length > 0) {
        await variationAPI.createVariations(allVariations)
      }

      // Track usage
      await userAPI.trackUsage('generation', 'ad_variations', {
        campaign_id: campaign.id,
        platforms: selectedPlatforms,
        variations_count: allVariations.length
      })

      // Update local state
      addCampaign(campaign)
      setAdVariations(allVariations)
      
      // Update usage stats
      setUsageStats(prev => ({
        ...prev,
        generations: prev.generations + 1
      }))
      
      setTimeout(() => {
        setStep(4)
        toast.success(`Generated ${allVariations.length} ad variations!`)
      }, 1000)

    } catch (error) {
      console.error('Generation error:', error)
      toast.error('Failed to generate ad variations. Please try again.')
      setStep(2)
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePostVariation = async (variationId) => {
    // Simulate posting
    return new Promise((resolve) => {
      setTimeout(() => {
        toast.success('Posted to social media!')
        resolve()
      }, 2000)
    })
  }

  const resetWorkflow = () => {
    setStep(1)
    setUploadedImage(null)
    setProductDescription('')
    setSelectedPlatforms(['instagram'])
    setAdVariations([])
    setCurrentGenerationStep(1)
  }

  // Tab navigation
  const TabButton = ({ id, label, icon: Icon, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
        isActive
          ? 'bg-primary text-white'
          : 'text-text-secondary hover:text-text-primary hover:bg-surface'
      }`}
    >
      <Icon size={18} className="mr-2" />
      {label}
    </button>
  )

  // Usage stats display
  const UsageDisplay = () => {
    const features = subscriptionUtils.getSubscriptionFeatures(subscriptionTier)
    const remainingGenerations = subscriptionUtils.getRemainingUsage(
      subscriptionTier, 
      'generation', 
      usageStats.generations
    )
    const remainingPosts = subscriptionUtils.getRemainingUsage(
      subscriptionTier, 
      'post', 
      usageStats.posts
    )

    return (
      <div className="bg-surface rounded-lg p-4 border border-gray-700">
        <h3 className="font-medium text-text-primary mb-3">Usage This Month</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Generations</span>
            <span className="text-text-primary">
              {usageStats.generations} / {features.generations === 'unlimited' ? '∞' : features.generations}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Posts</span>
            <span className="text-text-primary">
              {usageStats.posts} / {features.posts === 'unlimited' ? '∞' : features.posts}
            </span>
          </div>
          <div className="text-xs text-text-secondary mt-2">
            Plan: <span className="capitalize font-medium">{subscriptionTier}</span>
          </div>
        </div>
      </div>
    )
  }

  // Render different tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'create':
        return renderCreateCampaign()
      case 'campaigns':
        return renderCampaigns()
      case 'analytics':
        return <AnalyticsDashboard />
      default:
        return renderCreateCampaign()
    }
  }

  const renderCreateCampaign = () => {
    if (step === 1) {
      return renderImageUpload()
    } else if (step === 2) {
      return renderCampaignDetails()
    } else if (step === 3) {
      return renderGenerating()
    } else {
      return renderResults()
    }
  }

  const renderCampaigns = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-text-primary">My Campaigns</h2>
        <button
          onClick={() => setActiveTab('create')}
          className="btn-primary flex items-center"
        >
          <Plus size={18} className="mr-2" />
          New Campaign
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      ) : userCampaigns.length === 0 ? (
        <div className="text-center py-12">
          <Sparkles size={48} className="mx-auto text-text-secondary mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">No campaigns yet</h3>
          <p className="text-text-secondary mb-4">Create your first AI-powered ad campaign</p>
          <button
            onClick={() => setActiveTab('create')}
            className="btn-primary"
          >
            Create Campaign
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {userCampaigns.map((campaign) => (
            <div key={campaign.id} className="bg-surface rounded-lg p-6 shadow-card">
              <img
                src={campaign.product_image}
                alt="Campaign"
                className="w-full h-32 object-cover rounded-lg mb-4"
              />
              <h3 className="font-medium text-text-primary mb-2">
                {campaign.product_description.substring(0, 50)}...
              </h3>
              <div className="flex items-center justify-between text-sm text-text-secondary mb-4">
                <span>{campaign.platforms.join(', ')}</span>
                <span>{campaign.ad_variations?.length || 0} variations</span>
              </div>
              <button
                onClick={() => navigate(`/app/campaign/${campaign.id}`)}
                className="w-full btn-secondary"
              >
                View Campaign
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderImageUpload = () => (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ImageUploader
            onImageUpload={handleImageUpload}
            uploadedImage={uploadedImage}
            onRemoveImage={handleRemoveImage}
          />
        </div>
        
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-medium text-text-primary mb-4">Quick Tips</h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>• Use high-quality product images</li>
              <li>• Include product context in description</li>
              <li>• Select platforms your audience uses</li>
              <li>• Test multiple variations for best results</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )

  if (step === 2) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Campaign Details</h1>
          <p className="text-text-secondary">Provide details about your product and select target platforms</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <ImageUploader
              onImageUpload={handleImageUpload}
              uploadedImage={uploadedImage}
              onRemoveImage={handleRemoveImage}
            />

            <div className="card p-6">
              <h3 className="text-lg font-medium text-text-primary mb-4">Product Description</h3>
              <textarea
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                placeholder="Describe your product, its benefits, target audience, and key selling points..."
                className="input w-full h-32 resize-none"
                maxLength={500}
              />
              <div className="flex justify-between mt-2 text-sm text-text-secondary">
                <span>Provide detailed context for better AI generation</span>
                <span>{productDescription.length}/500</span>
              </div>
            </div>

            <PlatformSelector
              selectedPlatforms={selectedPlatforms}
              onPlatformToggle={handlePlatformToggle}
            />
          </div>

          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="text-lg font-medium text-text-primary mb-4">Generation Preview</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Platforms</span>
                  <span className="text-text-primary">{selectedPlatforms.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Variations</span>
                  <span className="text-text-primary">{selectedPlatforms.length * 3}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Est. Time</span>
                  <span className="text-text-primary">~30 seconds</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleGenerate}
                disabled={!productDescription.trim() || selectedPlatforms.length === 0}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Ad Variations
              </button>
              
              <button
                onClick={resetWorkflow}
                className="btn-secondary w-full"
              >
                Start Over
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (step === 3) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Generating Your Ads</h1>
          <p className="text-text-secondary">AI is creating optimized ad variations for your campaign</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <ProgressIndicator
            steps={generationSteps}
            currentStep={currentGenerationStep}
            variant="loading"
          />
          
          <div className="mt-8 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg">
              <Zap className="w-4 h-4 text-primary mr-2" />
              <span className="text-primary text-sm font-medium">AI Working...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (step === 4) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">Generated Ad Variations</h1>
              <p className="text-text-secondary">Review and post your AI-generated ad variations</p>
            </div>
            <button
              onClick={resetWorkflow}
              className="btn-secondary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Campaign
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {adVariations.map((variation) => (
            <CreativeCard
              key={variation.id}
              variation={variation}
              onPost={handlePostVariation}
              variant="generated"
            />
          ))}
        </div>

        {adVariations.length === 0 && (
          <div className="text-center py-12">
            <Sparkles className="w-12 h-12 text-text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">No variations generated yet</h3>
            <p className="text-text-secondary">Start by uploading a product image and creating your first campaign.</p>
          </div>
        )}
      </div>
    )
  }

  return null
}

export default Dashboard
