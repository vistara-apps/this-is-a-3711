import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Zap, Target, BarChart3, ArrowRight, Check } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useAuthStore } from '../store/useStore'
import { toast } from 'react-toastify'

const Landing = () => {
  const navigate = useNavigate()
  const { signIn, signUp } = useAuth()
  const { user } = useAuthStore()
  
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password)

      if (error) {
        toast.error(error.message)
      } else {
        if (isSignUp) {
          toast.success('Account created! Please check your email to verify.')
        } else {
          toast.success('Signed in successfully!')
          navigate('/app')
        }
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (user) {
    navigate('/app')
    return null
  }

  const features = [
    {
      icon: Sparkles,
      title: 'AI Ad Creative Generation',
      description: 'Upload one product image, get 3-5 unique ad variations with copy and visuals'
    },
    {
      icon: Target,
      title: 'Platform Optimization',
      description: 'Automatically formatted and styled for TikTok and Instagram engagement'
    },
    {
      icon: Zap,
      title: 'Automated Posting',
      description: 'Post generated variations directly to your test social media pages'
    },
    {
      icon: BarChart3,
      title: 'Performance Insights',
      description: 'Get basic engagement metrics to understand what resonates best'
    }
  ]

  const pricingTiers = [
    {
      name: 'Free',
      price: 0,
      period: '',
      features: ['5 ad generations/month', '2 posts/month', 'Basic analytics', 'Instagram only'],
      cta: 'Start Free',
      popular: false
    },
    {
      name: 'Pro',
      price: 29,
      period: '/month',
      features: ['50 ad generations/month', '20 posts/month', 'Advanced analytics', 'Instagram + TikTok', 'Priority support'],
      cta: 'Start Pro Trial',
      popular: true
    },
    {
      name: 'Premium',
      price: 79,
      period: '/month',
      features: ['Unlimited generations', '100 posts/month', 'Advanced analytics', 'All platforms', 'Priority support', 'Custom integrations'],
      cta: 'Start Premium Trial',
      popular: false
    }
  ]

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="border-b border-gray-800 bg-surface/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold text-text-primary">AdSpark AI</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-text-secondary hover:text-text-primary transition-colors duration-200">Features</a>
              <a href="#pricing" className="text-text-secondary hover:text-text-primary transition-colors duration-200">Pricing</a>
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-text-secondary hover:text-text-primary transition-colors duration-200"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl lg:text-6xl font-bold text-text-primary leading-tight">
                Spark your ad creativity and 
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> automate social posting</span>
              </h1>
              <p className="mt-6 text-xl text-text-secondary leading-relaxed">
                AI-powered tool that generates ad variations and posts them to test social media pages for solo founders.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button 
                  onClick={() => document.getElementById('auth-form').scrollIntoView({ behavior: 'smooth' })}
                  className="btn-primary flex items-center justify-center space-x-2"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button className="btn-secondary">
                  Watch Demo
                </button>
              </div>
            </div>
            
            <div className="relative">
              <div className="card p-8 bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary">Upload Product & Get Ads</h3>
                  <p className="text-text-secondary mt-2">AI generates multiple variations instantly</p>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-surface p-4 rounded-lg">
                    <div className="h-32 bg-bg rounded border-2 border-dashed border-gray-600 flex items-center justify-center">
                      <span className="text-text-secondary">Product Image</span>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <ArrowRight className="w-6 h-6 text-accent mx-auto" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="bg-surface p-3 rounded-lg">
                        <div className="h-20 bg-bg rounded mb-2"></div>
                        <div className="space-y-1">
                          <div className="h-2 bg-bg rounded"></div>
                          <div className="h-2 bg-bg rounded w-3/4"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-surface/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-text-primary mb-4">
              Everything you need to scale your ads
            </h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              From generation to posting to analytics - all automated so you can focus on growing your business.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card p-6 text-center hover:scale-105 transition-transform duration-200">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">{feature.title}</h3>
                <p className="text-text-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-text-primary mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-text-secondary">
              Choose the plan that fits your needs. Upgrade or downgrade at any time.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingTiers.map((tier, index) => (
              <div key={index} className={`card p-8 relative ${tier.popular ? 'border-accent shadow-xl scale-105' : ''}`}>
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-accent text-bg px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-text-primary mb-2">{tier.name}</h3>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-text-primary">${tier.price}</span>
                    <span className="text-text-secondary ml-1">{tier.period}</span>
                  </div>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-text-secondary">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button className={tier.popular ? 'btn-primary w-full' : 'btn-secondary w-full'}>
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Auth Section */}
      <section id="auth-form" className="py-20 bg-surface/30">
        <div className="max-w-md mx-auto px-4">
          <div className="card p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-text-primary mb-2">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-text-secondary">
                {isSignUp ? 'Start generating amazing ads today' : 'Sign in to your account'}
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input w-full"
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input w-full"
                  placeholder="Enter your password"
                  required
                  minLength={6}
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-text-secondary hover:text-text-primary transition-colors duration-200"
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold text-text-primary">AdSpark AI</span>
            </div>
            <p className="text-text-secondary">
              Spark your ad creativity and automate social posting.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing