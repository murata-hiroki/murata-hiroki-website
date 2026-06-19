import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/** フォームで選べる年代の許可リスト（page.tsx と一致させること） */
const ALLOWED_AGE_GROUPS = [
  '10代',
  '20代',
  '30代',
  '40代',
  '50代',
  '60代',
  '70代以上',
] as const;

const MESSAGE_MAX = 2000;
const ADDRESS_MAX = 200;
const EMAIL_MAX = 200;
const SHORT_MAX = 100;
const PHONE_MAX = 20;
const POSTAL_MAX = 8;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Payload = {
  name?: unknown;
  nameKana?: unknown;
  postalCode?: unknown;
  address?: unknown;
  email?: unknown;
  phone?: unknown;
  ageGroup?: unknown;
  occupation?: unknown;
  message?: unknown;
  agreed?: unknown;
  website?: unknown; // ハニーポット
};

function clampString(value: unknown, max: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
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
  const nameKana = clampString(body.nameKana, SHORT_MAX);
  const postalCode = clampString(body.postalCode, POSTAL_MAX);
  const address = clampString(body.address, ADDRESS_MAX);
  const email = clampString(body.email, EMAIL_MAX);
  const phone = clampString(body.phone, PHONE_MAX);
  const occupation = clampString(body.occupation, SHORT_MAX);
  const message = clampString(body.message, MESSAGE_MAX);
  const agreed = body.agreed === true;

  // 年代は許可リスト内のみ採用（未選択・不正値は空に）
  const ageGroup =
    typeof body.ageGroup === 'string' &&
    (ALLOWED_AGE_GROUPS as readonly string[]).includes(body.ageGroup)
      ? body.ageGroup
      : '';

  // 必須: 氏名・同意・連絡先（メール または 電話）
  if (!name || !agreed) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (!email && !phone) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (email && !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[koenkai] Supabase env vars are missing');
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { error } = await supabase.from('supporters').insert({
    name,
    name_kana: nameKana || null,
    postal_code: postalCode || null,
    address: address || null,
    email: email || null,
    phone: phone || null,
    age_group: ageGroup || null,
    occupation: occupation || null,
    message: message || null,
    agreed,
    source: 'web-koenkai',
  });

  if (error) {
    console.error('[koenkai] insert failed:', error.message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
