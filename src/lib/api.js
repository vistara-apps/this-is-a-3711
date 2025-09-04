import { supabase } from './supabase'

// User API functions
export const userAPI = {
  // Get current user profile
  async getProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) throw error
    return data
  },

  // Update user profile
  async updateProfile(updates) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get user usage stats
  async getUsageStats() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)

    const { data, error } = await supabase
      .from('usage_tracking')
      .select('action_type, count(*)')
      .eq('user_id', user.id)
      .gte('created_at', currentMonth.toISOString())

    if (error) throw error

    const stats = {
      generations: 0,
      posts: 0
    }

    data.forEach(item => {
      if (item.action_type === 'generation') stats.generations = item.count
      if (item.action_type === 'post') stats.posts = item.count
    })

    return stats
  },

  // Check if user can perform action
  async checkUsageLimit(actionType) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase.rpc('check_usage_limit', {
      user_id: user.id,
      action_type: actionType
    })

    if (error) throw error
    return data
  },

  // Track usage
  async trackUsage(actionType, resourceType = null, metadata = {}) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase.rpc('track_usage', {
      user_id: user.id,
      action_type: actionType,
      resource_type: resourceType,
      metadata
    })

    if (error) throw error
  }
}

// Campaign API functions
export const campaignAPI = {
  // Get all campaigns for current user
  async getCampaigns() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('ad_campaigns')
      .select(`
        *,
        ad_variations (
          id,
          platform,
          post_status,
          engagement_metrics
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Get single campaign with variations
  async getCampaign(campaignId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('ad_campaigns')
      .select(`
        *,
        ad_variations (*)
      `)
      .eq('id', campaignId)
      .eq('user_id', user.id)
      .single()

    if (error) throw error
    return data
  },

  // Create new campaign
  async createCampaign(campaignData) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('ad_campaigns')
      .insert({
        ...campaignData,
        user_id: user.id
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update campaign
  async updateCampaign(campaignId, updates) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('ad_campaigns')
      .update(updates)
      .eq('id', campaignId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete campaign
  async deleteCampaign(campaignId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('ad_campaigns')
      .delete()
      .eq('id', campaignId)
      .eq('user_id', user.id)

    if (error) throw error
  }
}

// Ad Variations API functions
export const variationAPI = {
  // Get variations for a campaign
  async getVariations(campaignId) {
    const { data, error } = await supabase
      .from('ad_variations')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Create new variation
  async createVariation(variationData) {
    const { data, error } = await supabase
      .from('ad_variations')
      .insert(variationData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Create multiple variations
  async createVariations(variationsData) {
    const { data, error } = await supabase
      .from('ad_variations')
      .insert(variationsData)
      .select()

    if (error) throw error
    return data
  },

  // Update variation
  async updateVariation(variationId, updates) {
    const { data, error } = await supabase
      .from('ad_variations')
      .update(updates)
      .eq('id', variationId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update engagement metrics
  async updateEngagementMetrics(variationId, metrics) {
    const { data, error } = await supabase
      .from('ad_variations')
      .update({
        engagement_metrics: metrics,
        updated_at: new Date().toISOString()
      })
      .eq('id', variationId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete variation
  async deleteVariation(variationId) {
    const { error } = await supabase
      .from('ad_variations')
      .delete()
      .eq('id', variationId)

    if (error) throw error
  }
}

// Social Media Accounts API functions
export const socialAPI = {
  // Get connected social accounts
  async getAccounts() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)

    if (error) throw error
    return data
  },

  // Add social account
  async addAccount(accountData) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('social_accounts')
      .insert({
        ...accountData,
        user_id: user.id
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update social account
  async updateAccount(accountId, updates) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('social_accounts')
      .update(updates)
      .eq('id', accountId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Remove social account
  async removeAccount(accountId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('social_accounts')
      .update({ is_active: false })
      .eq('id', accountId)
      .eq('user_id', user.id)

    if (error) throw error
  }
}

// Subscription Plans API functions
export const subscriptionAPI = {
  // Get all subscription plans
  async getPlans() {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price_monthly', { ascending: true })

    if (error) throw error
    return data
  },

  // Get specific plan
  async getPlan(planName) {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('name', planName)
      .eq('is_active', true)
      .single()

    if (error) throw error
    return data
  }
}

// File upload helper
export const uploadAPI = {
  // Upload image to Supabase storage
  async uploadImage(file, bucket = 'product-images') {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${fileName}`

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file)

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    return {
      path: data.path,
      url: publicUrl
    }
  },

  // Delete image from storage
  async deleteImage(path, bucket = 'product-images') {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) throw error
  }
}

// Analytics helper functions
export const analyticsAPI = {
  // Get campaign performance overview
  async getCampaignAnalytics(campaignId) {
    const { data, error } = await supabase
      .from('ad_variations')
      .select('platform, post_status, engagement_metrics')
      .eq('campaign_id', campaignId)

    if (error) throw error

    const analytics = {
      totalVariations: data.length,
      posted: data.filter(v => v.post_status === 'posted').length,
      platforms: [...new Set(data.map(v => v.platform))],
      totalEngagement: 0,
      averageEngagement: 0,
      platformBreakdown: {}
    }

    // Calculate engagement metrics
    let totalEngagement = 0
    let engagementCount = 0

    data.forEach(variation => {
      const platform = variation.platform
      if (!analytics.platformBreakdown[platform]) {
        analytics.platformBreakdown[platform] = {
          variations: 0,
          posted: 0,
          engagement: 0
        }
      }

      analytics.platformBreakdown[platform].variations++
      if (variation.post_status === 'posted') {
        analytics.platformBreakdown[platform].posted++
      }

      if (variation.engagement_metrics) {
        const metrics = variation.engagement_metrics
        const engagement = (metrics.likes || 0) + (metrics.comments || 0) + (metrics.shares || 0)
        totalEngagement += engagement
        engagementCount++
        analytics.platformBreakdown[platform].engagement += engagement
      }
    })

    analytics.totalEngagement = totalEngagement
    analytics.averageEngagement = engagementCount > 0 ? totalEngagement / engagementCount : 0

    return analytics
  },

  // Get user's overall analytics
  async getUserAnalytics() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Get campaigns with variations
    const { data: campaigns, error } = await supabase
      .from('ad_campaigns')
      .select(`
        id,
        created_at,
        ad_variations (
          platform,
          post_status,
          engagement_metrics
        )
      `)
      .eq('user_id', user.id)

    if (error) throw error

    const analytics = {
      totalCampaigns: campaigns.length,
      totalVariations: 0,
      totalPosts: 0,
      totalEngagement: 0,
      platformStats: {},
      recentActivity: []
    }

    campaigns.forEach(campaign => {
      analytics.totalVariations += campaign.ad_variations.length
      
      campaign.ad_variations.forEach(variation => {
        const platform = variation.platform
        if (!analytics.platformStats[platform]) {
          analytics.platformStats[platform] = {
            variations: 0,
            posts: 0,
            engagement: 0
          }
        }

        analytics.platformStats[platform].variations++
        
        if (variation.post_status === 'posted') {
          analytics.totalPosts++
          analytics.platformStats[platform].posts++
        }

        if (variation.engagement_metrics) {
          const engagement = (variation.engagement_metrics.likes || 0) + 
                           (variation.engagement_metrics.comments || 0) + 
                           (variation.engagement_metrics.shares || 0)
          analytics.totalEngagement += engagement
          analytics.platformStats[platform].engagement += engagement
        }
      })
    })

    return analytics
  }
}
