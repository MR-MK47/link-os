# Link OS — Backend

Cloudflare Workers backend built with Hono.js.

## Tech Stack
- TypeScript 5
- Hono.js (web framework)
- Turso (SQLite database)
- Vitest (testing)
- Wrangler (Cloudflare Workers CLI)

## Setup
```bash
npm install
npm run dev
```

## Environment Variables
Create `backend/.env.local`:
```
DATABASE_URL=libsql://linkos-mk-47.aws-ap-south-1.turso.io
TURSO_AUTH_TOKEN=your_token_here
CLERK_SECRET_KEY=your_clerk_key
OPENROUTER_API_KEY=your_openrouter_key
JWT_SECRET=your_jwt_secret
```

## Testing
```bash
npm test              # Run all tests
npm run test:unit     # Unit tests only
npm run test:integration  # Integration tests
```

## TDD Workflow
1. Write failing test first (RED)
2. Run test to confirm failure
3. Write minimal code to pass (GREEN)
4. Run test to confirm pass
5. Refactor if needed
6. Commit
