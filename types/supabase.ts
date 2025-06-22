// src/types/supabase.ts
import { Session as SupabaseSession, User } from '@supabase/supabase-js';

export interface Session extends SupabaseSession {
  user: User & {
    email: string; // Make email required
    // Add other required user properties here
  };
}