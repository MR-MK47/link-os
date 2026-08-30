# Link OS — Project Rules

## Project: Link OS
Connector business automation platform for managing outreach workflows.

## Architecture
- Frontend: React 18 + TypeScript + Vite + shadcn/ui
- Backend: Cloudflare Workers + Hono.js + TypeScript
- Database: Turso (SQLite)
- Auth: Clerk (Google OAuth)
- AI: OpenRouter (DeepSeek R1, Qwen3)
- Email: Gmail API + Microsoft Graph API (direct OAuth)

## Key Principles
1. Draft-first: AI generates drafts, human reviews before sending
2. One lead per account: follow-ups always from same account
3. 20 emails/day per account max: protect sender reputation
4. Natural English only: no AI-sounding phrases
5. Free tier only: no credit card required services

## Code Standards
- TypeScript strict mode on
- No `any` types
- Error boundaries on all async operations
- API calls through backend only (never direct DB from frontend)
- Email validation: syntax → MX → AI sanity check
- All drafts human-reviewed before sending

## Non-Goals
- No automatic lead scraping
- No LinkedIn/Instagram automation
- No Brevo/SMTP relay
- No OmniRoute as runtime dependency
- No paid services in MVP

## Build Commands
- Frontend dev: `cd frontend && npm run dev`
- Backend dev: `cd backend && npm run dev`
- Tests: `npm test`
- Deploy: `npm run deploy`
