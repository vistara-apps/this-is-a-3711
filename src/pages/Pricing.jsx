import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ArrowLeft, Crown, Zap, Target } from 'lucide-react'

const Pricing = () => {
  const navigate = useNavigate()

  const pricingTiers = [
    {
      name: 'Free',
      price: 0,
      period: '',
      description: 'Perfect for getting started',
      features: [
        '5 ad generations per month',
        '2 posts per month',
        'Basic analytics',
        'Instagram only',
        'Community support'
      ],
      cta: 'Start Free',
      popular: false,
      color: 'border-gray-700'
    },
    {
      name: 'Pro',
      price: 29,
      period: '/month',
      description: 'Best for growing businesses',
      features: [
        '50 ad generations per month',
        '20 posts per month',
        'Advanced analytics',
        'Instagram + TikTok',
        'Priority support',
        'Custom posting schedule',
        'Performance insights'
      ],
      cta: 'Start Pro Trial',
      popular: true,
      color: 'border-accent shadow-xl'
    },
    {
      name: 'Premium',
      price: 79,
      period: '/month',
      description: 'For scaling enterprises',
      features: [
        'Unlimited ad generations',
        '100 posts per month',
        'Advanced analytics',
        'All platforms',
        'Priority support',
        'Custom integrations',
        'Dedicated account manager',
        'Custom AI training'
      ],
      cta: 'Start Premium Trial',
      popular: false,
      color: 'border-primary'
    }
  ]

  const features = [
    {
      icon: Zap,
      title: 'AI-Powered Generation',
      description: 'Advanced AI creates compelling ad copy and visuals tailored to your product and audience.'
    },
    {
      icon: Target,
      title: 'Platform Optimization',
      description: 'Content automatically optimized for Instagram, TikTok, and other social media platforms.'
    },
    {
      icon: Crown,
      title: 'Automated Posting',
      description: 'Schedule and post your ad variations directly to your social media accounts.'
    }
  ]

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="border-b border-gray-800 bg-surface/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-text-secondary hover:text-text-primary transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <div className="flex items-center space-x-2">
              <Crown className="w-6 h-6 text-primary" />
              <span className="text-lg font-semibold text-text-primary">Pricing Plans</span>
            </div>
            <div className="w-16"></div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold text-text-primary mb-6">
            Choose your plan
          </h1>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto mb-8">
            Start for free and scale as you grow. All plans include core AI features and platform integrations.
          </p>
          
          <div className="inline-flex items-center space-x-4 bg-surface p-1 rounded-lg">
            <button className="px-4 py-2 bg-primary text-white rounded-md font-medium">
              Monthly
            </button>
            <button className="px-4 py-2 text-text-secondary hover:text-text-primary">
              Annual (Save 20%)
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingTiers.map((tier, index) => (
              <div key={index} className={`card p-8 relative ${tier.color} ${tier.popular ? 'scale-105' : ''}`}>
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-accent text-bg px-4 py-2 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-text-primary mb-2">{tier.name}</h3>
                  <p className="text-text-secondary mb-4">{tier.description}</p>
                  <div className="flex items-baseline justify-center mb-4">
                    <span className="text-5xl font-bold text-text-primary">${tier.price}</span>
                    <span className="text-text-secondary ml-2">{tier.period}</span>
                  </div>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-text-secondary">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button className={`w-full py-3 px-6 rounded-md font-medium transition-colors duration-200 ${
                  tier.popular 
                    ? 'bg-accent text-bg hover:bg-accent/90' 
                    : 'bg-primary text-white hover:bg-primary/90'
                }`}>
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-surface/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary mb-4">
              Powerful features included
            </h2>
            <p className="text-xl text-text-secondary">
              Everything you need to create, optimize, and scale your social media ads.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-3">{feature.title}</h3>
                <p className="text-text-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary mb-4">
              Frequently asked questions
            </h2>
          </div>
          
          <div className="space-y-6">
            {[
              {
                question: 'Can I change my plan at any time?',
                answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and billing is prorated.'
              },
              {
                question: 'What platforms do you support?',
                answer: 'Currently we support Instagram and TikTok, with more platforms coming soon including Facebook, Twitter, and LinkedIn.'
              },
              {
                question: 'Do unused generations roll over?',
                answer: 'Unused generations reset each month. We recommend upgrading if you consistently hit your limits.'
              },
              {
                question: 'Is there a free trial for paid plans?',
                answer: 'Yes, all paid plans come with a 7-day free trial. No credit card required to start.'
              }
            ].map((faq, index) => (
              <div key={index} className="card p-6">
                <h3 className="text-lg font-medium text-text-primary mb-2">{faq.question}</h3>
                <p className="text-text-secondary">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary/5 border-t border-primary/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-text-primary mb-4">
            Ready to spark your ad creativity?
          </h2>
          <p className="text-xl text-text-secondary mb-8">
            Join thousands of founders who are already scaling their social media presence with AI.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="btn-primary text-lg px-8 py-4"
          >
            Start Free Today
          </button>
        </div>
      </section>
    </div>
  )
}

export default Pricing