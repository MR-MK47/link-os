# Link OS — Setup Guide

This guide will help you get all the API keys and run Link OS locally.

---

## Step 1: Get API Keys (Free, No Credit Card)

### 1.1 Turso Database (Already Created) ✅

You already have the database: `libsql://linkos-mk-47.aws-ap-south-1.turso.io`

**To get the auth token:**
1. Go to [turso.tech](https://turso.tech) and log in
2. Click on your database `linkos-mk-47`
3. Click **"Database Auth Token"** in the sidebar
4. Click **"Generate Token"**
5. Copy the token (starts with `eyJ...`)
6. Paste it in `backend/.env.local` as `TURSO_AUTH_TOKEN`

---

### 1.2 Clerk Auth (Google Login)

**Get Publishable Key (Frontend):**
1. Go to [clerk.com](https://clerk.com) → Sign up (free)
2. Click **"Add Application"** → Choose **"Web App"**
3. Give it a name (e.g., "Link OS")
4. On the dashboard, go to **"API Keys"** (left sidebar)
5. Copy the **"Publishable Key"** (starts with `pk_clerk_...`)
6. Paste in `frontend/.env.local` as `VITE_CLERK_PUBLISHABLE_KEY`

**Get Secret Key (Backend):**
1. In the same Clerk dashboard, go to **"API Keys"**
2. Copy the **"Secret Key"** (starts with `sk_clerk_...`)
3. Paste in `backend/.env.local` as `CLERK_SECRET_KEY`

**Enable Google Sign-In:**
1. In Clerk dashboard, go to **"Authentication"** → **"Social Connection"**
2. Click **"Google"** → Enable it
3. You'll need a Google Cloud OAuth client ID (see below)

---

### 1.3 Google OAuth (For Gmail Connection)

**Create OAuth Client:**
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click **"Select a project"** → **"New Project"**
3. Name it "Link OS" → Create
4. Go to **"APIs & Services"** → **"Credentials"**
5. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
6. Click **"Configure Consent"** → Choose **"External"** → Create
7. Fill in:
   - App name: `Link OS`
   - User support email: your email
   - Developer contact: your email
8. Go back to **"Credentials"** → Create OAuth client ID again
9. Application type: **"Web application"**
10. Name: `Link OS Web Client`
11. Under **"Authorized JavaScript origins"**:
    - Add: `http://localhost:5173`
    - Add: `http://localhost:8787`
12. Under **"Authorized redirect URIs"**:
    - Add: `http://localhost:8787/api/auth/google/callback`
13. Click **"Create"**
14. Copy the **Client ID** and **Client Secret**
15. Paste in `backend/.env.local`:
    - `GMAIL_CLIENT_ID=your_client_id`
    - `GMAIL_CLIENT_SECRET=your_client_secret`

**Also add to Google Cloud:**
1. Go to **"APIs & Services"** → **"Library"**
2. Search for **"Gmail API"** → Enable it
3. Search for **"Google People API"** → Enable it

---

### 1.4 Microsoft Graph API (For Outlook/Hotmail)

**Create Azure App:**
1. Go to [portal.azure.com](https://portal.azure.com) → Sign in with your Microsoft account
2. Search for **"Azure Active Directory"** → Click it
3. Click **"App registrations"** → **"+ New registration"**
4. Name: `Link OS`
5. Supported account types: **"Personal Microsoft accounts only"**
6. Redirect URI:
   - Platform: Web
   - URL: `http://localhost:8787/api/auth/microsoft/callback`
7. Click **"Register"**
8. Copy the **"Application (client) ID"**
9. Go to **"Certificates & secrets"** → **"+ New client secret"**
10. Description: `Link OS Secret`
11. Expires: **12 months**
12. Click **"Add"** → Copy the secret value
13. Go to **"API permissions"** → **"+ Add a permission"**
14. Select **"Microsoft Graph"** → **"Delegated permissions"**
15. Search and add:
    - `Mail.ReadWrite`
    - `Mail.Send`
    - `User.Read`
16. Click **"Grant admin consent"** (if available)
17. Paste in `backend/.env.local`:
    - `MICROSOFT_GRAPH_CLIENT_ID=your_client_id`
    - `MICROSOFT_GRAPH_CLIENT_SECRET=your_secret`

---

### 1.5 OpenRouter AI (Draft Generation)

**Get API Key (Free Tier):**
1. Go to [openrouter.ai](https://openrouter.ai)
2. Click **"Sign Up"** → Use Google or email
3. After signup, go to **"Settings"** → **"API Keys"**
4. Click **"+ Create Key"**
5. Name it `Link OS`
6. Copy the key (starts with `sk-or-v1-...`)
7. Paste in `backend/.env.local` as `OPENROUTER_API_KEY`

**Free Tier:**
- DeepSeek R1: 60 requests/day
- Qwen3: 60 requests/day
- Enough for MVP testing

---

### 1.6 Cloudflare (Backend Hosting)

**Get Account ID and API Token:**
1. Go to [cloudflare.com](https://cloudflare.com) → Sign up (free)
2. After signup, go to **"Your zones"** → Click on your domain (or create one)
3. Go to **"API Tokens"** → **"Create Token"**
4. Click **"Use template"** → **"Edit Cloudflare Workers"**
5. Click **"Continue to summary"** → **"Create Token"**
6. Copy the token (starts with `...`)
7. Go to **"Account Home"** → Your account ID is in the right sidebar
8. Paste in `backend/.env.local`:
    - `CLOUDFLARE_API_TOKEN=your_token`
    - `CLOUDFLARE_ACCOUNT_ID=your_account_id`

---

### 1.7 Vercel (Frontend Hosting)

**Get Token:**
1. Go to [vercel.com](https://vercel.com) → Sign up (free)
2. Click your avatar → **"Settings"** → **"Tokens"**
3. Click **"+ Generate Token"**
4. Name it `Link OS`
5. Copy the token
6. Paste in `backend/.env.local` as `VERCEL_TOKEN`
7. Go to **"Settings"** → **"General"** → Copy your **"Organization ID"**
8. Paste in `backend/.env.local` as `VERCEL_ORG_ID`
9. Deploy your frontend repo to Vercel, then copy the **"Project ID"**
10. Paste in `backend/.env.local` as `VERCEL_PROJECT_ID`

---

## Step 2: Configure .env.local Files

### Backend (.env.local)
Copy and fill in:
```bash
cd C:/Users/mkazi/projects/business-automations/link-os/backend
copy .env.example .env.local
notepad .env.local
```

Fill in:
```env
DATABASE_URL=libsql://linkos-mk-47.aws-ap-south-1.turso.io
TURSO_AUTH_TOKEN=your_turso_token_here

CLERK_PUBLISHABLE_KEY=pk_clerk_your_key
CLERK_SECRET_KEY=sk_clerk_your_key

OPENROUTER_API_KEY=sk-or-v1-your_key

GMAIL_CLIENT_ID=your_google_client_id
GMAIL_CLIENT_SECRET=your_google_client_secret

MICROSOFT_GRAPH_CLIENT_ID=your_microsoft_client_id
MICROSOFT_GRAPH_CLIENT_SECRET=your_microsoft_client_secret

JWT_SECRET=any_random_string_here

CLOUDFLARE_API_TOKEN=your_cloudflare_token
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id

VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
```

### Frontend (.env.local)
```bash
cd C:/Users/mkazi/projects/business-automations/link-os/frontend
copy .env.example .env.local
notepad .env.local
```

Fill in:
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_clerk_your_key
VITE_API_URL=http://localhost:8787
```

---

## Step 3: Run the Project

### Option A: Local Development (Testing)

**Terminal 1 — Backend:**
```bash
cd C:/Users/mkazi/projects/business-automations/link-os/backend
npm run dev
```
You should see: `Server running on http://localhost:8787`

**Terminal 2 — Frontend:**
```bash
cd C:/Users/mkazi/projects/business-automations/link-os/frontend
npm run dev
```
You should see: `Local: http://localhost:5173/`

**Open in browser:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8787/api/campaigns

### Option B: Run Tests Only
```bash
cd C:/Users/mkazi/projects/business-automations/link-os/backend
npm test
```
Expected: `36 tests passed`

---

## Step 4: Test the Website (Test Case)

### Test Case 1: Sign Up and Login
1. Open http://localhost:5173
2. Click **"Sign In"**
3. Choose **"Continue with Google"**
4. Select your Google account
5. You should see the dashboard (empty for now)

### Test Case 2: Create a Campaign
1. Click **"New Campaign"**
2. Fill in:
   - Name: `Roofing Outreach - UK`
   - Status: `Draft`
3. Click **"Create"**
4. You should see the campaign in the list

### Test Case 3: Upload Leads (CSV)
1. Go to your campaign
2. Click **"Upload Leads"**
3. Upload this CSV file (create it first):

```csv
name,email,company,title
John Smith,john@roofingco.uk,Roofing Co,Manager
Sarah Jones,sarah@buildingservices.co.uk,Building Services,Director
Mike Brown,mike@concreteworks.com,Concrete Works,Owner
```

4. You should see 3 leads added
5. Check each lead has a validation status

### Test Case 4: Generate Drafts (AI)
1. In the campaign, click **"Generate Drafts"**
2. Wait 5-10 seconds
3. You should see AI-generated drafts for each lead
4. Review each draft (should be natural English, not AI-sounding)
5. Click **"Approve"** on drafts you like

### Test Case 5: Send Email (Draft Mode)
1. Go to **"Drafts"**
2. Click on an approved draft
3. Click **"Send via Gmail"** (if connected)
4. OR click **"Save as Draft"** to send from your Gmail manually
5. Check your Gmail — you should see the draft

### Test Case 6: View Analytics
1. Go to **"Dashboard"**
2. You should see:
   - Total campaigns: 1
   - Total leads: 3
   - Emails sent: 0
   - Response rate: 0%

---

## Step 5: Troubleshooting

| Problem | Solution |
|---------|----------|
| `fetch failed` on tests | Make sure you're running `npm test` not trying to connect to Turso |
| Google login fails | Check Clerk Google OAuth is enabled and redirect URLs match |
| API returns 404 | Backend might not be running — check `npm run dev` in backend |
| CORS errors | Frontend proxy should handle this, check vite.config.ts |
| Turso connection fails | Make sure TURSO_AUTH_TOKEN is correct and database is active |

---

## Quick Commands Reference

```bash
# Run backend tests
cd backend && npm test

# Run frontend tests
cd frontend && npm test

# Run backend dev server
cd backend && npm run dev

# Run frontend dev server
cd frontend && npm run dev

# Build for production
npm run build

# Deploy backend to Cloudflare
cd backend && npx wrangler deploy

# Deploy frontend to Vercel
cd frontend && npx vercel --prod
```

---

## Next Steps After Setup

1. Connect Turso database (provide TURSO_AUTH_TOKEN)
2. Set up Clerk auth
3. Connect Gmail OAuth
4. Build the frontend pages
5. Deploy to production
