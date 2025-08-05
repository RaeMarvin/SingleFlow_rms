import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface TaskRow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: 'signal' | 'noise';
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  task_order: number;
  created_at: string;
  completed_at: string | null;
  updated_at: string;
}

export interface IdeaRow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  promoted: boolean;
  created_at: string;
  updated_at: string;
}
