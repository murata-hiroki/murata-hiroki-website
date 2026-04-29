export default function Support() {
  return (
    <section className="support" id="support">
      <div className="support-grid">
        <div className="support-intro">
          <span className="sec-kicker">サポートのお願い</span>
          <h2>
            一緒に松原の未来を
            <br />
            つくりましょう。
          </h2>
          <p>
            村田 ひろきの活動は、皆さまのご支援によって支えられています。応援してくださる方は、ぜひ以下の方法でお願いいたします。
          </p>
        </div>

        <div className="support-card line-card">
          <div className="line-card-head">
            <div className="line-badge">LINE</div>
            <h3>ボランティアとして参加する</h3>
          </div>
          <p>
            地域活動やイベントのお手伝いなど、一緒に活動してくださる方を募集しています。公式LINEから、お気軽にご連絡ください。
          </p>
          <div className="line-qr-row">
            <div className="line-qr">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/line_qr.png" alt="公式LINE QRコード" />
            </div>
            <div className="line-qr-note">
              QRコードから<b>公式LINE</b>を友だち追加し、トークで <span className="chip">入会希望</span> とお送りください。
            </div>
          </div>
        </div>

        <div className="support-card line-card">
          <div className="line-card-head">
            <div className="line-badge">寄付</div>
            <h3>ご寄付で応援する</h3>
          </div>
          <p>
            皆さまのご支援は、政策活動や広報活動に大切に使わせていただきます。お振込みやクレジットカードでのご寄付を受け付けております。
          </p>
          <a
            href="#"
            className="btn-outline-green"
            style={{ alignSelf: "flex-start", marginTop: "auto" }}
          >
            詳しく見る <span className="arrow-circle">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
