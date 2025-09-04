import React, { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Eye, Heart, MessageCircle, Share2, Calendar, Target } from 'lucide-react'
import { analyticsAPI } from '../lib/api'
import LoadingSpinner from './LoadingSpinner'

const AnalyticsDashboard = ({ campaignId = null }) => {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d') // 7d, 30d, 90d

  useEffect(() => {
    loadAnalytics()
  }, [campaignId, timeRange])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      let data
      if (campaignId) {
        data = await analyticsAPI.getCampaignAnalytics(campaignId)
      } else {
        data = await analyticsAPI.getUserAnalytics()
      }
      setAnalytics(data)
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-surface rounded-lg p-6 shadow-card">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="bg-surface rounded-lg p-6 shadow-card">
        <div className="text-center text-text-secondary">
          <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
          <p>No analytics data available</p>
        </div>
      </div>
    )
  }

  const MetricCard = ({ icon: Icon, title, value, change, color = 'text-primary' }) => (
    <div className="bg-bg rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <Icon className={`${color} opacity-80`} size={20} />
        {change && (
          <span className={`text-sm ${change > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {change > 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-text-primary mb-1">{value}</div>
      <div className="text-sm text-text-secondary">{title}</div>
    </div>
  )

  const PlatformBreakdown = ({ platformStats }) => (
    <div className="bg-surface rounded-lg p-6 shadow-card">
      <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
        <Target className="mr-2" size={20} />
        Platform Performance
      </h3>
      <div className="space-y-4">
        {Object.entries(platformStats).map(([platform, stats]) => (
          <div key={platform} className="flex items-center justify-between p-3 bg-bg rounded-lg">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${
                platform === 'instagram' ? 'bg-pink-500' :
                platform === 'tiktok' ? 'bg-black' :
                'bg-blue-500'
              }`} />
              <span className="font-medium text-text-primary capitalize">{platform}</span>
            </div>
            <div className="flex space-x-6 text-sm">
              <div className="text-center">
                <div className="text-text-primary font-medium">{stats.variations}</div>
                <div className="text-text-secondary">Variations</div>
              </div>
              <div className="text-center">
                <div className="text-text-primary font-medium">{stats.posts}</div>
                <div className="text-text-secondary">Posted</div>
              </div>
              <div className="text-center">
                <div className="text-text-primary font-medium">{stats.engagement}</div>
                <div className="text-text-secondary">Engagement</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const EngagementChart = ({ data }) => {
    const maxValue = Math.max(...Object.values(data))
    
    return (
      <div className="bg-surface rounded-lg p-6 shadow-card">
        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
          <TrendingUp className="mr-2" size={20} />
          Engagement Overview
        </h3>
        <div className="space-y-4">
          {Object.entries(data).map(([metric, value]) => (
            <div key={metric} className="flex items-center">
              <div className="w-20 text-sm text-text-secondary capitalize">{metric}</div>
              <div className="flex-1 mx-4">
                <div className="bg-bg rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-primary h-full rounded-full transition-all duration-500"
                    style={{ width: `${maxValue > 0 ? (value / maxValue) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div className="w-12 text-right text-sm font-medium text-text-primary">{value}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-text-primary flex items-center">
          <BarChart3 className="mr-3" size={28} />
          {campaignId ? 'Campaign Analytics' : 'Analytics Overview'}
        </h2>
        
        {/* Time Range Selector */}
        <div className="flex bg-bg rounded-lg p-1">
          {['7d', '30d', '90d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-primary text-white'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={Target}
          title={campaignId ? "Variations Created" : "Total Campaigns"}
          value={campaignId ? analytics.totalVariations : analytics.totalCampaigns}
          color="text-primary"
        />
        <MetricCard
          icon={Eye}
          title="Total Posts"
          value={campaignId ? analytics.posted : analytics.totalPosts}
          color="text-secondary"
        />
        <MetricCard
          icon={Heart}
          title="Total Engagement"
          value={analytics.totalEngagement}
          color="text-accent"
        />
        <MetricCard
          icon={TrendingUp}
          title="Avg. Engagement"
          value={Math.round(analytics.averageEngagement || 0)}
          color="text-green-400"
        />
      </div>

      {/* Platform Breakdown */}
      {(analytics.platformBreakdown || analytics.platformStats) && (
        <PlatformBreakdown 
          platformStats={analytics.platformBreakdown || analytics.platformStats} 
        />
      )}

      {/* Engagement Chart */}
      {analytics.totalEngagement > 0 && (
        <EngagementChart 
          data={{
            likes: Math.floor(analytics.totalEngagement * 0.6),
            comments: Math.floor(analytics.totalEngagement * 0.25),
            shares: Math.floor(analytics.totalEngagement * 0.15)
          }}
        />
      )}

      {/* Performance Insights */}
      <div className="bg-surface rounded-lg p-6 shadow-card">
        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
          <MessageCircle className="mr-2" size={20} />
          Performance Insights
        </h3>
        
        <div className="space-y-3">
          {analytics.totalEngagement === 0 ? (
            <div className="text-text-secondary">
              <p>No engagement data available yet. Start posting your ad variations to see insights!</p>
            </div>
          ) : (
            <>
              <div className="flex items-start space-x-3 p-3 bg-bg rounded-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="text-text-primary font-medium">Best Performing Platform</p>
                  <p className="text-text-secondary text-sm">
                    {Object.entries(analytics.platformBreakdown || analytics.platformStats || {})
                      .sort(([,a], [,b]) => b.engagement - a.engagement)[0]?.[0] || 'N/A'} 
                    is generating the most engagement
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-bg rounded-lg">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="text-text-primary font-medium">Posting Frequency</p>
                  <p className="text-text-secondary text-sm">
                    You've posted {campaignId ? analytics.posted : analytics.totalPosts} times. 
                    Consider increasing frequency for better reach.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-bg rounded-lg">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="text-text-primary font-medium">Engagement Rate</p>
                  <p className="text-text-secondary text-sm">
                    Average of {Math.round(analytics.averageEngagement || 0)} interactions per post. 
                    {analytics.averageEngagement > 50 ? 'Great performance!' : 'Room for improvement.'}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-surface rounded-lg p-6 shadow-card">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
            Create New Campaign
          </button>
          <button className="px-4 py-2 bg-bg text-text-primary border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors">
            Export Data
          </button>
          <button className="px-4 py-2 bg-bg text-text-primary border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors">
            Schedule Report
          </button>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsDashboard
