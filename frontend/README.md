# Link OS — Frontend

React + Vite frontend built with TypeScript.

## Tech Stack
- React 18
- TypeScript 5
- Vite
- shadcn/ui + Tailwind CSS
- TanStack Query
- Clerk (auth)
- Vitest (testing)

## Setup
```bash
npm install
npm run dev
```

## Environment Variables
Create `frontend/.env.local`:
```
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
VITE_API_URL=http://localhost:8787
```

## Testing
```bash
npm test              # Run all tests
npm run test:unit     # Unit tests only
```

## TDD Workflow
Same as backend — write test first, watch it fail, implement to pass.
