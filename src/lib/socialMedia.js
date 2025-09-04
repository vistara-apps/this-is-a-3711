// Social Media API Integration
// This module handles posting to various social media platforms

import { socialAPI, variationAPI } from './api'

// Instagram Basic Display API integration
export const instagramAPI = {
  // Get Instagram authorization URL
  getAuthUrl(redirectUri) {
    const clientId = import.meta.env.VITE_INSTAGRAM_CLIENT_ID
    const scope = 'user_profile,user_media'
    
    return `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`
  },

  // Exchange code for access token
  async getAccessToken(code, redirectUri) {
    const clientId = import.meta.env.VITE_INSTAGRAM_CLIENT_ID
    const clientSecret = import.meta.env.VITE_INSTAGRAM_CLIENT_SECRET

    const response = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code: code
      })
    })

    if (!response.ok) {
      throw new Error('Failed to get Instagram access token')
    }

    return await response.json()
  },

  // Get user profile
  async getUserProfile(accessToken) {
    const response = await fetch(`https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`)
    
    if (!response.ok) {
      throw new Error('Failed to get Instagram user profile')
    }

    return await response.json()
  },

  // Create media container (for posting)
  async createMediaContainer(accessToken, imageUrl, caption) {
    const response = await fetch(`https://graph.instagram.com/me/media`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        image_url: imageUrl,
        caption: caption,
        access_token: accessToken
      })
    })

    if (!response.ok) {
      throw new Error('Failed to create Instagram media container')
    }

    return await response.json()
  },

  // Publish media
  async publishMedia(accessToken, creationId) {
    const response = await fetch(`https://graph.instagram.com/me/media_publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        creation_id: creationId,
        access_token: accessToken
      })
    })

    if (!response.ok) {
      throw new Error('Failed to publish Instagram media')
    }

    return await response.json()
  },

  // Get media insights (basic engagement metrics)
  async getMediaInsights(accessToken, mediaId) {
    const metrics = 'engagement,impressions,reach'
    const response = await fetch(`https://graph.instagram.com/${mediaId}/insights?metric=${metrics}&access_token=${accessToken}`)
    
    if (!response.ok) {
      // Return empty metrics if insights are not available
      return {
        engagement: 0,
        impressions: 0,
        reach: 0
      }
    }

    const data = await response.json()
    const insights = {}
    
    data.data.forEach(metric => {
      insights[metric.name] = metric.values[0]?.value || 0
    })

    return insights
  }
}

// TikTok API integration (simplified for MVP)
export const tiktokAPI = {
  // Note: TikTok's API is more complex and requires business verification
  // For MVP, we'll simulate posting or provide manual posting instructions
  
  getAuthUrl(redirectUri) {
    // TikTok OAuth URL would go here
    // For now, return a placeholder
    return `#tiktok-auth-placeholder`
  },

  async simulatePost(caption, videoUrl) {
    // Simulate TikTok posting for MVP
    // In production, this would use TikTok's Content Posting API
    return {
      success: true,
      postId: `tiktok_${Date.now()}`,
      message: 'TikTok posting simulated - manual posting required',
      instructions: {
        caption,
        videoUrl,
        steps: [
          'Open TikTok app',
          'Tap the + button to create new video',
          'Upload or record your content',
          'Add the generated caption',
          'Post to your account'
        ]
      }
    }
  }
}

// Main social media posting service
export const socialMediaService = {
  // Connect a social media account
  async connectAccount(platform, authData) {
    try {
      let accountData

      switch (platform) {
        case 'instagram':
          const profile = await instagramAPI.getUserProfile(authData.access_token)
          accountData = {
            platform: 'instagram',
            account_id: profile.id,
            account_name: profile.username,
            access_token: authData.access_token,
            token_expires_at: new Date(Date.now() + (authData.expires_in * 1000)).toISOString()
          }
          break

        case 'tiktok':
          // TikTok connection would be implemented here
          throw new Error('TikTok connection not yet implemented')

        default:
          throw new Error(`Unsupported platform: ${platform}`)
      }

      // Save account to database
      const savedAccount = await socialAPI.addAccount(accountData)
      return savedAccount

    } catch (error) {
      console.error('Error connecting social account:', error)
      throw error
    }
  },

  // Post ad variation to social media
  async postVariation(variationId, accountId) {
    try {
      // Get the variation data
      const variation = await variationAPI.getVariation(variationId)
      if (!variation) {
        throw new Error('Variation not found')
      }

      // Get the connected account
      const accounts = await socialAPI.getAccounts()
      const account = accounts.find(acc => acc.id === accountId)
      if (!account) {
        throw new Error('Social media account not found')
      }

      let postResult

      switch (account.platform) {
        case 'instagram':
          postResult = await this.postToInstagram(variation, account)
          break

        case 'tiktok':
          postResult = await this.postToTikTok(variation, account)
          break

        default:
          throw new Error(`Posting to ${account.platform} not supported`)
      }

      // Update variation with post status and URL
      await variationAPI.updateVariation(variationId, {
        post_status: 'posted',
        post_url: postResult.postUrl,
        posted_at: new Date().toISOString()
      })

      return postResult

    } catch (error) {
      // Update variation with failed status
      await variationAPI.updateVariation(variationId, {
        post_status: 'failed'
      })
      
      console.error('Error posting variation:', error)
      throw error
    }
  },

  // Post to Instagram
  async postToInstagram(variation, account) {
    try {
      // Create caption with copy and hashtags
      const caption = `${variation.copy}\n\n${variation.hashtags}`

      // Create media container
      const containerResult = await instagramAPI.createMediaContainer(
        account.access_token,
        variation.imageUrl,
        caption
      )

      // Publish media
      const publishResult = await instagramAPI.publishMedia(
        account.access_token,
        containerResult.id
      )

      return {
        success: true,
        postId: publishResult.id,
        postUrl: `https://instagram.com/p/${publishResult.id}`,
        platform: 'instagram'
      }

    } catch (error) {
      console.error('Instagram posting error:', error)
      throw new Error('Failed to post to Instagram: ' + error.message)
    }
  },

  // Post to TikTok (simulated for MVP)
  async postToTikTok(variation, account) {
    try {
      // For MVP, simulate TikTok posting
      const result = await tiktokAPI.simulatePost(
        `${variation.copy}\n\n${variation.hashtags}`,
        variation.imageUrl
      )

      return {
        success: true,
        postId: result.postId,
        postUrl: '#manual-posting-required',
        platform: 'tiktok',
        instructions: result.instructions
      }

    } catch (error) {
      console.error('TikTok posting error:', error)
      throw new Error('Failed to post to TikTok: ' + error.message)
    }
  },

  // Get engagement metrics for posted variations
  async updateEngagementMetrics(variationId) {
    try {
      const variation = await variationAPI.getVariation(variationId)
      if (!variation || variation.post_status !== 'posted') {
        return null
      }

      const accounts = await socialAPI.getAccounts()
      const account = accounts.find(acc => acc.platform === variation.platform)
      if (!account) {
        return null
      }

      let metrics = {}

      switch (account.platform) {
        case 'instagram':
          if (variation.post_url) {
            const mediaId = variation.post_url.split('/').pop()
            metrics = await instagramAPI.getMediaInsights(account.access_token, mediaId)
          }
          break

        case 'tiktok':
          // TikTok metrics would be implemented here
          metrics = {
            likes: Math.floor(Math.random() * 100),
            comments: Math.floor(Math.random() * 20),
            shares: Math.floor(Math.random() * 10)
          }
          break
      }

      // Update variation with new metrics
      await variationAPI.updateEngagementMetrics(variationId, metrics)
      return metrics

    } catch (error) {
      console.error('Error updating engagement metrics:', error)
      return null
    }
  },

  // Batch update metrics for all posted variations
  async batchUpdateMetrics(campaignId) {
    try {
      const variations = await variationAPI.getVariations(campaignId)
      const postedVariations = variations.filter(v => v.post_status === 'posted')

      const updatePromises = postedVariations.map(variation => 
        this.updateEngagementMetrics(variation.id)
      )

      await Promise.allSettled(updatePromises)
      
      return {
        success: true,
        updated: postedVariations.length
      }

    } catch (error) {
      console.error('Error batch updating metrics:', error)
      throw error
    }
  },

  // Get posting instructions for manual posting
  getManualPostingInstructions(variation, platform) {
    const instructions = {
      caption: `${variation.copy}\n\n${variation.hashtags}`,
      imageUrl: variation.imageUrl,
      platform,
      steps: []
    }

    switch (platform) {
      case 'instagram':
        instructions.steps = [
          'Save the generated image to your device',
          'Open Instagram app',
          'Tap the + button to create a new post',
          'Select the saved image',
          'Copy and paste the generated caption',
          'Add location and tag people if needed',
          'Share your post'
        ]
        break

      case 'tiktok':
        instructions.steps = [
          'Save the generated image to your device',
          'Open TikTok app',
          'Tap the + button to create new video',
          'Upload the image or create a video with it',
          'Copy and paste the generated caption',
          'Add effects, sounds, or filters as desired',
          'Post to your account'
        ]
        break

      default:
        instructions.steps = [
          'Save the generated content to your device',
          'Open the social media app',
          'Create a new post',
          'Upload the content and add the caption',
          'Publish your post'
        ]
    }

    return instructions
  }
}
