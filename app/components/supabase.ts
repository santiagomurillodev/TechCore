import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://thereruzcrclsnmtwppu.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_36NehzCvk_AhWC6DeoGVQA_mfqc7fPF';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);