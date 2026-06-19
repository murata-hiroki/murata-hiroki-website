export default function Footer() {
  return (
    <footer id="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="name">村田 ひろき</div>
          <div className="role">大阪維新の会 松原市政対策委員</div>
          <div className="sig">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/signature.png" alt="Hiroki Murata" />
          </div>
        </div>
        <div className="footer-nav">
          <div className="row">
            <a href="#home">ホーム</a>
            <a href="#about">プロフィール</a>
            <a href="#promises">政策</a>
            <a href="#activity">活動報告</a>
            <a href="#support">サポート</a>
            <a href="/koenkai">賛同会員（無料）</a>
          </div>
          <div className="footer-contact">
            <div className="footer-contact-label">お問い合わせ</div>
            <a href="mailto:matsubara.murata@gmail.com">matsubara.murata@gmail.com</a>
            <a href="tel:+817022085416">070-2208-5416</a>
          </div>
          <div className="row">
            <a href="#">プライバシーポリシー</a>
            <a href="#">特定商取引法に基づく表記</a>
          </div>
        </div>
        <div className="footer-socials">
          <a href="#" aria-label="Facebook">
            <svg className="icn" width="14" height="14" viewBox="0 0 24 24" style={{ fill: "currentColor", stroke: "none" }}>
              <path d="M14 9h3V5.5h-3c-2 0-3.5 1.5-3.5 3.5V11H8v3.5h2.5V21H14v-6.5h2.5L17 11h-3V9.5c0-.3.2-.5.5-.5z" />
            </svg>
          </a>
          <a href="#" aria-label="X">
            <svg className="icn" width="13" height="13" viewBox="0 0 24 24" style={{ fill: "currentColor", stroke: "none" }}>
              <path d="M17.5 3h3L14 11l7.5 10h-5.5l-4.5-6.2L6 21H3l7-9-7-9h5.5l4.2 5.8z" />
            </svg>
          </a>
          <a href="#" aria-label="Instagram">
            <svg className="icn" width="14" height="14" viewBox="0 0 24 24">
              <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
            </svg>
          </a>
        </div>
      </div>
      <div className="footer-bottom">© 2026 Hiroki Murata. All Rights Reserved.</div>
    </footer>
  );
}
