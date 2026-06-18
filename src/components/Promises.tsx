type Pillar = {
  num: string;
  title: string;
  lead: string;
  issue: string;
  proposal: string;
  actions: string[];
  icon: React.ReactElement;
};

const pillars: Pillar[] = [
  {
    num: "01",
    title: "子育て世帯への直接支援",
    lead: "「いま」の困りごとに、行政が直接応える。",
    issue:
      "保育料や日々の出費など、子育て世帯の負担は重いままです。近隣市では先進的な支援が始まっていますが、松原ではこれからの部分も少なくありません。",
    proposal:
      "支援を「制度として用意する」だけでなく、困っている家庭に直接届く形にしていきます。",
    actions: [
      "第2子の保育料の負担軽減を目指す（段階的に、まず第2子から）",
      "0歳児おむつ定期便の実現を目指す（届ける過程を、見守り・相談の入口に）",
      "子育ての相談を、オンラインでも届くわかりやすい窓口へ",
    ],
    icon: (
      <svg className="icn" width="32" height="32" viewBox="0 0 48 48">
        <circle cx="17" cy="16" r="5" />
        <circle cx="31" cy="16" r="5" />
        <path d="M8 38c0-5 4-9 9-9s9 4 9 9" />
        <path d="M22 38c0-5 4-9 9-9s9 4 9 9" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "若い世代が残る・戻ってくるまちへ",
    lead: "地域全体で、子どもを育てる。",
    issue:
      "進学や就職で一度まちを離れると、戻る理由が見つけにくい。子どもの居場所も、家庭と学校に偏りがちです。",
    proposal:
      "家庭・学校だけでなく、地域に「もうひとつの居場所」をつくり、「ここで子育てしたい」と選ばれるまちにしていきます。",
    actions: [
      "町会・自治会・学校が連携した、子どもの居場所づくり",
      "AI時代に対応した教育で、南河内で1番の学力を目指す",
    ],
    icon: (
      <svg className="icn" width="32" height="32" viewBox="0 0 48 48">
        <path d="M8 24l16-14 16 14" />
        <path d="M12 22v18h9v-11h6v11h9v-18" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "アップデートし続ける市政へ",
    lead: "「聞く・動く・変えていく」を、回し続ける。",
    issue:
      "行政の手続きや情報発信には、まだ手間と時間がかかります。職員の負担も大きく、その分だけ市民に向き合う余力が削られています。",
    proposal:
      "SE（システムエンジニア）の経験を活かし、仕組みそのものを軽くして、支援を続けられる市政にしていきます。",
    actions: [
      "議員報酬の適正化に取り組む",
      "AI・デジタルの活用で、市役所業務の効率化を進める",
      "職員の負担を軽くし、市民に向き合える行政に",
    ],
    icon: (
      <svg className="icn" width="32" height="32" viewBox="0 0 48 48">
        <path d="M8 12h32v22H24l-6 6v-6H8z" />
        <path d="M15 21h18M15 27h12" />
      </svg>
    ),
  },
];

const cycle = [
  { num: "01", text: "直接支援で「いま」の子育てを支える" },
  { num: "02", text: "支えられた家庭と子どもが地域につながり、まちに残る・戻る理由になる" },
  { num: "03", text: "市政をアップデートし、その仕組みを続けられる形にする" },
  { num: "01", text: "生まれた余力を、また次の子育て支援へ" },
];

export default function Promises() {
  return (
    <section className="promises" id="promises">
      <div className="promises-head">
        <span className="sec-kicker">政策</span>
        <h2 className="promises-title">3つの約束</h2>
        <p className="promises-sub">
          ビジョンは「南河内で1番、教育水準が高く、子育てしやすいまち」。3本柱を貫く軸は、ひとつです。
        </p>
      </div>

      <div className="promise-axis">
        <span className="promise-axis-label">核となる考え</span>
        <p className="promise-axis-text">
          親だけでなく、<strong>地域全体で子どもを育てる</strong>まちをつくる。
        </p>
      </div>

      <div className="promise-grid">
        {pillars.map((p) => (
          <div key={p.num} className="promise-card">
            <div className="promise-head">
              <div className="promise-icon-wrap">{p.icon}</div>
              <div className="promise-num">{p.num}</div>
              <h3>{p.title}</h3>
            </div>
            <p className="promise-lead">{p.lead}</p>

            <div className="promise-detail">
              <div className="pd-row">
                <span className="pd-label pd-issue">課題</span>
                <p>{p.issue}</p>
              </div>
              <div className="pd-row">
                <span className="pd-label pd-proposal">私の提案</span>
                <p>{p.proposal}</p>
              </div>
              <div className="pd-actions">
                <span className="pd-label pd-action">具体策</span>
                <ul>
                  {p.actions.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="promise-cycle">
        <h3 className="promise-cycle-title">3本柱は、つながって循環する</h3>
        <ol className="cycle-flow">
          {cycle.map((c, i) => (
            <li key={i} className="cycle-step">
              <span className="cycle-num">{c.num}</span>
              <span className="cycle-text">{c.text}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="promise-cta">
        <p className="promise-cta-lead">あなたの声を、政策に。</p>
        <div className="promise-cta-btns">
          <a className="btn-green-cta" href="/koe">声を届ける</a>
          <a className="btn-outline-green" href="#support">活動をサポートする</a>
        </div>
      </div>
    </section>
  );
}
