import { nanoid } from 'nanoid'
import type { Lead } from '../types/lead'

export class LeadService {
  private leads: Lead[] = []

  uploadCSV(csv: string, campaignId: string): Lead[] {
    const lines = csv.trim().split('\n')
    if (lines.length < 2) return []

    const headers = this.parseCSVLine(lines[0])
    const leads: Lead[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i])
      if (values.length !== headers.length) continue

      const row: Record<string, string> = {}
      headers.forEach((h, idx) => {
        row[h.trim().toLowerCase()] = values[idx]?.trim() ?? ''
      })

      const email = row['email'] || row['e-mail'] || row['email_address']
      if (!email) continue

      const fullName = row['name'] || row['full_name'] || row['contact_name'] || ''
      const [first_name, ...lastParts] = fullName.split(' ')
      const last_name = lastParts.join(' ') || undefined

      const lead: Lead = {
        id: nanoid(),
        campaign_id: campaignId,
        email,
        first_name: first_name || undefined,
        last_name,
        company: row['company'] || row['company_name'] || undefined,
        title: row['title'] || row['job_title'] || undefined,
        linkedin_url: row['linkedin_url'] || row['linkedin'] || undefined,
        phone: row['phone'] || row['phone_number'] || undefined,
        status: 'pending',
        created_at: new Date().toISOString(),
      }

      leads.push(lead)
      this.leads.push(lead)
    }

    return leads
  }

  private parseCSVLine(line: string): string[] {
    const values: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        values.push(current)
        current = ''
      } else {
        current += char
      }
    }
    values.push(current)
    return values
  }

  list(campaignId: string): Lead[] {
    return this.leads.filter(l => l.campaign_id === campaignId)
  }

  getById(id: string, campaignId: string): Lead | null {
    return this.leads.find(l => l.id === id && l.campaign_id === campaignId) || null
  }

  updateStatus(id: string, campaignId: string, status: Lead['status']): Lead {
    const index = this.leads.findIndex(l => l.id === id && l.campaign_id === campaignId)
    if (index === -1) throw new Error(`Lead ${id} not found`)

    this.leads[index] = { ...this.leads[index], status }
    return this.leads[index]
  }

  delete(id: string, campaignId: string): void {
    const index = this.leads.findIndex(l => l.id === id && l.campaign_id === campaignId)
    if (index === -1) throw new Error(`Lead ${id} not found`)

    this.leads.splice(index, 1)
  }
}
