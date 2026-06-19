"use client";

import { useState } from "react";
import Link from "next/link";

const links = [
  { href: "#home", label: "ホーム" },
  { href: "#about", label: "プロフィール" },
  { href: "#promises", label: "政策" },
  { href: "#activity", label: "活動報告" },
  { href: "#support", label: "サポート" },
  { href: "#footer", label: "お問い合わせ" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <nav className="top">
      <div className="nav-inner">
        <a href="#home" className="brand" onClick={close}>
          <span className="name">村田 ひろき</span>
          <span className="role">大阪維新の会 松原市政対策委員</span>
        </a>
        <ul className="nav-links">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className={l.href === "#home" ? "active" : undefined}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <Link href="/koenkai" className="btn-pill">
          賛同会員になる <span className="arrow-circle">→</span>
        </Link>
        <button
          className="hamburger"
          aria-label={open ? "メニューを閉じる" : "メニューを開く"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {open && (
        <div className="mobile-menu" role="dialog" aria-label="メニュー">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={close}>
              {l.label}
            </a>
          ))}
          <Link href="/koenkai" className="mobile-koenkai" onClick={close}>
            賛同会員になる（無料）
          </Link>
          <div className="contact">
            <a href="mailto:matsubara.murata@gmail.com" onClick={close}>matsubara.murata@gmail.com</a>
            <a href="tel:+817022085416" onClick={close}>070-2208-5416</a>
          </div>
        </div>
      )}
    </nav>
  );
}
