import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Use the constants from integrations/supabase/client.ts
import { supabase as supabaseClient } from '@/integrations/supabase/client';

// Export the supabase client
export const supabase = supabaseClient;

// This ensures we're using the same client throughout the application
