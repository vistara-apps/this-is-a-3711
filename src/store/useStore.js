import { create } from 'zustand'

export const useAuthStore = create((set, get) => ({
  user: null,
  session: null,
  loading: true,
  subscriptionTier: 'free',
  
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ loading }),
  setSubscriptionTier: (tier) => set({ subscriptionTier: tier }),
  
  signOut: () => set({ user: null, session: null, subscriptionTier: 'free' }),
}))

export const useCampaignStore = create((set, get) => ({
  campaigns: [],
  currentCampaign: null,
  adVariations: [],
  loading: false,
  
  setCampaigns: (campaigns) => set({ campaigns }),
  setCurrentCampaign: (campaign) => set({ currentCampaign: campaign }),
  setAdVariations: (variations) => set({ adVariations: variations }),
  setLoading: (loading) => set({ loading }),
  
  addCampaign: (campaign) => set((state) => ({
    campaigns: [campaign, ...state.campaigns]
  })),
  
  addVariation: (variation) => set((state) => ({
    adVariations: [...state.adVariations, variation]
  })),
  
  updateVariation: (id, updates) => set((state) => ({
    adVariations: state.adVariations.map(variation =>
      variation.id === id ? { ...variation, ...updates } : variation
    )
  })),
}))