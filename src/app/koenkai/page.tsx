'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';

/** 年代の選択肢（route.ts の許可リストと一致させること） */
const AGE_GROUPS = [
  '10代',
  '20代',
  '30代',
  '40代',
  '50代',
  '60代',
  '70代以上',
] as const;

type Status = 'editing' | 'sending' | 'done' | 'error';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function KoenkaiPage() {
  const [name, setName] = useState('');
  const [nameKana, setNameKana] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [occupation, setOccupation] = useState('');
  const [message, setMessage] = useState('');
  const [agreed, setAgreed] = useState(false);

  // スパムよけハニーポット（人間は触らない隠しフィールド）
  const [website, setWebsite] = useState('');

  const [status, setStatus] = useState<Status>('editing');

  // 郵便番号→住所の自動補完
  const [zipStatus, setZipStatus] = useState<'idle' | 'loading' | 'notfound'>('idle');
  // 自動補完で入れた住所を控えておき、ユーザーの手入力を上書きしないためのガード
  const autoAddressRef = useRef('');

  const handlePostalChange = (raw: string) => {
    setPostalCode(raw);
    // 全角数字を半角化してから数字だけ取り出す
    const digits = raw
      .replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0))
      .replace(/[^0-9]/g, '');
    if (digits.length === 7) {
      void lookupAddress(digits);
    } else if (zipStatus !== 'idle') {
      setZipStatus('idle');
    }
  };

  const lookupAddress = async (zip: string) => {
    setZipStatus('loading');
    try {
      const res = await fetch(
        `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${zip}`,
      );
      const data = (await res.json().catch(() => null)) as {
        results?: { address1?: string; address2?: string; address3?: string }[] | null;
      } | null;
      const r = data?.results?.[0];
      if (r) {
        const base = `${r.address1 ?? ''}${r.address2 ?? ''}${r.address3 ?? ''}`;
        // 住所欄が空、または前回の自動補完値のままなら上書きする
        if (address === '' || address === autoAddressRef.current) {
          autoAddressRef.current = base;
          setAddress(base);
        }
        setZipStatus('idle');
      } else {
        setZipStatus('notfound');
      }
    } catch {
      setZipStatus('notfound');
    }
  };

  // 連絡先は メール または 電話 のどちらか1つ以上
  const hasContact = email.trim().length > 0 || phone.trim().length > 0;
  const emailValid = email.trim().length === 0 || EMAIL_RE.test(email.trim());
  const canSubmit =
    name.trim().length > 0 &&
    hasContact &&
    emailValid &&
    agreed &&
    status !== 'sending';

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setStatus('sending');
    try {
      const res = await fetch('/api/koenkai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          nameKana,
          postalCode,
          address,
          email,
          phone,
          ageGroup,
          occupation,
          message,
          agreed,
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
          ご登録、ありがとうございます。
          <br />
          一緒に、まちをつくっていきましょう。
        </h1>
        <p className="koe-thanks-sub">
          村田ひろき後援会の賛同会員として、たしかに受け付けました。
          今後の活動や報告をお届けします。
        </p>
        <Link href="/" className="koe-back">
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
            村田ひろき後援会・賛同会員（会費無料）
          </p>
          <h1 className="koe-title">
            まちの未来に、
            <br />
            <span className="accent">あなたの賛同を。</span>
          </h1>
          <p className="koe-sub">
            会費はかかりません。お名前とご連絡先をご登録いただくだけで、
            村田ひろきの後援会・賛同会員としてご参加いただけます。
          </p>
        </header>

        {/* お名前（必須） */}
        <section className="koe-card">
          <div className="koe-label-row">
            <label className="koe-label" htmlFor="kk-name">
              お名前
            </label>
            <span className="koe-req">必須</span>
          </div>
          <input
            id="kk-name"
            className="koe-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            autoComplete="name"
            placeholder="例：村田 ひろき"
          />

          <div className="koe-label-row koe-label-mt">
            <label className="koe-label" htmlFor="kk-kana">
              ふりがな
            </label>
            <span className="koe-opt">任意</span>
          </div>
          <input
            id="kk-kana"
            className="koe-input"
            type="text"
            value={nameKana}
            onChange={(e) => setNameKana(e.target.value)}
            maxLength={100}
            placeholder="例：むらた ひろき"
          />
        </section>

        {/* ご連絡先（メール または 電話のいずれか必須） */}
        <section className="koe-card">
          <div className="koe-label-row">
            <span className="koe-label">ご連絡先</span>
            <span className="koe-req">どちらか必須</span>
          </div>
          <label className="koe-sublabel" htmlFor="kk-email">
            メールアドレス
          </label>
          <input
            id="kk-email"
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

          <label className="koe-sublabel koenkai-sublabel-mt" htmlFor="kk-phone">
            電話番号
          </label>
          <input
            id="kk-phone"
            className="koe-input"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={20}
            inputMode="tel"
            autoComplete="tel"
            placeholder="例：090-1234-5678"
          />
          <p className="koe-contact-note">
            活動のご報告やご連絡に使用します。どちらか一方のご記入で結構です。
          </p>
        </section>

        {/* ご住所（任意） */}
        <section className="koe-card">
          <div className="koe-label-row">
            <span className="koe-label">ご住所</span>
            <span className="koe-opt">任意</span>
          </div>
          <label className="koe-sublabel" htmlFor="kk-postal">
            郵便番号
          </label>
          <div className="koenkai-zip-row">
            <input
              id="kk-postal"
              className="koe-input koenkai-input-narrow"
              type="text"
              value={postalCode}
              onChange={(e) => handlePostalChange(e.target.value)}
              maxLength={8}
              inputMode="numeric"
              autoComplete="postal-code"
              placeholder="例：580-0000"
            />
            {zipStatus === 'loading' && (
              <span className="koenkai-zip-note" aria-live="polite">
                <span className="koe-spin koenkai-zip-spin" aria-hidden="true" />
                住所を検索中…
              </span>
            )}
            {zipStatus === 'notfound' && (
              <span className="koenkai-zip-note koenkai-warn" aria-live="polite">
                該当する住所が見つかりませんでした
              </span>
            )}
          </div>

          <label className="koe-sublabel koenkai-sublabel-mt" htmlFor="kk-address">
            住所
          </label>
          <input
            id="kk-address"
            className="koe-input"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            maxLength={200}
            autoComplete="street-address"
            placeholder="例：松原市天美◯◯町1-2-3"
          />
        </section>

        {/* 年代・ご職業（任意） */}
        <section className="koe-card">
          <div className="koe-label-row">
            <span className="koe-label">年代</span>
            <span className="koe-opt">任意</span>
          </div>
          <div className="koe-chips koenkai-chips-age">
            {AGE_GROUPS.map((a) => {
              const selected = ageGroup === a;
              return (
                <button
                  key={a}
                  type="button"
                  className="koe-chip koenkai-chip-age"
                  aria-pressed={selected}
                  onClick={() => setAgeGroup(selected ? '' : a)}
                >
                  <span className="koe-chip-text">{a}</span>
                </button>
              );
            })}
          </div>

          <div className="koe-label-row koe-label-mt">
            <label className="koe-label" htmlFor="kk-occupation">
              ご職業
            </label>
            <span className="koe-opt">任意</span>
          </div>
          <input
            id="kk-occupation"
            className="koe-input"
            type="text"
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
            maxLength={100}
            placeholder="例：会社員 / 自営業 / 学生 など"
          />
        </section>

        {/* 応援メッセージ（任意） */}
        <section className="koe-card">
          <div className="koe-label-row">
            <label className="koe-label" htmlFor="kk-message">
              応援メッセージ
            </label>
            <span className="koe-opt">任意</span>
          </div>
          <textarea
            id="kk-message"
            className="koe-textarea"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            maxLength={2000}
            placeholder="村田ひろきへの応援や、まちへの想いをお聞かせください"
          />
        </section>

        {/* ハニーポット（スクリーンリーダー・人間には見せない） */}
        <div className="koenkai-hp" aria-hidden="true">
          <label htmlFor="kk-website">Website</label>
          <input
            id="kk-website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        {/* 同意（必須） */}
        <section className="koe-card">
          <label className="koenkai-consent">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <span className="koenkai-consent-box" aria-hidden="true" />
            <span className="koenkai-consent-text">
              個人情報の取り扱いに同意して登録します。
              <span className="koenkai-consent-hint">
                ご登録いただいた情報は、村田ひろきの政治活動（後援会運営・活動報告・ご連絡）の目的のみに使用し、
                法令に基づく場合を除き第三者へ提供しません。
              </span>
            </span>
          </label>
        </section>

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
              '賛同会員として登録する'
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
