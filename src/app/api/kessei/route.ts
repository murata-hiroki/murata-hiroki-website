import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

const NOTE_MAX = 2000;
const EMAIL_MAX = 200;
const SHORT_MAX = 100;
const PHONE_MAX = 20;

/** ご参加人数の上限。会場規模から見て現実的な範囲に丸める（page.tsx と一致させること）。 */
const PARTY_SIZE_MAX = 99;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Payload = {
  name?: unknown;
  tel?: unknown;
  email?: unknown;
  partySize?: unknown;
  referrer?: unknown;
  note?: unknown;
  website?: unknown; // ハニーポット
};

function clampString(value: unknown, max: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

/**
 * ご参加人数（本人を含む総数）を検証する。
 * 数値／数字文字列のいずれも受け、整数に丸めて 1〜PARTY_SIZE_MAX に収める。
 * 不正値は 0 を返し、呼び出し側で必須チェックに落とす。
 */
function parsePartySize(value: unknown): number {
  const n =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number(value)
        : NaN;
  if (!Number.isFinite(n)) return 0;
  const int = Math.floor(n);
  if (int < 1) return 0;
  return Math.min(int, PARTY_SIZE_MAX);
}

export async function POST(request: Request) {
  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // ハニーポットに入力があれば bot とみなし、成功を装って黙って捨てる。
  if (clampString(body.website, SHORT_MAX) !== '') {
    return NextResponse.json({ ok: true });
  }

  const name = clampString(body.name, SHORT_MAX);
  const tel = clampString(body.tel, PHONE_MAX);
  const email = clampString(body.email, EMAIL_MAX);
  const referrer = clampString(body.referrer, SHORT_MAX);
  const note = clampString(body.note, NOTE_MAX);
  const partySize = parsePartySize(body.partySize);

  // 必須: 氏名・電話番号・参加人数（1以上）
  if (!name || !tel || partySize < 1) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (email && !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch {
    console.error('[kessei] Supabase env vars are missing');
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const { error } = await supabase.from('kessei_attendance').insert({
    name,
    tel,
    email: email || null,
    party_size: partySize,
    referrer: referrer || null,
    note: note || null,
    source: 'web-kessei',
  });

  if (error) {
    console.error('[kessei] insert failed:', error.message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
