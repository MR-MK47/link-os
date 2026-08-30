import type { Campaign, CreateCampaignInput, UpdateCampaignInput } from '../types/campaign'

export class CampaignService {
  private campaigns: Campaign[]

  constructor(campaigns: Campaign[] = []) {
    this.campaigns = campaigns
  }

  create(input: CreateCampaignInput): Campaign {
    const exists = this.campaigns.find(c => c.id === input.id)
    if (exists) {
      throw new Error(`Campaign with id ${input.id} already exists`)
    }

    const campaign: Campaign = {
      ...input,
      status: input.status || 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    this.campaigns.push(campaign)
    return campaign
  }

  list(userId: string): Campaign[] {
    return this.campaigns.filter(c => c.user_id === userId)
  }

  getById(id: string, userId: string): Campaign | null {
    return this.campaigns.find(c => c.id === id && c.user_id === userId) || null
  }

  update(id: string, userId: string, input: UpdateCampaignInput): Campaign {
    const index = this.campaigns.findIndex(c => c.id === id && c.user_id === userId)
    if (index === -1) {
      throw new Error(`Campaign ${id} not found`)
    }

    this.campaigns[index] = {
      ...this.campaigns[index],
      ...input,
      updated_at: new Date().toISOString(),
    }

    return this.campaigns[index]
  }

  delete(id: string, userId: string): void {
    const index = this.campaigns.findIndex(c => c.id === id && c.user_id === userId)
    if (index === -1) {
      throw new Error(`Campaign ${id} not found`)
    }

    this.campaigns.splice(index, 1)
  }
}
