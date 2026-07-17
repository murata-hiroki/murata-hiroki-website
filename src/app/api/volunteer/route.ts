import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

/** 対象日の許可リスト（page.tsx と一致させること） */
const ALLOWED_DATES = [
  '2026-08-09',
  '2026-08-10',
  '2026-08-11',
  '2026-08-12',
  '2026-08-13',
  '2026-08-14',
  '2026-08-15',
] as const;

/** シフト枠の許可リスト（page.tsx と一致させること） */
const ALLOWED_SLOTS = ['08-11', '11-14', '14-17', '17-20'] as const;

const ALLOWED_TYPES = ['volunteer', 'speaker'] as const;

const NOTE_MAX = 2000;
const EMAIL_MAX = 200;
const SHORT_MAX = 100;
const PHONE_MAX = 20;

/** 7日 × 4枠。これを超える送信は弾く。 */
const SHIFTS_MAX = ALLOWED_DATES.length * ALLOWED_SLOTS.length;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Payload = {
  name?: unknown;
  tel?: unknown;
  email?: unknown;
  type?: unknown;
  shifts?: unknown;
  wantsHelp?: unknown;
  note?: unknown;
  website?: unknown; // ハニーポット
};

type Shift = { date: string; slot: string };

function clampString(value: unknown, max: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

/**
 * 送られてきた shifts を検証し、許可リスト内の {date, slot} だけに絞る。
 * 重複は落とす。クライアント申告の順序は信頼せず、日付→枠の順に並べ直す。
 */
function parseShifts(value: unknown): Shift[] {
  if (!Array.isArray(value)) return [];

  const seen = new Set<string>();
  for (const item of value.slice(0, SHIFTS_MAX)) {
    if (typeof item !== 'object' || item === null) continue;
    const { date, slot } = item as { date?: unknown; slot?: unknown };
    if (typeof date !== 'string' || typeof slot !== 'string') continue;
    if (!(ALLOWED_DATES as readonly string[]).includes(date)) continue;
    if (!(ALLOWED_SLOTS as readonly string[]).includes(slot)) continue;
    seen.add(`${date}__${slot}`);
  }

  return ALLOWED_DATES.flatMap((date) =>
    ALLOWED_SLOTS.filter((slot) => seen.has(`${date}__${slot}`)).map((slot) => ({
      date,
      slot,
    })),
  );
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
  const note = clampString(body.note, NOTE_MAX);

  const type =
    typeof body.type === 'string' &&
    (ALLOWED_TYPES as readonly string[]).includes(body.type)
      ? body.type
      : '';

  const shifts = parseShifts(body.shifts);

  // 「スポット以外もお手伝いできる」は先生（speaker）にしか出していない項目。
  // お手伝いの方は役割を直接選んでいるので、申告されても無視する。
  const wantsHelp = type === 'speaker' && body.wantsHelp === true;

  // 必須: 種別・氏名・電話番号・シフト 1 つ以上
  if (!type || !name || !tel || shifts.length === 0) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (email && !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch {
    console.error('[volunteer] Supabase env vars are missing');
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const { error } = await supabase.from('volunteer_shifts').insert({
    name,
    tel,
    email: email || null,
    type,
    shifts,
    wants_help: wantsHelp,
    note: note || null,
    source: 'web-volunteer',
  });

  if (error) {
    console.error('[volunteer] insert failed:', error.message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
