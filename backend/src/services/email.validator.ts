export interface ValidationResult {
  email: string
  valid: boolean
  status: 'valid' | 'invalid' | 'unknown'
  reason?: string
  confidence: number
}

export class EmailValidator {
  private readonly emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  validateSyntax(email: string): boolean {
    return this.emailRegex.test(email)
  }

  extractDomain(email: string): string | null {
    if (!this.validateSyntax(email)) return null
    return email.split('@')[1]
  }

  validate(email: string): ValidationResult {
    if (!email || email.trim() === '') {
      return { email, valid: false, status: 'unknown', confidence: 0 }
    }

    if (!this.validateSyntax(email)) {
      return { email, valid: false, status: 'invalid', reason: 'invalid_syntax', confidence: 0 }
    }

    // Syntax is valid - basic confidence
    const domain = this.extractDomain(email)
    if (!domain) {
      return { email, valid: false, status: 'unknown', confidence: 0.3 }
    }

    // Check for common disposable email domains
    const disposableDomains = [
      'tempmail.com', 'throwaway.email', 'guerrillamail.com',
      'mailinator.com', 'yopmail.com', 'trashmail.com'
    ]
    if (disposableDomains.some(d => domain.endsWith(d))) {
      return { email, valid: true, status: 'valid', reason: 'disposable_domain', confidence: 0.5 }
    }

    return { email, valid: true, status: 'valid', confidence: 0.8 }
  }
}
