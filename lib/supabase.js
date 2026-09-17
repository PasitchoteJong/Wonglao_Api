import { createClient } from "@supabase/supabase-js";

// console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
// console.log("SUPABASE_KEY EXISTS:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);
// console.log("SUPABASE_BUCKET:", process.env.SUPABASE_BUCKET);

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);

export default supabase;