'use client';

import { useCallback, useEffect, useState } from 'react';
import { composeReply } from '@/lib/composeReply';

// Basic 認証は middleware.ts で担保済み（matcher: /admin/*）。
// スタイルは globals.css の .voices-* と CSS 変数（--green 等）に統一。

type Voice = {
  id: string;
  created_at: string;
  display_name: string | null;
  contact_name: string | null;
  contact: string | null;
  area: string | null;
  categories: string[] | null;
  message: string | null;
  wants_reply: boolean;
  status: string | null;
  replied_at: string | null;
  reply_text: string | null;
  canReply: boolean;
};

const FILTERS = [
  { key: 'pending', label: '未対応の返信希望' },
  { key: 'contactable', label: '連絡できる声' },
  { key: 'all', label: 'すべて' },
  { key: 'replied', label: '返信済み' },
  { key: 'closed', label: '対応済み' },
] as const;

type FilterKey = (typeof FILTERS)[number]['key'];

function formatJst(iso: string): string {
  try {
    return new Intl.DateTimeFormat('ja-JP', {
      timeZone: 'Asia/Tokyo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function callerName(v: Voice): string {
  return v.contact_name || v.display_name || '匿名';
}

export default function AdminVoicesPage() {
  const [filter, setFilter] = useState<FilterKey>('pending');
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (f: FilterKey) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/voices?filter=${f}`, {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('取得に失敗しました');
      const json = (await res.json()) as { ok: boolean; voices: Voice[] };
      setVoices(json.voices ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : '取得に失敗しました');
      setVoices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(filter);
  }, [filter, load]);

  return (
    <main className="voices-page">
      <div className="voices-head">
        <h1 className="voices-title">声への返信</h1>
        <p className="voices-sub">
          いただいた声を確認し、返信希望の方へその場でお返事できます。
        </p>
      </div>

      <div className="voices-filters">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`voices-filter${filter === f.key ? ' is-active' : ''}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="voices-list">
        {loading && <p className="voices-note">読み込み中…</p>}
        {error && <p className="voices-note voices-note-err">{error}</p>}
        {!loading && !error && voices.length === 0 && (
          <p className="voices-note">該当する声はありません。</p>
        )}
        {voices.map((v) => (
          <VoiceCard key={v.id} voice={v} onChanged={() => load(filter)} />
        ))}
      </div>
    </main>
  );
}

function VoiceCard({
  voice,
  onChanged,
}: {
  voice: Voice;
  onChanged: () => void;
}) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [closing, setClosing] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const replied = voice.status === 'replied';
  const closed = voice.status === 'closed';

  async function send() {
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setMsg(null);
    try {
      const res = await fetch('/api/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: voice.id, text: body }),
      });
      if (!res.ok) throw new Error('送信に失敗しました');
      setDone(true);
      setMsg('返信を送信しました');
      onChanged();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : '送信に失敗しました');
    } finally {
      setSending(false);
    }
  }

  async function markClosed() {
    if (closing) return;
    setClosing(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/voices/${voice.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'closed' }),
      });
      if (!res.ok) throw new Error('更新に失敗しました');
      onChanged();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : '更新に失敗しました');
    } finally {
      setClosing(false);
    }
  }

  return (
    <article className="voices-card">
      <div className="voices-card-top">
        <span className="voices-date">{formatJst(voice.created_at)}</span>
        <div className="voices-badges">
          {voice.wants_reply ? (
            <span className="voices-badge is-reply">返信希望</span>
          ) : (
            <span className="voices-badge is-closed">返信希望なし</span>
          )}
          {replied && <span className="voices-badge is-replied">返信済み</span>}
          {closed && <span className="voices-badge is-closed">対応済み</span>}
        </div>
      </div>

      <div className="voices-name">
        {callerName(voice)}
        {voice.contact && (
          <span className="voices-contact">({voice.contact})</span>
        )}
      </div>

      <div className="voices-meta">
        {voice.area && <span className="voices-area">📍 {voice.area}</span>}
        {(voice.categories ?? []).map((c) => (
          <span key={c} className="voices-cat">
            {c}
          </span>
        ))}
      </div>

      {voice.message && <p className="voices-message">{voice.message}</p>}

      {replied && voice.reply_text && (
        <div className="voices-replied">
          <div className="voices-replied-head">
            返信済み{voice.replied_at ? `・${formatJst(voice.replied_at)}` : ''}
          </div>
          <p className="voices-replied-text">{voice.reply_text}</p>
        </div>
      )}

      {!replied && !done && (
        <div className="voices-reply">
          {voice.canReply ? (
            <>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                maxLength={1000}
                placeholder="いただいた内容へのお返事を入力"
                className="voices-textarea"
              />
              {text.trim() && (
                <div className="voices-preview">
                  <div className="voices-preview-head">
                    LINEに届く文面（プレビュー）
                  </div>
                  <p className="voices-preview-body">
                    {composeReply(voice.message, text)}
                  </p>
                </div>
              )}
              <div className="voices-actions">
                <button
                  onClick={send}
                  disabled={sending || !text.trim()}
                  className="voices-send"
                >
                  {sending && <span className="voices-spin" />}
                  LINEで返信
                </button>
                {!closed && (
                  <button
                    onClick={markClosed}
                    disabled={closing}
                    className="voices-close"
                  >
                    返信せず対応済みに
                  </button>
                )}
              </div>
            </>
          ) : (
            <p className="voices-noreply">返信不可（匿名送信）</p>
          )}
        </div>
      )}

      {done && <p className="voices-msg-ok">返信を送信しました</p>}
      {msg && !done && <p className="voices-msg-err">{msg}</p>}
    </article>
  );
}
