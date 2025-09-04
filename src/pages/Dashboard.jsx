import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Upload, Zap, BarChart3, Sparkles } from 'lucide-react'
import { useCampaignStore, useAuthStore } from '../store/useStore'
import ImageUploader from '../components/ImageUploader'
import PlatformSelector from '../components/PlatformSelector'
import ProgressIndicator from '../components/ProgressIndicator'
import CreativeCard from '../components/CreativeCard'
import { generateAdCopy, generateImagePrompt } from '../lib/openai'
import { toast } from 'react-toastify'

const Dashboard = () => {
  const navigate = useNavigate()
  const { campaigns, addCampaign, setAdVariations, adVariations } = useCampaignStore()
  const { subscriptionTier } = useAuthStore()
  
  const [step, setStep] = useState(1)
  const [uploadedImage, setUploadedImage] = useState(null)
  const [productDescription, setProductDescription] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState(['instagram'])
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentGenerationStep, setCurrentGenerationStep] = useState(1)

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
    if (!uploadedImage || !productDescription.trim()) {
      toast.error('Please upload an image and provide a product description')
      return
    }

    if (selectedPlatforms.length === 0) {
      toast.error('Please select at least one platform')
      return
    }

    setIsGenerating(true)
    setStep(3)
    setCurrentGenerationStep(1)

    try {
      // Simulate step progression
      const stepInterval = setInterval(() => {
        setCurrentGenerationStep(prev => {
          if (prev < 4) return prev + 1
          clearInterval(stepInterval)
          return prev
        })
      }, 2000)

      // Generate variations for each platform
      const allVariations = []
      
      for (const platform of selectedPlatforms) {
        // Generate ad copy
        const adCopyVariations = await generateAdCopy(
          productDescription,
          platform,
          'Product image uploaded by user'
        )

        // Create variations with copy
        for (let i = 0; i < adCopyVariations.length; i++) {
          const variation = adCopyVariations[i]
          
          allVariations.push({
            id: `${platform}-${i + 1}-${Date.now()}`,
            campaignId: 'current',
            platform,
            copy: variation.copy,
            hashtags: variation.hashtags,
            tone: variation.tone,
            imageUrl: uploadedImage.preview, // Use uploaded image for now
            postStatus: null,
            generatedAt: new Date().toISOString()
          })
        }
      }

      // Create campaign
      const campaign = {
        id: `campaign-${Date.now()}`,
        userId: 'current-user',
        productImage: uploadedImage.preview,
        productDescription,
        platforms: selectedPlatforms,
        createdAt: new Date().toISOString(),
        variationsCount: allVariations.length
      }

      addCampaign(campaign)
      setAdVariations(allVariations)
      
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

  const getUsageInfo = () => {
    switch (subscriptionTier) {
      case 'pro':
        return { generations: '42/50', posts: '15/20' }
      case 'premium':
        return { generations: 'Unlimited', posts: '67/100' }
      default:
        return { generations: '3/5', posts: '1/2' }
    }
  }

  const usage = getUsageInfo()

  if (step === 1) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Create New Campaign</h1>
          <p className="text-text-secondary">Upload your product image to start generating ad variations</p>
        </div>

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
              <h3 className="text-lg font-medium text-text-primary mb-4">Usage This Month</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-text-secondary">Generations</span>
                    <span className="text-text-primary">{usage.generations}</span>
                  </div>
                  <div className="w-full bg-bg rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{width: '60%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-text-secondary">Posts</span>
                    <span className="text-text-primary">{usage.posts}</span>
                  </div>
                  <div className="w-full bg-bg rounded-full h-2">
                    <div className="bg-secondary h-2 rounded-full" style={{width: '75%'}}></div>
                  </div>
                </div>
              </div>
            </div>

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
  }

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