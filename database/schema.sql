-- AdSpark AI Database Schema
-- This file contains the complete database schema for the AdSpark AI application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'premium');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'unpaid', 'incomplete', 'incomplete_expired', 'trialing', 'inactive');
CREATE TYPE post_status AS ENUM ('draft', 'scheduled', 'posted', 'failed');
CREATE TYPE action_type AS ENUM ('generation', 'post', 'api_call');

-- Users table (extends auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    subscription_tier subscription_tier DEFAULT 'free',
    subscription_status subscription_status DEFAULT 'inactive',
    subscription_end_date TIMESTAMPTZ,
    stripe_customer_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ad Campaigns table
CREATE TABLE public.ad_campaigns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    product_image TEXT NOT NULL,
    product_description TEXT NOT NULL,
    platforms TEXT[] NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ad Variations table
CREATE TABLE public.ad_variations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    campaign_id UUID REFERENCES public.ad_campaigns(id) ON DELETE CASCADE NOT NULL,
    platform TEXT NOT NULL,
    copy TEXT NOT NULL,
    hashtags TEXT,
    tone TEXT,
    image_url TEXT,
    image_prompt TEXT,
    post_status post_status DEFAULT 'draft',
    post_url TEXT,
    posted_at TIMESTAMPTZ,
    engagement_metrics JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Social Media Accounts table
CREATE TABLE public.social_accounts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    platform TEXT NOT NULL,
    account_id TEXT NOT NULL,
    account_name TEXT NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, platform, account_id)
);

-- Usage Tracking table
CREATE TABLE public.usage_tracking (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    action_type action_type NOT NULL,
    resource_type TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscription Plans table
CREATE TABLE public.subscription_plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name subscription_tier NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10,2) NOT NULL,
    price_yearly DECIMAL(10,2),
    stripe_price_id TEXT,
    stripe_yearly_price_id TEXT,
    features JSONB NOT NULL DEFAULT '{}',
    limits JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_ad_campaigns_user_id ON public.ad_campaigns(user_id);
CREATE INDEX idx_ad_campaigns_created_at ON public.ad_campaigns(created_at DESC);

CREATE INDEX idx_ad_variations_campaign_id ON public.ad_variations(campaign_id);
CREATE INDEX idx_ad_variations_platform ON public.ad_variations(platform);
CREATE INDEX idx_ad_variations_post_status ON public.ad_variations(post_status);
CREATE INDEX idx_ad_variations_created_at ON public.ad_variations(created_at DESC);

CREATE INDEX idx_social_accounts_user_id ON public.social_accounts(user_id);
CREATE INDEX idx_social_accounts_platform ON public.social_accounts(platform);
CREATE INDEX idx_social_accounts_is_active ON public.social_accounts(is_active);

CREATE INDEX idx_usage_tracking_user_id ON public.usage_tracking(user_id);
CREATE INDEX idx_usage_tracking_action_type ON public.usage_tracking(action_type);
CREATE INDEX idx_usage_tracking_created_at ON public.usage_tracking(created_at DESC);

-- Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Ad Campaigns policies
CREATE POLICY "Users can view own campaigns" ON public.ad_campaigns
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own campaigns" ON public.ad_campaigns
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own campaigns" ON public.ad_campaigns
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own campaigns" ON public.ad_campaigns
    FOR DELETE USING (auth.uid() = user_id);

-- Ad Variations policies
CREATE POLICY "Users can view variations of own campaigns" ON public.ad_variations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.ad_campaigns 
            WHERE ad_campaigns.id = ad_variations.campaign_id 
            AND ad_campaigns.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create variations for own campaigns" ON public.ad_variations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.ad_campaigns 
            WHERE ad_campaigns.id = ad_variations.campaign_id 
            AND ad_campaigns.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update variations of own campaigns" ON public.ad_variations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.ad_campaigns 
            WHERE ad_campaigns.id = ad_variations.campaign_id 
            AND ad_campaigns.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete variations of own campaigns" ON public.ad_variations
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.ad_campaigns 
            WHERE ad_campaigns.id = ad_variations.campaign_id 
            AND ad_campaigns.user_id = auth.uid()
        )
    );

-- Social Accounts policies
CREATE POLICY "Users can view own social accounts" ON public.social_accounts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own social accounts" ON public.social_accounts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own social accounts" ON public.social_accounts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own social accounts" ON public.social_accounts
    FOR DELETE USING (auth.uid() = user_id);

-- Usage Tracking policies
CREATE POLICY "Users can view own usage" ON public.usage_tracking
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own usage records" ON public.usage_tracking
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Subscription Plans policies (public read access)
CREATE POLICY "Anyone can view active subscription plans" ON public.subscription_plans
    FOR SELECT USING (is_active = true);

-- Functions for common operations

-- Function to create user profile on signup
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

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ad_campaigns_updated_at BEFORE UPDATE ON public.ad_campaigns
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ad_variations_updated_at BEFORE UPDATE ON public.ad_variations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_social_accounts_updated_at BEFORE UPDATE ON public.social_accounts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON public.subscription_plans
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to check usage limits
CREATE OR REPLACE FUNCTION public.check_usage_limit(
    user_id UUID,
    action_type TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    user_tier subscription_tier;
    current_usage INTEGER;
    usage_limit INTEGER;
    current_month_start TIMESTAMPTZ;
BEGIN
    -- Get user's subscription tier
    SELECT subscription_tier INTO user_tier
    FROM public.users
    WHERE id = user_id;

    -- Calculate current month start
    current_month_start := date_trunc('month', NOW());

    -- Count current usage for this month
    SELECT COUNT(*) INTO current_usage
    FROM public.usage_tracking
    WHERE usage_tracking.user_id = check_usage_limit.user_id
    AND usage_tracking.action_type = check_usage_limit.action_type::action_type
    AND created_at >= current_month_start;

    -- Determine usage limit based on tier and action
    CASE user_tier
        WHEN 'free' THEN
            CASE action_type
                WHEN 'generation' THEN usage_limit := 5;
                WHEN 'post' THEN usage_limit := 2;
                ELSE usage_limit := 0;
            END CASE;
        WHEN 'pro' THEN
            CASE action_type
                WHEN 'generation' THEN usage_limit := 50;
                WHEN 'post' THEN usage_limit := 20;
                ELSE usage_limit := 100;
            END CASE;
        WHEN 'premium' THEN
            CASE action_type
                WHEN 'generation' THEN usage_limit := -1; -- unlimited
                WHEN 'post' THEN usage_limit := 100;
                ELSE usage_limit := -1; -- unlimited
            END CASE;
        ELSE
            usage_limit := 0;
    END CASE;

    -- Return true if under limit (or unlimited)
    RETURN usage_limit = -1 OR current_usage < usage_limit;
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
    VALUES (user_id, action_type::action_type, resource_type, metadata);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, display_name, description, price_monthly, price_yearly, features, limits) VALUES
('free', 'Free', 'Perfect for getting started', 0.00, 0.00, 
 '{"platforms": ["instagram"], "analytics": "basic", "support": "community"}',
 '{"generations": 5, "posts": 2}'),
('pro', 'Pro', 'For growing businesses', 29.00, 290.00,
 '{"platforms": ["instagram", "tiktok"], "analytics": "advanced", "support": "priority", "scheduling": true}',
 '{"generations": 50, "posts": 20}'),
('premium', 'Premium', 'For scaling companies', 79.00, 790.00,
 '{"platforms": ["instagram", "tiktok", "facebook"], "analytics": "advanced", "support": "priority", "scheduling": true, "customBranding": true}',
 '{"generations": -1, "posts": 100}');

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- Storage policies for product images
CREATE POLICY "Users can upload product images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view product images" ON storage.objects
    FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Users can update own product images" ON storage.objects
    FOR UPDATE USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own product images" ON storage.objects
    FOR DELETE USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);
