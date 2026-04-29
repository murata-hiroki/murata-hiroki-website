type Promise = {
  num: string;
  title: string;
  body: string;
  icon: React.ReactElement;
};

const promises: Promise[] = [
  {
    num: "01",
    title: "子育て世帯への直接支援",
    body: "今の子育ての困りごとに、行政が直接応えます。第2子の保育料無償化や、0歳児おむつ定期便（見守り・相談の入口づくり）など、隣接市の先進事例を松原でも実現することを目指します。",
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
    body: "町会・自治会・学校が連携し、子どもにとって家庭・学校以外の「もうひとつの居場所」をつくります。AI時代に対応した教育で南河内で1番の学力を目指し、若い世代が「松原で子育てしたい」と選ぶまちにしていきます。",
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
    body: "「聞く・動く・変えていく」を回し続ける議会へ。議員報酬の適正化に取り組み、SE経験を活かしてAI・デジタルによる市役所の効率化を進めます。職員の負担を軽くして、市民に向き合える行政をつくります。",
    icon: (
      <svg className="icn" width="32" height="32" viewBox="0 0 48 48">
        <path d="M8 12h32v22H24l-6 6v-6H8z" />
        <path d="M15 21h18M15 27h12" />
      </svg>
    ),
  },
];

export default function Promises() {
  return (
    <section className="promises" id="promises">
      <div className="promises-head">
        <span className="sec-kicker">政策</span>
        <h2 className="promises-title">3つの約束</h2>
        <p className="promises-sub">
          ビジョンは「南河内で1番、教育水準が高く、子育てしやすいまち」。地域全体で子どもを育てる、を貫く3本柱です。
        </p>
      </div>

      <div className="promise-grid">
        {promises.map((p) => (
          <div key={p.num} className="promise-card">
            <div className="promise-head">
              <div className="promise-icon-wrap">{p.icon}</div>
              <div className="promise-num">{p.num}</div>
              <h3>{p.title}</h3>
            </div>
            <p>{p.body}</p>
          </div>
        ))}
      </div>

    </section>
  );
}
