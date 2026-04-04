import { createClient } from '@supabase/supabase-js'

let client = null

export const supabase = () => {
  if (!client) {
    client = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    )
  }
  return client
}
