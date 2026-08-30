import { Hono } from 'hono'
import { z } from 'zod'
import { zodValidator } from 'hono/zod-validator'
import type { Campaign } from '../types/campaign'
import type { Lead } from '../types/lead'

// In-memory storage (replace with Turso later)
let campaigns: Campaign[] = []
let leads: Lead[] = []

const campaignService = {
  create: (input: { id: string; user_id: string; name: string; status?: string; notes?: string }) => {
    const campaign: Campaign = {
      ...input,
      status: input.status || 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    campaigns.push(campaign)
    return campaign
  },
  list: (userId: string) => campaigns.filter(c => c.user_id === userId),
  getById: (id: string, userId: string) => campaigns.find(c => c.id === id && c.user_id === userId) || null,
  update: (id: string, userId: string, input: Partial<Campaign>) => {
    const index = campaigns.findIndex(c => c.id === id && c.user_id === userId)
    if (index === -1) throw new Error(`Campaign ${id} not found`)
    campaigns[index] = { ...campaigns[index], ...input, updated_at: new Date().toISOString() }
    return campaigns[index]
  },
  delete: (id: string, userId: string) => {
    const index = campaigns.findIndex(c => c.id === id && c.user_id === userId)
    if (index === -1) throw new Error(`Campaign ${id} not found`)
    campaigns.splice(index, 1)
  },
}

const leadService = {
  uploadCSV: (csv: string, campaignId: string) => {
    const lines = csv.trim().split('\n')
    if (lines.length < 2) return []
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    const newLeads: Lead[] = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      if (values.length !== headers.length) continue
      const row: Record<string, string> = {}
      headers.forEach((h, idx) => { row[h] = values[idx] ?? '' })
      if (!row['email']) continue
      newLeads.push({
        id: Math.random().toString(36).substr(2, 9),
        campaign_id: campaignId,
        email: row['email'],
        first_name: row['name']?.split(' ')[0] || undefined,
        last_name: row['name']?.split(' ').slice(1).join(' ') || undefined,
        company: row['company'] || undefined,
        title: row['title'] || undefined,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
    }
    leads.push(...newLeads)
    return newLeads
  },
  list: (campaignId: string) => leads.filter(l => l.campaign_id === campaignId),
}

const api = new Hono()

// Campaigns
api.get('/api/campaigns', (c) => {
  const userId = c.req.query('user_id') || 'user_1'
  const data = campaignService.list(userId)
  return c.json({ data })
})

api.post('/api/campaigns', async (c) => {
  const body = await c.req.json()
  const campaign = campaignService.create({
    id: body.id || Math.random().toString(36).substr(2, 9),
    user_id: body.user_id || 'user_1',
    name: body.name,
    status: body.status,
    notes: body.notes,
  })
  return c.json({ data: campaign }, 201)
})

api.get('/api/campaigns/:id', (c) => {
  const id = c.req.param('id')
  const userId = c.req.query('user_id') || 'user_1'
  const campaign = campaignService.getById(id, userId)
  if (!campaign) return c.json({ error: { code: 'NOT_FOUND', message: 'Campaign not found' } }, 404)
  return c.json({ data: campaign })
})

api.patch('/api/campaigns/:id', async (c) => {
  const id = c.req.param('id')
  const userId = c.req.query('user_id') || 'user_1'
  const body = await c.req.json()
  const campaign = campaignService.update(id, userId, body)
  return c.json({ data: campaign })
})

api.delete('/api/campaigns/:id', (c) => {
  const id = c.req.param('id')
  const userId = c.req.query('user_id') || 'user_1'
  campaignService.delete(id, userId)
  return c.json({ data: { deleted: true } })
})

// Leads
api.post('/api/campaigns/:id/leads', async (c) => {
  const campaignId = c.req.param('id')
  const formData = await c.req.formData()
  const file = formData.get('file') as File
  if (!file) return c.json({ error: { code: 'BAD_REQUEST', message: 'No file uploaded' } }, 400)
  const csv = await file.text()
  const newLeads = leadService.uploadCSV(csv, campaignId)
  return c.json({ data: newLeads, meta: { count: newLeads.length } }, 201)
})

api.get('/api/campaigns/:id/leads', (c) => {
  const campaignId = c.req.param('id')
  const data = leadService.list(campaignId)
  return c.json({ data })
})

export default api
