'use client';

import { Fragment, useState } from 'react';
import Link from 'next/link';

/**
 * 対象日（route.ts の許可リストと一致させること）
 * 8/9〜8/15 の 7 日間。曜日は仕様書で検証済み。
 * ⚠️ 画面には日付と曜日だけを出す（「告示日」「選挙運動期間」等の語は出さない）。
 */
const DAYS = [
  { date: '2026-08-09', label: '8/9', dow: '日' },
  { date: '2026-08-10', label: '8/10', dow: '月' },
  { date: '2026-08-11', label: '8/11', dow: '火' },
  { date: '2026-08-12', label: '8/12', dow: '水' },
  { date: '2026-08-13', label: '8/13', dow: '木' },
  { date: '2026-08-14', label: '8/14', dow: '金' },
  { date: '2026-08-15', label: '8/15', dow: '土' },
] as const;

/** シフト枠（route.ts の許可リストと一致させること）。8:00〜20:00 を 3 時間 × 4 枠。 */
const SLOTS = [
  { id: '08-11', head: '8–11', label: '8:00〜11:00' },
  { id: '11-14', head: '11–14', label: '11:00〜14:00' },
  { id: '14-17', head: '14–17', label: '14:00〜17:00' },
  { id: '17-20', head: '17–20', label: '17:00〜20:00' },
] as const;

type Status = 'editing' | 'sending' | 'done' | 'error';
type FormType = '' | 'volunteer' | 'speaker';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** シフト 1 マスを表す内部キー。送信時に {date, slot} へ戻す。 */
const cellKey = (date: string, slot: string) => `${date}__${slot}`;

export default function VolunteerPage() {
  const [type, setType] = useState<FormType>('');
  const [name, setName] = useState('');
  const [tel, setTel] = useState('');
  const [email, setEmail] = useState('');
  const [shifts, setShifts] = useState<string[]>([]);
  const [note, setNote] = useState('');
  // 先生（speaker）のみ。スポット以外もお手伝いできる場合の意思表示。
  // 何をお願いするかはフォームに並べず、後ほど個別にご相談する。
  const [wantsHelp, setWantsHelp] = useState(false);

  // スパムよけハニーポット（人間は触らない隠しフィールド）
  const [website, setWebsite] = useState('');

  const [status, setStatus] = useState<Status>('editing');

  const toggleCell = (key: string) => {
    setShifts((prev) =>
      prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key],
    );
  };

  const dayKeys = (date: string) => SLOTS.map((s) => cellKey(date, s.id));
  const isDayFull = (date: string) =>
    dayKeys(date).every((k) => shifts.includes(k));

  /** 日付ラベルのタップで、その日の 4 枠をまとめて選ぶ／外す。 */
  const toggleDay = (date: string) => {
    const keys = dayKeys(date);
    setShifts((prev) =>
      isDayFull(date)
        ? prev.filter((k) => !keys.includes(k))
        : [...new Set([...prev, ...keys])],
    );
  };

  const emailValid = email.trim().length === 0 || EMAIL_RE.test(email.trim());

  const canSubmit =
    status !== 'sending' &&
    (type === 'volunteer' || type === 'speaker') &&
    name.trim().length > 0 &&
    tel.trim().length > 0 &&
    emailValid &&
    shifts.length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setStatus('sending');
    try {
      // 内部キーを集計しやすい {date, slot} の配列に戻す（DAYS / SLOTS の順を保つ）
      const shiftPairs = DAYS.flatMap((d) =>
        SLOTS.filter((s) => shifts.includes(cellKey(d.date, s.id))).map((s) => ({
          date: d.date,
          slot: s.id,
        })),
      );

      const res = await fetch('/api/volunteer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          tel,
          email,
          type,
          shifts: shiftPairs,
          wantsHelp: type === 'speaker' ? wantsHelp : false,
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
          ありがとうございます。
          <br />
          たしかに、承りました。
        </h1>
        <p className="koe-thanks-sub">
          お聞かせいただいた日時をもとに、追って担当より個別にご連絡いたします。
          お力添えに、心より御礼申し上げます。
        </p>
        <Link href="/" className="koe-back">
          トップへ戻る
        </Link>
      </main>
    );
  }

  const chosen = type === 'volunteer' || type === 'speaker';

  return (
    <main className="koe">
      <div className="koe-inner">
        <header className="koe-head">
          <p className="koe-eyebrow">
            <span className="dot" aria-hidden="true" />
            村田ひろき事務所より、お手伝いのお願い
          </p>
          <h1 className="koe-title">
            お力を貸していただける
            <br />
            <span className="accent">日時をお聞かせください。</span>
          </h1>
          <p className="koe-sub">
            8月9日（日）〜15日（土）の段取りを組むにあたり、ご都合のよい枠をお教えください。
            数タップで終わります。
          </p>
        </header>

        {/* ご協力の種別（必須・分岐の起点） */}
        <section className="koe-card">
          <div className="koe-label-row">
            <span className="koe-label">どちらでのご協力ですか</span>
            <span className="koe-req">必須</span>
          </div>
          <div className="koe-chips">
            <button
              type="button"
              className="koe-chip"
              aria-pressed={type === 'volunteer'}
              onClick={() => setType('volunteer')}
            >
              <span className="koe-chip-text">お手伝い</span>
              <span className="koe-chip-mark" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="koe-chip"
              aria-pressed={type === 'speaker'}
              onClick={() => setType('speaker')}
            >
              <span className="koe-chip-text">先生・応援弁士</span>
              <span className="koe-chip-mark" aria-hidden="true" />
            </button>
          </div>
        </section>

        {!chosen && (
          <p className="koe-privacy vol-pick-hint">
            どちらかをお選びいただくと、続きが表示されます。
          </p>
        )}

        {chosen && (
          <>
            {/* お名前・ご連絡先（共通） */}
            <section className="koe-card">
              <div className="koe-label-row">
                <label className="koe-label" htmlFor="vol-name">
                  お名前
                </label>
                <span className="koe-req">必須</span>
              </div>
              <input
                id="vol-name"
                className="koe-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                autoComplete="name"
                placeholder="例：村田 ひろき"
              />

              <div className="koe-label-row koe-label-mt">
                <label className="koe-label" htmlFor="vol-tel">
                  電話番号
                </label>
                <span className="koe-req">必須</span>
              </div>
              <input
                id="vol-tel"
                className="koe-input"
                type="tel"
                value={tel}
                onChange={(e) => setTel(e.target.value)}
                maxLength={20}
                inputMode="tel"
                autoComplete="tel"
                placeholder="例：090-1234-5678"
              />
              <p className="koe-contact-note">当日のご連絡に使わせていただきます。</p>

              <div className="koe-label-row koe-label-mt">
                <label className="koe-label" htmlFor="vol-email">
                  メールアドレス
                </label>
                <span className="koe-opt">任意</span>
              </div>
              <input
                id="vol-email"
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

            {/* シフト（7日 × 4枠 = 28マス） */}
            <section className="koe-card">
              <div className="koe-label-row">
                <span className="koe-label" id="vol-shifts-label">
                  {type === 'speaker'
                    ? 'お越しいただける枠（複数可）'
                    : '来られる日時（複数可）'}
                </span>
                <span className="koe-req">1つ以上えらぶ</span>
              </div>

              {/* 何をお願いするかは事務所側で決め、いただいた枠をもとに個別にご相談する */}
              {type === 'volunteer' && (
                <p className="vol-assign-note">
                  何をお願いするかは、いただいた枠をもとに、後ほど個別にご相談させてください。
                </p>
              )}

              {type === 'speaker' && (
                <p className="vol-speaker-note">
                  街頭にてマイクを握り、ひとことお言葉を頂戴できればと存じます。
                  <strong>ご登壇は1回15〜30分程度</strong>を想定しております。
                  街宣車の場所を組む都合上、お越しいただける<strong>3時間の枠</strong>
                  をお教えください。
                  枠内のどの時間にお越しいただくかは、後ほど個別に調整させていただきます。
                </p>
              )}

              <p className="vol-grid-hint">
                日付をタップすると、その日の4枠をまとめて選べます。
              </p>

              <div
                className="vol-grid"
                role="group"
                aria-labelledby="vol-shifts-label"
              >
                <span className="vol-grid-corner" aria-hidden="true" />
                {SLOTS.map((s) => (
                  <span key={s.id} className="vol-slot-head" aria-hidden="true">
                    {s.head}
                  </span>
                ))}

                {DAYS.map((d) => (
                  <Fragment key={d.date}>
                    <button
                      type="button"
                      className="vol-day"
                      aria-pressed={isDayFull(d.date)}
                      aria-label={`${d.label}（${d.dow}）の4枠をまとめて選ぶ`}
                      onClick={() => toggleDay(d.date)}
                    >
                      <span className="vol-day-date">{d.label}</span>
                      <span className="vol-day-dow">{d.dow}</span>
                    </button>
                    {SLOTS.map((s) => {
                      const key = cellKey(d.date, s.id);
                      return (
                        <button
                          key={s.id}
                          type="button"
                          className="vol-cell"
                          aria-pressed={shifts.includes(key)}
                          aria-label={`${d.label}（${d.dow}）${s.label}`}
                          onClick={() => toggleCell(key)}
                        />
                      );
                    })}
                  </Fragment>
                ))}
              </div>

              <p className="koe-contact-note">
                時間は 8–11＝8:00〜11:00、11–14＝11:00〜14:00、14–17＝14:00〜17:00、17–20＝17:00〜20:00 です。
              </p>
            </section>

            {/* 登壇以外のお力添え（type=speaker のみ・任意） */}
            {type === 'speaker' && (
              <section className="koe-card">
                <label className="koe-toggle">
                  <span className="koe-toggle-text">
                    スポット以外もお手伝いできます
                    <span className="koe-toggle-hint">
                      くわしい内容は、後ほど個別にご相談させてください。
                    </span>
                  </span>
                  <input
                    type="checkbox"
                    checked={wantsHelp}
                    onChange={(e) => setWantsHelp(e.target.checked)}
                  />
                  <span className="koe-switch" aria-hidden="true" />
                </label>
              </section>
            )}

            {/* ご連絡事項（任意） */}
            <section className="koe-card">
              <div className="koe-label-row">
                <label className="koe-label" htmlFor="vol-note">
                  ご連絡事項
                </label>
                <span className="koe-opt">任意</span>
              </div>
              <textarea
                id="vol-note"
                className="koe-textarea"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                maxLength={2000}
                placeholder="例：15時までなら大丈夫です／途中からでも構いません など"
              />
            </section>

            {/* ハニーポット（スクリーンリーダー・人間には見せない） */}
            <div className="koenkai-hp" aria-hidden="true">
              <label htmlFor="vol-website">Website</label>
              <input
                id="vol-website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>

            {/* 注記（仕様書 §5-4） */}
            <p className="koe-privacy">
              ※ 公務員の方は、法令上ご協力いただけない場合がございます。恐れ入りますがご確認ください。
            </p>
            <p className="koe-privacy">
              ご記入いただいた情報は、村田ひろきの政治活動における連絡・調整の目的のみに使用し、
              法令に基づく場合を除き第三者へ提供しません。
            </p>
          </>
        )}

        {status === 'error' && (
          <p className="koe-error" role="alert" aria-live="assertive">
            送信に失敗しました。少し時間をおいて、もう一度お試しください。
          </p>
        )}
      </div>

      {/* 送信ボタン（下部固定） */}
      {chosen && (
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
                'この内容で送る'
              )}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
