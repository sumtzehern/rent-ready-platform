// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://exvxzmcwjsbmzjowlvfm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4dnh6bWN3anNibXpqb3dsdmZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3ODMxNzUsImV4cCI6MjA2MTM1OTE3NX0._4tYmnMue8EnWEiPed8VTHQuEO1iy0izwzcotwM2Ryw";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);