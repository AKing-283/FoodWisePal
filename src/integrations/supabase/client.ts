// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://tucpoejrlgwsivgjybmr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1Y3BvZWpybGd3c2l2Z2p5Ym1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2OTU4NjAsImV4cCI6MjA1OTI3MTg2MH0.dOQxC4vkxoqV5ifrsm2lix6ZubksrV_xFEMjwBliq9s";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);