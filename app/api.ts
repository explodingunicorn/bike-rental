import { createClient } from "@supabase/supabase-js";

const key =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4ZWRrYW1ibmp3aHhpc3FmdnNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDY5Mjc0NTMsImV4cCI6MTk2MjUwMzQ1M30.1Qy--eRJ3mXerqh74b3m3ZaN3elK5SdTb1fepPp9MLg";
// Create a single supabase client for interacting with your database
export const supabase = createClient(
  "https://qxedkambnjwhxisqfvsh.supabase.co",
  key
);
