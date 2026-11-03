import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  'https://jjyexujkbipbiqeyrdfj.supabase.co';

const supabaseKey =
  (typeof import.meta !== 'undefined' &&
    (import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env?.VITE_SUPABASE_ANON_KEY)) ||
  'sb_publishable_G6YkQuE1T_ao0xOu_VUfeQ_h0TaBLi5';

export const supabase = createClient(supabaseUrl, supabaseKey);
