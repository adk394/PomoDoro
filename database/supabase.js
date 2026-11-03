import {createClient} from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://dvlhlhwunjxmdtfvhvfy.supabase.co"
const SUPABASE_KEY = "sb_publishable_vpDinpWWIwlMco6_Byc1JA_u8GDvTlN"

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)