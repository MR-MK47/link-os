import { describe, it, expect, beforeEach } from 'vitest'
import { CampaignService } from '../src/services/campaign.service'
import type { Campaign } from '../src/types'

describe('CampaignService', () => {
  let service: CampaignService
  let campaigns: Campaign[]

  beforeEach(() => {
    campaigns = []
    service = new CampaignService(campaigns)
  })

  describe('create', () => {
    it('should create a new campaign', () => {
      const campaign = service.create({
        id: 'cmp_1',
        user_id: 'user_1',
        name: 'Roofing Outreach',
        status: 'draft',
      })

      expect(campaign.id).toBe('cmp_1')
      expect(campaign.name).toBe('Roofing Outreach')
      expect(campaign.status).toBe('draft')
      expect(campaign.created_at).toBeDefined()
    })

    it('should assign a default status of draft', () => {
      const campaign = service.create({
        id: 'cmp_2',
        user_id: 'user_1',
        name: 'Concrete Campaign',
      })

      expect(campaign.status).toBe('draft')
    })

    it('should throw if campaign with same id exists', () => {
      service.create({
        id: 'cmp_1',
        user_id: 'user_1',
        name: 'First Campaign',
      })

      expect(() =>
        service.create({
          id: 'cmp_1',
          user_id: 'user_1',
          name: 'Duplicate',
        })
      ).toThrow('Campaign with id cmp_1 already exists')
    })
  })

  describe('list', () => {
    it('should return all campaigns for a user', () => {
      service.create({ id: 'cmp_1', user_id: 'user_1', name: 'Campaign 1' })
      service.create({ id: 'cmp_2', user_id: 'user_1', name: 'Campaign 2' })
      service.create({ id: 'cmp_3', user_id: 'user_2', name: 'Other User' })

      const userCampaigns = service.list('user_1')

      expect(userCampaigns).toHaveLength(2)
      expect(userCampaigns.every(c => c.user_id === 'user_1')).toBe(true)
    })

    it('should return empty array for user with no campaigns', () => {
      const result = service.list('user_nonexistent')
      expect(result).toHaveLength(0)
    })
  })

  describe('getById', () => {
    it('should return campaign by id', () => {
      const campaign = service.create({
        id: 'cmp_1',
        user_id: 'user_1',
        name: 'Test Campaign',
      })

      const found = service.getById('cmp_1', 'user_1')

      expect(found).toBeDefined()
      expect(found!.id).toBe('cmp_1')
      expect(found!.name).toBe('Test Campaign')
    })

    it('should return null for non-existent campaign', () => {
      const result = service.getById('nonexistent', 'user_1')
      expect(result).toBeNull()
    })

    it('should not return campaign belonging to another user', () => {
      service.create({
        id: 'cmp_1',
        user_id: 'user_2',
        name: 'Other User Campaign',
      })

      const result = service.getById('cmp_1', 'user_1')
      expect(result).toBeNull()
    })
  })

  describe('update', () => {
    it('should update campaign name', () => {
      const campaign = service.create({
        id: 'cmp_1',
        user_id: 'user_1',
        name: 'Original Name',
      })

      service.update('cmp_1', 'user_1', { name: 'Updated Name' })

      const updated = service.getById('cmp_1', 'user_1')
      expect(updated!.name).toBe('Updated Name')
    })

    it('should update campaign status', () => {
      service.create({ id: 'cmp_1', user_id: 'user_1', name: 'Test' })

      service.update('cmp_1', 'user_1', { status: 'active' })

      const updated = service.getById('cmp_1', 'user_1')
      expect(updated!.status).toBe('active')
    })

    it('should throw if campaign does not exist', () => {
      expect(() => service.update('nonexistent', 'user_1', { name: 'X' })).toThrow()
    })
  })

  describe('delete', () => {
    it('should delete a campaign', () => {
      service.create({ id: 'cmp_1', user_id: 'user_1', name: 'To Delete' })

      service.delete('cmp_1', 'user_1')

      const result = service.getById('cmp_1', 'user_1')
      expect(result).toBeNull()
    })

    it('should throw if campaign does not exist', () => {
      expect(() => service.delete('nonexistent', 'user_1')).toThrow()
    })
  })
})
