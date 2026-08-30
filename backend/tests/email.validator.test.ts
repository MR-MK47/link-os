import { describe, it, expect } from 'vitest'
import { EmailValidator } from '../src/services/email.validator'

describe('EmailValidator', () => {
  let validator: EmailValidator

  beforeEach(() => {
    validator = new EmailValidator()
  })

  describe('syntax', () => {
    it('should validate correct email format', () => {
      expect(validator.validateSyntax('john@example.com')).toBe(true)
      expect(validator.validateSyntax('john.doe@company.co.uk')).toBe(true)
      expect(validator.validateSyntax('user+tag@example.com')).toBe(true)
    })

    it('should reject invalid email formats', () => {
      expect(validator.validateSyntax('notanemail')).toBe(false)
      expect(validator.validateSyntax('@example.com')).toBe(false)
      expect(validator.validateSyntax('user@')).toBe(false)
      expect(validator.validateSyntax('')).toBe(false)
      expect(validator.validateSyntax('user at example.com')).toBe(false)
    })
  })

  describe('extractDomain', () => {
    it('should extract domain from email', () => {
      expect(validator.extractDomain('john@example.com')).toBe('example.com')
      expect(validator.extractDomain('user@sub.example.com')).toBe('sub.example.com')
    })

    it('should return null for invalid email', () => {
      expect(validator.extractDomain('notanemail')).toBeNull()
      expect(validator.extractDomain('')).toBeNull()
    })
  })

  describe('validate', () => {
    it('should return valid status for correct email', () => {
      const result = validator.validate('john@example.com')
      expect(result.valid).toBe(true)
      expect(result.status).toBe('valid')
      expect(result.confidence).toBeGreaterThan(0)
    })

    it('should return invalid status for bad email', () => {
      const result = validator.validate('notanemail')
      expect(result.valid).toBe(false)
      expect(result.status).toBe('invalid')
      expect(result.reason).toBe('invalid_syntax')
    })

    it('should return unknown status for empty email', () => {
      const result = validator.validate('')
      expect(result.valid).toBe(false)
      expect(result.status).toBe('unknown')
    })
  })
})
