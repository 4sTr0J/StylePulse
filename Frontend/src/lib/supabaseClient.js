import { createBrowserClient } from '@supabase/ssr';

const runtimeEnv = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};
const supabaseUrl = runtimeEnv.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = runtimeEnv.VITE_SUPABASE_ANON_KEY || 'placeholder_key';

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  cookies: {
    getAll() {
      return [];
    },
    setAll() {},
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const saveProfileToSupabase = async (user, extra = {}) => {
  if (!user?.id || !user?.email) return;

  const profilePayload = {
    id: user.id,
    full_name: extra.fullName || user.user_metadata?.fullName || user.user_metadata?.name || user.email.split('@')[0],
    email: user.email,
    phone: extra.phone || user.user_metadata?.phone || '',
    role: extra.role || user.user_metadata?.role || 'customer',
  };

  const { error } = await supabase.from('profiles').upsert(profilePayload, { onConflict: 'id' });

  if (error) {
    console.warn('Profile persistence skipped:', error.message);
  }
};

export const recordLoginAudit = async (user, extra = {}) => {
  if (!user?.id || !user?.email) return;

  const auditPayload = {
    user_id: user.id,
    full_name: extra.fullName || user.user_metadata?.fullName || user.user_metadata?.name || user.email.split('@')[0],
    email: user.email,
    phone: extra.phone || user.user_metadata?.phone || '',
    role: extra.role || user.user_metadata?.role || 'customer',
    user_details: {
      fullName: extra.fullName || user.user_metadata?.fullName || user.user_metadata?.name || user.email.split('@')[0],
      email: user.email,
      phone: extra.phone || user.user_metadata?.phone || '',
      role: extra.role || user.user_metadata?.role || 'customer',
    },
    logged_in_at: new Date().toISOString(),
    logged_out_at: null,
    is_active: true,
  };

  const { error } = await supabase.from('login_logs').insert(auditPayload);

  if (error) {
    console.warn('Login audit persistence skipped:', error.message);
  }
};

export const closeLoginAudit = async (user) => {
  if (!user?.id) return;

  const { error } = await supabase
    .from('login_logs')
    .update({
      logged_out_at: new Date().toISOString(),
      is_active: false,
    })
    .eq('user_id', user.id)
    .eq('is_active', true);

  if (error) {
    console.warn('Login audit cleanup skipped:', error.message);
  }
};
