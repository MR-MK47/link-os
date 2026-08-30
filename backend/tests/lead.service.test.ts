import { describe, it, expect } from 'vitest'
import { LeadService } from '../src/services/lead.service'
import type { Lead } from '../src/types/lead'

describe('LeadService', () => {
  let service: LeadService

  beforeEach(() => {
    service = new LeadService()
  })

  describe('uploadCSV', () => {
    it('should parse CSV with standard headers', () => {
      const csv = `name,email,company,title
John Doe,john@example.com,Acme Inc,CEO
Jane Smith,jane@example.com,Tech Corp,CTO`

      const result = service.uploadCSV(csv, 'cmp_1')

      expect(result).toHaveLength(2)
      expect(result[0].email).toBe('john@example.com')
      expect(result[0].company).toBe('Acme Inc')
      expect(result[0].title).toBe('CEO')
      expect(result[1].email).toBe('jane@example.com')
    })

    it('should handle CSV with different column order', () => {
      const csv = `email,name,company
a@b.com,Alice,Company A
c@d.com,Bob,Company B`

      const result = service.uploadCSV(csv, 'cmp_1')

      expect(result).toHaveLength(2)
      expect(result[0].email).toBe('a@b.com')
      expect(result[0].first_name).toBe('Alice')
    })

    it('should skip rows with missing email', () => {
      const csv = `name,email
John,
Jane,jane@example.com`

      const result = service.uploadCSV(csv, 'cmp_1')

      expect(result).toHaveLength(1)
      expect(result[0].email).toBe('jane@example.com')
    })

    it('should handle empty CSV', () => {
      const result = service.uploadCSV('', 'cmp_1')
      expect(result).toHaveLength(0)
    })

    it('should trim whitespace from values', () => {
      const csv = `name,email
  John Doe  ,  john@example.com  `

      const result = service.uploadCSV(csv, 'cmp_1')

      expect(result[0].first_name).toBe('John')
      expect(result[0].last_name).toBe('Doe')
      expect(result[0].email).toBe('john@example.com')
    })
  })

  describe('list', () => {
    it('should return leads for a campaign', () => {
      service.uploadCSV('name,email\nJohn,john@test.com', 'cmp_1')
      service.uploadCSV('name,email\nJane,jane@test.com', 'cmp_2')

      const leads = service.list('cmp_1')
      expect(leads).toHaveLength(1)
      expect(leads[0].email).toBe('john@test.com')
    })

    it('should return empty array for campaign with no leads', () => {
      const leads = service.list('nonexistent')
      expect(leads).toHaveLength(0)
    })
  })

  describe('getById', () => {
    it('should return lead by id', () => {
      const leads = service.uploadCSV('name,email\nJohn,john@test.com', 'cmp_1')

      const lead = service.getById(leads[0].id, 'cmp_1')
      expect(lead).toBeDefined()
      expect(lead!.email).toBe('john@test.com')
    })

    it('should return null for non-existent lead', () => {
      const result = service.getById('nonexistent', 'cmp_1')
      expect(result).toBeNull()
    })
  })

  describe('updateStatus', () => {
    it('should update lead status', () => {
      const leads = service.uploadCSV('name,email\nJohn,john@test.com', 'cmp_1')

      service.updateStatus(leads[0].id, 'cmp_1', 'valid')

      const lead = service.getById(leads[0].id, 'cmp_1')
      expect(lead!.status).toBe('valid')
    })

    it('should throw for non-existent lead', () => {
      expect(() => service.updateStatus('nonexistent', 'cmp_1', 'valid')).toThrow()
    })
  })

  describe('delete', () => {
    it('should delete a lead', () => {
      const leads = service.uploadCSV('name,email\nJohn,john@test.com', 'cmp_1')

      service.delete(leads[0].id, 'cmp_1')

      const result = service.getById(leads[0].id, 'cmp_1')
      expect(result).toBeNull()
    })

    it('should throw for non-existent lead', () => {
      expect(() => service.delete('nonexistent', 'cmp_1')).toThrow()
    })
  })
})
