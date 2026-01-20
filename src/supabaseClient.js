import { createClient } from '@supabase/supabase-js'

// ⚠️ GO TO SUPABASE > SETTINGS > API TO GET THESE KEYS
const supabaseUrl = 'https://ihkwbtlwmqxesuutphob.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imloa3didGx3bXF4ZXN1dXRwaG9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4ODEyMjcsImV4cCI6MjA4MjQ1NzIyN30.D5d0_23LSuw7Zgle5eP8iRGqWRRS30JOm9bySkX9ieU'

export const supabase = createClient(supabaseUrl, supabaseKey)