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

describe('Database Connection', () => {
  it('should connect to in-memory database', async () => {
    const result = await db.execute('SELECT 1 as test')
    expect(result.rows[0].test).toBe(1)
  })

  it('should create campaigns table', async () => {
    await db.execute(`
      CREATE TABLE campaigns (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    const result = await db.execute(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='campaigns'"
    )
    expect(result.rows.length).toBe(1)
  })

  it('should insert and retrieve a campaign', async () => {
    await db.execute(`
      CREATE TABLE campaigns (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await db.execute(
      'INSERT INTO campaigns (id, user_id, name) VALUES (?, ?, ?)',
      ['cmp_1', 'user_1', 'Test Campaign']
    )

    const result = await db.execute(
      'SELECT * FROM campaigns WHERE id = ?',
      ['cmp_1']
    )
    expect(result.rows.length).toBe(1)
    expect(result.rows[0].name).toBe('Test Campaign')
  })
})

export { db }
