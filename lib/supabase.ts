import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nuhirhfevxoonendpfsm.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51aGlyaGZldnhvb25lbmRwZnNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzcxNDMwOTksImV4cCI6MTk5MjcxOTA5OX0.F24Rc0tD5pM3g-8jNjlkUBR4EmB0d_PxvqWMNW8wn3Q'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
