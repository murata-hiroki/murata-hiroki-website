export default function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-panel" aria-hidden>
        <svg viewBox="0 0 1440 820" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="gp" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00A040" />
              <stop offset="60%" stopColor="#038038" />
              <stop offset="100%" stopColor="#026A2E" />
            </linearGradient>
            <pattern id="tex" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(135)">
              <line x1="0" y1="0" x2="0" y2="16" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            </pattern>
            <radialGradient id="gloss" cx="15%" cy="0%" r="70%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
              <stop offset="60%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
          </defs>
          <path d="M 0 0 L 720 0 C 640 220, 820 500, 520 820 L 0 820 Z" fill="url(#gp)" />
          <path d="M 0 0 L 720 0 C 640 220, 820 500, 520 820 L 0 820 Z" fill="url(#tex)" />
          <path d="M 0 0 L 720 0 C 640 220, 820 500, 520 820 L 0 820 Z" fill="url(#gloss)" opacity="0.5" />
        </svg>
      </div>

      <div className="hero-inner">
        <div className="hero-copy">
          <span className="role-pill">大阪維新の会 松原市政対策委員</span>
          <h1>
            若い力で、聞く、動く、
            <br />
            <em>変えていく</em>。
          </h1>
          <p className="hero-lead">
            東京から松原に戻ってきた25歳のSEが、子育て・若者・行政を、地域とともに変えていきます。
          </p>
          <div className="hero-signature">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/signature.png" alt="Hiroki Murata" />
          </div>
          <div className="hero-who">
            <div className="label">むらた ひろき</div>
            <div className="who-row">
              <div className="who-name">村田 ひろき</div>
              <div className="age-badge">25歳</div>
            </div>
            <div className="who-sub">大阪維新の会</div>
          </div>
        </div>

        <div className="hero-visual">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="portrait" src="/assets/portrait.png" alt="村田 ひろき ポートレート" />
        </div>
      </div>
    </section>
  );
}
