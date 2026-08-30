import { serve } from '@hono/node-server'
import api from './routes'

const PORT = parseInt(process.env.PORT || '8787', 10)

serve({
  fetch: api.fetch,
  port: PORT,
})

console.log(`Server running on http://localhost:${PORT}`)
