import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

// Basic 認証は middleware.ts で担保済み（matcher: /api/admin/*）。

export const dynamic = 'force-dynamic';

const FILTERS = ['pending', 'contactable', 'all', 'replied', 'closed'] as const;
type Filter = (typeof FILTERS)[number];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get('filter');
  const filter: Filter = (FILTERS as readonly string[]).includes(raw ?? '')
    ? (raw as Filter)
    : 'pending';

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch {
    console.error('[admin/voices] Supabase env vars are missing');
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  let query = supabase
    .from('voices')
    .select(
      'id, created_at, display_name, contact_name, contact, area, categories, message, wants_reply, status, replied_at, reply_text, line_user_id',
    )
    .order('created_at', { ascending: false })
    .limit(100);

  if (filter === 'pending') {
    query = query.eq('wants_reply', true).eq('status', 'new');
  } else if (filter === 'contactable') {
    // 返信希望に限らず、LINEで届く（line_user_id あり）＆未対応の声すべて。
    query = query.eq('status', 'new').not('line_user_id', 'is', null);
  } else if (filter === 'replied') {
    query = query.eq('status', 'replied');
  } else if (filter === 'closed') {
    query = query.eq('status', 'closed');
  }

  const { data, error } = await query;
  if (error) {
    console.error('[admin/voices] select failed:', error.message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  // line_user_id は生で返さない。返信可否(canReply)だけに変換する（プライバシー）。
  const voices = (data ?? []).map((v) => {
    const { line_user_id, ...rest } = v as Record<string, unknown> & {
      line_user_id: string | null;
    };
    return { ...rest, canReply: Boolean(line_user_id) };
  });

  return NextResponse.json({ ok: true, voices });
}
