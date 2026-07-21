'use client';

import { useState } from 'react';
import Link from 'next/link';

type Status = 'editing' | 'sending' | 'done' | 'error';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** ご参加人数の上限（route.ts と一致させること）。 */
const PARTY_SIZE_MAX = 99;

/** 会場への地図リンク（仕様書 §4）。 */
const MAP_URL =
  'https://www.google.com/maps/dir/?api=1&destination=34.58771,135.53275';

export default function KesseiPage() {
  const [name, setName] = useState('');
  const [tel, setTel] = useState('');
  const [email, setEmail] = useState('');
  // 本人を含めた総数。既定値は 1（ご本人のみ）。
  const [partySize, setPartySize] = useState(1);
  const [referrer, setReferrer] = useState('');
  const [note, setNote] = useState('');

  // スパムよけハニーポット（人間は触らない隠しフィールド）
  const [website, setWebsite] = useState('');

  const [status, setStatus] = useState<Status>('editing');

  const stepParty = (delta: number) =>
    setPartySize((prev) => Math.min(PARTY_SIZE_MAX, Math.max(1, prev + delta)));

  const emailValid = email.trim().length === 0 || EMAIL_RE.test(email.trim());

  const canSubmit =
    status !== 'sending' &&
    name.trim().length > 0 &&
    tel.trim().length > 0 &&
    emailValid &&
    partySize >= 1;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setStatus('sending');
    try {
      const res = await fetch('/api/kessei', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          tel,
          email,
          partySize,
          referrer,
          note,
          website, // ハニーポット
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
          お申込ありがとうございます。
        </h1>
        <p className="koe-thanks-sub">
          8月2日（日）11時、池内記念会館でお待ちしております。
        </p>
        <a
          className="koe-back kessei-thanks-map"
          href={MAP_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          会場の地図を見る
        </a>
        <Link href="/" className="koe-back kessei-thanks-home">
          トップへ戻る
        </Link>
      </main>
    );
  }

  return (
    <main className="koe">
      <div className="koe-inner">
        <header className="koe-head">
          <p className="koe-eyebrow">
            <span className="dot" aria-hidden="true" />
            村田ひろき後援会・総決起大会
          </p>
          <h1 className="koe-title">
            8月2日（日）、
            <br />
            <span className="accent">ご一緒しませんか。</span>
          </h1>
          <p className="koe-sub">
            ご来場の人数を事前に把握するための、参加のお申込みフォームです。
            数タップ・1分ほどで終わります。
          </p>
        </header>

        {/* イベント情報（案内状＝正本と一致。仕様書 §4） */}
        <section className="koe-card kessei-event" aria-label="開催のご案内">
          <dl className="kessei-event-list">
            <div className="kessei-event-row">
              <dt>名称</dt>
              <dd>村田ひろき後援会　総決起大会</dd>
            </div>
            <div className="kessei-event-row">
              <dt>日時</dt>
              <dd>2026年8月2日（日）午前11時 開演（開場 午前10時30分）</dd>
            </div>
            <div className="kessei-event-row">
              <dt>会場</dt>
              <dd>
                池内記念会館（大阪府松原市天美東8丁目6-6）
                <a
                  className="kessei-event-map"
                  href={MAP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  地図を見る
                </a>
              </dd>
            </div>
            <div className="kessei-event-row">
              <dt>ご来賓</dt>
              <dd>
                衆議院議員 浦野靖人 氏／大阪府議会議員 山本しんご 氏（いずれもご予定）
              </dd>
            </div>
            <div className="kessei-event-row">
              <dt>参加費</dt>
              <dd>無料（どなたでもご参加いただけます）</dd>
            </div>
            <div className="kessei-event-row">
              <dt>主催・連絡先</dt>
              <dd>
                村田ひろき後援会　電話 070-2208-5416 ／ メール matsubara.murata@gmail.com
              </dd>
            </div>
          </dl>
          <p className="kessei-event-note">
            当日のご来場（お申込なし）も歓迎いたします。
          </p>
        </section>

        {/* お名前・ご連絡先 */}
        <section className="koe-card">
          <div className="koe-label-row">
            <label className="koe-label" htmlFor="ks-name">
              お名前
            </label>
            <span className="koe-req">必須</span>
          </div>
          <input
            id="ks-name"
            className="koe-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            autoComplete="name"
            placeholder="例：村田 ひろき"
          />

          <div className="koe-label-row koe-label-mt">
            <label className="koe-label" htmlFor="ks-tel">
              電話番号
            </label>
            <span className="koe-req">必須</span>
          </div>
          <input
            id="ks-tel"
            className="koe-input"
            type="tel"
            value={tel}
            onChange={(e) => setTel(e.target.value)}
            maxLength={20}
            inputMode="tel"
            autoComplete="tel"
            placeholder="例：090-1234-5678"
          />
          <p className="koe-contact-note">
            当日のご連絡・お席のご用意のために使わせていただきます。
          </p>

          <div className="koe-label-row koe-label-mt">
            <label className="koe-label" htmlFor="ks-email">
              メールアドレス
            </label>
            <span className="koe-opt">任意</span>
          </div>
          <input
            id="ks-email"
            className="koe-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={200}
            inputMode="email"
            autoComplete="email"
            placeholder="例：example@mail.com"
          />
          {!emailValid && (
            <p className="koe-contact-note koenkai-warn">
              メールアドレスの形式をご確認ください。
            </p>
          )}
        </section>

        {/* ご参加人数（本人を含む総数・ステッパー） */}
        <section className="koe-card">
          <div className="koe-label-row">
            <span className="koe-label" id="ks-party-label">
              ご参加人数
            </span>
            <span className="koe-req">必須</span>
          </div>
          <p className="kessei-party-hint">
            ご本人を含めた総数をご記入ください。（お連れの方がいらっしゃる場合はその人数も含めて）
          </p>
          <div className="kessei-stepper" role="group" aria-labelledby="ks-party-label">
            <button
              type="button"
              className="kessei-step-btn"
              aria-label="1人減らす"
              onClick={() => stepParty(-1)}
              disabled={partySize <= 1}
            >
              −
            </button>
            <span className="kessei-step-value" aria-live="polite">
              {partySize}
              <span className="kessei-step-unit">名</span>
            </span>
            <button
              type="button"
              className="kessei-step-btn"
              aria-label="1人増やす"
              onClick={() => stepParty(1)}
              disabled={partySize >= PARTY_SIZE_MAX}
            >
              ＋
            </button>
          </div>
        </section>

        {/* ご紹介者（任意） */}
        <section className="koe-card">
          <div className="koe-label-row">
            <label className="koe-label" htmlFor="ks-referrer">
              ご紹介者のお名前
            </label>
            <span className="koe-opt">任意</span>
          </div>
          <p className="kessei-party-hint">
            どなたかのお声がけでお越しの場合、お名前をご記入ください。
          </p>
          <input
            id="ks-referrer"
            className="koe-input"
            type="text"
            value={referrer}
            onChange={(e) => setReferrer(e.target.value)}
            maxLength={100}
            autoComplete="off"
            placeholder="例）村田さなえ"
          />
        </section>

        {/* ご連絡事項（任意） */}
        <section className="koe-card">
          <div className="koe-label-row">
            <label className="koe-label" htmlFor="ks-note">
              ご連絡事項
            </label>
            <span className="koe-opt">任意</span>
          </div>
          <textarea
            id="ks-note"
            className="koe-textarea"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            maxLength={2000}
            placeholder="例：車椅子で伺います／ベビーカー・お子様連れです など"
          />
        </section>

        {/* ハニーポット（スクリーンリーダー・人間には見せない） */}
        <div className="koenkai-hp" aria-hidden="true">
          <label htmlFor="ks-website">Website</label>
          <input
            id="ks-website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        <p className="koe-privacy">
          ご記入いただいた情報は、村田ひろきの政治活動における連絡・調整の目的のみに使用し、
          法令に基づく場合を除き第三者へ提供しません。
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
              'この内容でお申込みする'
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
