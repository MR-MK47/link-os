import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createClient } from '@libsql/client'

// In-memory SQLite for tests (no Turso dependency)
let db: ReturnType<typeof createClient>

beforeEach(() => {
  db = createClient({
    url: ':memory:',
  })
})

afterEach(async () => {
  await db.close()
})

export { db }
