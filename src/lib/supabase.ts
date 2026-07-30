import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY)?.trim();
export const isSupabaseConfigured = Boolean(url && anonKey);
export const supabaseConfigured = isSupabaseConfigured;
export const supabase = isSupabaseConfigured ? createClient(url!, anonKey!, { auth: { persistSession:true, autoRefreshToken:true, detectSessionInUrl:true } }) : null;
export const INSTITUTION_DOMAIN = "pgvim.ac.th";
export const isInstitutionEmail = (email?: string | null) => Boolean(email?.toLowerCase().endsWith(`@${INSTITUTION_DOMAIN}`));
