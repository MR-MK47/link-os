export interface Lead {
  id: string
  campaign_id: string
  email: string
  first_name?: string
  last_name?: string
  company?: string
  title?: string
  linkedin_url?: string
  phone?: string
  status: 'pending' | 'validating' | 'valid' | 'invalid' | 'sent' | 'replied'
  validation_score?: number
  notes?: string
  created_at: string
}

export interface LeadUploadResult {
  leads: Lead[]
  valid: number
  invalid: number
}
