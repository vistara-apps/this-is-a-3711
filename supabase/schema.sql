-- AdSpark AI Database Schema
-- This file contains the complete database schema for the AdSpark AI application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'premium')),
  stripe_customer_id TEXT,
  subscription_status TEXT DEFAULT 'inactive',
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  generations_used INTEGER DEFAULT 0,
  posts_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ad Campaigns table
CREATE TABLE public.ad_campaigns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  product_image TEXT NOT NULL,
  product_description TEXT NOT NULL,
  platforms TEXT[] NOT NULL DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ad Variations table
CREATE TABLE public.ad_variations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_id UUID REFERENCES public.ad_campaigns(id) ON DELETE CASCADE NOT NULL,
  ad_type TEXT DEFAULT 'image_text' CHECK (ad_type IN ('image_text', 'video', 'carousel')),
  copy TEXT NOT NULL,
  hashtags TEXT,
  tone TEXT,
  image_url TEXT,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok', 'facebook')),
  post_url TEXT,
  post_status TEXT DEFAULT 'draft' CHECK (post_status IN ('draft', 'scheduled', 'posted', 'failed')),
  engagement_metrics JSONB DEFAULT '{}',
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  posted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social Media Accounts table
CREATE TABLE public.social_accounts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok', 'facebook')),
  account_id TEXT NOT NULL,
  account_name TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, platform, account_id)
);

-- Usage Tracking table
CREATE TABLE public.usage_tracking (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('generation', 'post', 'api_call')),
  resource_type TEXT, -- 'ad_copy', 'image', 'post'
  cost_credits INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription Plans table (for reference)
CREATE TABLE public.subscription_plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  price_monthly INTEGER NOT NULL, -- in cents
  price_yearly INTEGER,
  generations_limit INTEGER, -- NULL for unlimited
  posts_limit INTEGER, -- NULL for unlimited
  features JSONB DEFAULT '{}',
  stripe_price_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, price_monthly, price_yearly, generations_limit, posts_limit, features, is_active) VALUES
('free', 0, 0, 5, 2, '{"platforms": ["instagram"], "analytics": "basic", "support": "community"}', true),
('pro', 2900, 29000, 50, 20, '{"platforms": ["instagram", "tiktok"], "analytics": "advanced", "support": "priority", "scheduling": true}', true),
('premium', 7900, 79000, NULL, 100, '{"platforms": ["instagram", "tiktok", "facebook"], "analytics": "advanced", "support": "priority", "scheduling": true, "unlimited_generations": true}', true);

-- Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Campaigns policies
CREATE POLICY "Users can view own campaigns" ON public.ad_campaigns
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own campaigns" ON public.ad_campaigns
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own campaigns" ON public.ad_campaigns
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own campaigns" ON public.ad_campaigns
  FOR DELETE USING (auth.uid() = user_id);

-- Ad variations policies
CREATE POLICY "Users can view own variations" ON public.ad_variations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.ad_campaigns 
      WHERE ad_campaigns.id = ad_variations.campaign_id 
      AND ad_campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own variations" ON public.ad_variations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ad_campaigns 
      WHERE ad_campaigns.id = ad_variations.campaign_id 
      AND ad_campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own variations" ON public.ad_variations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.ad_campaigns 
      WHERE ad_campaigns.id = ad_variations.campaign_id 
      AND ad_campaigns.user_id = auth.uid()
    )
  );

-- Social accounts policies
CREATE POLICY "Users can manage own social accounts" ON public.social_accounts
  FOR ALL USING (auth.uid() = user_id);

-- Usage tracking policies
CREATE POLICY "Users can view own usage" ON public.usage_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert usage" ON public.usage_tracking
  FOR INSERT WITH CHECK (true);

-- Subscription plans are publicly readable
CREATE POLICY "Anyone can view subscription plans" ON public.subscription_plans
  FOR SELECT USING (is_active = true);

-- Functions for user management
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to check usage limits
CREATE OR REPLACE FUNCTION public.check_usage_limit(
  user_id UUID,
  action_type TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  user_tier TEXT;
  current_usage INTEGER;
  tier_limit INTEGER;
BEGIN
  -- Get user's subscription tier
  SELECT subscription_tier INTO user_tier
  FROM public.users
  WHERE id = user_id;

  -- Get current month usage
  SELECT COUNT(*) INTO current_usage
  FROM public.usage_tracking
  WHERE user_id = check_usage_limit.user_id
    AND action_type = check_usage_limit.action_type
    AND created_at >= date_trunc('month', NOW());

  -- Get tier limits
  IF action_type = 'generation' THEN
    SELECT generations_limit INTO tier_limit
    FROM public.subscription_plans
    WHERE name = user_tier;
  ELSIF action_type = 'post' THEN
    SELECT posts_limit INTO tier_limit
    FROM public.subscription_plans
    WHERE name = user_tier;
  END IF;

  -- NULL limit means unlimited
  IF tier_limit IS NULL THEN
    RETURN TRUE;
  END IF;

  RETURN current_usage < tier_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track usage
CREATE OR REPLACE FUNCTION public.track_usage(
  user_id UUID,
  action_type TEXT,
  resource_type TEXT DEFAULT NULL,
  metadata JSONB DEFAULT '{}'
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.usage_tracking (user_id, action_type, resource_type, metadata)
  VALUES (user_id, action_type, resource_type, metadata);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Indexes for performance
CREATE INDEX idx_ad_campaigns_user_id ON public.ad_campaigns(user_id);
CREATE INDEX idx_ad_campaigns_created_at ON public.ad_campaigns(created_at DESC);
CREATE INDEX idx_ad_variations_campaign_id ON public.ad_variations(campaign_id);
CREATE INDEX idx_ad_variations_platform ON public.ad_variations(platform);
CREATE INDEX idx_usage_tracking_user_id_created_at ON public.usage_tracking(user_id, created_at DESC);
CREATE INDEX idx_social_accounts_user_id ON public.social_accounts(user_id);
