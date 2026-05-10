// Supabase client used for auth + direct queries when we eventually move
// off the FastAPI mediated path. Today, the app still talks to the backend
// for everything except optional auth — keep this module side-effect-free
// so importing it is cheap.
//
// Required env (Netlify):
//   REACT_APP_SUPABASE_URL
//   REACT_APP_SUPABASE_ANON_KEY
//
// When either is missing we export a dummy client whose auth methods all
// return { error } so legacy anonymous flows keep working.

import { createClient } from '@supabase/supabase-js';

const url = process.env.REACT_APP_SUPABASE_URL;
const key = process.env.REACT_APP_SUPABASE_ANON_KEY;

let client = null;
if (url && key) {
  try {
    client = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  } catch (_) {
    client = null;
  }
}

const stub = {
  auth: {
    async getSession() { return { data: { session: null }, error: null }; },
    async signInWithPassword() { return { data: null, error: { message: 'Supabase not configured' } }; },
    async signUp() { return { data: null, error: { message: 'Supabase not configured' } }; },
    async signOut() { return { error: null }; },
    async resetPasswordForEmail() { return { data: null, error: { message: 'Supabase not configured' } }; },
    async updateUser() { return { data: null, error: { message: 'Supabase not configured' } }; },
    onAuthStateChange() { return { data: { subscription: { unsubscribe() {} } } }; },
  },
};

export const supabase = client || stub;
export const isSupabaseConfigured = !!client;
