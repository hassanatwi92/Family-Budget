
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://sjkvemjyueolpanjozxm.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqa3ZlbWp5dWVvbHBhbmpvenhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NTg0NjAsImV4cCI6MjA5MzIzNDQ2MH0.jBweMM36DSC6aqD5_J2jvumWXozLwvZjY84g2wk8Iwo"
);