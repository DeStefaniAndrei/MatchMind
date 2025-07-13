// Test environment variable loading
console.log('NEXT_PUBLIC_SUPABASE_KEY exists:', !!process.env.NEXT_PUBLIC_SUPABASE_KEY)
console.log('SUPABASE_KEY exists:', !!process.env.SUPABASE_KEY)
 
if (process.env.NEXT_PUBLIC_SUPABASE_KEY) {
  console.log('NEXT_PUBLIC_SUPABASE_KEY length:', process.env.NEXT_PUBLIC_SUPABASE_KEY.length)
} else {
  console.log('NEXT_PUBLIC_SUPABASE_KEY is missing!')
} 