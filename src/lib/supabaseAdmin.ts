import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * service_role キーで動くサーバー専用 Supabase クライアント。
 * このキーは RLS を貫通する全権キーなので、必ず API ルート内（サーバー）だけで使う。
 * クライアントコンポーネントから import しないこと。
 */
export function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error('Supabase env vars are missing');
  }
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
