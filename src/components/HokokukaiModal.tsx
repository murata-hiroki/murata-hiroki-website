"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const STORAGE_KEY = "murata_hokokukai_modal_dismissed_until";
const REAPPEAR_AFTER_MS = 24 * 60 * 60 * 1000;
const OPEN_DELAY_MS = 1000;

/**
 * 告知モーダルを出したくない画面（前方一致）。
 * 記入してもらうことが目的のフォームは、開いた瞬間にモーダルで塞がない。
 * ※ "/koe" は /koe と /koenkai の両方に前方一致する。
 */
const MODAL_SUPPRESSED_PREFIXES = ["/koe", "/volunteer"];

export default function HokokukaiModal() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const ctaRef = useRef<HTMLAnchorElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (MODAL_SUPPRESSED_PREFIXES.some((p) => pathname?.startsWith(p))) return;

    let suppressed = false;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const until = raw ? Number(raw) : 0;
      if (Number.isFinite(until) && until > Date.now()) {
        suppressed = true;
      }
    } catch {
      // localStorage unavailable (Safari private mode etc.) → show anyway
    }
    if (suppressed) return;

    const t = window.setTimeout(() => setIsOpen(true), OPEN_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [pathname]);

  const close = useCallback(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        String(Date.now() + REAPPEAR_AFTER_MS),
      );
    } catch {
      // ignore
    }
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    document.body.classList.add("hkk-scroll-lock");
    // Wait a frame so the element is in the DOM before focusing.
    const raf = window.requestAnimationFrame(() => {
      closeBtnRef.current?.focus();
    });

    return () => {
      window.cancelAnimationFrame(raf);
      document.body.classList.remove("hkk-scroll-lock");
      previousFocusRef.current?.focus?.();
    };
  }, [isOpen]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      close();
      return;
    }
    if (e.key !== "Tab") return;

    const closeEl = closeBtnRef.current;
    const ctaEl = ctaRef.current;
    if (!closeEl || !ctaEl) return;

    const active = document.activeElement;
    if (e.shiftKey && active === closeEl) {
      e.preventDefault();
      ctaEl.focus();
    } else if (!e.shiftKey && active === ctaEl) {
      e.preventDefault();
      closeEl.focus();
    }
  };

  const onOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) close();
  };

  const onCtaClick = () => {
    console.log("[HokokukaiModal] LINE CTA clicked");
    close();
  };

  if (!isOpen) return null;

  return (
    <div
      className="hkk-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hkk-title"
      onClick={onOverlayClick}
      onKeyDown={onKeyDown}
    >
      <div className="hkk-modal">
        <button
          ref={closeBtnRef}
          type="button"
          onClick={close}
          aria-label="閉じる"
          className="hkk-close"
        >
          ×
        </button>
        <div className="hkk-banner-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="hkk-banner"
            src="/images/hokokukai-banner.png"
            alt="7月19日 政治活動報告会 開催のお知らせ"
          />
        </div>
        <div className="hkk-body">
          <h2 id="hkk-title" className="hkk-title">
            📣 7/19(日) 政治活動報告会
          </h2>
          <p className="hkk-meta">
            <span>開場 13:30 / 開始 14:00</span>
            <span>松原テラス 多目的ホール</span>
          </p>
          <p className="hkk-note">
            最新情報・会場詳細は
            <br />
            LINEで配信中📲
          </p>
          <a
            ref={ctaRef}
            className="hkk-cta"
            href="https://lin.ee/9Tm7Ata"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onCtaClick}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="hkk-cta-icon"
              src="/images/line-icon.png"
              alt=""
              aria-hidden="true"
            />
            LINEで友だち追加
          </a>
          <p className="hkk-host">主催: 村田ひろき後援会</p>
        </div>
      </div>
    </div>
  );
}
