// Stripe Payment Integration
// This module handles subscription payments and billing

import { loadStripe } from '@stripe/stripe-js'
import { userAPI, subscriptionAPI } from './api'

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

export const stripeService = {
  // Create checkout session for subscription
  async createCheckoutSession(planName, successUrl, cancelUrl) {
    try {
      // Get plan details
      const plan = await subscriptionAPI.getPlan(planName)
      if (!plan) {
        throw new Error('Subscription plan not found')
      }

      // Create checkout session via your backend
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planName,
          priceId: plan.stripe_price_id,
          successUrl,
          cancelUrl
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { sessionId } = await response.json()

      // Redirect to Stripe Checkout
      const stripe = await stripePromise
      const { error } = await stripe.redirectToCheckout({
        sessionId
      })

      if (error) {
        throw error
      }

    } catch (error) {
      console.error('Error creating checkout session:', error)
      throw error
    }
  },

  // Create customer portal session for managing subscription
  async createPortalSession(returnUrl) {
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnUrl
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create portal session')
      }

      const { url } = await response.json()
      window.location.href = url

    } catch (error) {
      console.error('Error creating portal session:', error)
      throw error
    }
  },

  // Get current subscription status
  async getSubscriptionStatus() {
    try {
      const profile = await userAPI.getProfile()
      return {
        tier: profile.subscription_tier,
        status: profile.subscription_status,
        endDate: profile.subscription_end_date,
        customerId: profile.stripe_customer_id
      }
    } catch (error) {
      console.error('Error getting subscription status:', error)
      return {
        tier: 'free',
        status: 'inactive',
        endDate: null,
        customerId: null
      }
    }
  },

  // Handle successful payment (called from success page)
  async handlePaymentSuccess(sessionId) {
    try {
      const response = await fetch('/api/stripe/handle-success', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to handle payment success')
      }

      const result = await response.json()
      return result

    } catch (error) {
      console.error('Error handling payment success:', error)
      throw error
    }
  },

  // Cancel subscription
  async cancelSubscription() {
    try {
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error('Failed to cancel subscription')
      }

      const result = await response.json()
      return result

    } catch (error) {
      console.error('Error canceling subscription:', error)
      throw error
    }
  }
}

// Stripe webhook handlers (for backend)
export const stripeWebhooks = {
  // Handle subscription created
  handleSubscriptionCreated(subscription) {
    return {
      userId: subscription.metadata.userId,
      updates: {
        subscription_tier: subscription.metadata.planName,
        subscription_status: 'active',
        subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
        stripe_customer_id: subscription.customer
      }
    }
  },

  // Handle subscription updated
  handleSubscriptionUpdated(subscription) {
    return {
      userId: subscription.metadata.userId,
      updates: {
        subscription_tier: subscription.metadata.planName,
        subscription_status: subscription.status,
        subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString()
      }
    }
  },

  // Handle subscription deleted/canceled
  handleSubscriptionDeleted(subscription) {
    return {
      userId: subscription.metadata.userId,
      updates: {
        subscription_tier: 'free',
        subscription_status: 'canceled',
        subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString()
      }
    }
  },

  // Handle payment succeeded
  handlePaymentSucceeded(paymentIntent) {
    return {
      userId: paymentIntent.metadata.userId,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: 'succeeded'
    }
  },

  // Handle payment failed
  handlePaymentFailed(paymentIntent) {
    return {
      userId: paymentIntent.metadata.userId,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: 'failed',
      error: paymentIntent.last_payment_error?.message
    }
  }
}

// Utility functions for subscription management
export const subscriptionUtils = {
  // Check if user can perform action based on subscription
  canPerformAction(subscriptionTier, actionType, currentUsage = 0) {
    const limits = {
      free: {
        generation: 5,
        post: 2
      },
      pro: {
        generation: 50,
        post: 20
      },
      premium: {
        generation: null, // unlimited
        post: 100
      }
    }

    const tierLimits = limits[subscriptionTier] || limits.free
    const actionLimit = tierLimits[actionType]

    // Null means unlimited
    if (actionLimit === null) return true

    return currentUsage < actionLimit
  },

  // Get remaining usage for current period
  getRemainingUsage(subscriptionTier, actionType, currentUsage = 0) {
    const limits = {
      free: {
        generation: 5,
        post: 2
      },
      pro: {
        generation: 50,
        post: 20
      },
      premium: {
        generation: null, // unlimited
        post: 100
      }
    }

    const tierLimits = limits[subscriptionTier] || limits.free
    const actionLimit = tierLimits[actionType]

    // Null means unlimited
    if (actionLimit === null) return 'unlimited'

    return Math.max(0, actionLimit - currentUsage)
  },

  // Get subscription features
  getSubscriptionFeatures(subscriptionTier) {
    const features = {
      free: {
        platforms: ['instagram'],
        analytics: 'basic',
        support: 'community',
        generations: 5,
        posts: 2,
        scheduling: false,
        priority: false
      },
      pro: {
        platforms: ['instagram', 'tiktok'],
        analytics: 'advanced',
        support: 'priority',
        generations: 50,
        posts: 20,
        scheduling: true,
        priority: true
      },
      premium: {
        platforms: ['instagram', 'tiktok', 'facebook'],
        analytics: 'advanced',
        support: 'priority',
        generations: 'unlimited',
        posts: 100,
        scheduling: true,
        priority: true,
        customBranding: true
      }
    }

    return features[subscriptionTier] || features.free
  },

  // Format subscription status for display
  formatSubscriptionStatus(status, endDate) {
    const statusMap = {
      active: 'Active',
      canceled: 'Canceled',
      past_due: 'Past Due',
      unpaid: 'Unpaid',
      incomplete: 'Incomplete',
      incomplete_expired: 'Expired',
      trialing: 'Trial',
      inactive: 'Inactive'
    }

    let displayStatus = statusMap[status] || 'Unknown'

    if (endDate) {
      const end = new Date(endDate)
      const now = new Date()
      
      if (status === 'canceled' && end > now) {
        displayStatus = `Canceled (ends ${end.toLocaleDateString()})`
      } else if (status === 'active') {
        displayStatus = `Active (renews ${end.toLocaleDateString()})`
      }
    }

    return displayStatus
  },

  // Check if subscription is active
  isSubscriptionActive(status, endDate) {
    if (status === 'active' || status === 'trialing') {
      return true
    }

    if (status === 'canceled' && endDate) {
      const end = new Date(endDate)
      const now = new Date()
      return end > now
    }

    return false
  }
}
