import { describe, it, expect } from 'vitest'
import { formatCampaignStats } from '../src/lib/utils'

describe('Utils', () => {
  describe('formatCampaignStats', () => {
    it('should return zero stats for empty campaign', () => {
      const result = formatCampaignStats({
        leads: [],
        drafts: [],
        emails: [],
      })

      expect(result.totalLeads).toBe(0)
      expect(result.totalSent).toBe(0)
      expect(result.totalResponses).toBe(0)
      expect(result.responseRate).toBe(0)
    })

    it('should calculate correct response rate', () => {
      const result = formatCampaignStats({
        leads: [
          { id: '1', email: 'a@test.com', status: 'sent' },
          { id: '2', email: 'b@test.com', status: 'sent' },
          { id: '3', email: 'c@test.com', status: 'replied' },
        ],
        drafts: [],
        emails: [
          { lead_id: '1', status: 'sent' },
          { lead_id: '2', status: 'sent' },
        ],
      })

      expect(result.totalLeads).toBe(3)
      expect(result.totalSent).toBe(2)
      expect(result.totalResponses).toBe(1)
      expect(result.responseRate).toBe(50)
    })
  })
})
