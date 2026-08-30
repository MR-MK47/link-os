export interface CampaignStats {
  totalLeads: number
  totalSent: number
  totalResponses: number
  responseRate: number
  leadsByStatus: Record<string, number>
}

export interface FormatCampaignInput {
  leads: Array<{ id: string; email: string; status: string }>
  drafts: Array<{ id: string; status: string }>
  emails: Array<{ lead_id: string; status: string }>
}

export function formatCampaignStats(input: FormatCampaignInput): CampaignStats {
  const totalLeads = input.leads.length
  const totalSent = input.emails.filter(e => e.status === 'sent').length
  const totalResponses = input.leads.filter(l => l.status === 'replied').length

  const responseRate = totalSent > 0
    ? Math.round((totalResponses / totalSent) * 100)
    : 0

  const leadsByStatus: Record<string, number> = {}
  for (const lead of input.leads) {
    leadsByStatus[lead.status] = (leadsByStatus[lead.status] || 0) + 1
  }

  return {
    totalLeads,
    totalSent,
    totalResponses,
    responseRate,
    leadsByStatus,
  }
}
