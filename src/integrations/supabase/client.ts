
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://pzbppzlaaiujajrwgorf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6YnBwemxhYWl1amFqcndnb3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwOTQ5NDcsImV4cCI6MjA2MDY3MDk0N30.4Q-K4P2oeA8CDv52svQ6TGVoC6XZGoKSe_1-0fWZ1Ls";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
