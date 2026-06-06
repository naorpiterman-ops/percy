import { createClient } from "@supabase/supabase-js";

const supabaseUrl  = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnon = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Base client — used for storage and anon operations
export const supabase = createClient(supabaseUrl, supabaseAnon);

// Returns a Supabase client that injects the Auth0 access token
// so RLS policies can validate the user identity.
export function getAuthedClient(accessToken) {
  return createClient(supabaseUrl, supabaseAnon, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}
