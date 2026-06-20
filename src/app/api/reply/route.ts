import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { composeReply } from '@/lib/composeReply';

// Basic 認証は middleware.ts で担保済み（matcher: /api/reply）。

const REPLY_MAX = 1000;

type Payload = { id?: unknown; text?: unknown };

export async function POST(request: Request) {
  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const id = typeof body.id === 'string' ? body.id.trim() : '';
  const text =
    typeof body.text === 'string' ? body.text.trim().slice(0, REPLY_MAX) : '';

  if (!id) return NextResponse.json({ ok: false }, { status: 400 });
  if (!text) return NextResponse.json({ ok: false }, { status: 400 });

  const token = process.env.LINE_MESSAGING_CHANNEL_ACCESS_TOKEN;
  if (!token) {
    console.error('[reply] LINE_MESSAGING_CHANNEL_ACCESS_TOKEN is missing');
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch {
    console.error('[reply] Supabase env vars are missing');
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  // 任意の userId 宛に送れる作りにしない。必ず voices 行の id から line_user_id を引く。
  // message も取得し、返信文面に「何への返事か」を引用して同梱する。
  const { data: row, error: selErr } = await supabase
    .from('voices')
    .select('id, line_user_id, message')
    .eq('id', id)
    .single();

  if (selErr || !row) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const voice = row as { line_user_id: string | null; message: string | null };
  const to = voice.line_user_id;
  if (!to) {
    // 匿名の声は返信不可
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // 受け手のトークには相談内容が残らないため、元の声を引用した文面にして送る。
  const outgoing = composeReply(voice.message, text);

  // LINE Messaging API push 送信。
  // ※ push は無料プランの月間通数（200通/月）を1通消費する。
  let lineRes: Response;
  try {
    lineRes = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        messages: [{ type: 'text', text: outgoing }],
      }),
    });
  } catch (e) {
    console.error('[reply] LINE push fetch failed:', e);
    return NextResponse.json({ ok: false, error: 'send failed' }, { status: 502 });
  }

  if (!lineRes.ok) {
    // エラー詳細はサーバーログのみ。クライアントには汎用メッセージ。
    const detail = await lineRes.text().catch(() => '');
    console.error('[reply] LINE push error:', lineRes.status, detail);
    // status は更新しない（未送信のまま残す）。
    return NextResponse.json({ ok: false, error: 'send failed' }, { status: 502 });
  }

  // 送信成功 → 返信済みに更新。
  const { error: updErr } = await supabase
    .from('voices')
    .update({
      status: 'replied',
      replied_at: new Date().toISOString(),
      reply_text: text,
    })
    .eq('id', id);

  if (updErr) {
    // 送信は成功している。更新失敗はログに残しつつ ok を返す（二重送信を避けるため）。
    console.error('[reply] sent but status update failed:', updErr.message);
  }

  return NextResponse.json({ ok: true });
}
