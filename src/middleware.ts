import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * 管理ページと管理用 API を HTTP Basic 認証で保護する。
 * ADMIN_USER / ADMIN_PASSWORD は .env.local / Vercel に設定（サーバー専用・秘密）。
 * Edge ランタイムで動くよう、Authorization ヘッダは atob でデコードする。
 */
export function middleware(req: NextRequest) {
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASSWORD;

  // 認証情報が未設定なら通さない（誤って無防備に公開しないため）。
  if (!user || !pass) {
    return new NextResponse('Server not configured', { status: 503 });
  }

  const header = req.headers.get('authorization') ?? '';
  if (header.startsWith('Basic ')) {
    try {
      const decoded = atob(header.slice(6)); // "user:pass"
      const sep = decoded.indexOf(':');
      const inUser = decoded.slice(0, sep);
      const inPass = decoded.slice(sep + 1);
      if (sep !== -1 && inUser === user && inPass === pass) {
        return NextResponse.next();
      }
    } catch {
      // デコード失敗は未認証として扱う
    }
  }

  return new NextResponse('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="admin"' },
  });
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/api/reply'],
};
