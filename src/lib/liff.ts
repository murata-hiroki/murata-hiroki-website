import type { Liff } from '@line/liff';

export type LiffProfile = {
  userId: string;
  displayName: string;
};

export type LiffSession = {
  /** LIFF 初期化に成功したか（LINE外ブラウザでは false になりうる） */
  ready: boolean;
  /** LINE ログイン済みのプロフィール。未取得・LINE外なら null */
  profile: LiffProfile | null;
  /** サーバーでの本人確認に使う ID トークン。未取得なら null */
  idToken: string | null;
};

const EMPTY_SESSION: LiffSession = {
  ready: false,
  profile: null,
  idToken: null,
};

/**
 * LIFF を初期化してプロフィール・ID トークンを取得する。
 *
 * LINE 外ブラウザや init 失敗時はクラッシュさせず、
 * 「匿名の声」として送信できるフォールバック用の空セッションを返す。
 */
export async function initLiff(liffId: string): Promise<LiffSession> {
  if (!liffId) return EMPTY_SESSION;

  try {
    // SDK はクライアントでのみ動くため動的 import する
    const liff = (await import('@line/liff')).default as Liff;
    await liff.init({ liffId });

    // LINE アプリ内でログインしていなければログインへ誘導
    if (!liff.isLoggedIn()) {
      liff.login();
      // login() はリダイレクトするため、戻ってくるまで待つ
      return { ready: true, profile: null, idToken: null };
    }

    const profile = await liff.getProfile();
    const idToken = liff.getIDToken();

    return {
      ready: true,
      profile: {
        userId: profile.userId,
        displayName: profile.displayName,
      },
      idToken: idToken ?? null,
    };
  } catch {
    // LINE 外ブラウザ・ネットワーク不調など。フォームは出すが匿名扱い。
    return EMPTY_SESSION;
  }
}

/** サンクス画面から LINE に戻る。LINE 外では何もしない。 */
export async function closeLiffWindow(): Promise<void> {
  try {
    const liff = (await import('@line/liff')).default as Liff;
    if (liff.isInClient()) {
      liff.closeWindow();
    }
  } catch {
    // no-op
  }
}
