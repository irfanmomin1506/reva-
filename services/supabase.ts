
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hfkyyjvfstfklmfzvcfb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhma3l5anZmc3Rma2xtZnp2Y2ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0MTcxMDEsImV4cCI6MjA5MDk5MzEwMX0.bcG0mv-QbX7az31b_PUjwJR3V3NYuOCLF-E3K7flR6s'; // Replace with your actual publishable key

export const supabase = createClient(supabaseUrl, supabaseKey);
