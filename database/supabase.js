import {createClient} from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://yplywdkalymqkppnbifj.supabase.co"
const SUPABASE_KEY = "sb_publishable_udNCPPksdHvAz6qvPYj39w_BfCvH1Jh"

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)