import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/** フォームで選べるカテゴリの許可リスト（page.tsx と一致させること） */
const ALLOWED_CATEGORIES = [
  '子育て・教育',
  '学校のこと',
  '道路・交通',
  '公園・施設',
  '防災・防犯',
  '市役所の手続き',
  'その他',
] as const;

const MESSAGE_MAX = 2000;
const SHORT_MAX = 100;

type Payload = {
  idToken?: unknown;
  profile?: { userId?: unknown; displayName?: unknown } | null;
  categories?: unknown;
  area?: unknown;
  message?: unknown;
  wantsReply?: unknown;
  contactName?: unknown;
};

function clampString(value: unknown, max: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

/**
 * LINE の ID トークンを検証し、なりすましでない userId（sub）を返す。
 * idToken が無い・検証に失敗した場合は null（匿名の声として受理）。
 */
async function verifyLineUser(idToken: unknown): Promise<string | null> {
  if (typeof idToken !== 'string' || !idToken) return null;

  const channelId = process.env.LINE_LOGIN_CHANNEL_ID;
  if (!channelId) return null;

  try {
    const res = await fetch('https://api.line.me/oauth2/v2.1/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ id_token: idToken, client_id: channelId }),
    });

    if (!res.ok) return null;
    const data = (await res.json()) as { sub?: string };
    return typeof data.sub === 'string' ? data.sub : null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // カテゴリは配列で1件以上、かつ許可リスト内であること
  const categories = Array.isArray(body.categories)
    ? body.categories.filter(
        (c): c is string =>
          typeof c === 'string' &&
          (ALLOWED_CATEGORIES as readonly string[]).includes(c),
      )
    : [];

  if (categories.length === 0) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const message = clampString(body.message, MESSAGE_MAX);
  const area = clampString(body.area, SHORT_MAX);
  const wantsReply = body.wantsReply === true;
  const contactName = wantsReply ? clampString(body.contactName, SHORT_MAX) : '';

  // 本人確認。検証できれば信頼できる userId を採用、無理なら匿名。
  // クライアント申告の profile.userId は信頼しない（なりすまし防止）。
  const lineUserId = await verifyLineUser(body.idToken);

  const displayName = clampString(body.profile?.displayName, SHORT_MAX);

  // TODO: 同一 userId からの連投を軽く弾く簡易レート制限（必要になれば追加）

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[koe] Supabase env vars are missing');
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { error } = await supabase.from('voices').insert({
    line_user_id: lineUserId,
    display_name: displayName || null,
    categories,
    area: area || null,
    message: message || null,
    wants_reply: wantsReply,
    contact_name: contactName || null,
    source: 'liff-koe',
  });

  if (error) {
    console.error('[koe] insert failed:', error.message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
