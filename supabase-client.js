const DORE_SUPABASE_URL = 'https://egnmdruacjyblcarwhrs.supabase.co';
const DORE_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_hwfFhL4qccUmuCqKSlz3OA_qNQTjReR';

window.doreSupabase = window.supabase?.createClient(
  DORE_SUPABASE_URL,
  DORE_SUPABASE_PUBLISHABLE_KEY
);
