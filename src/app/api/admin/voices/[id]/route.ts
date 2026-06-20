import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

// Basic 認証は middleware.ts で担保済み（matcher: /api/admin/*）。
// 返信せず「対応済み(closed)」にするための更新。

type Payload = { status?: unknown };
const ALLOWED_STATUS = ['new', 'closed'] as const;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id) return NextResponse.json({ ok: false }, { status: 400 });

  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const status = typeof body.status === 'string' ? body.status : '';
  if (!(ALLOWED_STATUS as readonly string[]).includes(status)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch {
    console.error('[admin/voices/:id] Supabase env vars are missing');
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const { error } = await supabase
    .from('voices')
    .update({ status })
    .eq('id', id);

  if (error) {
    console.error('[admin/voices/:id] update failed:', error.message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
