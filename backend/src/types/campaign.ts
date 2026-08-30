export interface Campaign {
  id: string
  user_id: string
  name: string
  status: 'draft' | 'active' | 'paused' | 'completed'
  notes?: string
  created_at: string
  updated_at: string
}

export interface CreateCampaignInput {
  id: string
  user_id: string
  name: string
  status?: 'draft' | 'active' | 'paused' | 'completed'
  notes?: string
}

export interface UpdateCampaignInput {
  name?: string
  status?: 'draft' | 'active' | 'paused' | 'completed'
  notes?: string
}
