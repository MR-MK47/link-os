# Link OS — Project Specification

**Version:** 1.0
**Status:** Planning — pre-implementation
**Date:** 2026-08-30

---

## 1. Product Overview

### 1.1 What It Is
Link OS is a web-based operating platform for a connector/business-development business. It replaces a scattered workflow of Python scripts, spreadsheets, and manual email with a single browser-based interface that manages the entire outreach lifecycle: leads → campaigns → outreach → responses → analytics.

### 1.2 What It Is Not
- Not an automatic lead-scraping tool (user collects leads externally)
- Not an AI chatbot platform
- Not a general CRM — it's purpose-built for outreach sequencing
- Not dependent on OmniRoute at runtime

### 1.3 Success Criteria
The user can go from zero to a live outreach campaign in one session: sign in, create a campaign, upload a CSV of leads, validate emails, write/approve 2–3 outreach drafts, schedule sends, and see responses come back — all from the browser, on any device, without their PC being on.

---

## 2. User Flows

### 2.1 Primary Flow: Campaign → Leads → Send → Track

```
Sign in (Google OAuth)
  └─► Dashboard (overview of all campaigns)
       ├─► Create Campaign (name, niche, description)
       │    ├─► Upload Leads (CSV/Excel with column mapping)
       │    │    ├─► Parse & validate columns
       │    │    ├─► Show import preview
       │    │    └─► Confirm import → leads saved
       │    ├─► Validate Emails (syntax → MX → SMTP confidence scoring)
       │    │    └─► Show confidence levels (high / medium / low)
       │    ├─► Create Sequence (step 1: subject + body, delays, step 2…)
       │    │    └─► AI generates draft based on campaign context
       │    ├─► Generate Drafts per lead (one per lead, personalized)
       │    │    └─► Drafts land in Drafts queue
       │    ├─► Review Drafts (approve/reject/edit, batch approve)
       │    │    └─► Approved drafts → send queue
       │    ├─► Send (respect account rate limits, rotate accounts)
       │    │    └─► Track send status per lead
       │    └─► Monitor (responses arrive → update lead status → analytics update)
       └─► Analytics (campaign-level + global dashboard)
```

### 2.2 Lead Upload Flow

```
CSV/Excel upload
  └─► Parse headers
       └─► Auto-detect columns (name, email, company, title, linkedin_url, notes, source)
            └─► Allow manual column mapping if auto-detect is uncertain
                 └─► Show first 5 rows as preview
                      └─► User confirms → bulk insert into campaign
```

### 2.3 Email Validation Flow

```
For each uploaded lead:
  ├─► Syntax check (regex)
  ├─► Domain check (DNS MX records)
  ├─► SMTP check (connect to mail server, test address)
  └─► Confidence score (high = syntax + MX + SMTP pass; low = fails any)
       └─► Display: ✅ high | ⚠️ medium | ❌ low
```

### 2.4 Draft Generation & Review Flow

```
User clicks "Generate Drafts"
  └─► AI (OpenRouter) generates 2–3 outreach variants per lead
       └─► Variants stored as drafts (status: pending)
            └─► User reviews in Drafts page
                 ├─► Edit text inline
                 ├─► Approve (→ status: approved)
                 └─► Reject (→ status: rejected, not sent)
                      └─► Batch approve all approved drafts → send queue
```

### 2.5 Sending Flow

```
Send queue populated
  └─► For each approved draft:
       ├─► Pick next available email account (round-robin)
       ├─► Check account daily limit (max 20/day)
       ├─► Send via Gmail API or Microsoft Graph API
       ├─► Record send event (timestamp, account, status)
       └─► Update lead status: New → Contacted
```

### 2.6 Response Tracking Flow

```
Email provider webhook / poll
  └─► Incoming reply matched to lead
       └─► Update lead status: Contacted → Responded
            └─► Show in Drafts as "Reply Suggestion" (AI-generated quick reply)
                 └─► User reviews → sends or writes own reply
                      └─► Lead status → Closed (if deal) or stays Responded
```

---

## 3. Technical Architecture

### 3.1 Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | React 18 + TypeScript + Vite | Fast, modern, shadcn/ui ready |
| UI Components | shadcn/ui + Tailwind CSS | Accessible, consistent, low bundle |
| Backend | Cloudflare Workers + Hono.js | Zero cold-start, free tier, global |
| Database | Turso (SQLite) | Serverless-friendly, cheap, SQL |
| Auth | Clerk (Google OAuth) | Drop-in, well-maintained |
| AI | OpenRouter (DeepSeek R1, Qwen3) | Provider abstraction, free tier models |
| Email | Gmail API + Microsoft Graph API (direct OAuth) | No third-party relay needed |
| Hosting | Cloudflare Pages (frontend) + Workers (backend) | PC-independent, free tier sufficient |

### 3.2 Directory Structure

```
link-os/
├── frontend/
│   ├── src/
│   │   ├── components/       # shadcn/ui + custom components
│   │   ├── pages/            # Dashboard, Campaigns, Leads, Drafts, Analytics, Settings
│   │   ├── lib/              # API client, auth helpers, utils
│   │   ├── hooks/            # useCampaign, useLeads, useDrafts
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
├── backend/
│   ├── src/
│   │   ├── routes/           # Hono route handlers
│   │   ├── db/               # Turso client, migrations
│   │   ├── services/         # Email validation, AI drafting, sending
│   │   ├── middleware/       # Auth guard, rate limiting
│   │   └── index.ts          # Worker entry point
│   ├── wrangler.toml
│   ├── package.json
│   └── tsconfig.json
├── package.json              # Root (monorepo scripts)
└── PROJECT_SPEC.md
```

### 3.3 Hosting & Deployment

- **Frontend:** Cloudflare Pages (CI/CD from git push)
- **Backend:** Cloudflare Workers (wrangler deploy)
- **Database:** Turso (serverless SQLite, geo-replicated)
- **Auth:** Clerk hosted (no infrastructure to manage)
- **Result:** Zero always-on infrastructure; free tiers cover early usage

---

## 4. Database Schema

### 4.1 Users
```sql
CREATE TABLE users (
  id            TEXT PRIMARY KEY,  -- Clerk user ID
  email         TEXT NOT NULL UNIQUE,
  name          TEXT,
  created_at    INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at    INTEGER NOT NULL DEFAULT (unixepoch())
);
```

### 4.2 Campaigns
```sql
CREATE TABLE campaigns (
  id            TEXT PRIMARY KEY,  -- UUID
  user_id       TEXT NOT NULL REFERENCES users(id),
  name          TEXT NOT NULL,
  niche         TEXT,              -- e.g. "Roofing", "Wealth Management"
  description   TEXT,
  status        TEXT NOT NULL DEFAULT 'active',  -- active | archived
  created_at    INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at    INTEGER NOT NULL DEFAULT (unixepoch())
);
```

### 4.3 Leads
```sql
CREATE TABLE leads (
  id            TEXT PRIMARY KEY,
  campaign_id   TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  name          TEXT,
  email         TEXT,
  company       TEXT,
  title         TEXT,
  linkedin_url  TEXT,
  phone         TEXT,
  industry      TEXT,
  location      TEXT,
  source        TEXT,              -- where the lead was collected
  notes         TEXT,
  status        TEXT NOT NULL DEFAULT 'new',  -- new | contacted | responded | closed
  validated     INTEGER NOT NULL DEFAULT 0,
  validation_confidence TEXT DEFAULT NULL,  -- high | medium | low
  created_at    INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at    INTEGER NOT NULL DEFAULT (unixepoch())
);
```

### 4.4 Email Sequences
```sql
CREATE TABLE email_sequences (
  id            TEXT PRIMARY KEY,
  campaign_id   TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,     -- e.g. "Initial outreach", "Follow-up 1"
  step_number   INTEGER NOT NULL,  -- 1, 2, 3…
  delay_days    INTEGER NOT NULL DEFAULT 3,  -- days after previous step
  subject       TEXT,
  body          TEXT NOT NULL,
  created_at    INTEGER NOT NULL DEFAULT (unixepoch())
);
```

### 4.5 Drafts
```sql
CREATE TABLE drafts (
  id            TEXT PRIMARY KEY,
  lead_id       TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  sequence_id   TEXT REFERENCES email_sequences(id),
  status        TEXT NOT NULL DEFAULT 'pending',  -- pending | approved | rejected
  subject       TEXT,
  body          TEXT NOT NULL,
  generated_by  TEXT DEFAULT 'ai',  -- ai | manual
  created_at    INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at    INTEGER NOT NULL DEFAULT (unixepoch())
);
```

### 4.6 Email Accounts
```sql
CREATE TABLE email_accounts (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id),
  provider      TEXT NOT NULL,      -- gmail | outlook
  email_address TEXT NOT NULL,
  display_name  TEXT,
  daily_limit   INTEGER NOT NULL DEFAULT 20,
  emails_sent_today INTEGER NOT NULL DEFAULT 0,
  is_active     INTEGER NOT NULL DEFAULT 1,
  oauth_token   TEXT,              -- encrypted
  created_at    INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at    INTEGER NOT NULL DEFAULT (unixepoch())
);
```

### 4.7 Send Events
```sql
CREATE TABLE send_events (
  id            TEXT PRIMARY KEY,
  draft_id      TEXT NOT NULL REFERENCES drafts(id),
  lead_id       TEXT NOT NULL REFERENCES leads(id),
  account_id    TEXT NOT NULL REFERENCES email_accounts(id),
  sequence_id   TEXT REFERENCES email_sequences(id),
  sent_at       INTEGER NOT NULL DEFAULT (unixepoch()),
  status        TEXT NOT NULL,      -- sent | bounced | failed
  reply_to      TEXT,              -- thread ID from email provider
  created_at    INTEGER NOT NULL DEFAULT (unixepoch())
);
```

### 4.8 Response Events
```sql
CREATE TABLE response_events (
  id            TEXT PRIMARY KEY,
  lead_id       TEXT NOT NULL REFERENCES leads(id),
  send_event_id TEXT REFERENCES send_events(id),
  received_at   INTEGER NOT NULL DEFAULT (unixepoch()),
  subject       TEXT,
  snippet       TEXT,              -- first 200 chars of reply
  ai_suggested_reply TEXT,         -- pre-generated reply text
  status        TEXT NOT NULL DEFAULT 'new',  -- new | replied | closed
  created_at    INTEGER NOT NULL DEFAULT (unixepoch())
);
```

### 4.9 Indexes
```sql
CREATE INDEX idx_leads_campaign ON leads(campaign_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_drafts_lead ON drafts(lead_id);
CREATE INDEX idx_drafts_status ON drafts(status);
CREATE INDEX idx_send_events_lead ON send_events(lead_id);
CREATE INDEX idx_send_events_account ON send_events(account_id, sent_at);
CREATE INDEX idx_response_events_lead ON response_events(lead_id);
CREATE INDEX idx_campaigns_user ON campaigns(user_id);
```

---

## 5. API Endpoints

### 5.1 Auth (Clerk-managed, backend verifies session)
```
POST   /api/auth/verify          # Verify Clerk session, return user
```

### 5.2 Dashboard
```
GET    /api/dashboard            # Aggregate stats: total leads, sent, responses, deals, revenue
```

### 5.3 Campaigns
```
GET    /api/campaigns            # List all campaigns for current user
POST   /api/campaigns            # Create campaign
GET    /api/campaigns/:id        # Campaign detail + stats
PATCH  /api/campaigns/:id        # Update campaign (name, niche, description)
DELETE /api/campaigns/:id        # Archive campaign (soft delete)
```

### 5.4 Leads
```
GET    /api/campaigns/:id/leads           # List leads with pagination/filter
POST   /api/campaigns/:id/leads/upload    # Upload CSV/Excel (multipart)
GET    /api/leads/:id                     # Lead detail + full activity history
PATCH  /api/leads/:id                     # Update lead (status, notes, etc.)
POST   /api/leads/:id/validate            # Trigger email validation
GET    /api/leads/:id/validation          # Get validation result
```

### 5.5 Sequences
```
GET    /api/campaigns/:id/sequences       # List sequences for campaign
POST   /api/campaigns/:id/sequences       # Create sequence step
PATCH  /api/campaigns/:id/sequences/:sid  # Update sequence step
DELETE /api/campaigns/:id/sequences/:sid  # Delete sequence step
```

### 5.6 Drafts
```
GET    /api/campaigns/:id/drafts          # List drafts (filterable by status)
GET    /api/drafts/:id                    # Draft detail
PATCH  /api/drafts/:id                    # Edit draft (subject, body)
POST   /api/drafts/:id/approve            # Approve draft
POST   /api/drafts/:id/reject             # Reject draft
POST   /api/campaigns/:id/drafts/generate # AI generate drafts for all un-drafted leads
POST   /api/drafts/batch-approve          # Bulk approve all pending drafts
```

### 5.7 Sending
```
POST   /api/campaigns/:id/send            # Send all approved drafts for campaign
POST   /api/drafts/:id/send               # Send individual draft
GET    /api/campaigns/:id/send-status     # Check send progress
POST   /api/email-accounts/:id/rotate     # Manual account rotation (reset daily count)
```

### 5.8 Email Accounts
```
GET    /api/email-accounts                # List accounts
POST   /api/email-accounts                # Add account (OAuth flow redirect)
PATCH  /api/email-accounts/:id            # Update account (daily limit, active)
DELETE /api/email-accounts/:id            # Remove account
```

### 5.9 Responses
```
GET    /api/campaigns/:id/responses       # List responses
POST   /api/responses/:id/reply           # Send reply (with optional AI suggestion)
PATCH  /api/responses/:id                 # Update response status
```

### 5.10 Analytics
```
GET    /api/campaigns/:id/analytics       # Campaign-level metrics
GET    /api/analytics/overall             # Cross-campaign aggregate metrics
GET    /api/analytics/trends              # Time-series: sends, responses, revenue over time
```

### 5.11 AI (OpenRouter)
```
POST   /api/ai/draft           # Generate outreach draft (subject + body)
POST   /api/ai/reply-suggest   # Generate suggested reply to incoming email
POST   /api/ai/validate-sanity # AI sanity check on email content (natural language check)
```

---

## 6. Milestones

### M1 — Project Scaffold & Auth (Week 1)
**Goal:** Empty project with Clerk auth, basic routing, shared TypeScript config.
- Initialize monorepo (frontend + backend)
- Set up Vite + React + TypeScript + Tailwind + shadcn/ui
- Set up Hono + Cloudflare Workers + TypeScript
- Configure Clerk (Google OAuth)
- Create basic navigation layout (sidebar, topbar)
- Auth guard middleware on all backend routes
- **Deliverable:** User can sign in with Google and see a logged-in dashboard shell

### M2 — Database & Campaign CRUD (Week 2)
**Goal:** Users can create and manage campaigns.
- Set up Turso database, run initial migration
- Implement all campaign endpoints (CRUD)
- Campaign list page + campaign detail page
- Campaign analytics placeholder (totals, not yet wired)
- **Deliverable:** Full campaign lifecycle from creation to archive

### M3 — Lead Upload & Validation (Week 3)
**Goal:** Upload leads from CSV/Excel and validate emails.
- CSV/Excel parser with column auto-detection and mapping UI
- Bulk lead insert API
- Email validation service: syntax → DNS MX → SMTP confidence scoring
- Lead list page with filters (status, validation confidence)
- Validation result display on lead rows
- **Deliverable:** End-to-end: upload a CSV, see leads with validation scores

### M4 — Sequences & Draft Generation (Week 4)
**Goal:** Create outreach sequences and generate AI drafts.
- Sequence CRUD (steps with delays)
- AI draft generation service (OpenRouter abstraction)
- Draft list page with approve/reject/edit
- Draft preview with personalization tokens ({{name}}, {{company}})
- Natural-language sanity check (no AI-sounding phrases)
- **Deliverable:** Generate 2–3 outreach drafts per lead, review and approve them

### M5 — Email Account Management & Sending (Week 5)
**Goal:** Connect email accounts and send approved drafts.
- Gmail API + Microsoft Graph OAuth flow
- Account storage (encrypted tokens)
- Send service with account rotation and 20/day limit per account
- Send queue + send event tracking
- Lead status auto-update on send (new → contacted)
- **Deliverable:** Approved drafts actually get sent from connected email accounts

### M6 — Response Tracking & Reply Suggestions (Week 6)
**Goal:** Track incoming replies and suggest quick responses.
- Email provider webhook/polling for replies
- Response event storage + lead status update (contacted → responded)
- AI-generated reply suggestions
- Reply sending flow (user reviews → sends)
- Activity timeline on lead detail page
- **Deliverable:** Replies appear in the system with suggested responses

### M7 — Analytics Dashboard (Week 7)
**Goal:** Campaign and global analytics.
- Campaign analytics: leads, sent, responses, response rate, deals, revenue
- Overall analytics: aggregate across all campaigns
- Time-series trends chart
- Dashboard page with KPI cards and charts
- **Deliverable:** Dashboard shows real metrics; campaign pages show performance data

### M8 — Polish & Deployment (Week 8)
**Goal:** Production-ready, deployable system.
- Mobile-responsive layout audit
- Error boundaries on all async operations
- Loading states, empty states, edge-case handling
- CI/CD: Cloudflare Pages + Workers deploy on push
- Turso database provisioned in production
- End-to-end smoke test: sign in → create campaign → upload leads → generate drafts → send → view analytics
- **Deliverable:** Live at a URL, works from any device, PC-independent

---

## 7. Key Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Email deliverability** — Gmail/Outlook flag bulk-sent outreach as spam | High | High | Rotate accounts, respect 20/day limit, use natural language, warm up accounts gradually |
| **OAuth token expiry** — Email provider tokens refresh unexpectedly | Medium | High | Store refresh tokens, auto-refresh on 401, alert user when re-auth needed |
| **Turso connection limits** — Serverless SQLite has concurrency limits | Medium | Medium | Use connection pooling (libsql), keep queries simple, monitor usage |
| **AI draft quality** — Generated text sounds robotic or off-tone | Medium | Medium | Use natural-language prompt templates, sanity-check endpoint, user-in-the-loop review mandatory |
| **Cloudflare Workers cold starts** — Slow first response after inactivity | Low | Medium | Workers have sub-second cold starts; not a major concern for this traffic level |
| **Clerk free tier limits** — 10k MAU limit may be tight | Low | Low | MVP user is a single person; this is not a risk until scaling |
| **CSV import failures** — Bad data from user uploads breaks import | Medium | Low | Validate on upload, show clear error rows, never silently drop leads |
| **No auto-scaling on Workers** — Sudden traffic spike could hit limits | Low | Medium | Daily sending cap (20/account) naturally limits traffic; not a concern for single-user MVP |

---

## 8. Out of Scope (MVP)

- Automated lead scraping / sourcing
- LinkedIn or Instagram integration
- Brevo / SMTP relay
- OmniRoute as a runtime dependency
- Multi-user / team features
- Revenue tracking beyond basic deal status
- Advanced AI orchestration (multi-step reasoning inside the product)
- Mobile app (web-responsive is sufficient for MVP)

---

## 9. Open Decisions

| Decision | Options | Recommended | Rationale |
|----------|---------|-------------|-----------|
| AI model for drafts | DeepSeek R1 vs Qwen3 vs GPT-4o | DeepSeek R1 via OpenRouter | Free tier, strong at creative writing, provider-agnostic |
| Email validation depth | MX-only vs full SMTP probe | MX + SMTP confidence scoring | User explicitly wants more than syntax check |
| Draft personalization | Full name/company tokens vs minimal | {{name}} + {{company}} only | Avoid over-personalization that sounds fake |
| Response tracking | Webhook vs periodic polling | Polling every 5 min (simpler, no public endpoint needed) | Lower operational complexity for MVP |
| Revenue field | Free-text notes vs structured amount | Structured: deal_status (open / closed-won / closed-lost) + notes | Enough for analytics without over-engineering |
