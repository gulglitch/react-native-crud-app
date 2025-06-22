import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://kkttplmwlvtxqgtyxyxz.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdHRwbG13bHZ0eHFndHl4eXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NzMzNzgsImV4cCI6MjA2NTQ0OTM3OH0.k9W1EHTHjUyUL_QFowOofGnCt0hXZ0l9q0jgIClglAM'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
