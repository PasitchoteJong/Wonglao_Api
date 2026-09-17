import "dotenv/config";
import supabase from "./lib/supabase.js";

const { data, error } = await supabase.storage
    .from(process.env.SUPABASE_BUCKET)
    .list();

console.log("DATA:", data);
console.log("ERROR:", error);