'use client';

import { useEffect, useState } from 'react';
import { initLiff, closeLiffWindow, type LiffProfile } from '@/lib/liff';

const CATEGORIES = [
  '子育て・教育',
  '学校のこと',
  '道路・交通',
  '公園・施設',
  '防災・防犯',
  '市役所の手続き',
  'その他',
] as const;

type Status = 'editing' | 'sending' | 'done' | 'error';

export default function KoePage() {
  const [profile, setProfile] = useState<LiffProfile | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);

  const [categories, setCategories] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [area, setArea] = useState('');
  const [wantsReply, setWantsReply] = useState(false);
  const [contactName, setContactName] = useState('');

  const [status, setStatus] = useState<Status>('editing');

  useEffect(() => {
    let active = true;
    (async () => {
      const session = await initLiff(process.env.NEXT_PUBLIC_LIFF_ID ?? '');
      if (!active) return;
      setProfile(session.profile);
      setIdToken(session.idToken);
    })();
    return () => {
      active = false;
    };
  }, []);

  const toggleCategory = (c: string) => {
    setCategories((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );
  };

  const canSubmit = categories.length > 0 && status !== 'sending';

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setStatus('sending');
    try {
      const res = await fetch('/api/koe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken,
          profile,
          categories,
          area,
          message,
          wantsReply,
          contactName,
        }),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean } | null;
      if (res.ok && data?.ok) {
        setStatus('done');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  if (status === 'done') {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center bg-emerald-50 px-6 pb-[env(safe-area-inset-bottom)] text-center">
        <div className="max-w-sm">
          <p className="text-5xl mb-4" aria-hidden="true">
            🌱
          </p>
          <h1 className="text-xl font-bold text-gray-900 mb-3" aria-live="polite">
            ありがとうございます。
            <br />
            あなたの声が、まちを動かす一歩になります
          </h1>
          <p className="text-sm text-gray-600 mb-8">
            いただいた声は、これからのまちづくりに活かします。
          </p>
          <button
            type="button"
            onClick={() => closeLiffWindow()}
            className="w-full rounded-full bg-emerald-600 px-6 py-4 text-base font-semibold text-white shadow-sm transition active:scale-[0.98]"
          >
            LINEに戻る
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-white">
      <div className="mx-auto max-w-lg px-5 pt-8 pb-[calc(7rem+env(safe-area-inset-bottom))]">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            松原のこと、聞かせてください
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            気になっていること・困っていること、なんでも大丈夫です。
          </p>
        </header>

        {/* カテゴリ（必須・複数選択可） */}
        <section className="mb-6">
          <label className="mb-2 block text-sm font-semibold text-gray-800">
            どんなことですか？
            <span className="ml-1 text-emerald-600">（1つ以上）</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => {
              const selected = categories.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  role="button"
                  aria-pressed={selected}
                  onClick={() => toggleCategory(c)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition active:scale-[0.97] ${
                    selected
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50 text-emerald-800'
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </section>

        {/* 自由記述（任意） */}
        <section className="mb-6">
          <label
            htmlFor="koe-message"
            className="mb-2 block text-sm font-semibold text-gray-800"
          >
            くわしく教えてください
            <span className="ml-1 font-normal text-gray-400">（任意）</span>
          </label>
          <textarea
            id="koe-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="例：天美の〇〇交差点、子どもの登校が心配です"
            className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-base text-gray-900 outline-none placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </section>

        {/* お住まいの地域（任意） */}
        <section className="mb-6">
          <label
            htmlFor="koe-area"
            className="mb-2 block text-sm font-semibold text-gray-800"
          >
            お住まいの地域
            <span className="ml-1 font-normal text-gray-400">（任意）</span>
          </label>
          <input
            id="koe-area"
            type="text"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            maxLength={100}
            placeholder="例：天美、上田 など（任意）"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base text-gray-900 outline-none placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </section>

        {/* 返信希望（任意） */}
        <section className="mb-6">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={wantsReply}
              onChange={(e) => setWantsReply(e.target.checked)}
              className="h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-sm font-medium text-gray-800">
              返信を希望する
            </span>
          </label>

          {wantsReply && (
            <div className="mt-3">
              <label
                htmlFor="koe-name"
                className="mb-2 block text-sm font-semibold text-gray-800"
              >
                お名前（呼び名）
                <span className="ml-1 font-normal text-gray-400">（任意）</span>
              </label>
              <input
                id="koe-name"
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                maxLength={100}
                placeholder="例：村田 / ひろき など"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base text-gray-900 outline-none placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          )}
        </section>

        {/* プライバシー注記 */}
        <p className="mb-4 rounded-xl bg-gray-50 p-4 text-xs leading-relaxed text-gray-500">
          いただいた声は、村田ひろきの政治活動（政策づくり・活動報告）に活用します。
          公開する場合は匿名化し、個人が特定される形では使いません。
          返信をご希望の場合のみ、LINEからお返事します。
        </p>

        {status === 'error' && (
          <p
            role="alert"
            aria-live="assertive"
            className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700"
          >
            送信に失敗しました。少し時間をおいて再度お試しください。
          </p>
        )}
      </div>

      {/* 送信ボタン（下部固定） */}
      <div className="fixed inset-x-0 bottom-0 border-t border-gray-100 bg-white/95 px-5 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur">
        <div className="mx-auto max-w-lg">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            aria-live="polite"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-4 text-base font-semibold text-white shadow-sm transition active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {status === 'sending' ? (
              <>
                <span
                  className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white"
                  aria-hidden="true"
                />
                送信中…
              </>
            ) : (
              '送信する'
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
