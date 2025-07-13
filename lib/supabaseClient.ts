import { createClient } from '@supabase/supabase-js'
//is

const supabaseUrl = 'https://vzbxayfoblrztstfaslh.supabase.co'
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6YnhheWZvYmxyenRzdGZhc2xoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNDE3ODQsImV4cCI6MjA2NzkxNzc4NH0.8rmtczZIybMJ_xVGpcpm7Ie1M9dzXrPdPP7Sh4WivoI"

console.log('Environment check:')
console.log('- NEXT_PUBLIC_SUPABASE_KEY exists:', !!process.env.NEXT_PUBLIC_SUPABASE_KEY)
console.log('- SUPABASE_KEY exists:', !!process.env.SUPABASE_KEY)
console.log('- Final supabaseKey exists:', !!supabaseKey)

// if (!supabaseKey) {
//   console.error('Missing Supabase key in environment variables')
//   console.error('Make sure you have NEXT_PUBLIC_SUPABASE_KEY or SUPABASE_KEY in your .env.local file')
//   throw new Error('Missing Supabase key in environment')
// }

//FOR NOW THE KEY IS HARDCODED IN THE CODE BELOW
export const supabase = createClient(supabaseUrl, "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6YnhheWZvYmxyenRzdGZhc2xoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNDE3ODQsImV4cCI6MjA2NzkxNzc4NH0.8rmtczZIybMJ_xVGpcpm7Ie1M9dzXrPdPP7Sh4WivoI") 

//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6YnhheWZvYmxyenRzdGZhc2xoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNDE3ODQsImV4cCI6MjA2NzkxNzc4NH0.8rmtczZIybMJ_xVGpcpm7Ie1M9dzXrPdPP7Sh4WivoI