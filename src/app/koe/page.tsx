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
  const [liffChecked, setLiffChecked] = useState(false);
  const [inClient, setInClient] = useState(false);

  const [categories, setCategories] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [area, setArea] = useState('');
  const [wantsReply, setWantsReply] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contact, setContact] = useState('');

  const [status, setStatus] = useState<Status>('editing');

  useEffect(() => {
    let active = true;
    (async () => {
      const session = await initLiff(process.env.NEXT_PUBLIC_LIFF_ID ?? '');
      if (!active) return;
      setProfile(session.profile);
      setIdToken(session.idToken);
      setInClient(session.inClient);
      setLiffChecked(true);
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

  // LINE ログイン済みなら LINE で返信できる。未ログイン（外部ブラウザ等）で
  // 返信を希望する場合は、連絡先の入力を必須にする。
  const lineLinked = profile !== null;
  const needsContact = wantsReply && liffChecked && !lineLinked;
  const canSubmit =
    categories.length > 0 &&
    status !== 'sending' &&
    (!needsContact || contact.trim().length > 0);

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
          contact,
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
      <main className="koe-thanks">
        <div className="koe-thanks-mark" aria-hidden="true">
          <svg viewBox="0 0 52 52" width="52" height="52">
            <circle cx="26" cy="26" r="24" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <path
              d="M16 27l7 7 14-15"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className="koe-thanks-title" aria-live="polite">
          ありがとうございます。
          <br />
          たしかに、受け取りました。
        </h1>
        <p className="koe-thanks-sub">
          いただいた声は、これからのまちづくりに大切に活かします。
        </p>
        {inClient ? (
          <button type="button" className="koe-back" onClick={() => closeLiffWindow()}>
            LINEに戻る
          </button>
        ) : (
          <a href="/" className="koe-back">
            ホームに戻る
          </a>
        )}
      </main>
    );
  }

  return (
    <main className="koe">
      <div className="koe-inner">
        <header className="koe-head">
          <p className="koe-eyebrow">
            <span className="dot" aria-hidden="true" />
            あなたの声は、村田ひろき本人に届きます
          </p>
          <h1 className="koe-title">
            松原のこと、
            <br />
            <span className="accent">聞かせてください。</span>
          </h1>
          <p className="koe-sub">
            気になっていること・困っていること、なんでも大丈夫です。
          </p>
        </header>

        {/* カテゴリ（必須・複数選択可） */}
        <section className="koe-card">
          <div className="koe-label-row">
            <span className="koe-label">どんなことですか？</span>
            <span className="koe-req">1つ以上えらぶ</span>
          </div>
          <div className="koe-chips">
            {CATEGORIES.map((c) => {
              const selected = categories.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  className="koe-chip"
                  aria-pressed={selected}
                  onClick={() => toggleCategory(c)}
                >
                  <span className="koe-chip-text">{c}</span>
                  <span className="koe-chip-mark" aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </section>

        {/* 自由記述・地域（任意） */}
        <section className="koe-card">
          <div className="koe-label-row">
            <label className="koe-label" htmlFor="koe-message">
              くわしく教えてください
            </label>
            <span className="koe-opt">任意</span>
          </div>
          <textarea
            id="koe-message"
            className="koe-textarea"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            maxLength={2000}
            placeholder="例：天美の〇〇交差点、子どもの登校が心配です"
          />

          <div className="koe-label-row koe-label-mt">
            <label className="koe-label" htmlFor="koe-area">
              お住まいの地域
            </label>
            <span className="koe-opt">任意</span>
          </div>
          <input
            id="koe-area"
            className="koe-input"
            type="text"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            maxLength={100}
            placeholder="例：天美、上田 など"
          />
        </section>

        {/* 返信希望（任意） */}
        <section className="koe-card">
          <label className="koe-toggle">
            <span className="koe-toggle-text">
              お返事を希望する
              <span className="koe-toggle-hint">
                {lineLinked
                  ? '希望される方にだけ、LINEでお返事します'
                  : '希望される方にだけ、ご記入の連絡先にお返事します'}
              </span>
            </span>
            <input
              type="checkbox"
              checked={wantsReply}
              onChange={(e) => setWantsReply(e.target.checked)}
            />
            <span className="koe-switch" aria-hidden="true" />
          </label>

          {wantsReply && (
            <div className="koe-name-wrap">
              <div className="koe-label-row">
                <label className="koe-label" htmlFor="koe-name">
                  お名前（呼び名）
                </label>
                <span className="koe-opt">任意</span>
              </div>
              <input
                id="koe-name"
                className="koe-input"
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                maxLength={100}
                placeholder="例：ひろき / 村田 など"
              />

              {needsContact && (
                <>
                  <div className="koe-label-row koe-label-mt">
                    <label className="koe-label" htmlFor="koe-contact">
                      連絡先（メール または 電話番号）
                    </label>
                    <span className="koe-req">必須</span>
                  </div>
                  <input
                    id="koe-contact"
                    className="koe-input"
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    maxLength={100}
                    inputMode="email"
                    placeholder="例：example@mail.com / 090-1234-5678"
                  />
                  <p className="koe-contact-note">
                    LINE以外からのご利用のため、お返事用の連絡先をお願いします。
                  </p>
                </>
              )}
            </div>
          )}
        </section>

        {/* プライバシー注記 */}
        <p className="koe-privacy">
          いただいた声は、村田ひろきの政治活動（政策づくり・活動報告）に活用します。
          公開する場合は匿名化し、個人が特定される形では使いません。
          お返事をご希望の場合のみ、LINE または ご記入いただいた連絡先にご連絡します。
        </p>

        {status === 'error' && (
          <p className="koe-error" role="alert" aria-live="assertive">
            送信に失敗しました。少し時間をおいて、もう一度お試しください。
          </p>
        )}
      </div>

      {/* 送信ボタン（下部固定） */}
      <div className="koe-bar">
        <div className="koe-bar-inner">
          <button
            type="button"
            className="koe-submit"
            onClick={handleSubmit}
            disabled={!canSubmit}
            aria-live="polite"
          >
            {status === 'sending' ? (
              <>
                <span className="koe-spin" aria-hidden="true" />
                送信中…
              </>
            ) : (
              '声を届ける'
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
